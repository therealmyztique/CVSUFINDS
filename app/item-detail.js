import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { supabase } from "../lib/supabaseClient";

const DEFAULT_AVATAR = "https://via.placeholder.com/150";

const CATEGORY_LABELS = {
  electronics: "Electronics",
  clothing: "Clothing",
  accessories: "Accessories",
  documents: "Documents/ID",
  keys: "Keys",
  other: "Other",
};

export default function ItemDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Parse the item data from params
  const item = {
    id: params.id,
    title: params.title || "Unknown Item",
    status: params.status || "Found",
    category: params.category || "other",
    description: params.description || "",
    location: params.location || "Unknown location",
    dateTime: params.dateTime || "",
    reward: params.reward || "",
    notes: params.notes || "",
    image: params.image || "https://via.placeholder.com/400",
    author: params.author || "Anonymous",
    avatar: params.avatar || DEFAULT_AVATAR,
    contactPreference: params.contactPreference || "facebook",
    contactValue: params.contactValue || "",
    reporterId: params.reporterId || "",
  };

  const [reporterName, setReporterName] = useState(item.author?.trim());

  useEffect(() => {
    let isActive = true;

    const loadReporterName = async () => {
      if (!item.reporterId) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", item.reporterId)
          .single();

        if (error) {
          console.warn("Unable to load reporter profile:", error);
          return;
        }

        if (!data) {
          return;
        }

        const firstName = data.first_name?.trim();
        const lastName = data.last_name?.trim();
        const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

        if (fullName && isActive) {
          setReporterName(fullName);
        }
      } catch (profileError) {
        console.warn("Error fetching reporter profile:", profileError);
      }
    };

    loadReporterName();

    return () => {
      isActive = false;
    };
  }, [item.reporterId]);

  const isFound = item.status === "Found";
  const primaryColor = isFound ? "#2bee79" : "#f43f5e";

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${item.status} Item: ${item.title}\n\nLocation: ${item.location}\n\nDescription: ${item.description}`,
        title: `${item.status} Item - ${item.title}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleContact = () => {
    const { contactPreference, contactValue } = item;

    if (!contactValue) {
      return;
    }

    switch (contactPreference) {
      case "facebook":
        // Try to open Facebook link or search
        if (contactValue.includes("facebook.com")) {
          Linking.openURL(contactValue);
        } else {
          Linking.openURL(
            `https://www.facebook.com/search/top?q=${encodeURIComponent(
              contactValue
            )}`
          );
        }
        break;
      case "email":
        Linking.openURL(
          `mailto:${contactValue}?subject=${encodeURIComponent(
            `Regarding your ${item.status.toLowerCase()} item: ${item.title}`
          )}`
        );
        break;
      case "phone":
        Linking.openURL(`tel:${contactValue}`);
        break;
      default:
        break;
    }
  };

  const contactCtaText = useMemo(() => {
    const firstName = (reporterName || "").split(" ")[0]?.trim();
    if (firstName) {
      return `Message ${firstName}`;
    }
    return "Message the poster";
  }, [reporterName]);

  return (
    <View className={`flex-1 ${isDark ? "bg-[#0b1610]" : "bg-slate-50"}`}>
      {/* Header */}
      <View
        className={`flex-row items-center justify-between px-4 pt-14 pb-4 ${
          isDark ? "bg-[#12251a]" : "bg-white"
        }`}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            isDark ? "bg-[#1e3a2f]" : "bg-slate-100"
          }`}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? "#f8fafc" : "#0f172a"}
          />
        </TouchableOpacity>

        <Text
          className={`text-base font-bold tracking-wider ${
            isDark ? "text-slate-50" : "text-slate-900"
          }`}
        >
          DETAILS
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleShare}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            isDark ? "bg-[#1e3a2f]" : "bg-slate-100"
          }`}
        >
          <MaterialIcons
            name="ios-share"
            size={24}
            color={isDark ? "#f8fafc" : "#0f172a"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Section */}
        <View className="relative w-full h-72">
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View
              className={`w-full h-full items-center justify-center ${
                isDark ? "bg-[#1e3a2f]" : "bg-slate-200"
              }`}
            >
              <MaterialIcons
                name="image"
                size={64}
                color={isDark ? "#4ade80" : "#94a3b8"}
              />
            </View>
          )}
          {/* Status Badge */}
          <View
            className={`absolute bottom-4 left-4 flex-row items-center px-3 py-1.5 rounded-full ${
              isFound ? "bg-[#2bee79]" : "bg-[#f43f5e]"
            }`}
          >
            <View className="w-2 h-2 rounded-full bg-white mr-2" />
            <Text
              className={`text-xs font-bold ${
                isFound ? "text-[#102217]" : "text-white"
              }`}
            >
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View className="px-5 pt-5">
          {/* Title and Reward */}
          <View className="flex-row items-start justify-between mb-3">
            <Text
              className={`flex-1 text-2xl font-bold mr-3 ${
                isDark ? "text-slate-50" : "text-slate-900"
              }`}
            >
              {item.title}
            </Text>
            {item.reward ? (
              <View className="bg-amber-500/20 px-3 py-1.5 rounded-full">
                <Text className="text-amber-500 text-sm font-semibold">
                  ₱{item.reward} Reward
                </Text>
              </View>
            ) : null}
          </View>

          {/* Category Tag */}
          <View
            className={`flex-row items-center self-start px-3 py-1.5 rounded-full mb-4 ${
              isDark ? "bg-[#1e3a2f]" : "bg-slate-100"
            }`}
          >
            <MaterialIcons
              name="category"
              size={16}
              color={isDark ? "#92c9a8" : "#64748b"}
            />
            <Text
              className={`ml-1.5 text-sm ${
                isDark ? "text-[#92c9a8]" : "text-slate-500"
              }`}
            >
              {CATEGORY_LABELS[item.category] || item.category}
            </Text>
          </View>

          {/* User Card */}
          <View
            className={`flex-row items-center justify-between p-4 rounded-2xl mb-5 ${
              isDark ? "bg-[#12251a]" : "bg-white"
            }`}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full overflow-hidden mr-3">
                {item.avatar ? (
                  <Image
                    source={{ uri: item.avatar }}
                    className="w-full h-full"
                  />
                ) : (
                  <Image
                    source={{ uri: DEFAULT_AVATAR }}
                    className="w-full h-full"
                  />
                )}
              </View>
              <View>
                <Text
                  className={`text-base font-semibold ${
                    isDark ? "text-slate-50" : "text-slate-900"
                  }`}
                >
                  {reporterName || "Anonymous"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              className="w-11 h-11 rounded-full bg-[#2bee79] items-center justify-center"
              onPress={handleContact}
            >
              <MaterialIcons name="chat-bubble" size={22} color="#102217" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text
              className={`text-sm font-semibold mb-2 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Description
            </Text>
            <Text
              className={`text-base leading-6 ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {item.description || "No description provided."}
            </Text>
          </View>

          {/* Date/Time Card */}
          <View
            className={`flex-row items-center p-4 rounded-2xl mb-3 ${
              isDark ? "bg-[#12251a]" : "bg-white"
            }`}
          >
            <View
              className={`w-11 h-11 rounded-full items-center justify-center mr-3 ${
                isFound ? "bg-[#2bee79]/20" : "bg-[#f43f5e]/20"
              }`}
            >
              <MaterialIcons name="schedule" size={22} color={primaryColor} />
            </View>
            <View className="flex-1">
              <Text
                className={`text-xs font-medium mb-0.5 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {isFound ? "Found At" : "Last Seen"}
              </Text>
              <Text
                className={`text-sm font-medium ${
                  isDark ? "text-slate-100" : "text-slate-800"
                }`}
              >
                {formatDateTime(item.dateTime) || item.location}
              </Text>
            </View>
          </View>

          {/* Location Card */}
          <View
            className={`flex-row items-center p-4 rounded-2xl mb-3 ${
              isDark ? "bg-[#12251a]" : "bg-white"
            }`}
          >
            <View
              className={`w-11 h-11 rounded-full items-center justify-center mr-3 ${
                isFound ? "bg-[#2bee79]/20" : "bg-[#f43f5e]/20"
              }`}
            >
              <MaterialIcons
                name="location-on"
                size={22}
                color={primaryColor}
              />
            </View>
            <View className="flex-1">
              <Text
                className={`text-xs font-medium mb-0.5 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Location
              </Text>
              <Text
                className={`text-sm font-medium ${
                  isDark ? "text-slate-100" : "text-slate-800"
                }`}
              >
                {item.location}
              </Text>
            </View>
          </View>

          {/* Notes Section */}
          {item.notes ? (
            <View
              className={`p-4 rounded-2xl mt-2 ${
                isDark ? "bg-[#12251a]" : "bg-slate-100"
              }`}
            >
              <Text
                className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Additional Notes
              </Text>
              <Text
                className={`text-sm leading-5 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {item.notes}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        className={`absolute bottom-0 left-0 right-0 px-5 pt-4 pb-8 border-t ${
          isDark ? "bg-[#0b1610] border-[#1e3a2f]" : "bg-white border-slate-200"
        }`}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleContact}
          className={`flex-row items-center justify-center py-4 rounded-full ${
            isFound ? "bg-[#2bee79]" : "bg-[#f43f5e]"
          }`}
        >
          <MaterialIcons
            name="chat-bubble-outline"
            size={22}
            color={isFound ? "#102217" : "#ffffff"}
          />
          <Text
            className={`ml-2 text-base font-bold ${
              isFound ? "text-[#102217]" : "text-white"
            }`}
          >
            {contactCtaText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
