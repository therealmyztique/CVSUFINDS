import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
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
import Toast from "react-native-root-toast";
import {
  findMatchesForLostItem,
  generateImageEmbedding,
} from "../lib/embeddingService";
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

const insertLostReport = async (payload) =>
  supabase
    .from("lost_reports")
    .insert({
      ...payload,
      status: "active",
    })
    .select("id")
    .single();

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

  // Matches state
  const [matchedItems, setMatchedItems] = useState([]);
  const [searchingMatches, setSearchingMatches] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [showNoMatchModal, setShowNoMatchModal] = useState(false);

  // Animation refs
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for the search icon
  useEffect(() => {
    if (searchingMatches) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotate animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
    }
  }, [searchingMatches]);

  // Progress animation
  useEffect(() => {
    if (searchingMatches) {
      setSearchProgress(0);
      progressAnim.setValue(0);

      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: 100,
        duration: 4000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();

      // Update progress state for display
      const interval = setInterval(() => {
        setSearchProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 15;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [searchingMatches]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

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
        showToast(
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
      showToast("Image picker error", message);
    }
  };

  const handleSubmit = async () => {
    if (uploading) {
      return;
    }

    // Check for specific missing fields
    const missingFields = [];
    if (!itemName.trim()) missingFields.push("Item Name");
    if (!category) missingFields.push("Category");
    if (!lastSeen.trim()) missingFields.push("Last Seen Location");
    if (!dateTime) missingFields.push("Date & Time");
    if (!contactInfo.trim()) missingFields.push("Contact Info");

    if (missingFields.length > 0) {
      showToast(
        "Missing fields",
        `Please fill in: ${missingFields.join(", ")}`
      );
      return;
    }

    if (!imageAsset?.uri) {
      showToast("Image required", "Please upload a photo of the lost item.");
      return;
    }

    // Validate email format if email is selected as contact preference
    if (contactPref === "email" && !contactInfo.includes("@")) {
      showToast(
        "Invalid Email",
        "Please enter a valid email address containing '@'."
      );
      return;
    }

    // Validate phone number format if phone is selected as contact preference
    if (contactPref === "phone") {
      const digitsOnly = contactInfo.replace(/\D/g, "");
      const isValid =
        (digitsOnly.startsWith("09") && digitsOnly.length === 11) ||
        (digitsOnly.startsWith("9") &&
          !digitsOnly.startsWith("09") &&
          digitsOnly.length === 10);

      if (!isValid) {
        showToast(
          "Invalid Phone Number",
          "Phone must be 11 digits starting with 09, or 10 digits starting with 9."
        );
        return;
      }
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
        showToast(
          "Authentication error",
          userError.message || "Please log in to submit a report."
        );
        setUploading(false);
        return;
      }

      if (!user) {
        showToast(
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
        await insertLostReport({
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

      // Generate CLIP ViT-B-32 image embedding and search for matches
      if (insertedReport?.id) {
        setSearchingMatches(true);
        try {
          const embeddingResult = await generateImageEmbedding(
            imageUrl,
            insertedReport.id,
            "lost"
          );

          if (embeddingResult.success) {
            // Wait a moment for the embedding to be stored, then search for matches
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const matchResult = await findMatchesForLostItem(
              insertedReport.id,
              0.5, // 50% similarity threshold
              10
            );

            if (matchResult.success && matchResult.matches?.length > 0) {
              setSearchingMatches(false);
              // Navigate to match results page
              const sourceItem = {
                title: itemName.trim(),
                image_url: imageUrl,
                category,
                contact_preference: contactPref,
                contact_value: contactInfo.trim(),
              };
              // Reset form
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
              setUploading(false);
              // Navigate to match results page
              router.push({
                pathname: "/match-results",
                params: {
                  matches: JSON.stringify(matchResult.matches),
                  sourceItem: JSON.stringify(sourceItem),
                  reportType: "lost",
                },
              });
              return; // Exit early to navigate to results page
            } else {
              setSearchingMatches(false);
              setShowNoMatchModal(true);
              // Reset form
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
              setUploading(false);
              return; // Exit early to show no match modal
            }
          } else {
            console.warn(
              "Image embedding generation failed:",
              embeddingResult.error
            );
            // Still show no match modal even if embedding failed
            setSearchingMatches(false);
            setShowNoMatchModal(true);
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
            setUploading(false);
            return;
          }
        } catch (err) {
          console.warn("Image embedding/matching error:", err);
          // Show no match modal on error
          setSearchingMatches(false);
          setShowNoMatchModal(true);
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
          setUploading(false);
          return;
        }
      }

      // If we get here without showing a modal, show the no match modal
      setSearchingMatches(false);
      setShowNoMatchModal(true);
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
      showToast("Submission failed", message);
      setUploading(false);
      router.back();
      return;
    }
    setUploading(false);
  };

  // Handle closing the no match modal
  const handleCloseNoMatchModal = () => {
    setShowNoMatchModal(false);
    router.back();
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-[#102217]" : "bg-[#f8fafc]"}`}>
      <View
        className={`flex-row items-center justify-between px-5 pt-14 pb-4 ${
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
          className={`text-lg font-bold ${
            isDark ? "text-white" : "text-[#0f172a]"
          }`}
        >
          Report Lost Item
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
        <View>
          <Text
            className={`text-2xl font-bold mb-2 ${
              isDark ? "text-white" : "text-[#0f172a]"
            }`}
          >
            Lost something?
          </Text>
          <Text
            className={`text-base leading-6 ${
              isDark ? "text-[#92c9a8]" : "text-[#64748b]"
            }`}
          >
            Upload a photo to help others identify and return your item.
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={handlePickImage}>
          <ImageBackground
            source={imageAsset ? { uri: imageAsset.uri } : PLACEHOLDER_IMAGE}
            className={`w-full h-48 rounded-2xl overflow-hidden mt-6 ${
              isDark ? "border border-[#326747]" : "border border-[#e2e8f0]"
            }`}
            imageStyle={{ opacity: 0.85 }}
          >
            <View
              className={`flex-1 items-center justify-center ${
                imageAsset ? "bg-black/25" : "bg-black/40"
              }`}
            >
              <View className="w-16 h-16 rounded-full bg-white/90 items-center justify-center mb-3">
                <MaterialIcons
                  name={imageAsset ? "photo-camera" : "add-a-photo"}
                  size={32}
                  color="#f43f5e"
                />
              </View>
              <Text className="text-base font-semibold text-white">
                {imageAsset ? "Tap to change photo" : "Tap to Upload Photo"}
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
            Last Seen Location
          </Text>
          <View className="relative">
            <TextInput
              className={`h-14 px-4 pr-12 rounded-2xl text-base ${
                isDark
                  ? "bg-[#193324] border border-[#326747] text-[#f8fafc]"
                  : "bg-white border border-[#e2e8f0] text-[#0f172a]"
              }`}
              placeholder="e.g. DIT 5th Floor, around 2pm"
              placeholderTextColor={placeholderColor}
              value={lastSeen}
              onChangeText={setLastSeen}
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
            Date & Time Lost
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
                      ? "bg-[#f43f5e]/10 border-[#f43f5e]"
                      : isDark
                      ? "bg-[#193324] border-[#326747]"
                      : "bg-white border-[#e2e8f0]"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected
                        ? isDark
                          ? "text-[#fda4af]"
                          : "text-[#f43f5e]"
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
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSubmit}
          disabled={uploading}
          className={`flex-row items-center justify-center h-14 rounded-full bg-[#f43f5e] ${
            uploading ? "opacity-60" : ""
          }`}
        >
          <Text className="text-base font-bold text-white mr-2">
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
              <Text className="text-[#f43f5e] text-base font-semibold">
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Searching Matches Modal - Beautiful Design */}
      <Modal
        visible={searchingMatches}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-[#102217]/95 justify-center items-center p-6">
          {/* Animated Search Icon */}
          <View className="mb-8">
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
              }}
            >
              <View className="w-[100px] h-[100px] rounded-full bg-[#22c55e]/15 justify-center items-center">
                <View className="w-[70px] h-[70px] rounded-full bg-[#22c55e]/25 justify-center items-center">
                  <Animated.View
                    style={{
                      transform: [{ rotate: rotateInterpolate }],
                    }}
                  >
                    <MaterialIcons
                      name="find-replace"
                      size={36}
                      color="#22c55e"
                    />
                  </Animated.View>
                </View>
              </View>
            </Animated.View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-white mb-3 text-center">
            Finding a match...
          </Text>

          {/* Subtitle */}
          <Text className="text-[15px] text-[#92c9a8] text-center mb-10 leading-[22px]">
            The system is finding a match for the{"\n"}lost item
          </Text>

          {/* Progress Section */}
          <View className="w-full max-w-[280px]">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-[#92c9a8]">
                Scanning database...
              </Text>
              <Text className="text-sm text-[#22c55e] font-semibold">
                {Math.min(Math.round(searchProgress), 100)}%
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="h-[6px] bg-[#22c55e]/20 rounded-[3px] overflow-hidden">
              <Animated.View
                style={{
                  height: "100%",
                  backgroundColor: "#22c55e",
                  borderRadius: 3,
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                }}
              />
            </View>

            {/* Status Text */}
            <Text className="text-[13px] text-[#6b7c72] text-center mt-4">
              Analyzing image features...
            </Text>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => {
              setSearchingMatches(false);
              router.back();
            }}
            className="mt-12 bg-[#22c55e] py-3.5 px-12 rounded-full"
          >
            <Text className="text-base font-semibold text-white">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* No Match Found Modal */}
      <Modal
        visible={showNoMatchModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-[#102217]/95 justify-center items-center p-6">
          {/* Icon */}
          <View className="w-[100px] h-[100px] rounded-full bg-[#eab308]/15 justify-center items-center mb-6">
            <View className="w-[70px] h-[70px] rounded-full bg-[#eab308]/25 justify-center items-center">
              <MaterialIcons name="search-off" size={36} color="#eab308" />
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-white mb-3 text-center">
            No matches found
          </Text>

          {/* Subtitle */}
          <Text className="text-[15px] text-[#92c9a8] text-center mb-4 leading-[22px] px-5">
            We couldn't find any matching found items in our database right now.
          </Text>

          {/* Info Box */}
          <View className="bg-[#22c55e]/10 rounded-xl p-4 mb-8 w-full max-w-[300px]">
            <Text className="text-sm text-[#92c9a8] text-center leading-5">
              ✨ Don't worry! Your report has been saved. You'll be notified if
              someone finds a matching item.
            </Text>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={handleCloseNoMatchModal}
            className="bg-[#22c55e] py-3.5 px-12 rounded-full"
          >
            <Text className="text-base font-semibold text-white">
              Go to Home
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
