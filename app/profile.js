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

import { supabase } from "../lib/supabaseClient";
import { profileStyles as styles } from "./styles/profileStyles";

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
        icon: "public",
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
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      <View
        style={[
          styles.header,
          isDark ? styles.headerSurfaceDark : styles.headerSurfaceLight,
        ]}
      >
        <View style={styles.headerSpacer} />
        <Text
          style={[
            styles.headerTitle,
            isDark ? styles.headerTitleDark : styles.headerTitleLight,
          ]}
        >
          Profile
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loadingProfile ? (
          <View style={{ paddingVertical: 48, alignItems: "center", gap: 12 }}>
            <ActivityIndicator size="large" color="#2bee79" />
            <Text
              style={[
                styles.subcaption,
                isDark ? styles.subcaptionDark : styles.subcaptionLight,
                { color: isDark ? "#94a3b8" : "#64748b" },
              ]}
            >
              Loading profile…
            </Text>
          </View>
        ) : (
          <>
            {profileError ? (
              <View
                style={{
                  marginBottom: 20,
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: isDark
                    ? "rgba(248,113,113,0.35)"
                    : "rgba(248,113,113,0.4)",
                  backgroundColor: isDark
                    ? "rgba(248,113,113,0.12)"
                    : "rgba(248,113,113,0.15)",
                }}
              >
                <Text
                  style={{
                    color: isDark ? "#fecaca" : "#b91c1c",
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {profileError}
                </Text>
              </View>
            ) : null}

            <View style={styles.avatarWrapper}>
              <View style={styles.avatarRing}>
                <Image
                  source={{ uri: profile?.avatar_url || AVATAR_URI }}
                  style={styles.avatarImage}
                />
              </View>
            </View>

            <View style={styles.headingBlock}>
              <Text
                style={[
                  styles.nameText,
                  isDark ? styles.nameTextDark : styles.nameTextLight,
                ]}
              >
                {fullName}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  isDark ? styles.subtitleDark : styles.subtitleLight,
                ]}
              >
                {courseText}
              </Text>
              <Text
                style={[
                  styles.subcaption,
                  isDark ? styles.subcaptionDark : styles.subcaptionLight,
                ]}
              >
                {academicDetails}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.editButton}
              onPress={() => router.push("/edit-profile")}
            >
              <MaterialIcons name="edit" size={20} color="#102217" />
              <Text style={styles.editLabel}>Edit Profile</Text>
            </TouchableOpacity>

            <View style={styles.sectionHeading}>
              <View style={styles.headingDivider} />
              <Text
                style={[
                  styles.headingText,
                  isDark ? styles.headingTextDark : styles.headingTextLight,
                ]}
              >
                Contact Information
              </Text>
            </View>

            <View style={styles.contactList}>
              {contactItems.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.contactItem,
                    isDark ? styles.contactItemDark : styles.contactItemLight,
                  ]}
                >
                  <View
                    style={[
                      styles.iconPill,
                      isDark ? styles.iconPillDark : null,
                    ]}
                  >
                    <MaterialIcons
                      name={item.icon}
                      size={24}
                      color={isDark ? "#2bee79" : "#334155"}
                    />
                  </View>

                  <View style={styles.contactMeta}>
                    <Text
                      style={[
                        styles.contactLabel,
                        isDark
                          ? styles.contactLabelDark
                          : styles.contactLabelLight,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.contactValue,
                        isDark
                          ? styles.contactValueDark
                          : styles.contactValueLight,
                        item.isEmpty ? { opacity: 0.6 } : null,
                      ]}
                    >
                      {item.displayValue}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.contactAction,
                      item.isEmpty ? { opacity: 0.4 } : null,
                    ]}
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

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.logoutButton,
                signingOut ? styles.logoutButtonDisabled : null,
              ]}
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
              <Text style={styles.logoutButtonText}>
                {signingOut ? "Signing out..." : "Logout"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomNav,
          isDark ? styles.bottomNavDark : styles.bottomNavLight,
        ]}
      >
        <View style={styles.navItems}>
          <TouchableOpacity
            style={styles.navButton}
            activeOpacity={0.85}
            onPress={() => router.replace("/home")}
          >
            <MaterialIcons
              name="home"
              size={26}
              color={isDark ? "#94a3b8" : "#94a3b8"}
            />
            <Text
              style={[
                styles.navLabel,
                isDark
                  ? styles.navLabelInactiveDark
                  : styles.navLabelInactiveLight,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} activeOpacity={0.85}>
            <MaterialIcons
              name="task-alt"
              size={26}
              color={isDark ? "#94a3b8" : "#94a3b8"}
            />
            <Text
              style={[
                styles.navLabel,
                isDark
                  ? styles.navLabelInactiveDark
                  : styles.navLabelInactiveLight,
              ]}
            >
              Resolved Items
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} activeOpacity={0.85}>
            <MaterialIcons name="person" size={26} color="#2bee79" />
            <Text style={[styles.navLabel, styles.navLabelActive]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
