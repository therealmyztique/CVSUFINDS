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
import { itemDetailStyles as styles } from "../styles/itemDetailStyles";

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
            styles.headerButton,
            isDark ? styles.headerButtonDark : styles.headerButtonLight,
          ]}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? "#f8fafc" : "#0f172a"}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            isDark ? styles.headerTitleDark : styles.headerTitleLight,
          ]}
        >
          DETAILS
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleShare}
          style={[
            styles.headerButton,
            isDark ? styles.headerButtonDark : styles.headerButtonLight,
          ]}
        >
          <MaterialIcons
            name="ios-share"
            size={24}
            color={isDark ? "#f8fafc" : "#0f172a"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Section */}
        <View style={styles.imageCarousel}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.itemImage,
                {
                  backgroundColor: isDark ? "#1e3a2f" : "#e2e8f0",
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <MaterialIcons
                name="image"
                size={64}
                color={isDark ? "#4ade80" : "#94a3b8"}
              />
            </View>
          )}
          <View
            style={[
              styles.statusBadge,
              isFound ? styles.statusBadgeFound : styles.statusBadgeLost,
            ]}
          >
            <View style={styles.statusDot} />
            <Text
              style={[
                styles.statusText,
                isFound ? styles.statusTextFound : null,
              ]}
            >
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsContainer}>
          {/* Title and Reward */}
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.itemTitle,
                isDark ? styles.itemTitleDark : styles.itemTitleLight,
              ]}
            >
              {item.title}
            </Text>
            {item.reward ? (
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardText}>₱{item.reward} Reward</Text>
              </View>
            ) : null}
          </View>

          {/* Category Tag */}
          <View
            style={[
              styles.categoryTag,
              isDark ? styles.categoryTagDark : styles.categoryTagLight,
            ]}
          >
            <MaterialIcons
              name="category"
              size={16}
              color={isDark ? "#92c9a8" : "#64748b"}
            />
            <Text
              style={[
                styles.categoryText,
                isDark ? styles.categoryTextDark : styles.categoryTextLight,
              ]}
            >
              {CATEGORY_LABELS[item.category] || item.category}
            </Text>
          </View>

          {/* User Card */}
          <View
            style={[
              styles.userCard,
              isDark ? styles.userCardDark : styles.userCardLight,
            ]}
          >
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                {item.avatar ? (
                  <Image
                    source={{ uri: item.avatar }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Image
                    source={{ uri: DEFAULT_AVATAR }}
                    style={styles.avatarImage}
                  />
                )}
              </View>
              <View>
                <Text
                  style={[
                    styles.userName,
                    isDark ? styles.userNameDark : styles.userNameLight,
                  ]}
                >
                  {reporterName || "Anonymous"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.messageButton}
              onPress={handleContact}
            >
              <MaterialIcons name="chat-bubble" size={22} color="#102217" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                isDark ? styles.sectionTitleDark : styles.sectionTitleLight,
              ]}
            >
              Description
            </Text>
            <Text
              style={[
                styles.descriptionText,
                isDark
                  ? styles.descriptionTextDark
                  : styles.descriptionTextLight,
              ]}
            >
              {item.description || "No description provided."}
            </Text>
          </View>

          {/* Date/Time Card */}
          <View
            style={[
              styles.infoCard,
              isDark ? styles.infoCardDark : styles.infoCardLight,
            ]}
          >
            <View
              style={[
                styles.infoIconWrapper,
                isFound
                  ? styles.infoIconWrapperFound
                  : styles.infoIconWrapperLost,
              ]}
            >
              <MaterialIcons name="schedule" size={22} color={primaryColor} />
            </View>
            <View style={styles.infoContent}>
              <Text
                style={[
                  styles.infoLabel,
                  isDark ? styles.infoLabelDark : styles.infoLabelLight,
                ]}
              >
                {isFound ? "Found At" : "Last Seen"}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  isDark ? styles.infoValueDark : styles.infoValueLight,
                ]}
              >
                {formatDateTime(item.dateTime) || item.location}
              </Text>
            </View>
          </View>

          {/* Location Card */}
          <View
            style={[
              styles.infoCard,
              isDark ? styles.infoCardDark : styles.infoCardLight,
            ]}
          >
            <View
              style={[
                styles.infoIconWrapper,
                isFound
                  ? styles.infoIconWrapperFound
                  : styles.infoIconWrapperLost,
              ]}
            >
              <MaterialIcons
                name="location-on"
                size={22}
                color={primaryColor}
              />
            </View>
            <View style={styles.infoContent}>
              <Text
                style={[
                  styles.infoLabel,
                  isDark ? styles.infoLabelDark : styles.infoLabelLight,
                ]}
              >
                Location
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  isDark ? styles.infoValueDark : styles.infoValueLight,
                ]}
              >
                {item.location}
              </Text>
            </View>
          </View>

          {/* Notes Section */}
          {item.notes ? (
            <View
              style={[
                styles.notesSection,
                isDark ? styles.notesSectionDark : styles.notesSectionLight,
              ]}
            >
              <Text
                style={[
                  styles.notesLabel,
                  isDark ? styles.notesLabelDark : styles.notesLabelLight,
                ]}
              >
                Additional Notes
              </Text>
              <Text
                style={[
                  styles.notesText,
                  isDark ? styles.notesTextDark : styles.notesTextLight,
                ]}
              >
                {item.notes}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[styles.footer, isDark ? styles.footerDark : styles.footerLight]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleContact}
          style={[
            styles.contactButton,
            isFound ? styles.contactButtonFound : styles.contactButtonLost,
          ]}
        >
          <MaterialIcons
            name="chat-bubble-outline"
            size={22}
            color={isFound ? "#102217" : "#ffffff"}
          />
          <Text
            style={[
              styles.contactButtonText,
              isFound
                ? styles.contactButtonTextFound
                : styles.contactButtonTextLost,
            ]}
          >
            {contactCtaText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
