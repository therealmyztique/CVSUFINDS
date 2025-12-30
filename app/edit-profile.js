import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";

import { supabase } from "../lib/supabaseClient";
import { editProfileStyles as styles } from "./styles/editProfileStyles";

export default function EditProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [facebookName, setFacebookName] = useState("");
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const mountedRef = useRef(true);
  const placeholderColor = isDark ? "#92c9a8" : "#94a3b8";

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadProfile = useCallback(async () => {
    if (!mountedRef.current) {
      return;
    }

    setErrorMessage("");
    setInfoMessage("");
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        if (mountedRef.current) {
          setErrorMessage(userError.message ?? "Unable to load your account.");
        }
        return;
      }

      if (!user) {
        if (mountedRef.current) {
          setErrorMessage("Session expired. Please log in again.");
        }
        router.replace("/login");
        return;
      }

      if (mountedRef.current) {
        setProfileId(user.id);
        setEmail(user.email ?? "");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, course, phone_num, fb_name")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        if (mountedRef.current) {
          setErrorMessage(error.message ?? "Unable to load profile details.");
        }
        return;
      }

      if (!mountedRef.current) {
        return;
      }

      setFirstName(data?.first_name ?? "");
      setLastName(data?.last_name ?? "");
      const normalizedEmail = (data?.email ?? email ?? "").trim();
      setEmail(normalizedEmail);
      setCourse(data?.course ?? "");
      setPhoneNumber(data?.phone_num ?? "");
      setFacebookName(data?.fb_name ?? "");
    } catch (error) {
      if (mountedRef.current) {
        setErrorMessage(error.message ?? "Unable to load profile details.");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = useCallback(async () => {
    if (saving || !profileId) {
      return;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedCourse = course.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedFacebook = facebookName.trim();
    const trimmedEmail = email.trim();

    if (trimmedPhone && !/^\d{11}$/.test(trimmedPhone)) {
      setErrorMessage("Phone number must be exactly 11 digits.");
      setInfoMessage("");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setInfoMessage("");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: profileId,
          first_name: trimmedFirstName || null,
          last_name: trimmedLastName || null,
          email: trimmedEmail || null,
          course: trimmedCourse || null,
          phone_num: trimmedPhone || null,
          fb_name: trimmedFacebook || null,
        });

      if (error) {
        setErrorMessage(error.message ?? "Unable to save changes.");
        return;
      }

      setInfoMessage("Profile updated successfully.");
      router.back();
    } catch (error) {
      setErrorMessage(error.message ?? "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  }, [course, email, facebookName, firstName, lastName, phoneNumber, profileId, router, saving]);

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
          isDark ? styles.containerDark : styles.containerLight,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.backButton,
            isDark ? styles.backButtonDark : styles.backButtonLight,
          ]}
          onPress={() => router.back()}
        >
          <MaterialIcons
            name="arrow-back"
            size={22}
            color={isDark ? "#f8fafc" : "#0f172a"}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            isDark ? styles.headerTitleDark : styles.headerTitleLight,
          ]}
        >
          Edit Profile
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#2bee79" />
            <Text
              style={[
                styles.message,
                isDark ? styles.helperDark : styles.helperLight,
              ]}
            >
              Loading profile details…
            </Text>
          </View>
        ) : (
          <>
            {errorMessage ? (
              <Text
                style={[
                  styles.message,
                  styles.messageError,
                ]}
              >
                {errorMessage}
              </Text>
            ) : null}

            {infoMessage ? (
              <Text
                style={[
                  styles.message,
                  styles.messageInfo,
                ]}
              >
                {infoMessage}
              </Text>
            ) : null}

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.labelDark : styles.labelLight,
                ]}
              >
                First Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                ]}
                placeholder="Enter your first name"
                placeholderTextColor={placeholderColor}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.labelDark : styles.labelLight,
                ]}
              >
                Last Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                ]}
                placeholder="Enter your last name"
                placeholderTextColor={placeholderColor}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.labelDark : styles.labelLight,
                ]}
              >
                University Email
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                  styles.inputDisabled,
                  isDark ? styles.inputDisabledDark : styles.inputDisabledLight,
                ]}
                editable={false}
                selectTextOnFocus={false}
                value={email}
              />
              <Text
                style={[
                  styles.helper,
                  isDark ? styles.helperDark : styles.helperLight,
                ]}
              >
                This address comes from your university account.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.labelDark : styles.labelLight,
                ]}
              >
                Course
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                ]}
                placeholder="Enter your course"
                placeholderTextColor={placeholderColor}
                value={course}
                onChangeText={setCourse}
              />
              <Text
                style={[
                  styles.helper,
                  isDark ? styles.helperDark : styles.helperLight,
                ]}
              >
                Example: BS Computer Science
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.labelDark : styles.labelLight,
                ]}
              >
                Phone Number
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                ]}
                placeholder="Add your contact number"
                placeholderTextColor={placeholderColor}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={(value) => {
                  const digitsOnly = value.replace(/\D/g, "");
                  setPhoneNumber(digitsOnly);
                }}
                maxLength={11}
              />
              <Text
                style={[
                  styles.helper,
                  isDark ? styles.helperDark : styles.helperLight,
                ]}
              >
                Enter exactly 11 digits (e.g., 09123456789).
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.labelDark : styles.labelLight,
                ]}
              >
                Facebook Name or Link
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                ]}
                placeholder="Add your Facebook details"
                placeholderTextColor={placeholderColor}
                value={facebookName}
                onChangeText={setFacebookName}
                autoCapitalize="none"
              />
              <Text
                style={[
                  styles.helper,
                  isDark ? styles.helperDark : styles.helperLight,
                ]}
              >
                Provide a profile link or name classmates can search.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.button,
                saving || !profileId ? styles.buttonDisabled : null,
              ]}
              onPress={handleSave}
              disabled={saving || !profileId}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#102217" />
              ) : (
                <MaterialIcons
                  name="save"
                  size={22}
                  color="#102217"
                />
              )}
              <Text style={styles.buttonText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
