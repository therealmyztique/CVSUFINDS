import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { generateImageEmbedding } from "../lib/embeddingService";
import { supabase } from "../lib/supabaseClient";

const CATEGORY_OPTIONS = [
  { label: "Electronics", value: "electronics" },
  { label: "Clothing", value: "clothing" },
  { label: "Accessories", value: "accessories" },
  { label: "Documents/ID", value: "documents" },
  { label: "Keys", value: "keys" },
  { label: "Other", value: "other" },
];

const CONTACT_OPTIONS = [
  { label: "Facebook", value: "facebook" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
];

const PLACEHOLDER_IMAGE = {
  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAc16CvC4n81XeD46Lz0Nn91VBSzi1iAGav_sX1J1cY5qx6vCzp-gQSvsgeGoh6QVuvdreij16XcQlGYECGDTT_E5ltQOSKlrW6Hf8048YY6vpIJaigV4xKlP0Mzv111XfQlOtpONEWBUKVHmsnCv6AdU956DFtiQ318YmtV1xI5SlQH0Si2EhJAWh5jskJotoIjZSJ42ILEcIWpNoQ13Vysfsc193CaE3M6IvY2PBE2xvGnK7nmRfEPrjCIUQpcC16CYR8KrmSk61k",
};

const LIGHT_SURFACE_COLOR = "#ffffff";
const DARK_SURFACE_COLOR = "#193324";
const LIGHT_BORDER_COLOR = "#e2e8f0";
const DARK_BORDER_COLOR = "#326747";
const LIGHT_TEXT_COLOR = "#0f172a";
const DARK_TEXT_COLOR = "#f8fafc";

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

const createImageBlob = async (asset, contentType) => {
  if (!asset?.uri) {
    throw new Error("Invalid image asset selected.");
  }

  if (Platform.OS === "web") {
    const response = await fetch(asset.uri);
    if (!response.ok) {
      throw new Error("Couldn't read the selected image.");
    }
    return response.blob();
  }

  // For React Native, return the base64 string - we'll handle it differently in upload
  const base64Data =
    asset.base64 ||
    (await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    }));

  return base64Data;
};

const insertFoundReport = async (payload) =>
  supabase
    .from("found_reports")
    .insert({
      ...payload,
      status: "active",
    })
    .select("id")
    .single();

