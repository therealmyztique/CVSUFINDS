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
        className={`rounded-3xl overflow-hidden mb-4 ${
          isDark ? "bg-[#193324]" : "bg-white"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="absolute top-3 left-3 z-10 bg-primary px-3 py-1.5 rounded-full">
          <Text className="text-xs font-bold text-[#102217]">Top Match</Text>
        </View>

        <Image
          source={{
            uri: item.image_url || "https://via.placeholder.com/400x200",
          }}
          className="w-full h-48"
          resizeMode="cover"
        />

        <View className="p-4">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="verified" size={24} color={PRIMARY_COLOR} />
            <Text className="ml-2 text-lg font-bold text-primary">
              {percentage}% Match
            </Text>
          </View>

          <Text
            className={`text-xl font-bold mb-1 ${
              isDark ? "text-white" : "text-[#0f172a]"
            }`}
          >
            {item.title || location}
          </Text>

          <Text
            className={`text-sm ${
              isDark ? "text-[#92c9a8]" : "text-[#64748b]"
            }`}
          >
            {dateLabel} {formatDate(dateField)} at {location}
          </Text>

          {/* Posted by */}
          <View className="flex-row items-center mt-2">
            <MaterialIcons
              name="person"
              size={16}
              color={isDark ? "#92c9a8" : "#64748b"}
            />
            <Text
              className={`ml-1 text-sm ${
                isDark ? "text-[#92c9a8]" : "text-[#64748b]"
              }`}
            >
              Posted by {posterName}
            </Text>
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-center bg-primary py-3 rounded-xl mt-4"
            onPress={() => handleSelectItem(item)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="visibility" size={20} color="#102217" />
            <Text className="ml-2 text-base font-semibold text-[#102217]">
              View Details
            </Text>
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
        className={`flex-row rounded-2xl p-3 mb-3 ${
          isDark ? "bg-[#193324]" : "bg-white"
        } ${isLowConfidence ? "opacity-70" : ""}`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View className="flex-1 pr-3">
          <View className="mb-1">
            <Text
              className={`text-sm font-bold ${
                confidence === "high"
                  ? "text-primary"
                  : confidence === "medium"
                  ? "text-[#eab308]"
                  : isDark
                  ? "text-[#92c9a8]"
                  : "text-[#94a3b8]"
              }`}
            >
              {percentage}% Match
            </Text>
          </View>

          <Text
            className={`text-base font-semibold mb-1 ${
              isDark ? "text-white" : "text-[#0f172a]"
            }`}
            numberOfLines={1}
          >
            {item.title || location}
          </Text>

          <Text
            className={`text-xs ${
              isDark ? "text-[#92c9a8]" : "text-[#64748b]"
            }`}
          >
            {formatDate(dateField)} • By {posterName}
          </Text>

          <TouchableOpacity
            className={`flex-row items-center mt-2 px-3 py-2 rounded-lg ${
              isLowConfidence
                ? isDark
                  ? "bg-[#326747]"
                  : "bg-[#f1f5f9]"
                : isDark
                ? "bg-[#102217]"
                : "bg-[#f1f5f9]"
            }`}
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
              className={`ml-1.5 text-sm font-medium ${
                isLowConfidence
                  ? isDark
                    ? "text-white"
                    : "text-[#64748b]"
                  : isDark
                  ? "text-primary"
                  : "text-[#0f172a]"
              }`}
            >
              View Details
            </Text>
          </TouchableOpacity>
        </View>

        <Image
          source={{
            uri: item.image_url || "https://via.placeholder.com/96x128",
          }}
          className={`w-24 h-28 rounded-xl ${
            isLowConfidence ? "opacity-60" : ""
          }`}
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
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className={`rounded-t-3xl max-h-[90%] pb-8 ${
              isDark ? "bg-[#102217]" : "bg-white"
            }`}
          >
            {/* Modal Header */}
            <View
              className={`flex-row justify-between items-center p-4 border-b ${
                isDark ? "border-[#326747]" : "border-[#e2e8f0]"
              }`}
            >
              <Text
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-[#0f172a]"
                }`}
              >
                Item Details
              </Text>
              <TouchableOpacity
                onPress={handleCloseItemModal}
                className={`p-2 rounded-full ${
                  isDark ? "bg-[#326747]" : "bg-[#f1f5f9]"
                }`}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={isDark ? "#ffffff" : "#0f172a"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
              {/* Item Image */}
              <Image
                source={{
                  uri:
                    selectedItem.image_url ||
                    "https://via.placeholder.com/400x200",
                }}
                className="w-full h-48 rounded-2xl mb-4"
                resizeMode="cover"
              />

              {/* Match Badge */}
              <View className="flex-row items-center mb-3">
                <View className="flex-row items-center bg-primary px-3 py-1.5 rounded-full">
                  <MaterialIcons name="verified" size={16} color="#102217" />
                  <Text className="ml-1 text-sm font-bold text-[#102217]">
                    {percentage}% Match
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text
                className={`text-[22px] font-bold mb-2 ${
                  isDark ? "text-white" : "text-[#0f172a]"
                }`}
              >
                {selectedItem.title || "Unknown Item"}
              </Text>

              {/* Category */}
              <View className="flex-row items-center mb-4">
                <MaterialIcons
                  name="category"
                  size={18}
                  color={isDark ? "#92c9a8" : "#64748b"}
                />
                <Text
                  className={`ml-1.5 text-sm ${
                    isDark ? "text-[#92c9a8]" : "text-[#64748b]"
                  }`}
                >
                  {CATEGORY_LABELS[selectedItem.category] ||
                    selectedItem.category ||
                    "Other"}
                </Text>
              </View>

              {/* Description */}
              {selectedItem.description && (
                <View className="mb-4">
                  <Text
                    className={`text-xs font-semibold uppercase mb-1 ${
                      isDark ? "text-[#92c9a8]" : "text-[#64748b]"
                    }`}
                  >
                    Description
                  </Text>
                  <Text
                    className={`text-[15px] leading-[22px] ${
                      isDark ? "text-[#f8fafc]" : "text-[#334155]"
                    }`}
                  >
                    {selectedItem.description}
                  </Text>
                </View>
              )}

              {/* Location */}
              <View className="mb-4">
                <Text
                  className={`text-xs font-semibold uppercase mb-1 ${
                    isDark ? "text-[#92c9a8]" : "text-[#64748b]"
                  }`}
                >
                  {reportType === "lost" ? "Location Found" : "Last Seen"}
                </Text>
                <View className="flex-row items-center">
                  <MaterialIcons
                    name="location-on"
                    size={18}
                    color={PRIMARY_COLOR}
                  />
                  <Text
                    className={`ml-1.5 text-[15px] ${
                      isDark ? "text-[#f8fafc]" : "text-[#334155]"
                    }`}
                  >
                    {location}
                  </Text>
                </View>
              </View>

              {/* Date */}
              <View className="mb-4">
                <Text
                  className={`text-xs font-semibold uppercase mb-1 ${
                    isDark ? "text-[#92c9a8]" : "text-[#64748b]"
                  }`}
                >
                  {reportType === "lost" ? "Date Found" : "Date Lost"}
                </Text>
                <View className="flex-row items-center">
                  <MaterialIcons
                    name="schedule"
                    size={18}
                    color={PRIMARY_COLOR}
                  />
                  <Text
                    className={`ml-1.5 text-[15px] ${
                      isDark ? "text-[#f8fafc]" : "text-[#334155]"
                    }`}
                  >
                    {formatFullDate(dateField)}
                  </Text>
                </View>
              </View>

              {/* Posted By */}
              <View className="mb-6">
                <Text
                  className={`text-xs font-semibold uppercase mb-1 ${
                    isDark ? "text-[#92c9a8]" : "text-[#64748b]"
                  }`}
                >
                  Posted By
                </Text>
                <View className="flex-row items-center">
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center ${
                      isDark ? "bg-[#326747]" : "bg-[#e2e8f0]"
                    }`}
                  >
                    <MaterialIcons
                      name="person"
                      size={20}
                      color={isDark ? "#92c9a8" : "#64748b"}
                    />
                  </View>
                  <Text
                    className={`ml-2.5 text-[15px] font-semibold ${
                      isDark ? "text-[#f8fafc]" : "text-[#334155]"
                    }`}
                  >
                    {posterName}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row px-4 gap-3">
              <TouchableOpacity
                onPress={handleCloseItemModal}
                className={`flex-1 py-3.5 rounded-xl items-center ${
                  isDark ? "bg-[#326747]" : "bg-[#f1f5f9]"
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    isDark ? "text-white" : "text-[#64748b]"
                  }`}
                >
                  Close
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClaimItem}
                disabled={isClaiming}
                className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl bg-primary ${
                  isClaiming ? "opacity-70" : ""
                }`}
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
                    <Text className="ml-2 text-base font-semibold text-[#102217]">
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
        <View className="flex-1 bg-[#102217]/95 justify-center items-center p-6">
          {/* Icon */}
          <View className="w-[100px] h-[100px] rounded-full bg-primary/15 justify-center items-center mb-6">
            <View className="w-[70px] h-[70px] rounded-full bg-primary/25 justify-center items-center">
              <MaterialIcons
                name="notifications-active"
                size={36}
                color="#2bee79"
              />
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-white mb-3 text-center">
            Claim Submitted!
          </Text>

          {/* Subtitle */}
          <Text className="text-[15px] text-[#92c9a8] text-center mb-4 leading-[22px] px-5">
            {posterName} has been notified about your claim.
          </Text>

          {/* Info Box */}
          <View className="bg-primary/10 rounded-xl p-4 mb-8 w-full max-w-[300px]">
            <Text className="text-sm text-[#92c9a8] text-center leading-5">
              📧 They will reach out to you soon to verify and arrange the
              handover. Please wait for their response.
            </Text>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={handleClaimModalClose}
            className="bg-primary py-3.5 px-12 rounded-full"
          >
            <Text className="text-base font-semibold text-[#102217]">
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-[#102217]" : "bg-[#f8fafc]"}`}>
      {/* Header */}
      <View
        className={`flex-row items-center px-5 pt-14 pb-4 ${
          isDark ? "bg-[#193324]" : "bg-white"
        }`}
      >
        <TouchableOpacity
          className={`w-11 h-11 rounded-full items-center justify-center ${
            isDark ? "bg-[#102217]" : "bg-[#f1f5f9]"
          }`}
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
          className={`ml-4 text-lg font-bold ${
            isDark ? "text-white" : "text-[#0f172a]"
          }`}
        >
          Potential Matches
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Reference Card - Source Item */}
        {sourceItem && (
          <View
            className={`mx-5 mt-4 p-3 rounded-2xl flex-row items-center justify-between ${
              isDark ? "bg-[#193324]" : "bg-white"
            }`}
          >
            <View className="flex-row items-center flex-1">
              <Image
                source={{
                  uri: sourceItem.image_url || "https://via.placeholder.com/48",
                }}
                className={`w-12 h-12 rounded-xl ${
                  isDark ? "border border-[#326747]" : "border border-[#e2e8f0]"
                }`}
              />
              <View className="ml-3 flex-1">
                <Text
                  className={`text-xs ${
                    isDark ? "text-[#92c9a8]" : "text-[#64748b]"
                  }`}
                >
                  Searching for
                </Text>
                <Text
                  className={`text-base font-semibold ${
                    isDark ? "text-white" : "text-[#0f172a]"
                  }`}
                  numberOfLines={1}
                >
                  {sourceItem.title || "Your item"}
                </Text>
              </View>
            </View>
            <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
              <MaterialIcons name="image" size={18} color={PRIMARY_COLOR} />
            </View>
          </View>
        )}

        {/* Headline */}
        <View className="px-5 mt-5 mb-4">
          <Text
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-[#0f172a]"
            }`}
          >
            We found{" "}
            <Text className="text-primary">
              {matches.length} {matches.length === 1 ? "match" : "matches"}
            </Text>
          </Text>
          <Text
            className={`mt-1 text-sm ${
              isDark ? "text-[#92c9a8]" : "text-[#64748b]"
            }`}
          >
            Review the results below to verify your item.
          </Text>
        </View>

        {/* Results List */}
        {matches.length > 0 ? (
          <View className="px-5 pb-28">
            {matches.map((item, index) => {
              // First item (highest match) gets hero treatment
              if (index === 0) {
                return renderHeroCard(item, index);
              }
              return renderMatchCard(item, index);
            })}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-8 py-12">
            <MaterialIcons
              name="search-off"
              size={64}
              color={isDark ? "#92c9a8" : "#64748b"}
              className="mb-4"
            />
            <Text
              className={`text-center text-base ${
                isDark ? "text-[#92c9a8]" : "text-[#64748b]"
              }`}
            >
              No matching items found. Check back later or adjust your search.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
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
          className={`py-4 rounded-xl items-center ${
            isDark ? "bg-[#102217]" : "bg-[#f1f5f9]"
          }`}
          onPress={handleNoMatch}
          activeOpacity={0.7}
        >
          <Text
            className={`text-base font-semibold ${
              isDark ? "text-[#92c9a8]" : "text-[#64748b]"
            }`}
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
