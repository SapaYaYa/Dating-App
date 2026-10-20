import { useAuth as useClerkAuth, useUser } from "@clerk/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

export type VerificationStatus = "none" | "pending" | "verified";

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  age: number;
  birthday?: string;
  gender?: string;
  lookingFor?: string[];
  bio: string;
  images: string[];
  interests: string[];
  occupation: string;
  matchNote?: string;
  verificationStatus?: VerificationStatus;
  latitude?: number;
  longitude?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  verificationStatus: VerificationStatus;
  logout: () => Promise<void>;
  updateUser: (data: Partial<AuthUser>) => void;
  saveProfile: (userId: string, data: Partial<AuthUser>) => Promise<void>;
  updateVerification: (status: VerificationStatus) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function profileKey(userId: string) {
  return `spark_profile_${userId}`;
}

function verificationKey(userId: string) {
  return `spark_verification_${userId}`;
}

function apiBase(): string {
  if (Platform.OS === "web") return "/api";
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}/api` : "/api";
}

async function apiFetch(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<Response> {
  return fetch(`${apiBase()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
}

function toApiPayload(data: Partial<AuthUser>) {
  return {
    name: data.name,
    age: data.age,
    birthday: data.birthday,
    gender: data.gender,
    lookingFor: data.lookingFor,
    bio: data.bio,
    photos: data.images,
    interests: data.interests,
    occupation: data.occupation,
    ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
    ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut, getToken } = useClerkAuth();
  const [profile, setProfile] = useState<Partial<AuthUser> | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [verificationStatus, setVerificationStatusState] = useState<VerificationStatus>("none");

  useEffect(() => {
    setAuthTokenGetter(getToken);
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!clerkUser?.id) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    const userId = clerkUser.id;

    // Load verification status independently from profile
    AsyncStorage.getItem(verificationKey(userId)).then((stored) => {
      if (stored === "pending" || stored === "verified") {
        setVerificationStatusState(stored as VerificationStatus);
      }
    });

    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const token = await getToken();
        if (token) {
          const res = await apiFetch("/profiles/me", token);

          if (res.ok) {
            const data = await res.json();
            setProfile(data);
            await AsyncStorage.setItem(profileKey(userId), JSON.stringify(data));
            return;
          }

          if (res.status === 404) {
            const raw = await AsyncStorage.getItem(profileKey(userId));
            if (raw) {
              const local: Partial<AuthUser> = JSON.parse(raw);
              setProfile(local);
              apiFetch("/profiles/me", token, {
                method: "PUT",
                body: JSON.stringify(toApiPayload(local)),
              }).catch(() => {});
            } else {
              setProfile(null);
            }
            return;
          }
        }

        const raw = await AsyncStorage.getItem(profileKey(userId));
        setProfile(raw ? JSON.parse(raw) : null);
      } catch {
        const raw = await AsyncStorage.getItem(profileKey(userId));
        setProfile(raw ? JSON.parse(raw) : null);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [clerkUser?.id, isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const user: AuthUser | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        name:
          profile?.name ||
          [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
          clerkUser.username ||
          clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0] ||
          "",
        phone: profile?.phone ?? clerkUser.primaryPhoneNumber?.phoneNumber,
        age: profile?.age ?? 25,
        birthday: profile?.birthday,
        gender: profile?.gender,
        lookingFor: profile?.lookingFor ?? ["Everyone"],
        bio: profile?.bio ?? "",
        images: profile?.images ?? (clerkUser.imageUrl ? [clerkUser.imageUrl] : []),
        interests: profile?.interests ?? [],
        occupation: profile?.occupation ?? "",
        matchNote: profile?.matchNote,
        verificationStatus,
      }
    : null;

  const isLoading = !isLoaded || (!!clerkUser && profileLoading);

  const updateVerification = useCallback(
    (status: VerificationStatus) => {
      if (!clerkUser?.id) return;
      setVerificationStatusState(status);
      AsyncStorage.setItem(verificationKey(clerkUser.id), status);
    },
    [clerkUser?.id],
  );

  const saveProfile = useCallback(
    async (userId: string, data: Partial<AuthUser>) => {
      const merged = { ...(profile || {}), ...data };
      setProfile(merged);
      await AsyncStorage.setItem(profileKey(userId), JSON.stringify(merged));
      try {
        const token = await getToken();
        if (token) {
          await apiFetch("/profiles/me", token, {
            method: "PUT",
            body: JSON.stringify(toApiPayload(merged)),
          });
        }
      } catch {
        // Network error — local save succeeded
      }
    },
    [profile, getToken], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const logout = async () => {
    await signOut();
    setProfile(null);
    setProfileLoading(true);
    setVerificationStatusState("none");
  };

  const updateUser = useCallback(
    (data: Partial<AuthUser>) => {
      if (!clerkUser?.id) return;
      const updated = { ...(profile || {}), ...data };
      setProfile(updated);
      AsyncStorage.setItem(profileKey(clerkUser.id), JSON.stringify(updated));
      getToken().then((token) => {
        if (!token) return;
        apiFetch("/profiles/me", token, {
          method: "PUT",
          body: JSON.stringify(toApiPayload(updated)),
        }).catch(() => {});
      });
    },
    [profile, clerkUser?.id, getToken], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, verificationStatus, logout, updateUser, saveProfile, updateVerification }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
