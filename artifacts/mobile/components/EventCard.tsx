import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Event } from "@/constants/mockData";

interface Props {
  event: Event;
}

export function EventCard({ event }: Props) {
  const colors = useColors();
  const [rsvped, setRsvped] = useState(false);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.hostRow}>
          <Image source={{ uri: event.hostImage }} style={styles.hostImg} />
          <View>
            <Text style={[styles.category, { color: colors.mutedForeground }]}>{event.category}</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>{event.title}</Text>
          </View>
        </View>
        {event.free ? (
          <View style={[styles.priceBadge, { backgroundColor: colors.green + "22" }]}>
            <Text style={[styles.priceText, { color: colors.green }]}>Free</Text>
          </View>
        ) : (
          <View style={[styles.priceBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.priceText, { color: colors.foreground }]}>{event.price}</Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Feather name="calendar" size={13} color={colors.mutedForeground} />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{event.date} at {event.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Feather name="map-pin" size={13} color={colors.mutedForeground} />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{event.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Feather name="users" size={13} color={colors.mutedForeground} />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{event.attendees} attending</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setRsvped(!rsvped)}
        style={[
          styles.rsvpBtn,
          { backgroundColor: rsvped ? colors.green + "22" : colors.primary },
        ]}
        activeOpacity={0.8}
      >
        {rsvped && <Feather name="check" size={14} color={colors.green} />}
        <Text style={[styles.rsvpText, { color: rsvped ? colors.green : colors.primaryForeground }]}>
          {rsvped ? "Going!" : "RSVP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  hostImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  category: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  priceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  priceText: {
    fontSize: 12,
    fontWeight: "700",
  },
  details: {
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
  },
  rsvpBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
  },
  rsvpText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
