import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import { supabase } from "../lib/supabaseClient";

const AVATAR_URI =
  "https://lh3.googleusercontent.com/d/15hdjPNF0qwo2q3wmfRp2NZNQiIqHZ1ai";

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      if (!mountedRef.current) {
        return;
      }

      setProfileError("");
      setLoadingProfile(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        if (mountedRef.current) {
          setProfileError(
            userError.message ?? "Unable to identify the current user."
          );
        }
        return;
      }

      if (!user) {
        if (mountedRef.current) {
          router.replace("/login");
        }
        return;
      }

      const { data, error: profileFetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!mountedRef.current) {
        return;
      }

      if (profileFetchError) {
        setProfileError(
          profileFetchError.message ?? "Unable to load profile details."
        );
        setProfile(null);
        return;
      }

      setProfile(data ?? null);
    } catch (error) {
      if (mountedRef.current) {
        setProfileError(error.message ?? "Unable to load profile details.");
      }
    } finally {
      if (mountedRef.current) {
        setLoadingProfile(false);
      }
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const fullName = useMemo(() => {
    const first =
      typeof profile?.first_name === "string" ? profile.first_name.trim() : "";
    const last =
      typeof profile?.last_name === "string" ? profile.last_name.trim() : "";
    const combined = [first, last].filter(Boolean).join(" ");

    if (combined) {
      return combined;
    }

    if (profile?.email) {
      return profile.email;
    }

    return "Complete your profile";
  }, [profile]);

  const courseText = useMemo(() => {
    const course =
      typeof profile?.course === "string" ? profile.course.trim() : "";
    if (course) {
      return course;
    }

    const program =
      typeof profile?.program === "string" ? profile.program.trim() : "";
    if (program) {
      return program;
    }

    return "Add your course in settings";
  }, [profile]);

  const academicDetails = useMemo(() => {
    const details = [];
    const yearLevel = profile?.year_level;
    const yearText =
      typeof yearLevel === "string" ? yearLevel.trim() : yearLevel;
    if (yearText) {
      details.push(String(yearText));
    }

    const sectionRaw = profile?.section;
    const section = typeof sectionRaw === "string" ? sectionRaw.trim() : "";
    if (section) {
      details.push(
        section.toLowerCase().startsWith("section")
          ? section
          : `Section ${section}`
      );
    }

    const studentNumber =
      typeof profile?.student_number === "string"
        ? profile.student_number.trim()
        : "";
    if (!details.length && studentNumber) {
      details.push(`Student No. ${studentNumber}`);
    }

    return details.length
      ? details.join(" · ")
      : "Update your academic details";
  }, [profile]);

  const contactItems = useMemo(() => {
    const sanitize = (value) => {
      if (value === null || value === undefined) {
        return "";
      }

      const normalized = typeof value === "string" ? value : String(value);
      const trimmed = normalized.trim();
      return trimmed.length ? trimmed : "";
    };

    const email = sanitize(profile?.email);
    const phone = sanitize(
      profile?.phone_num ??
        profile?.phone_number ??
        profile?.contact_number ??
        profile?.mobile_number
    );
    const facebook = sanitize(
      profile?.fb_name ??
        profile?.facebook_url ??
        profile?.facebook ??
        profile?.facebook_profile
    );

    return [
      {
        id: "email",
        label: "University Email",
        value: email,
        icon: "mail",
        actionIcon: "content-copy",
      },
      {
        id: "phone",
        label: "Phone Number",
        value: phone,
        icon: "call",
        actionIcon: "sms",
      },
      {
        id: "facebook",
        label: "Facebook",
        value: facebook,
        icon: "facebook",
        actionIcon: "open-in-new",
      },
    ].map((item) => ({
      ...item,
      displayValue: item.value || "Not provided yet",
      isEmpty: !item.value,
    }));
  }, [profile]);

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#0b1610]" : "bg-slate-50"}`}
    >
      <AppHeader />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {loadingProfile ? (
          <View className="py-12 items-center gap-3">
            <ActivityIndicator size="large" color="#2bee79" />
            <Text
              className={`text-sm ${
                isDark ? "text-muted-dark" : "text-muted-light"
              }`}
            >
              Loading profile…
            </Text>
          </View>
        ) : (
          <>
            {profileError ? (
              <View
                className="mb-5 p-3.5 rounded-2xl border"
                style={{
                  borderColor: isDark
                    ? "rgba(248,113,113,0.35)"
                    : "rgba(248,113,113,0.4)",
                  backgroundColor: isDark
                    ? "rgba(248,113,113,0.12)"
                    : "rgba(248,113,113,0.15)",
                }}
              >
                <Text
                  className="font-semibold text-center"
                  style={{ color: isDark ? "#fecaca" : "#b91c1c" }}
                >
                  {profileError}
                </Text>
              </View>
            ) : null}

            {/* Avatar Section */}
            <View className="items-center mt-6 mb-4">
              <View
                className="rounded-full p-1"
                style={{
                  borderWidth: 3,
                  borderColor: "#2bee79",
                  shadowColor: "#2bee79",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <Image
                  source={{
                    uri: profile?.avatar_url ? profile.avatar_url : AVATAR_URI,
                  }}
                  className="w-28 h-28 rounded-full"
                  style={{ backgroundColor: "#1a3022" }}
                />
              </View>
            </View>

            {/* Name & Info Block */}
            <View className="items-center mb-5">
              <Text
                className={`text-2xl font-bold text-center mb-1 ${
                  isDark ? "text-text-dark" : "text-text-light"
                }`}
              >
                {fullName}
              </Text>
              <Text
                className={`text-base text-center mb-1 ${
                  isDark ? "text-primary" : "text-[#16a34a]"
                }`}
              >
                {courseText}
              </Text>
              <Text
                className={`text-sm text-center ${
                  isDark ? "text-muted-dark" : "text-muted-light"
                }`}
              >
                {academicDetails}
              </Text>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              className="flex-row items-center justify-center bg-primary py-3.5 px-6 rounded-xl mb-6 self-center"
              onPress={() => router.push("/edit-profile")}
            >
              <MaterialIcons name="edit" size={20} color="#102217" />
              <Text className="text-[#102217] font-bold text-base ml-2">
                Edit Profile
              </Text>
            </TouchableOpacity>

            {/* Section Heading */}
            <View className="flex-row items-center mb-4">
              <View className="w-1 h-5 bg-primary rounded-full mr-3" />
              <Text
                className={`text-lg font-semibold ${
                  isDark ? "text-text-dark" : "text-text-light"
                }`}
              >
                Contact Information
              </Text>
            </View>

            {/* Contact Items */}
            <View className="gap-3 mb-6">
              {contactItems.map((item) => (
                <View
                  key={item.id}
                  className={`flex-row items-center p-4 rounded-2xl ${
                    isDark ? "bg-surface-dark-alt" : "bg-white"
                  }`}
                  style={
                    !isDark && {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }
                  }
                >
                  {/* Icon Container */}
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
                      isDark ? "bg-[#102217]" : "bg-slate-100"
                    }`}
                  >
                    <MaterialIcons
                      name={item.icon}
                      size={24}
                      color={isDark ? "#2bee79" : "#334155"}
                    />
                  </View>

                  {/* Contact Info */}
                  <View className="flex-1">
                    <Text
                      className={`text-xs font-medium mb-0.5 ${
                        isDark ? "text-muted-dark" : "text-muted-light"
                      }`}
                    >
                      {item.label}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className={`text-base font-medium ${
                        isDark ? "text-text-dark" : "text-text-light"
                      }`}
                      style={item.isEmpty ? { opacity: 0.6 } : null}
                    >
                      {item.displayValue}
                    </Text>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    className="w-10 h-10 items-center justify-center rounded-lg"
                    style={item.isEmpty ? { opacity: 0.4 } : null}
                    activeOpacity={item.isEmpty ? 1 : 0.8}
                    disabled={item.isEmpty}
                  >
                    <MaterialIcons
                      name={item.actionIcon}
                      size={22}
                      color={isDark ? "#94a3b8" : "#cbd5e1"}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              className={`flex-row items-center justify-center py-4 px-6 rounded-xl mt-2 ${
                signingOut ? "bg-red-400" : "bg-red-500"
              }`}
              style={signingOut ? { opacity: 0.7 } : null}
              onPress={async () => {
                if (signingOut) {
                  return;
                }
                try {
                  setSigningOut(true);
                  const { error } = await supabase.auth.signOut();
                  if (error) {
                    setProfileError(error.message ?? "Unable to log out.");
                    return;
                  }
                  await AsyncStorage.removeItem("token");
                  router.replace("/login");
                } catch (logoutError) {
                  setProfileError(logoutError.message ?? "Unable to log out.");
                } finally {
                  setSigningOut(false);
                }
              }}
            >
              {signingOut ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <MaterialIcons name="logout" size={20} color="#ffffff" />
              )}
              <Text className="text-white font-bold text-base ml-2">
                {signingOut ? "Signing out..." : "Logout"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}