export default function ReportFoundScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [reward, setReward] = useState("");
  const [notes, setNotes] = useState("");
  const [contactPref, setContactPref] = useState("facebook");
  const [contactInfo, setContactInfo] = useState("");
  const [dateTime, setDateTime] = useState(null);
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const [imageAsset, setImageAsset] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const placeholderColor = isDark ? "#92c9a8" : "#94a3b8";

  const formattedDateTime = useMemo(() => {
    if (!dateTime) {
      return "";
    }
    try {
      return dateTime.toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  }, [dateTime]);

  const handleAndroidDateTime = (initial) => {
    DateTimePickerAndroid.open({
      value: initial,
      mode: "date",
      onChange: (event, selectedDate) => {
        if (event.type !== "set" || !selectedDate) {
          return;
        }
        const dateWithTime = new Date(selectedDate);
        DateTimePickerAndroid.open({
          value: dateWithTime,
          mode: "time",
          onChange: (timeEvent, selectedTime) => {
            if (timeEvent.type !== "set" || !selectedTime) {
              return;
            }
            const finalDate = new Date(dateWithTime);
            finalDate.setHours(selectedTime.getHours());
            finalDate.setMinutes(selectedTime.getMinutes());
            setDateTime(finalDate);
          },
        });
      },
    });
  };

  const openDateTimePicker = () => {
    const initial = dateTime || new Date();
    if (Platform.OS === "android") {
      handleAndroidDateTime(initial);
      return;
    }
    setShowIOSPicker(true);
  };

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission needed",
          "Please allow access to your photos to upload a found item image."
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (pickerResult.canceled || !pickerResult.assets?.length) {
        return;
      }

      setImageAsset(pickerResult.assets[0]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to pick image right now.";
      Alert.alert("Image picker error", message);
    }
  };

  const handleSubmit = async () => {
    if (uploading) {
      return;
    }

    if (
      !itemName.trim() ||
      !category ||
      !location.trim() ||
      !dateTime ||
      !contactInfo.trim()
    ) {
      Alert.alert(
        "Missing details",
        "Please fill in all required fields before submitting."
      );
      return;
    }

    if (!imageAsset?.uri) {
      Alert.alert("Image required", "Please upload a photo of the found item.");
      return;
    }

    setUploading(true);

    try {
      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Auth error:", userError);
        Alert.alert(
          "Authentication error",
          userError.message || "Please log in to submit a report."
        );
        setUploading(false);
        return;
      }

      if (!user) {
        Alert.alert(
          "Authentication required",
          "Please log in to submit a report."
        );
        setUploading(false);
        return;
      }

      const fileExtension =
        imageAsset.uri.split(".").pop()?.toLowerCase() || "jpg";
      const contentType =
        imageAsset.mimeType ||
        `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`;
      const storagePath = `reports/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${fileExtension}`;

      let uploadError;

      if (Platform.OS === "web") {
        const imageBlob = await createImageBlob(imageAsset, contentType);
        const result = await supabase.storage
          .from("item-images")
          .upload(storagePath, imageBlob, {
            contentType,
            cacheControl: "3600",
            upsert: false,
          });
        uploadError = result.error;
      } else {
        // For React Native, use base64 decode approach
        const base64Data = await createImageBlob(imageAsset, contentType);
        const byteArray = decodeBase64ToUint8Array(base64Data);

        const result = await supabase.storage
          .from("item-images")
          .upload(storagePath, byteArray, {
            contentType,
            cacheControl: "3600",
            upsert: false,
          });
        uploadError = result.error;
      }

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("item-images")
        .getPublicUrl(storagePath);

      const imageUrl = publicUrlData?.publicUrl;
      if (!imageUrl) {
        throw new Error("Unable to retrieve the uploaded image URL.");
      }

      const { data: insertedReport, error: insertError } =
        await insertFoundReport({
          reporter_id: user.id,
          title: itemName.trim(),
          category,
          description: description.trim() || null,
          location_found: location.trim(),
          reward: reward.trim() || null,
          notes: notes.trim() || null,
          contact_preference: contactPref,
          contact_value: contactInfo.trim(),
          found_at: dateTime ? dateTime.toISOString() : null,
          image_url: imageUrl,
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      // Generate CLIP image embedding for matching
      if (insertedReport?.id) {
        try {
          const embeddingResult = await generateImageEmbedding(
            imageUrl,
            insertedReport.id,
            "found"
          );
          if (embeddingResult.success) {
            // Embedding generated successfully
          } else {
            console.warn(
              "Failed to generate embedding:",
              embeddingResult.error
            );
          }
        } catch (embError) {
          console.warn("Embedding generation error:", embError);
          // Don't fail the report submission if embedding fails
        }
      }

      // Report successfully submitted - show success modal
      setShowSuccessModal(true);
      // Reset form
      setItemName("");
      setCategory("");
      setDescription("");
      setLocation("");
      setDateTime(null);
      setReward("");
      setNotes("");
      setContactInfo("");
      setShowCategoryList(false);
      setImageAsset(null);
    } catch (error) {
      console.error("Submission error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting.";
      Alert.alert("Submission failed", message);
    }
    setUploading(false);
  };

  // Handle closing the success modal
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.replace("/home");
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-[#102217]" : "bg-[#f8fafc]"}`}>
      <View
        className={`flex-row items-center justify-between px-4 pt-14 pb-4 ${
          isDark ? "bg-[#193324]" : "bg-white"
        }`}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          className={`w-11 h-11 rounded-full items-center justify-center ${
            isDark ? "bg-[#102217]" : "bg-[#f1f5f9]"
          }`}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? "#ffffff" : "#0f172a"}
          />
        </TouchableOpacity>

        <Text
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-[#0f172a]"
          }`}
        >
          Report Found Item
        </Text>

        <View className="w-11" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text
            className={`text-2xl font-bold mb-2 ${
              isDark ? "text-white" : "text-[#0f172a]"
            }`}
          >
            Found something?
          </Text>
          <Text
            className={`text-base mb-6 ${
              isDark ? "text-[#92c9a8]" : "text-[#64748b]"
            }`}
          >
            Upload a photo to help our AI match it with lost reports.
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={handlePickImage}>
          <ImageBackground
            source={imageAsset ? { uri: imageAsset.uri } : PLACEHOLDER_IMAGE}
            className={`h-52 rounded-2xl overflow-hidden mb-6 border ${
              isDark ? "border-[#326747]" : "border-[#e2e8f0]"
            }`}
            imageStyle={{ opacity: 0.85 }}
          >
            <View
              className={`flex-1 items-center justify-center ${
                imageAsset ? "bg-black/25" : ""
              }`}
            >
              <View className="w-16 h-16 rounded-full bg-[#2bee79]/15 items-center justify-center mb-3">
                <MaterialIcons
                  name={imageAsset ? "photo-camera" : "add-a-photo"}
                  size={32}
                  color="#2bee79"
                />
              </View>
              <Text className="text-white text-base font-semibold">
                {imageAsset ? "Tap to change photo" : "Tap to Upload Photo"}
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <View className="mb-5">
          <Text
            className={`text-sm font-medium mb-2 ${
              isDark ? "text-[#92c9a8]" : "text-[#64748b]"
            }`}
          >
            Item Name
          </Text>
          <TextInput
            className={`h-14 px-4 rounded-2xl text-base border ${
              isDark
                ? "bg-[#193324] border-[#326747] text-[#f8fafc]"
                : "bg-white border-[#e2e8f0] text-[#0f172a]"
            }`}
            placeholder="e.g. Blue Backpack"
            placeholderTextColor={placeholderColor}
            value={itemName}
            onChangeText={setItemName}
          />
        </View>

        <View className="mb-5">
          <Text
            className={`text-sm font-medium mb-2 ${
              isDark ? "text-[#92c9a8]" : "text-[#64748b]"
            }`}
          >
            Item Category
          </Text>
          <View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowCategoryList((prev) => !prev)}
              className={`h-14 px-4 pr-12 rounded-2xl border flex-row items-center ${
                isDark
                  ? "bg-[#193324] border-[#326747]"
                  : "bg-white border-[#e2e8f0]"
              }`}
            >
              <Text
                style={{
                  color: category
                    ? isDark
                      ? "#f8fafc"
                      : "#0f172a"
                    : placeholderColor,
                  fontSize: 16,
                }}
              >
                {category
                  ? CATEGORY_OPTIONS.find((option) => option.value === category)
                      ?.label
                  : "Select a category"}
              </Text>
              <MaterialIcons
                name={showCategoryList ? "expand-less" : "expand-more"}
                size={24}
                color={placeholderColor}
                style={{ position: "absolute", right: 16 }}
              />
            </TouchableOpacity>
            {showCategoryList ? (
              <View
                className={`mt-2 rounded-2xl border overflow-hidden ${
                  isDark
                    ? "bg-[#193324] border-[#326747]"
                    : "bg-white border-[#e2e8f0]"
                }`}
              >
                {CATEGORY_OPTIONS.map((option) => {
                  const isSelected = option.value === category;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.85}
                      onPress={() => {
                        setCategory(option.value);
                        setShowCategoryList(false);
                      }}
                      className={`py-3.5 px-4 ${
                        isSelected ? "bg-[#2bee79]/10" : ""
                      }`}
                    >
                      <Text
                        style={{
                          color: isSelected
                            ? "#cafff0ff"
                            : isDark
                            ? DARK_TEXT_COLOR
                            : LIGHT_TEXT_COLOR,
                          fontWeight: isSelected ? "900" : "500",
                        }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
        </View>

        <View className="mb-5">
          <Text
            className={`text-sm font-medium mb-2 ${
              isDark ? "text-[#92c9a8]" : "text-[#64748b]"
            }`}
          >
            Description
          </Text>
          <TextInput
            multiline
            className={`min-h-[100px] p-4 rounded-2xl text-base border ${
              isDark
                ? "bg-[#193324] border-[#326747] text-[#f8fafc]"
                : "bg-white border-[#e2e8f0] text-[#0f172a]"
            }`}
            style={{ textAlignVertical: "top" }}
            placeholder="Describe the item (color, brand, distinguishing marks...)"
            placeholderTextColor={placeholderColor}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View className="mb-5">
          <Text
            className={`text-sm font-medium mb-2 ${
              isDark ? "text-[#92c9a8]" : "text-[#64748b]"
            }`}
          >
            Location Found
          </Text>
          <View className="relative">
            <TextInput
              className={`h-14 px-4 pr-12 rounded-2xl text-base border ${
                isDark
                  ? "bg-[#193324] border-[#326747] text-[#f8fafc]"
                  : "bg-white border-[#e2e8f0] text-[#0f172a]"
              }`}
              placeholder="e.g. DIT 5th Floor"
              placeholderTextColor={placeholderColor}
              value={location}
              onChangeText={setLocation}
            />
            <MaterialIcons
              name="location-on"
              size={22}
              color={placeholderColor}
              style={{ position: "absolute", right: 16, top: 16 }}
            />
          </View>
        </View>

        <View className="mb-5">
          <Text
            className={`text-sm font-medium mb-2 ${
              isDark ? "text-[#92c9a8]" : "text-[#64748b]"
            }`}
          >
            Date & Time Found
          </Text>
          <View className="relative">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={openDateTimePicker}
              className={`h-14 px-4 pr-12 rounded-2xl border justify-center ${
                isDark
                  ? "bg-[#193324] border-[#326747]"
                  : "bg-white border-[#e2e8f0]"
              }`}
            >
              <Text
                style={{
                  color: formattedDateTime
                    ? isDark
                      ? "#f8fafc"
                      : "#0f172a"
                    : placeholderColor,
                  fontSize: 16,
                }}
              >
                {formattedDateTime || "Select date and time"}
              </Text>
            </TouchableOpacity>
            <MaterialIcons
              name="calendar-today"
              size={22}
              color={placeholderColor}
              style={{ position: "absolute", right: 16, top: 16 }}
            />
          </View>
        </View>

        <View className="mb-5">
          <Text
            className={`text-sm font-medium mb-2 ${
              isDark ? "text-[#92c9a8]" : "text-[#64748b]"
            }`}
          >
            Reward{" "}
            <Text className={isDark ? "text-[#5e8c72]" : "text-[#94a3b8]"}>
              (Optional)
            </Text>
          </Text>
          <View className="relative">
            <TextInput
              className={`h-14 px-4 pr-12 rounded-2xl text-base border ${
                isDark
                  ? "bg-[#193324] border-[#326747] text-[#f8fafc]"
                  : "bg-white border-[#e2e8f0] text-[#0f172a]"
              }`}
              placeholder="e.g. ₱100"
              placeholderTextColor={placeholderColor}
              value={reward}
              onChangeText={setReward}
            />
            <MaterialIcons
              name="payments"
              size={22}
              color={placeholderColor}
              style={{ position: "absolute", right: 16, top: 16 }}
            />
          </View>
        </View>

        <View className="mb-5">
          <Text
            className={`text-sm font-medium mb-2 ${
              isDark ? "text-[#92c9a8]" : "text-[#64748b]"
            }`}
          >
            Additional Notes{" "}
            <Text className={isDark ? "text-[#5e8c72]" : "text-[#94a3b8]"}>
              (Optional)
            </Text>
          </Text>
          <TextInput
            multiline
            className={`min-h-[80px] p-4 rounded-2xl text-base border ${
              isDark
                ? "bg-[#193324] border-[#326747] text-[#f8fafc]"
                : "bg-white border-[#e2e8f0] text-[#0f172a]"
            }`}
            style={{ textAlignVertical: "top" }}
            placeholder="Any other details?"
            placeholderTextColor={placeholderColor}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View className="mb-5">
          <Text
            className={`text-sm font-medium mb-2 ${
              isDark ? "text-[#92c9a8]" : "text-[#64748b]"
            }`}
          >
            Contact Preference
          </Text>
          <View className="flex-row gap-3 mb-3">
            {CONTACT_OPTIONS.map((option) => {
              const isSelected = option.value === contactPref;
              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.85}
                  onPress={() => setContactPref(option.value)}
                  className={`flex-1 py-3 rounded-xl border items-center ${
                    isSelected
                      ? "bg-[#2bee79]/15 border-[#2bee79]"
                      : isDark
                      ? "bg-[#193324] border-[#326747]"
                      : "bg-white border-[#e2e8f0]"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected
                        ? isDark
                          ? "text-[#2bee79]"
                          : "text-[#059669]"
                        : isDark
                        ? "text-[#92c9a8]"
                        : "text-[#64748b]"
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            className={`h-14 px-4 rounded-2xl text-base border ${
              isDark
                ? "bg-[#193324] border-[#326747] text-[#f8fafc]"
                : "bg-white border-[#e2e8f0] text-[#0f172a]"
            }`}
            placeholder="Enter link, email, or phone number"
            placeholderTextColor={placeholderColor}
            value={contactInfo}
            onChangeText={setContactInfo}
          />
        </View>
      </ScrollView>

      <View
        className={`px-4 pt-3 pb-8 border-t ${
          isDark ? "bg-[#193324] border-[#326747]" : "bg-white border-[#e2e8f0]"
        }`}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSubmit}
          disabled={uploading}
          className={`flex-row items-center justify-center py-4 rounded-full bg-[#2bee79] ${
            uploading ? "opacity-60" : ""
          }`}
        >
          <Text className="text-[#102217] text-base font-semibold mr-2">
            {uploading ? "Submitting..." : "Submit Report"}
          </Text>
          {uploading ? (
            <ActivityIndicator size="small" color="#102217" />
          ) : (
            <MaterialIcons name="check" size={20} color="#102217" />
          )}
        </TouchableOpacity>
      </View>

      {Platform.OS === "ios" && showIOSPicker ? (
        <View className="absolute inset-0 bg-black/40 items-center justify-end">
          <View
            className={`w-full px-4 pt-3 pb-6 rounded-t-3xl ${
              isDark ? "bg-[#193324]" : "bg-white"
            }`}
          >
            <DateTimePicker
              mode="datetime"
              display="spinner"
              value={dateTime || new Date()}
              onChange={(_, selected) => {
                if (selected) {
                  setDateTime(selected);
                }
              }}
              themeVariant={isDark ? "dark" : "light"}
            />
            <TouchableOpacity
              className="self-end mt-3"
              onPress={() => setShowIOSPicker(false)}
            >
              <Text className="text-[#2bee79] text-base font-semibold">
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-[#102217]/95 justify-center items-center p-6">
          {/* Icon */}
          <View className="w-24 h-24 rounded-full bg-[#2bee79]/15 justify-center items-center mb-6">
            <View className="w-[70px] h-[70px] rounded-full bg-[#2bee79]/25 justify-center items-center">
              <MaterialIcons name="check-circle" size={36} color="#2bee79" />
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-white mb-3 text-center">
            Item Posted!
          </Text>

          {/* Subtitle */}
          <Text className="text-[15px] text-[#92c9a8] text-center mb-4 leading-[22px] px-5">
            Your found item has been successfully posted.
          </Text>

          {/* Info Box */}
          <View className="bg-[#2bee79]/10 rounded-xl p-4 mb-8 w-full max-w-[300px]">
            <Text className="text-sm text-[#92c9a8] text-center leading-5">
              🔔 You'll be notified when someone claims this item as theirs.
              Thank you for helping!
            </Text>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={handleCloseSuccessModal}
            className="bg-[#2bee79] py-3.5 px-12 rounded-full"
          >
            <Text className="text-base font-semibold text-[#102217]">
              Go to Home
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
