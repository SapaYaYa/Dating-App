import { Audio } from "expo-av";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MOCK_CHAT_MESSAGES, MOCK_MATCHES, ICE_BREAKERS, type ChatMessage } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { blockProfile } from "@/utils/blocks";
import { isProfileHidden } from "@/utils/hiddenProfiles";
import { unmatchProfile } from "@/utils/unmatches";
import { dismissSlowReplyNotice, isSlowReplyNoticeDismissed } from "@/utils/slowReplyDismissals";
import ReportModal, { hasReported } from "@/components/ReportModal";
import { ChatOptionsSheet } from "@/components/ChatOptionsSheet";
import { GhostIcon } from "@/components/GhostIcon";
import { hasGreatChatBadge } from "@/components/GreatChatBadge";
import { ChatRatingCard } from "@/components/ChatRatingCard";
import {
  isConversationRateable,
  shouldAskForRating,
  type ChatRating,
  type ChatRatingRecord,
} from "@/constants/greatChat";
import { getChatRatingRecord, saveChatRating, skipChatRating } from "@/utils/chatRatings";
import { SlowToReplyNotice, hasSlowToReplyBadge } from "@/components/SlowToReplyNotice";

const MESSAGE_MAX = 280;
const WAVE_COUNT = 22;

type VoiceState = "idle" | "recording" | "preview";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getWaveformBars(seed: string): number[] {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
  return Array.from({ length: WAVE_COUNT }, (_, i) => {
    hash = ((hash << 5) + hash) ^ i;
    return 0.15 + (Math.abs(hash) % 85) / 100;
  });
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addPoints } = useApp();

  const match = MOCK_MATCHES.find((m) => m.id === id);
  const initialMessages: ChatMessage[] = MOCK_CHAT_MESSAGES[id ?? ""] ?? [];

  const randomIceBreakers = useMemo(() => {
    const shuffled = [...ICE_BREAKERS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  // The list is inverted, so it needs newest-first; sample chats are oldest-first.
  const [messages, setMessages] = useState<ChatMessage[]>(() => [...initialMessages].reverse());
  const [input, setInput] = useState("");
  const [showIceBreakers, setShowIceBreakers] = useState(messages.length === 0);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [blockStatusLoaded, setBlockStatusLoaded] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Voice recording state
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [recordingObj, setRecordingObj] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // Preview playback
  const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  // Message playback
  const [activeMsgId, setActiveMsgId] = useState<string | null>(null);
  const [activeSound, setActiveSound] = useState<Audio.Sound | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (match) {
      hasReported(match.profile.id).then(setAlreadyReported);
    }
  }, [match?.profile.id]);

  const isSlowToReply = hasSlowToReplyBadge(match?.profile.badges);
  // Start hidden so a dismissed bar doesn't flash before storage answers.
  const [slowReplyNoticeDismissed, setSlowReplyNoticeDismissed] = useState(true);

  useEffect(() => {
    if (!match || !isSlowToReply) return;
    isSlowReplyNoticeDismissed(match.profile.id).then(setSlowReplyNoticeDismissed);
  }, [match?.profile.id, isSlowToReply]);

  // "How's your conversation going?" card. undefined = not loaded yet.
  const [ratingRecord, setRatingRecord] = useState<ChatRatingRecord | null | undefined>(undefined);
  const [ratingAnswered, setRatingAnswered] = useState(false);

  useEffect(() => {
    if (!match) return;
    getChatRatingRecord(match.profile.id).then((record) => setRatingRecord(record ?? null));
  }, [match?.profile.id]);

  const showRatingCard =
    ratingAnswered ||
    (ratingRecord !== undefined &&
      isConversationRateable(messages) &&
      shouldAskForRating(ratingRecord ?? undefined, messages.length, Date.now()));

  const handleRate = (rating: ChatRating) => {
    if (!match) return;
    Haptics.selectionAsync();
    setRatingAnswered(true);
    setRatingRecord((current) => ({ skips: current?.skips ?? 0, ...current, rating }));
    saveChatRating(match.profile.id, rating).catch(() => {});
  };

  const handleSkipRating = () => {
    if (!match) return;
    setRatingRecord((current) => ({
      ...current,
      skips: (current?.skips ?? 0) + 1,
      lastSkippedAt: Date.now(),
      messagesAtLastSkip: messages.length,
    }));
    skipChatRating(match.profile.id, messages.length).catch(() => {});
  };

  const handleDismissSlowReplyNotice = () => {
    if (!match) return;
    setSlowReplyNoticeDismissed(true);
    dismissSlowReplyNotice(match.profile.id).catch(() => {});
  };

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setBlockStatusLoaded(false);

      if (!match) {
        setBlockStatusLoaded(true);
        return () => {
          cancelled = true;
        };
      }

      isProfileHidden(match.profile.id).then((blocked) => {
        if (cancelled) return;
        setIsBlocked(blocked);
        setBlockStatusLoaded(true);
        if (blocked) router.replace("/(tabs)/matches");
      });

      return () => {
        cancelled = true;
      };
    }, [match?.profile.id]),
  );

  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      previewSound?.unloadAsync().catch(() => {});
      activeSound?.unloadAsync().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (voiceState === "recording") {
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      pulseLoopRef.current.start();
    } else {
      pulseLoopRef.current?.stop();
      pulseAnim.setValue(1);
    }
  }, [voiceState]);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecordingObj(recording);
      setRecordingDuration(0);
      setVoiceState("recording");
      timerRef.current = setInterval(() => setRecordingDuration((d) => d + 1), 1000);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      console.warn("Recording failed", e);
    }
  };

  const stopRecording = async () => {
    if (!recordingObj) return;
    timerRef.current && clearInterval(timerRef.current);
    try {
      await recordingObj.stopAndUnloadAsync();
      const uri = recordingObj.getURI();
      setRecordingUri(uri ?? null);
      setRecordingObj(null);
      setVoiceState("preview");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      setVoiceState("idle");
    }
  };

  const discardRecording = async () => {
    timerRef.current && clearInterval(timerRef.current);
    if (recordingObj) { try { await recordingObj.stopAndUnloadAsync(); } catch {} }
    if (previewSound) { try { await previewSound.unloadAsync(); } catch {} setPreviewSound(null); }
    setPreviewPlaying(false);
    setRecordingObj(null);
    setRecordingUri(null);
    setRecordingDuration(0);
    setVoiceState("idle");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const togglePreview = async () => {
    if (!recordingUri) return;
    if (previewPlaying && previewSound) {
      await previewSound.pauseAsync();
      setPreviewPlaying(false);
      return;
    }
    if (previewSound) {
      await previewSound.playAsync();
      setPreviewPlaying(true);
      return;
    }
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) setPreviewPlaying(false);
      });
      setPreviewSound(sound);
      await sound.playAsync();
      setPreviewPlaying(true);
    } catch (e) {
      console.warn("Preview failed", e);
    }
  };

  const sendVoiceNote = async () => {
    if (!recordingUri) return;
    if (previewSound) { try { await previewSound.stopAsync(); await previewSound.unloadAsync(); } catch {} setPreviewSound(null); }
    const newMsg: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      senderId: "me",
      text: "",
      timestamp: "Just now",
      isOwn: true,
      type: "voice",
      audioUri: recordingUri,
      duration: recordingDuration,
    };
    setMessages((prev) => [newMsg, ...prev]);
    setRecordingUri(null);
    setRecordingDuration(0);
    setPreviewPlaying(false);
    setVoiceState("idle");
    setShowIceBreakers(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addPoints(5);
  };

  const toggleMsgPlayback = async (msgId: string, uri: string) => {
    if (previewSound) { try { await previewSound.pauseAsync(); } catch {} setPreviewPlaying(false); }

    if (activeMsgId === msgId && activeSound) {
      const status = await activeSound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await activeSound.pauseAsync();
        setActiveMsgId(null);
      } else {
        await activeSound.playAsync();
        setActiveMsgId(msgId);
      }
      return;
    }

    if (activeSound) { try { await activeSound.stopAsync(); await activeSound.unloadAsync(); } catch {} setActiveSound(null); setActiveMsgId(null); }

    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        const progress = status.durationMillis ? status.positionMillis / status.durationMillis : 0;
        setPlaybackProgress((prev) => ({ ...prev, [msgId]: progress }));
        if (status.didJustFinish) {
          setActiveMsgId(null);
          setPlaybackProgress((prev) => ({ ...prev, [msgId]: 0 }));
        }
      });
      setActiveSound(sound);
      setActiveMsgId(msgId);
      await sound.playAsync();
    } catch (e) {
      console.warn("Playback failed", e);
    }
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      senderId: "me",
      text: text.trim(),
      timestamp: "Just now",
      isOwn: true,
      type: "text",
    };
    setMessages((prev) => [newMsg, ...prev]);
    setInput("");
    setShowIceBreakers(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addPoints(10);
  };

  const handleMoreOptions = () => {
    if (!match || alreadyReported) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOptionsVisible(true);
  };

  const handleBlock = async () => {
    if (!match) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await blockProfile(match.profile.id);
    setIsBlocked(true);
    router.replace("/(tabs)/matches");
  };

  const handleUnmatch = async () => {
    if (!match) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await unmatchProfile(match.profile.id);
    setIsBlocked(true);
    router.replace("/(tabs)/matches");
  };

  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const canRecord = Platform.OS !== "web";

  if (!blockStatusLoaded || isBlocked) {
    return <View style={[styles.root, { backgroundColor: colors.background }]} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        {match && (
          <TouchableOpacity style={styles.profileInfo} activeOpacity={0.8}>
            <Image source={{ uri: match.profile.images[0] }} style={styles.headerAvatar} />
            <View>
              <View style={styles.headerNameRow}>
                <Text style={[styles.headerName, { color: colors.foreground }]}>{match.profile.name}</Text>
                {isSlowToReply && (
                  <View accessibilityRole="image" accessibilityLabel="Slow to reply badge">
                    <GhostIcon size={16} color={colors.slowReply} />
                  </View>
                )}
                {hasGreatChatBadge(match.profile.badges) && (
                  <View accessibilityRole="image" accessibilityLabel="Great Chat badge">
                    <Feather name="message-square" size={15} color={colors.greatChat} />
                  </View>
                )}
              </View>
              <Text style={[styles.headerSub, { color: colors.green }]}>Online</Text>
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
          onPress={handleMoreOptions}
          disabled={alreadyReported}
        >
          {alreadyReported ? (
            <Feather name="flag" size={16} color={colors.mutedForeground} />
          ) : (
            <Feather name="more-horizontal" size={18} color={colors.foreground} />
          )}
        </TouchableOpacity>
      </View>

      {match && isSlowToReply && !slowReplyNoticeDismissed && (
        <View style={styles.slowReplyNotice}>
          <SlowToReplyNotice
            name={match.profile.name}
            variant="chat"
            onDismiss={handleDismissSlowReplyNotice}
          />
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          inverted
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.messageList, { paddingBottom: 16 }]}
          ListHeaderComponent={
            showRatingCard && match ? (
              <ChatRatingCard
                name={match.profile.name}
                answered={ratingAnswered}
                onRate={handleRate}
                onSkip={handleSkipRating}
              />
            ) : showIceBreakers && match ? (
              <View style={styles.iceBreakers}>
                <Text style={[styles.iceBreakerTitle, { color: colors.mutedForeground }]}>
                  Break the ice with {match.profile.name}
                </Text>
                {randomIceBreakers.map((ib, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => send(ib)}
                    style={[styles.ibChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.ibText, { color: colors.foreground }]}>{ib}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={[styles.msgRow, item.isOwn ? styles.msgRowOwn : styles.msgRowOther]}>
              {!item.isOwn && match && (
                <Image source={{ uri: match.profile.images[0] }} style={styles.msgAvatar} />
              )}
              {item.type === "voice" && item.audioUri ? (
                <TouchableOpacity
                  onPress={() => toggleMsgPlayback(item.id, item.audioUri!)}
                  activeOpacity={0.85}
                  style={[
                    styles.voiceBubble,
                    item.isOwn
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                  ]}
                >
                  <Feather
                    name={activeMsgId === item.id ? "pause" : "play"}
                    size={16}
                    color={item.isOwn ? colors.primaryForeground : colors.foreground}
                  />
                  <View style={styles.waveformRow}>
                    {getWaveformBars(item.id).map((h, i) => {
                      const progress = playbackProgress[item.id] ?? 0;
                      const filled = i / WAVE_COUNT <= progress;
                      return (
                        <View
                          key={i}
                          style={[
                            styles.waveBar,
                            {
                              height: h * 26,
                              backgroundColor: item.isOwn
                                ? filled ? colors.primaryForeground : colors.primaryForeground + "44"
                                : filled ? colors.foreground : colors.mutedForeground + "55",
                            },
                          ]}
                        />
                      );
                    })}
                  </View>
                  <Text style={[styles.voiceDuration, { color: item.isOwn ? colors.primaryForeground + "bb" : colors.mutedForeground }]}>
                    {formatDuration(item.duration ?? 0)}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.bubble,
                    item.isOwn
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                  ]}
                >
                  <Text style={[styles.bubbleText, { color: item.isOwn ? colors.primaryForeground : colors.foreground }]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.timestamp, { color: item.isOwn ? colors.primaryForeground + "80" : colors.mutedForeground }]}>
                    {item.timestamp}
                  </Text>
                </View>
              )}
            </View>
          )}
        />

        {/* ── Idle input bar ── */}
        {voiceState === "idle" && (
          <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
            <View style={[styles.inputWrap, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <TextInput
                style={[styles.textInput, { color: colors.foreground }]}
                placeholder={`Message ${match?.profile.name ?? ""}...`}
                placeholderTextColor={colors.mutedForeground}
                value={input}
                onChangeText={(t) => setInput(t.slice(0, MESSAGE_MAX))}
                multiline
                maxLength={MESSAGE_MAX}
              />
              {input.length > MESSAGE_MAX * 0.8 && (
                <Text style={[styles.charCount, { color: input.length >= MESSAGE_MAX ? colors.destructive : colors.mutedForeground }]}>
                  {input.length}/{MESSAGE_MAX}
                </Text>
              )}
            </View>
            {input.trim() ? (
              <TouchableOpacity onPress={() => send(input)} style={[styles.circleBtn, { backgroundColor: colors.primary }]}>
                <Feather name="send" size={18} color={colors.primaryForeground} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={canRecord ? startRecording : undefined}
                style={[styles.circleBtn, { backgroundColor: colors.secondary }]}
              >
                <Feather name="mic" size={18} color={canRecord ? colors.foreground : colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Recording bar ── */}
        {voiceState === "recording" && (
          <View style={[styles.inputBar, styles.recordingBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
            <Animated.View style={[styles.recordingDot, { backgroundColor: colors.accent, opacity: pulseAnim }]} />
            <Text style={[styles.timerText, { color: colors.foreground }]}>{formatDuration(recordingDuration)}</Text>
            <Text style={[styles.recordingHint, { color: colors.mutedForeground }]}>Recording…</Text>
            <TouchableOpacity onPress={stopRecording} style={[styles.circleBtn, { backgroundColor: colors.accent }]}>
              <Feather name="square" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Preview bar ── */}
        {voiceState === "preview" && (
          <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
            <TouchableOpacity onPress={togglePreview} style={[styles.circleBtn, { backgroundColor: colors.secondary }]}>
              <Feather name={previewPlaying ? "pause" : "play"} size={18} color={colors.foreground} />
            </TouchableOpacity>
            <View style={styles.previewWaveform}>
              {getWaveformBars(recordingUri ?? "preview").map((h, i) => (
                <View key={i} style={[styles.waveBar, { height: h * 26, backgroundColor: colors.foreground + "55" }]} />
              ))}
            </View>
            <Text style={[styles.timerText, { color: colors.mutedForeground }]}>{formatDuration(recordingDuration)}</Text>
            <TouchableOpacity onPress={discardRecording} style={[styles.circleBtn, { backgroundColor: colors.secondary }]}>
              <Feather name="trash-2" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity onPress={sendVoiceNote} style={[styles.circleBtn, { backgroundColor: colors.primary }]}>
              <Feather name="send" size={16} color={colors.primaryForeground} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {match && (
        <ChatOptionsSheet
          visible={optionsVisible}
          name={match.profile.name}
          onClose={() => setOptionsVisible(false)}
          onReport={() => setReportModalVisible(true)}
          onBlock={handleBlock}
          onUnmatch={handleUnmatch}
        />
      )}
      {match && (
        <ReportModal
          visible={reportModalVisible}
          profileId={match.profile.id}
          profileName={match.profile.name}
          onClose={() => {
            setReportModalVisible(false);
            if (match) hasReported(match.profile.id).then(setAlreadyReported);
          }}
          onBlocked={() => {
            setIsBlocked(true);
            router.replace("/(tabs)/matches");
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: { padding: 4 },
  profileInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19 },
  headerNameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  headerName: { fontSize: 16, fontWeight: "600" },
  slowReplyNotice: { paddingHorizontal: 16, paddingTop: 12 },
  headerSub: { fontSize: 12 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  messageList: { paddingHorizontal: 16, paddingTop: 12 },
  iceBreakers: { gap: 10, marginBottom: 16 },
  iceBreakerTitle: { fontSize: 13, textAlign: "center", marginBottom: 4 },
  ibChip: { borderRadius: 12, padding: 14, borderWidth: 1 },
  ibText: { fontSize: 14, lineHeight: 20 },
  msgRow: { flexDirection: "row", marginBottom: 8, alignItems: "flex-end", gap: 8 },
  msgRowOwn: { justifyContent: "flex-end" },
  msgRowOther: { justifyContent: "flex-start" },
  msgAvatar: { width: 28, height: 28, borderRadius: 14 },
  bubble: { maxWidth: "75%", borderRadius: 18, padding: 12, gap: 4 },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  timestamp: { fontSize: 10, alignSelf: "flex-end" },
  voiceBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    maxWidth: "80%",
  },
  waveformRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 28,
  },
  waveBar: {
    width: 2.5,
    borderRadius: 2,
    minHeight: 3,
  },
  voiceDuration: { fontSize: 11, fontWeight: "500", minWidth: 28 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  recordingBar: {
    justifyContent: "center",
  },
  inputWrap: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    gap: 4,
  },
  textInput: { fontSize: 15, lineHeight: 20, maxHeight: 80 },
  charCount: { fontSize: 10, alignSelf: "flex-end" },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timerText: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 36,
  },
  recordingHint: {
    flex: 1,
    fontSize: 13,
  },
  previewWaveform: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 28,
  },
});
