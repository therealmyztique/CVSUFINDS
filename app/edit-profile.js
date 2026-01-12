import { MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { supabase } from "../lib/supabaseClient";
import { editProfileStyles as styles } from "../styles/editProfileStyles";

const DEFAULT_AVATAR = "https://via.placeholder.com/150";

const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const decodeBase64ToUint8Array = (base64) => {
  if (!base64) {
    return new Uint8Array();
  }

  if (typeof global.atob === "function") {
    const binaryString = global.atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i += 1) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  const sanitized = base64.replace(/[^A-Za-z0-9+/=]/g, "");
  const output = [];
  let buffer = 0;
  let bitsCollected = 0;

  for (let i = 0; i < sanitized.length; i += 1) {
    const char = sanitized.charAt(i);
    if (char === "=") {
      break;
    }
    const value = BASE64_ALPHABET.indexOf(char);
    if (value === -1) {
      continue;
    }

    buffer = (buffer << 6) | value;
    bitsCollected += 6;

    if (bitsCollected >= 8) {
      bitsCollected -= 8;
      output.push((buffer >> bitsCollected) & 0xff);
    }
  }

  return new Uint8Array(output);
};

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
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarAsset, setAvatarAsset] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
        .select(
          "first_name, last_name, email, course, phone_num, fb_name, avatar_url"
        )
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
      setAvatarUrl(data?.avatar_url ?? "");
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

  const handlePickAvatar = useCallback(async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission needed",
          "Please allow access to your photos to change your profile picture."
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (pickerResult.canceled || !pickerResult.assets?.length) {
        return;
      }

      setAvatarAsset(pickerResult.assets[0]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to pick image right now.";
      Alert.alert("Image picker error", message);
    }
  }, []);

  const uploadAvatar = useCallback(async () => {
    if (!avatarAsset?.uri || !profileId) {
      return null;
    }

    setUploadingAvatar(true);

    try {
      const fileExtension =
        avatarAsset.uri.split(".").pop()?.toLowerCase() || "jpg";
      const contentType =
        avatarAsset.mimeType ||
        `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`;
      const storagePath = `${profileId}/${Date.now()}.${fileExtension}`;

      let uploadError;

      if (Platform.OS === "web") {
        const response = await fetch(avatarAsset.uri);
        const blob = await response.blob();
        const result = await supabase.storage
          .from("avatar")
          .upload(storagePath, blob, {
            contentType,
            cacheControl: "3600",
            upsert: true,
          });
        uploadError = result.error;
      } else {
        const base64Data =
          avatarAsset.base64 ||
          (await FileSystem.readAsStringAsync(avatarAsset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          }));
        const byteArray = decodeBase64ToUint8Array(base64Data);

        const result = await supabase.storage
          .from("avatar")
          .upload(storagePath, byteArray, {
            contentType,
            cacheControl: "3600",
            upsert: true,
          });
        uploadError = result.error;
      }

      if (uploadError) {
        throw new Error(`Avatar upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatar")
        .getPublicUrl(storagePath);

      return publicUrlData?.publicUrl || null;
    } catch (error) {
      console.error("Avatar upload error:", error);
      throw error;
    } finally {
      setUploadingAvatar(false);
    }
  }, [avatarAsset, profileId]);

  const handleSave = useCallback(async () => {
    if (saving || !profileId) {
      return;
    }

    const trimmedFirstName = String(firstName || "").trim();
    const trimmedLastName = String(lastName || "").trim();
    const trimmedCourse = String(course || "").trim();
    const trimmedPhone = String(phoneNumber || "").trim();
    const trimmedFacebook = String(facebookName || "").trim();
    const trimmedEmail = String(email || "").trim();

    if (trimmedPhone && !/^\d{11}$/.test(trimmedPhone)) {
      setErrorMessage("Phone number must be exactly 11 digits.");
      setInfoMessage("");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setInfoMessage("");

      let newAvatarUrl = avatarUrl;

      // Upload new avatar if selected
      if (avatarAsset?.uri) {
        try {
          const uploadedUrl = await uploadAvatar();
          if (uploadedUrl) {
            newAvatarUrl = uploadedUrl;
          }
        } catch (error) {
          setErrorMessage(error.message || "Failed to upload avatar.");
          setSaving(false);
          return;
        }
      }

      const { error } = await supabase.from("profiles").upsert({
        id: profileId,
        first_name: trimmedFirstName || null,
        last_name: trimmedLastName || null,
        email: trimmedEmail || null,
        course: trimmedCourse || null,
        phone_num: trimmedPhone || null,
        fb_name: trimmedFacebook || null,
        avatar_url: newAvatarUrl || null,
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
  }, [
    avatarAsset,
    avatarUrl,
    course,
    email,
    facebookName,
    firstName,
    lastName,
    phoneNumber,
    profileId,
    router,
    saving,
    uploadAvatar,
  ]);

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
              <Text style={[styles.message, styles.messageError]}>
                {errorMessage}
              </Text>
            ) : null}

            {infoMessage ? (
              <Text style={[styles.message, styles.messageInfo]}>
                {infoMessage}
              </Text>
            ) : null}

            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePickAvatar}
                disabled={uploadingAvatar}
                style={{
                  position: "relative",
                }}
              >
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    borderWidth: 3,
                    borderColor: "#2bee79",
                    overflow: "hidden",
                    backgroundColor: isDark ? "#193324" : "#e2e8f0",
                  }}
                >
                  <Image
                    source={{
                      uri: avatarAsset?.uri || avatarUrl || DEFAULT_AVATAR,
                    }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </View>
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "#2bee79",
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 3,
                    borderColor: isDark ? "#102217" : "#f6f8f7",
                  }}
                >
                  {uploadingAvatar ? (
                    <ActivityIndicator size="small" color="#102217" />
                  ) : (
                    <MaterialIcons
                      name="camera-alt"
                      size={18}
                      color="#102217"
                    />
                  )}
                </View>
              </TouchableOpacity>
              <Text
                style={[
                  styles.helper,
                  isDark ? styles.helperDark : styles.helperLight,
                  { marginTop: 8 },
                ]}
              >
                Tap to change profile photo
              </Text>
            </View>

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
                value={String(phoneNumber || "")}
                onChangeText={(value) => {
                  const digitsOnly = String(value || "").replace(/\D/g, "");
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
                <MaterialIcons name="save" size={22} color="#102217" />
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
