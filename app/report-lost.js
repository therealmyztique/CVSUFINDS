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
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { supabase } from "../lib/supabaseClient";
import { reportLostStyles as styles } from "./styles/reportLostStyles";

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

export default function ReportLostScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [description, setDescription] = useState("");
  const [lastSeen, setLastSeen] = useState("");
  const [reward, setReward] = useState("");
  const [notes, setNotes] = useState("");
  const [contactPref, setContactPref] = useState("facebook");
  const [contactInfo, setContactInfo] = useState("");
  const [dateTime, setDateTime] = useState(null);
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const [imageAsset, setImageAsset] = useState(null);
  const [uploading, setUploading] = useState(false);

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
          "Please allow access to your photos to upload a lost item image."
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
      !lastSeen.trim() ||
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
      Alert.alert("Image required", "Please upload a photo of the lost item.");
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

      const { error: insertError } = await supabase
        .from("lost_reports")
        .insert({
          reporter_id: user.id,
          title: itemName.trim(),
          category,
          description: description.trim() || null,
          last_seen: lastSeen.trim(),
          lost_at: dateTime ? dateTime.toISOString() : null,
          reward: reward.trim() || null,
          notes: notes.trim() || null,
          contact_preference: contactPref,
          contact_value: contactInfo.trim(),
          image_url: imageUrl,
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      Alert.alert("Success", "Lost item report submitted.");
      setItemName("");
      setCategory("");
      setDescription("");
      setLastSeen("");
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
    } finally {
      setUploading(false);
      router.back();
    }
  };

  return (
    <View
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
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          style={[
            styles.backButton,
            isDark ? styles.backButtonDark : styles.backButtonLight,
          ]}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? "#ffffff" : "#0f172a"}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            isDark ? styles.headerTitleDark : styles.headerTitleLight,
          ]}
        >
          Report Lost Item
        </Text>

        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text
            style={[
              styles.heroHeading,
              isDark ? styles.heroHeadingDark : styles.heroHeadingLight,
            ]}
          >
            Lost something?
          </Text>
          <Text
            style={[
              styles.heroBody,
              isDark ? styles.heroBodyDark : styles.heroBodyLight,
            ]}
          >
            Upload a photo to help others identify and return your item.
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={handlePickImage}>
          <ImageBackground
            source={imageAsset ? { uri: imageAsset.uri } : PLACEHOLDER_IMAGE}
            style={[
              styles.uploadCard,
              isDark ? styles.uploadCardDark : styles.uploadCardLight,
            ]}
            imageStyle={{ opacity: 0.85 }}
          >
            <View
              style={[
                styles.uploadOverlay,
                imageAsset ? { backgroundColor: "rgba(0,0,0,0.25)" } : null,
              ]}
            >
              <View style={styles.uploadIconWrapper}>
                <MaterialIcons
                  name={imageAsset ? "photo-camera" : "add-a-photo"}
                  size={32}
                  color="#f43f5e"
                />
              </View>
              <Text style={styles.uploadText}>
                {imageAsset ? "Tap to change photo" : "Tap to Upload Photo"}
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              isDark ? styles.labelDark : styles.labelLight,
            ]}
          >
            Item Name
          </Text>
          <TextInput
            style={[
              styles.textInput,
              isDark ? styles.textInputDark : styles.textInputLight,
            ]}
            placeholder="e.g. Blue Backpack"
            placeholderTextColor={placeholderColor}
            value={itemName}
            onChangeText={setItemName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              isDark ? styles.labelDark : styles.labelLight,
            ]}
          >
            Item Category
          </Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowCategoryList((prev) => !prev)}
              style={[
                styles.textInput,
                isDark ? styles.textInputDark : styles.textInputLight,
                styles.iconInput,
                styles.pickerTrigger,
              ]}
            >
              <Text
                style={[
                  styles.pickerTriggerText,
                  {
                    color: category
                      ? isDark
                        ? "#f8fafc"
                        : "#0f172a"
                      : placeholderColor,
                  },
                ]}
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
                style={styles.trailingIcon}
              />
            </TouchableOpacity>
            {showCategoryList ? (
              <View
                style={[
                  {
                    marginTop: 8,
                    borderRadius: 16,
                    borderWidth: 1,
                    overflow: "hidden",
                  },
                  isDark
                    ? {
                        backgroundColor: DARK_SURFACE_COLOR,
                        borderColor: DARK_BORDER_COLOR,
                      }
                    : {
                        backgroundColor: LIGHT_SURFACE_COLOR,
                        borderColor: LIGHT_BORDER_COLOR,
                      },
                ]}
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
                          ? "rgba(244,63,94,0.12)"
                          : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected
                            ? "#fecdd3"
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

        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              isDark ? styles.labelDark : styles.labelLight,
            ]}
          >
            Description
          </Text>
          <TextInput
            multiline
            style={[
              styles.textArea,
              isDark ? styles.textInputDark : styles.textInputLight,
            ]}
            placeholder="Describe the item (color, brand, distinguishing marks...)"
            placeholderTextColor={placeholderColor}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              isDark ? styles.labelDark : styles.labelLight,
            ]}
          >
            Last Seen Location
          </Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={[
                styles.textInput,
                isDark ? styles.textInputDark : styles.textInputLight,
                styles.iconInput,
              ]}
              placeholder="e.g. DIT 5th Floor, around 2pm"
              placeholderTextColor={placeholderColor}
              value={lastSeen}
              onChangeText={setLastSeen}
            />
            <MaterialIcons
              name="location-on"
              size={22}
              color={placeholderColor}
              style={styles.trailingIcon}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              isDark ? styles.labelDark : styles.labelLight,
            ]}
          >
            Date & Time Lost
          </Text>
          <View style={{ position: "relative" }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={openDateTimePicker}
              style={[
                styles.textInput,
                isDark ? styles.textInputDark : styles.textInputLight,
                styles.iconInput,
                { justifyContent: "center" },
              ]}
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
              style={styles.trailingIcon}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              isDark ? styles.labelDark : styles.labelLight,
            ]}
          >
            Reward{" "}
            <Text style={isDark ? styles.optionalDark : styles.optionalLight}>
              (Optional)
            </Text>
          </Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={[
                styles.textInput,
                isDark ? styles.textInputDark : styles.textInputLight,
                styles.iconInput,
              ]}
              placeholder="e.g. ₱100"
              placeholderTextColor={placeholderColor}
              value={reward}
              onChangeText={setReward}
            />
            <MaterialIcons
              name="payments"
              size={22}
              color={placeholderColor}
              style={styles.trailingIcon}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              isDark ? styles.labelDark : styles.labelLight,
            ]}
          >
            Additional Notes{" "}
            <Text style={isDark ? styles.optionalDark : styles.optionalLight}>
              (Optional)
            </Text>
          </Text>
          <TextInput
            multiline
            style={[
              styles.textArea,
              styles.textAreaSmall,
              isDark ? styles.textInputDark : styles.textInputLight,
            ]}
            placeholder="Any other details?"
            placeholderTextColor={placeholderColor}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              isDark ? styles.labelDark : styles.labelLight,
            ]}
          >
            Contact Preference
          </Text>
          <View style={styles.contactGrid}>
            {CONTACT_OPTIONS.map((option) => {
              const isSelected = option.value === contactPref;
              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.85}
                  onPress={() => setContactPref(option.value)}
                  style={[
                    styles.contactOption,
                    isDark
                      ? styles.contactOptionDark
                      : styles.contactOptionLight,
                    isSelected ? styles.contactOptionActive : null,
                    isSelected && isDark
                      ? styles.contactOptionActiveDark
                      : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.contactLabel,
                      isSelected
                        ? isDark
                          ? styles.contactLabelActiveDark
                          : styles.contactLabelActive
                        : isDark
                        ? styles.contactLabelDark
                        : styles.contactLabelLight,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            style={[
              styles.textInput,
              isDark ? styles.textInputDark : styles.textInputLight,
            ]}
            placeholder="Enter link, email, or phone number"
            placeholderTextColor={placeholderColor}
            value={contactInfo}
            onChangeText={setContactInfo}
          />
        </View>
      </ScrollView>

      <View
        style={[styles.footer, isDark ? styles.footerDark : styles.footerLight]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSubmit}
          disabled={uploading}
          style={[styles.submitButton, uploading ? { opacity: 0.6 } : null]}
        >
          <Text style={styles.submitText}>
            {uploading ? "Submitting..." : "Submit Report"}
          </Text>
          {uploading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <MaterialIcons name="check" size={20} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>

      {Platform.OS === "ios" && showIOSPicker ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: isDark ? "#193324" : "#ffffff",
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 24,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
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
              style={{ alignSelf: "flex-end", marginTop: 12 }}
              onPress={() => setShowIOSPicker(false)}
            >
              <Text
                style={{ color: "#f43f5e", fontSize: 16, fontWeight: "600" }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}
