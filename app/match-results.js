import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { supabase } from "../lib/supabaseClient";
import { matchResultsStyles as styles } from "./styles/matchResultsStyles";

const PRIMARY_COLOR = "#2bee79";

const CATEGORY_LABELS = {
  electronics: "Electronics",
  clothing: "Clothing",
  accessories: "Accessories",
  documents: "Documents/ID",
  keys: "Keys",
  other: "Other",
};

export default function MatchResultsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const params = useLocalSearchParams();

  const [matches, setMatches] = useState([]);
  const [sourceItem, setSourceItem] = useState(null);
  const [reportType, setReportType] = useState("lost");
  const [userProfiles, setUserProfiles] = useState({});

  // Item detail modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);

  // Claim confirmation modal state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    // Parse the matches from params
    if (params.matches) {
      try {
        const parsedMatches = JSON.parse(params.matches);
        setMatches(parsedMatches);
        // Fetch user profiles for all matches
        fetchUserProfiles(parsedMatches);
      } catch (e) {
        console.error("Error parsing matches:", e);
        setMatches([]);
      }
    }

    // Parse the source item info
    if (params.sourceItem) {
      try {
        const parsedSource = JSON.parse(params.sourceItem);
        setSourceItem(parsedSource);
      } catch (e) {
        console.error("Error parsing source item:", e);
      }
    }

    // Set report type (lost or found)
    if (params.reportType) {
      setReportType(params.reportType);
    }
  }, [params.matches, params.sourceItem, params.reportType]);

  console.log(sourceItem);

  const fetchUserProfiles = async (matchesList) => {
    try {
      // Get unique reporter IDs
      const reporterIds = [
        ...new Set(matchesList.map((m) => m.reporter_id).filter(Boolean)),
      ];

      if (reporterIds.length === 0) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, fb_name, avatar_url")
        .in("id", reporterIds);

      if (error) {
        console.error("Error fetching profiles:", error);
        return;
      }

      // Create a map of user profiles
      const profilesMap = {};
      data?.forEach((profile) => {
        profilesMap[profile.id] = profile;
      });
      setUserProfiles(profilesMap);
    } catch (err) {
      console.error("Error in fetchUserProfiles:", err);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleNoMatch = () => {
    router.replace("/home");
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleCloseItemModal = () => {
    setShowItemModal(false);
    setSelectedItem(null);
    router.replace("/home");
  };

  const handleClaimItem = async () => {
    if (!selectedItem) {
      return;
    }

    try {
      setIsClaiming(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      const reporterId = selectedItem.reporter_id;

      if (reporterId && reporterId !== user.id) {
        let claimantName = "A fellow student";

        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", user.id)
            .single();

          if (!profileError && profileData) {
            const firstName = profileData.first_name?.trim();
            const lastName = profileData.last_name?.trim();
            const combinedName = [firstName, lastName]
              .filter(Boolean)
              .join(" ")
              .trim();
            if (combinedName) {
              claimantName = combinedName;
            }
          } else if (user.email) {
            claimantName = user.email;
          }
        } catch (profileLookupError) {
          console.warn("Unable to load claimant profile:", profileLookupError);
          if (user.email) {
            claimantName = user.email;
          }
        }

        const itemTitle =
          selectedItem.title?.trim() ||
          selectedItem.name?.trim() ||
          sourceItem?.title?.trim() ||
          "your posted item";

        const relatedType = reportType === "lost" ? "found" : "lost";

        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: reporterId,
            type: "item_claimed",
            title: "Someone claimed your item",
            message: `${claimantName} believes they own "${itemTitle}". Review the claim and coordinate the handover.`,
            related_item_id: selectedItem.id,
            related_item_type: relatedType,
            contact_preference: sourceItem?.contact_preference || null,
            contact_value: sourceItem?.contact_value || null,
          });

        if (notificationError) {
          throw notificationError;
        }
      }

      setShowItemModal(false);
      setShowClaimModal(true);
    } catch (error) {
      console.error("Error notifying item owner about claim:", error);
      Alert.alert(
        "Unable to notify",
        "We couldn't notify the poster right now. Please try again later."
      );
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClaimModalClose = () => {
    setShowClaimModal(false);
    setSelectedItem(null);
    router.replace("/home");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatFullDate = (dateString) => {
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

  const getMatchPercentage = (similarity) => {
    return Math.round(similarity * 100);
  };

  const getConfidenceLevel = (similarity) => {
    if (similarity >= 0.7) return "high";
    if (similarity >= 0.5) return "medium";
    return "low";
  };

  const getUserName = (reporterId) => {
    const profile = userProfiles[reporterId];
    return profile?.fb_name || "Anonymous";
  };

  const renderHeroCard = (item, index) => {
    const percentage = getMatchPercentage(item.similarity);
    const location =
      item.location_found || item.last_seen || "Unknown location";
    const dateField = item.found_at || item.lost_at;
    const dateLabel = reportType === "lost" ? "Found" : "Reported";
    const posterName = getUserName(item.reporter_id);

    return (
      <View
        key={item.id || index}
        style={[
          styles.heroCard,
          isDark ? styles.heroCardDark : styles.heroCardLight,
        ]}
      >
        <View style={styles.heroCardBadge}>
          <Text style={styles.heroCardBadgeText}>Top Match</Text>
        </View>

        <Image
          source={{
            uri: item.image_url || "https://via.placeholder.com/400x200",
          }}
          style={styles.heroCardImage}
          resizeMode="cover"
        />

        <View style={styles.heroCardContent}>
          <View style={styles.heroMatchRow}>
            <MaterialIcons name="verified" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.heroMatchText}>{percentage}% Match</Text>
          </View>

          <Text
            style={[
              styles.heroCardTitle,
              isDark ? styles.heroCardTitleDark : styles.heroCardTitleLight,
            ]}
          >
            {item.title || location}
          </Text>

          <Text
            style={[
              styles.heroCardDescription,
              isDark
                ? styles.heroCardDescriptionDark
                : styles.heroCardDescriptionLight,
            ]}
          >
            {dateLabel} {formatDate(dateField)} at {location}
          </Text>

          {/* Posted by */}
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
          >
            <MaterialIcons
              name="person"
              size={16}
              color={isDark ? "#92c9a8" : "#64748b"}
            />
            <Text
              style={[
                styles.heroCardDescription,
                isDark
                  ? styles.heroCardDescriptionDark
                  : styles.heroCardDescriptionLight,
                { marginLeft: 4 },
              ]}
            >
              Posted by {posterName}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.heroCardButton}
            onPress={() => handleSelectItem(item)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="visibility" size={20} color="#102217" />
            <Text style={styles.heroCardButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMatchCard = (item, index) => {
    const percentage = getMatchPercentage(item.similarity);
    const confidence = getConfidenceLevel(item.similarity);
    const location =
      item.location_found || item.last_seen || "Unknown location";
    const dateField = item.found_at || item.lost_at;
    const isLowConfidence = confidence === "low";
    const posterName = getUserName(item.reporter_id);

    return (
      <View
        key={item.id || index}
        style={[
          styles.matchCard,
          isDark ? styles.matchCardDark : styles.matchCardLight,
          isLowConfidence && styles.matchCardLowConfidence,
        ]}
      >
        <View style={styles.matchCardContent}>
          <View style={styles.matchCardTextContainer}>
            <Text
              style={
                confidence === "high"
                  ? styles.matchPercentHigh
                  : confidence === "medium"
                  ? styles.matchPercentMedium
                  : [
                      styles.matchPercentLow,
                      isDark
                        ? styles.matchPercentLowDark
                        : styles.matchPercentLowLight,
                    ]
              }
            >
              {percentage}% Match
            </Text>

            <Text
              style={[
                styles.matchCardTitle,
                isDark ? styles.matchCardTitleDark : styles.matchCardTitleLight,
              ]}
            >
              {item.title || location}
            </Text>

            <Text
              style={[
                styles.matchCardMeta,
                isDark ? styles.matchCardMetaDark : styles.matchCardMetaLight,
              ]}
            >
              {formatDate(dateField)} • By {posterName}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.matchCardButton,
              isLowConfidence
                ? isDark
                  ? styles.matchCardButtonLowDark
                  : styles.matchCardButtonLowLight
                : isDark
                ? styles.matchCardButtonDark
                : styles.matchCardButtonLight,
            ]}
            onPress={() => handleSelectItem(item)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="visibility"
              size={16}
              color={
                isLowConfidence
                  ? isDark
                    ? "#fff"
                    : "#64748b"
                  : isDark
                  ? PRIMARY_COLOR
                  : "#0f172a"
              }
            />
            <Text
              style={[
                styles.matchCardButtonText,
                isLowConfidence
                  ? isDark
                    ? styles.matchCardButtonTextLowDark
                    : styles.matchCardButtonTextLowLight
                  : isDark
                  ? styles.matchCardButtonTextDark
                  : styles.matchCardButtonTextLight,
              ]}
            >
              View Details
            </Text>
          </TouchableOpacity>
        </View>

        <Image
          source={{
            uri: item.image_url || "https://via.placeholder.com/96x128",
          }}
          style={[
            styles.matchCardImage,
            isLowConfidence && styles.matchCardImageLow,
          ]}
          resizeMode="cover"
        />
      </View>
    );
  };

  const renderItemDetailModal = () => {
    if (!selectedItem) return null;

    const location =
      selectedItem.location_found ||
      selectedItem.last_seen ||
      "Unknown location";
    const dateField = selectedItem.found_at || selectedItem.lost_at;
    const posterName = getUserName(selectedItem.reporter_id);
    const percentage = getMatchPercentage(selectedItem.similarity);

    return (
      <Modal
        visible={showItemModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseItemModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? "#102217" : "#ffffff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "90%",
              paddingBottom: 34,
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#326747" : "#e2e8f0",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: isDark ? "#ffffff" : "#0f172a",
                }}
              >
                Item Details
              </Text>
              <TouchableOpacity
                onPress={handleCloseItemModal}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: isDark ? "#326747" : "#f1f5f9",
                }}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={isDark ? "#ffffff" : "#0f172a"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
              {/* Item Image */}
              <Image
                source={{
                  uri:
                    selectedItem.image_url ||
                    "https://via.placeholder.com/400x200",
                }}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 16,
                  marginBottom: 16,
                }}
                resizeMode="cover"
              />

              {/* Match Badge */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons name="verified" size={16} color="#102217" />
                  <Text
                    style={{
                      marginLeft: 4,
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#102217",
                    }}
                  >
                    {percentage}% Match
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: isDark ? "#ffffff" : "#0f172a",
                  marginBottom: 8,
                }}
              >
                {selectedItem.title || "Unknown Item"}
              </Text>

              {/* Category */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <MaterialIcons
                  name="category"
                  size={18}
                  color={isDark ? "#92c9a8" : "#64748b"}
                />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 14,
                    color: isDark ? "#92c9a8" : "#64748b",
                  }}
                >
                  {CATEGORY_LABELS[selectedItem.category] ||
                    selectedItem.category ||
                    "Other"}
                </Text>
              </View>

              {/* Description */}
              {selectedItem.description && (
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: isDark ? "#92c9a8" : "#64748b",
                      marginBottom: 4,
                      textTransform: "uppercase",
                    }}
                  >
                    Description
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      lineHeight: 22,
                      color: isDark ? "#f8fafc" : "#334155",
                    }}
                  >
                    {selectedItem.description}
                  </Text>
                </View>
              )}

              {/* Location */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: isDark ? "#92c9a8" : "#64748b",
                    marginBottom: 4,
                    textTransform: "uppercase",
                  }}
                >
                  {reportType === "lost" ? "Location Found" : "Last Seen"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons
                    name="location-on"
                    size={18}
                    color={PRIMARY_COLOR}
                  />
                  <Text
                    style={{
                      marginLeft: 6,
                      fontSize: 15,
                      color: isDark ? "#f8fafc" : "#334155",
                    }}
                  >
                    {location}
                  </Text>
                </View>
              </View>

              {/* Date */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: isDark ? "#92c9a8" : "#64748b",
                    marginBottom: 4,
                    textTransform: "uppercase",
                  }}
                >
                  {reportType === "lost" ? "Date Found" : "Date Lost"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons
                    name="schedule"
                    size={18}
                    color={PRIMARY_COLOR}
                  />
                  <Text
                    style={{
                      marginLeft: 6,
                      fontSize: 15,
                      color: isDark ? "#f8fafc" : "#334155",
                    }}
                  >
                    {formatFullDate(dateField)}
                  </Text>
                </View>
              </View>

              {/* Posted By */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: isDark ? "#92c9a8" : "#64748b",
                    marginBottom: 4,
                    textTransform: "uppercase",
                  }}
                >
                  Posted By
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: isDark ? "#326747" : "#e2e8f0",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialIcons
                      name="person"
                      size={20}
                      color={isDark ? "#92c9a8" : "#64748b"}
                    />
                  </View>
                  <Text
                    style={{
                      marginLeft: 10,
                      fontSize: 15,
                      fontWeight: "600",
                      color: isDark ? "#f8fafc" : "#334155",
                    }}
                  >
                    {posterName}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 16,
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={handleCloseItemModal}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? "#326747" : "#f1f5f9",
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: isDark ? "#ffffff" : "#64748b",
                  }}
                >
                  Close
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClaimItem}
                disabled={isClaiming}
                style={{
                  flex: 1,
                  backgroundColor: PRIMARY_COLOR,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                  opacity: isClaiming ? 0.7 : 1,
                }}
              >
                {isClaiming ? (
                  <ActivityIndicator size="small" color="#102217" />
                ) : (
                  <>
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color="#102217"
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#102217",
                      }}
                    >
                      Claim This Item
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderClaimConfirmationModal = () => {
    const posterName = selectedItem
      ? getUserName(selectedItem.reporter_id)
      : "the poster";

    return (
      <Modal
        visible={showClaimModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(16, 34, 23, 0.95)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "rgba(43, 238, 121, 0.15)",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: "rgba(43, 238, 121, 0.25)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons
                name="notifications-active"
                size={36}
                color="#2bee79"
              />
            </View>
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: "#ffffff",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Claim Submitted!
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: 15,
              color: "#92c9a8",
              textAlign: "center",
              marginBottom: 16,
              lineHeight: 22,
              paddingHorizontal: 20,
            }}
          >
            {posterName} has been notified about your claim.
          </Text>

          {/* Info Box */}
          <View
            style={{
              backgroundColor: "rgba(43, 238, 121, 0.1)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 32,
              width: "100%",
              maxWidth: 300,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#92c9a8",
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              📧 They will reach out to you soon to verify and arrange the
              handover. Please wait for their response.
            </Text>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={handleClaimModalClose}
            style={{
              backgroundColor: "#2bee79",
              paddingVertical: 14,
              paddingHorizontal: 48,
              borderRadius: 25,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#102217",
              }}
            >
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      {/* Header */}
      <View
        style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            isDark ? styles.backButtonDark : styles.backButtonLight,
          ]}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? "#fff" : "#0f172a"}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            isDark ? styles.headerTitleDark : styles.headerTitleLight,
          ]}
        >
          Potential Matches
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Reference Card - Source Item */}
        {sourceItem && (
          <View
            style={[
              styles.referenceCard,
              isDark ? styles.referenceCardDark : styles.referenceCardLight,
            ]}
          >
            <View style={styles.referenceCardContent}>
              <Image
                source={{
                  uri: sourceItem.image_url || "https://via.placeholder.com/48",
                }}
                style={[
                  styles.referenceImage,
                  isDark
                    ? styles.referenceImageDark
                    : styles.referenceImageLight,
                ]}
              />
              <View style={styles.referenceTextContainer}>
                <Text
                  style={[
                    styles.referenceLabel,
                    isDark
                      ? styles.referenceLabelDark
                      : styles.referenceLabelLight,
                  ]}
                >
                  Searching for
                </Text>
                <Text
                  style={[
                    styles.referenceTitle,
                    isDark
                      ? styles.referenceTitleDark
                      : styles.referenceTitleLight,
                  ]}
                  numberOfLines={1}
                >
                  {sourceItem.title || "Your item"}
                </Text>
              </View>
            </View>
            <View style={styles.referenceIconButton}>
              <MaterialIcons name="image" size={18} color={PRIMARY_COLOR} />
            </View>
          </View>
        )}

        {/* Headline */}
        <View style={styles.headlineContainer}>
          <Text
            style={[
              styles.headlineText,
              isDark ? styles.headlineTextDark : styles.headlineTextLight,
            ]}
          >
            We found{" "}
            <Text style={styles.headlineAccent}>
              {matches.length} {matches.length === 1 ? "match" : "matches"}
            </Text>
          </Text>
          <Text
            style={[
              styles.headlineSubtext,
              isDark ? styles.headlineSubtextDark : styles.headlineSubtextLight,
            ]}
          >
            Review the results below to verify your item.
          </Text>
        </View>

        {/* Results List */}
        {matches.length > 0 ? (
          <View style={styles.resultsContainer}>
            {matches.map((item, index) => {
              // First item (highest match) gets hero treatment
              if (index === 0) {
                return renderHeroCard(item, index);
              }
              return renderMatchCard(item, index);
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="search-off"
              size={64}
              color={isDark ? "#92c9a8" : "#64748b"}
              style={styles.emptyIcon}
            />
            <Text
              style={[
                styles.emptyText,
                isDark ? styles.emptyTextDark : styles.emptyTextLight,
              ]}
            >
              No matching items found. Check back later or adjust your search.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View
        style={[styles.footer, isDark ? styles.footerDark : styles.footerLight]}
      >
        <TouchableOpacity
          style={[
            styles.footerButton,
            isDark ? styles.footerButtonDark : styles.footerButtonLight,
          ]}
          onPress={handleNoMatch}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.footerButtonText,
              isDark
                ? styles.footerButtonTextDark
                : styles.footerButtonTextLight,
            ]}
          >
            None of these match
          </Text>
        </TouchableOpacity>
      </View>

      {/* Item Detail Modal */}
      {renderItemDetailModal()}

      {/* Claim Confirmation Modal */}
      {renderClaimConfirmationModal()}
    </View>
  );
}
