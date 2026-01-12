import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

  const base64Data =
    asset.base64 ||
    (await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    }));

  return base64Data;
};

export default function EditItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Parse item data from params - memoize to prevent infinite re-renders
  const itemData = useMemo(() => {
    return params.item ? JSON.parse(params.item) : null;
  }, [params.item]);
  const itemType = params.type || "found"; // "lost" or "found"

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
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const placeholderColor = isDark ? "#92c9a8" : "#94a3b8";

  // Initialize form with existing data - only run once
  useEffect(() => {
    if (itemData && !initialized) {
      setItemName(itemData.title || "");
      setCategory(itemData.category || "");
      setDescription(itemData.description || "");
      setLocation(
        itemType === "lost"
          ? itemData.last_seen || ""
          : itemData.location_found || ""
      );
      setReward(itemData.reward || "");
      setNotes(itemData.notes || "");
      setContactPref(itemData.contact_preference || "facebook");
      setContactInfo(itemData.contact_value || "");
      setExistingImageUrl(itemData.image_url || null);

      // Parse date
      const dateField =
        itemType === "lost" ? itemData.lost_at : itemData.found_at;
      if (dateField) {
        try {
          setDateTime(new Date(dateField));
        } catch (e) {
          console.error("Error parsing date:", e);
        }
      }
      setInitialized(true);
    }
  }, [itemData, itemType, initialized]);

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
          "Please allow access to your photos to upload an item image."
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
      setExistingImageUrl(null); // Clear existing image when new one is selected
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to pick image right now.";
      Alert.alert("Image picker error", message);
    }
  };

  const handleSave = async () => {
    if (saving) return;

    if (
      !itemName.trim() ||
      !category ||
      !location.trim() ||
      !dateTime ||
      !contactInfo.trim()
    ) {
      Alert.alert(
        "Missing details",
        "Please fill in all required fields before saving."
      );
      return;
    }

    if (!imageAsset?.uri && !existingImageUrl) {
      Alert.alert("Image required", "Please upload a photo of the item.");
      return;
    }

    setSaving(true);

    try {
      let imageUrl = existingImageUrl;

      // Upload new image if selected
      if (imageAsset?.uri) {
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

        imageUrl = publicUrlData?.publicUrl;
        if (!imageUrl) {
          throw new Error("Unable to retrieve the uploaded image URL.");
        }
      }

      // Update the appropriate table
      const tableName = itemType === "lost" ? "lost_reports" : "found_reports";
      const dateField = itemType === "lost" ? "lost_at" : "found_at";
      const locationField =
        itemType === "lost" ? "last_seen" : "location_found";

      const updatePayload = {
        title: itemName.trim(),
        category,
        description: description.trim() || null,
        [locationField]: location.trim(),
        reward: reward.trim() || null,
        notes: notes.trim() || null,
        contact_preference: contactPref,
        contact_value: contactInfo.trim(),
        [dateField]: dateTime ? dateTime.toISOString() : null,
        image_url: imageUrl,
      };

      const { error: updateError } = await supabase
        .from(tableName)
        .update(updatePayload)
        .eq("id", itemData.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error(`Failed to update item: ${updateError.message}`);
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Save error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while saving.";
      Alert.alert("Save failed", message);
    }

    setSaving(false);
  };

  const handleCancel = () => {
    router.back();
  };

  if (!itemData) {
    return (
      <View
        className={`flex-1 justify-center items-center ${
          isDark ? "bg-[#102217]" : "bg-[#f8fafc]"
        }`}
      >
        <Text className={isDark ? "text-white" : "text-black"}>
          No item data provided
        </Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? "bg-[#102217]" : "bg-[#f8fafc]"}`}>
      <View
        className={`flex-row items-center justify-between px-5 pt-14 pb-4 ${
          isDark ? "bg-[#193324]" : "bg-white"
        }`}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleCancel}
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
          className={`text-lg font-bold ${
            isDark ? "text-white" : "text-[#0f172a]"
          }`}
        >
          Edit Item Details
        </Text>

        <View className="w-11" />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={handlePickImage}>
          <ImageBackground
            source={
              imageAsset
                ? { uri: imageAsset.uri }
                : existingImageUrl
                ? { uri: existingImageUrl }
                : PLACEHOLDER_IMAGE
            }
            className={`w-full h-48 rounded-2xl overflow-hidden ${
              isDark ? "border border-[#326747]" : "border border-[#e2e8f0]"
            }`}
            imageStyle={{ opacity: 0.85 }}
          >
            <View
              className={`flex-1 items-center justify-center ${
                imageAsset || existingImageUrl ? "bg-black/25" : "bg-black/40"
              }`}
            >
              <View className="w-16 h-16 rounded-full bg-white/90 items-center justify-center mb-3">
                <MaterialIcons
                  name={
                    imageAsset || existingImageUrl
                      ? "photo-camera"
                      : "add-a-photo"
                  }
                  size={32}
                  color="#2bee79"
                />
              </View>
              <Text className="text-base font-semibold text-white">
                {imageAsset || existingImageUrl
                  ? "Tap to change photo"
                  : "Tap to Upload Photo"}
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <View className="mt-6">
          <Text
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-[#f8fafc]" : "text-[#334155]"
            }`}
          >
            Item Name
          </Text>
          <TextInput
            className={`h-14 px-4 rounded-2xl text-base ${
              isDark
                ? "bg-[#193324] border border-[#326747] text-[#f8fafc]"
                : "bg-white border border-[#e2e8f0] text-[#0f172a]"
            }`}
            placeholder="e.g. Blue Backpack"
            placeholderTextColor={placeholderColor}
            value={itemName}
            onChangeText={setItemName}
          />
        </View>

        <View className="mt-6">
          <Text
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-[#f8fafc]" : "text-[#334155]"
            }`}
          >
            Item Category
          </Text>
          <View className="relative">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowCategoryList((prev) => !prev)}
              className={`h-14 px-4 pr-12 rounded-2xl flex-row items-center justify-between ${
                isDark
                  ? "bg-[#193324] border border-[#326747]"
                  : "bg-white border border-[#e2e8f0]"
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
                style={{ position: "absolute", right: 12, top: 15 }}
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
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        backgroundColor: isSelected
                          ? "rgba(43,238,121,0.12)"
                          : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected
                            ? "#cafff0"
                            : isDark
                            ? "#f8fafc"
                            : "#0f172a",
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

        <View className="mt-6">
          <Text
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-[#f8fafc]" : "text-[#334155]"
            }`}
          >
            Description
          </Text>
          <TextInput
            multiline
            className={`min-h-[100px] p-4 rounded-2xl text-base ${
              isDark
                ? "bg-[#193324] border border-[#326747] text-[#f8fafc]"
                : "bg-white border border-[#e2e8f0] text-[#0f172a]"
            }`}
            style={{ textAlignVertical: "top" }}
            placeholder="Describe the item (color, brand, distinguishing marks...)"
            placeholderTextColor={placeholderColor}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View className="mt-6">
          <Text
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-[#f8fafc]" : "text-[#334155]"
            }`}
          >
            {itemType === "lost" ? "Last Seen Location" : "Location Found"}
          </Text>
          <View className="relative">
            <TextInput
              className={`h-14 px-4 pr-12 rounded-2xl text-base ${
                isDark
                  ? "bg-[#193324] border border-[#326747] text-[#f8fafc]"
                  : "bg-white border border-[#e2e8f0] text-[#0f172a]"
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
              style={{ position: "absolute", right: 12, top: 16 }}
            />
          </View>
        </View>

        <View className="mt-6">
          <Text
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-[#f8fafc]" : "text-[#334155]"
            }`}
          >
            {itemType === "lost" ? "Date & Time Lost" : "Date & Time Found"}
          </Text>
          <View className="relative">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={openDateTimePicker}
              className={`h-14 px-4 pr-12 rounded-2xl justify-center ${
                isDark
                  ? "bg-[#193324] border border-[#326747]"
                  : "bg-white border border-[#e2e8f0]"
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
              style={{ position: "absolute", right: 12, top: 16 }}
            />
          </View>
        </View>

        <View className="mt-6">
          <Text
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-[#f8fafc]" : "text-[#334155]"
            }`}
          >
            Reward{" "}
            <Text
              className={
                isDark
                  ? "text-[#92c9a8] font-normal"
                  : "text-[#94a3b8] font-normal"
              }
            >
              (Optional)
            </Text>
          </Text>
          <View className="relative">
            <TextInput
              className={`h-14 px-4 pr-12 rounded-2xl text-base ${
                isDark
                  ? "bg-[#193324] border border-[#326747] text-[#f8fafc]"
                  : "bg-white border border-[#e2e8f0] text-[#0f172a]"
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
              style={{ position: "absolute", right: 12, top: 16 }}
            />
          </View>
        </View>

        <View className="mt-6">
          <Text
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-[#f8fafc]" : "text-[#334155]"
            }`}
          >
            Additional Notes{" "}
            <Text
              className={
                isDark
                  ? "text-[#92c9a8] font-normal"
                  : "text-[#94a3b8] font-normal"
              }
            >
              (Optional)
            </Text>
          </Text>
          <TextInput
            multiline
            className={`min-h-[80px] p-4 rounded-2xl text-base ${
              isDark
                ? "bg-[#193324] border border-[#326747] text-[#f8fafc]"
                : "bg-white border border-[#e2e8f0] text-[#0f172a]"
            }`}
            style={{ textAlignVertical: "top" }}
            placeholder="Any other details?"
            placeholderTextColor={placeholderColor}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View className="mt-6">
          <Text
            className={`text-sm font-semibold mb-2 ${
              isDark ? "text-[#f8fafc]" : "text-[#334155]"
            }`}
          >
            Contact Preference
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {CONTACT_OPTIONS.map((option) => {
              const isSelected = option.value === contactPref;
              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.85}
                  onPress={() => setContactPref(option.value)}
                  className={`px-4 py-3 rounded-xl border ${
                    isSelected
                      ? "bg-primary/10 border-primary"
                      : isDark
                      ? "bg-[#193324] border-[#326747]"
                      : "bg-white border-[#e2e8f0]"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected
                        ? isDark
                          ? "text-[#86efac]"
                          : "text-primary"
                        : isDark
                        ? "text-[#f8fafc]"
                        : "text-[#334155]"
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            className={`h-14 px-4 rounded-2xl text-base ${
              isDark
                ? "bg-[#193324] border border-[#326747] text-[#f8fafc]"
                : "bg-white border border-[#e2e8f0] text-[#0f172a]"
            }`}
            placeholder="Enter link, email, or phone number"
            placeholderTextColor={placeholderColor}
            value={contactInfo}
            onChangeText={setContactInfo}
          />
        </View>

        <View className="h-24" />
      </ScrollView>

      <View
        className={`absolute bottom-0 left-0 right-0 px-5 pt-4 pb-8 ${
          isDark ? "bg-[#193324]" : "bg-white"
        }`}
        style={{
          borderTopWidth: 1,
          borderTopColor: isDark ? "#326747" : "#e2e8f0",
        }}
      >
        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleCancel}
            className={`flex-1 py-3.5 rounded-full items-center justify-center ${
              isDark ? "bg-[#1A2C23]" : "bg-[#e2e8f0]"
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                isDark ? "text-white" : "text-[#0f172a]"
              }`}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSave}
            disabled={saving}
            className={`flex-[2] flex-row items-center justify-center h-14 rounded-full bg-primary ${
              saving ? "opacity-60" : ""
            }`}
          >
            <Text className="text-base font-bold text-[#102217] mr-2">
              {saving ? "Saving..." : "Save Changes"}
            </Text>
            {saving ? (
              <ActivityIndicator size="small" color="#102217" />
            ) : (
              <MaterialIcons name="check" size={20} color="#102217" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-[#102217]/95 justify-center items-center p-6">
          <View className="w-[100px] h-[100px] rounded-full bg-primary/15 justify-center items-center mb-6">
            <View className="w-[70px] h-[70px] rounded-full bg-primary/25 justify-center items-center">
              <MaterialIcons name="check-circle" size={36} color="#2bee79" />
            </View>
          </View>

          <Text className="text-2xl font-bold text-white mb-3 text-center">
            Item Updated!
          </Text>

          <Text className="text-[15px] text-[#92c9a8] text-center mb-8 leading-[22px] px-5">
            Your item details have been successfully updated.
          </Text>

          <TouchableOpacity
            onPress={() => {
              setShowSuccessModal(false);
              router.replace("/my-reports");
            }}
            className="bg-primary py-3.5 px-12 rounded-full"
          >
            <Text className="text-base font-semibold text-[#102217]">Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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
              <Text className="text-primary text-base font-semibold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}
