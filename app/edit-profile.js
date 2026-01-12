import "../global.css";

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
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Toast from "react-native-root-toast";

import { supabase } from "../lib/supabaseClient";

// Helper function to show toast with title and message
const showToast = (title, message, isError = true) => {
  Toast.show(`${title}\n${message}`, {
    duration: Toast.durations.LONG,
    position: Toast.positions.TOP,
    shadow: true,
    animation: true,
    hideOnPress: true,
    backgroundColor: isError ? "#dc2626" : "#16a34a",
    textColor: "#ffffff",
    opacity: 1,
    containerStyle: {
      marginTop: 50,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 12,
    },
  });
};

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

    // Validate required fields
    const missingFields = [];
    if (!trimmedFirstName) missingFields.push("First Name");
    if (!trimmedLastName) missingFields.push("Last Name");

    if (missingFields.length > 0) {
      showToast(
        "Missing fields",
        `Please fill in: ${missingFields.join(", ")}`
      );
      return;
    }

    // Validate phone number format
    if (trimmedPhone) {
      const isValid =
        (trimmedPhone.startsWith("09") &&
          trimmedPhone.length === 11 &&
          /^\d+$/.test(trimmedPhone)) ||
        (trimmedPhone.startsWith("9") &&
          !trimmedPhone.startsWith("09") &&
          trimmedPhone.length === 10 &&
          /^\d+$/.test(trimmedPhone));

      if (!isValid) {
        showToast(
          "Invalid Phone Number",
          "Phone must be 11 digits starting with 09, or 10 digits starting with 9."
        );
        return;
      }
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
    <View className={`flex-1 ${isDark ? "bg-[#0b1610]" : "bg-white"}`}>
      <View
        className={`flex-row items-center justify-between px-4 pt-14 pb-4 ${
          isDark ? "bg-[#0b1610]" : "bg-white"
        }`}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            isDark ? "bg-[#12251a]" : "bg-slate-100"
          }`}
          onPress={() => router.back()}
        >
          <MaterialIcons
            name="arrow-back"
            size={22}
            color={isDark ? "#f8fafc" : "#0f172a"}
          />
        </TouchableOpacity>

        <Text
          className={`text-lg font-semibold ${
            isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
          }`}
        >
          Edit Profile
        </Text>

        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color="#2bee79" />
            <Text
              className={`text-sm mt-3 ${
                isDark ? "text-[#92c9a8]" : "text-slate-500"
              }`}
            >
              Loading profile details…
            </Text>
          </View>
        ) : (
          <>
            {errorMessage ? (
              <Text className="text-sm text-red-500 mb-4 text-center">
                {errorMessage}
              </Text>
            ) : null}

            {infoMessage ? (
              <Text className="text-sm text-[#2bee79] mb-4 text-center">
                {infoMessage}
              </Text>
            ) : null}

            <View className="items-center mb-6">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePickAvatar}
                disabled={uploadingAvatar}
                className="relative"
              >
                <View
                  className={`w-[120px] h-[120px] rounded-full border-[3px] border-[#2bee79] overflow-hidden ${
                    isDark ? "bg-[#193324]" : "bg-slate-200"
                  }`}
                >
                  <Image
                    source={{
                      uri: avatarAsset?.uri || avatarUrl || DEFAULT_AVATAR,
                    }}
                    className="w-full h-full"
                  />
                </View>
                <View
                  className={`absolute bottom-0 right-0 bg-[#2bee79] w-9 h-9 rounded-full items-center justify-center border-[3px] ${
                    isDark ? "border-[#102217]" : "border-[#f6f8f7]"
                  }`}
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
                className={`text-xs mt-2 ${
                  isDark ? "text-[#92c9a8]" : "text-slate-500"
                }`}
              >
                Tap to change profile photo
              </Text>
            </View>

            <View className="mb-4">
              <Text
                className={`text-sm font-medium mb-1.5 ${
                  isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
                }`}
              >
                First Name
              </Text>
              <TextInput
                className={`h-12 px-4 rounded-xl text-base ${
                  isDark
                    ? "bg-[#12251a] text-[#f8fafc]"
                    : "bg-slate-100 text-[#0f172a]"
                }`}
                placeholder="Enter your first name"
                placeholderTextColor={placeholderColor}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>

            <View className="mb-4">
              <Text
                className={`text-sm font-medium mb-1.5 ${
                  isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
                }`}
              >
                Last Name
              </Text>
              <TextInput
                className={`h-12 px-4 rounded-xl text-base ${
                  isDark
                    ? "bg-[#12251a] text-[#f8fafc]"
                    : "bg-slate-100 text-[#0f172a]"
                }`}
                placeholder="Enter your last name"
                placeholderTextColor={placeholderColor}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>

            <View className="mb-4">
              <Text
                className={`text-sm font-medium mb-1.5 ${
                  isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
                }`}
              >
                University Email
              </Text>
              <TextInput
                className={`h-12 px-4 rounded-xl text-base opacity-60 ${
                  isDark
                    ? "bg-[#1a3326] text-[#92c9a8]"
                    : "bg-slate-200 text-slate-500"
                }`}
                editable={false}
                selectTextOnFocus={false}
                value={email}
              />
              <Text
                className={`text-xs mt-1.5 ${
                  isDark ? "text-[#92c9a8]" : "text-slate-500"
                }`}
              >
                This address comes from your university account.
              </Text>
            </View>

            <View className="mb-4">
              <Text
                className={`text-sm font-medium mb-1.5 ${
                  isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
                }`}
              >
                Course
              </Text>
              <TextInput
                className={`h-12 px-4 rounded-xl text-base ${
                  isDark
                    ? "bg-[#12251a] text-[#f8fafc]"
                    : "bg-slate-100 text-[#0f172a]"
                }`}
                placeholder="Enter your course"
                placeholderTextColor={placeholderColor}
                value={course}
                onChangeText={setCourse}
              />
              <Text
                className={`text-xs mt-1.5 ${
                  isDark ? "text-[#92c9a8]" : "text-slate-500"
                }`}
              >
                Example: BS Computer Science
              </Text>
            </View>

            <View className="mb-4">
              <Text
                className={`text-sm font-medium mb-1.5 ${
                  isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
                }`}
              >
                Phone Number
              </Text>
              <TextInput
                className={`h-12 px-4 rounded-xl text-base ${
                  isDark
                    ? "bg-[#12251a] text-[#f8fafc]"
                    : "bg-slate-100 text-[#0f172a]"
                }`}
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
                className={`text-xs mt-1.5 ${
                  isDark ? "text-[#92c9a8]" : "text-slate-500"
                }`}
              >
                Enter exactly 11 digits (e.g., 09123456789).
              </Text>
            </View>

            <View className="mb-4">
              <Text
                className={`text-sm font-medium mb-1.5 ${
                  isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
                }`}
              >
                Facebook Name or Link
              </Text>
              <TextInput
                className={`h-12 px-4 rounded-xl text-base ${
                  isDark
                    ? "bg-[#12251a] text-[#f8fafc]"
                    : "bg-slate-100 text-[#0f172a]"
                }`}
                placeholder="Add your Facebook details"
                placeholderTextColor={placeholderColor}
                value={facebookName}
                onChangeText={setFacebookName}
                autoCapitalize="none"
              />
              <Text
                className={`text-xs mt-1.5 ${
                  isDark ? "text-[#92c9a8]" : "text-slate-500"
                }`}
              >
                Provide a profile link or name classmates can search.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              className={`h-14 rounded-xl flex-row items-center justify-center mt-4 ${
                saving || !profileId ? "bg-[#2bee79]/50" : "bg-[#2bee79]"
              }`}
              onPress={handleSave}
              disabled={saving || !profileId}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#102217" />
              ) : (
                <MaterialIcons name="save" size={22} color="#102217" />
              )}
              <Text className="text-base font-semibold text-[#102217] ml-2">
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}
