import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import {
  findMatchesForLostItem,
  generateImageEmbedding,
} from "../lib/embeddingService";
import { supabase } from "../lib/supabaseClient";

const PRIMARY_COLOR = "#2bee79";
const FILTERS = ["All", "Lost", "Found", "Resolved"];

const CATEGORY_LABELS = {
  electronics: "Electronics",
  clothing: "Clothing",
  accessories: "Accessories",
  documents: "Documents/ID",
  keys: "Keys",
  pets: "Pets",
  other: "Other",
};

const CATEGORY_ICONS = {
  electronics: "smartphone",
  clothing: "checkroom",
  accessories: "watch",
  documents: "description",
  keys: "vpn-key",
  pets: "pets",
  other: "category",
};

export default function MyReportsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [userId, setUserId] = useState(null);

  // Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Menu state
  const [menuVisible, setMenuVisible] = useState(null); // stores item id when menu is open
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Success modal states
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showResolvedSuccessModal, setShowResolvedSuccessModal] =
    useState(false);
  const [showNoMatchModal, setShowNoMatchModal] = useState(false);

  // Matching state
  const [searchingMatches, setSearchingMatches] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);

  // Animation refs
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for the search icon
  useEffect(() => {
    if (searchingMatches) {
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

      Animated.timing(progressAnim, {
        toValue: 100,
        duration: 4000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();

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

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  // Fetch user's reports
  const fetchReports = useCallback(async () => {
    if (!userId) return;

    try {
      // Fetch lost reports
      const { data: lostData, error: lostError } = await supabase
        .from("lost_reports")
        .select("*")
        .eq("reporter_id", userId)
        .order("created_at", { ascending: false });

      if (lostError) throw lostError;

      // Fetch found reports
      const { data: foundData, error: foundError } = await supabase
        .from("found_reports")
        .select("*")
        .eq("reporter_id", userId)
        .order("created_at", { ascending: false });

      if (foundError) throw foundError;

      // Combine and format
      const lostReports = (lostData || []).map((r) => ({
        ...r,
        type: "lost",
        location: r.last_seen,
        date: r.lost_at,
      }));

      const foundReports = (foundData || []).map((r) => ({
        ...r,
        type: "found",
        location: r.location_found,
        date: r.found_at,
      }));

      // Sort by created_at
      const allReports = [...lostReports, ...foundReports].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setReports(allReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchReports();
      }
    }, [userId, fetchReports])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const filteredReports = reports.filter((report) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Resolved") return report.status === "resolved";
    return (
      report.type.toLowerCase() === activeFilter.toLowerCase() &&
      report.status !== "resolved"
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
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

  const handleItemPress = (item) => {
    // Close menu if open
    if (menuVisible) {
      setMenuVisible(null);
      return;
    }
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  // Menu handlers
  const handleMenuPress = (item, e) => {
    e.stopPropagation();
    setMenuVisible(
      menuVisible === `${item.type}-${item.id}`
        ? null
        : `${item.type}-${item.id}`
    );
  };

  const handleEditPress = (item) => {
    setMenuVisible(null);
    router.push({
      pathname: "/edit-item",
      params: {
        item: JSON.stringify(item),
        type: item.type,
      },
    });
  };

  const handleDeletePress = (item) => {
    setMenuVisible(null);
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || deleting) return;

    setDeleting(true);

    try {
      const tableName =
        itemToDelete.type === "lost" ? "lost_reports" : "found_reports";

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", itemToDelete.id);

      if (error) {
        Alert.alert("Error", error.message || "Failed to delete item");
        setDeleting(false);
        return;
      }

      // Remove from local state
      setReports((prev) =>
        prev.filter(
          (r) => !(r.id === itemToDelete.id && r.type === itemToDelete.type)
        )
      );

      setShowDeleteModal(false);
      setItemToDelete(null);
      setShowDeleteSuccessModal(true);
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred");
    }

    setDeleting(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleMarkAsResolved = async (item) => {
    const targetItem = item ?? selectedItem;
    if (!targetItem) {
      return;
    }

    const table =
      targetItem.type === "found" ? "found_reports" : "lost_reports";
    const typeLabel = targetItem.type === "found" ? "found" : "lost";

    if (targetItem.status === "resolved") {
      return;
    }

    try {
      // First, verify the item exists
      const { data: existingItem, error: fetchError } = await supabase
        .from(table)
        .select("id, status")
        .eq("id", targetItem.id)
        .single();

      if (fetchError) {
        Alert.alert("Error", "Could not find item: " + fetchError.message);
        return;
      }

      // Now update
      const { data, error, count } = await supabase
        .from(table)
        .update({ status: "resolved" })
        .eq("id", targetItem.id)
        .select();

      if (error) {
        Alert.alert("Error", error.message || "Failed to mark as resolved");
        return;
      }

      if (!data || data.length === 0) {
        Alert.alert("Warning", "No rows were updated. Check RLS policies.");
        return;
      }

      // Verify the update worked
      const { data: verifyData } = await supabase
        .from(table)
        .select("id, status")
        .eq("id", targetItem.id)
        .single();

      if (verifyData?.status !== "resolved") {
        Alert.alert(
          "Error",
          "Update appeared to succeed but status is still: " +
            verifyData?.status
        );
        return;
      }

      // Update local state
      setReports((prev) =>
        prev.map((r) =>
          r.id === targetItem.id && r.type === typeLabel
            ? { ...r, status: "resolved" }
            : r
        )
      );

      setShowResolvedSuccessModal(true);
      handleCloseModal();
    } catch (error) {
      console.error("Error marking as resolved:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred");
    }
  };

  const handleMatchWithFound = async () => {
    if (!selectedItem || selectedItem.type !== "lost") return;

    setShowDetailModal(false);
    setSearchingMatches(true);

    try {
      // Generate embedding if needed
      if (selectedItem.image_url) {
        await generateImageEmbedding(
          selectedItem.image_url,
          selectedItem.id,
          "lost"
        );
      }

      // Wait a bit for the embedding to be stored
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Find matches
      const result = await findMatchesForLostItem(selectedItem.id, 0.5, 10);

      setSearchingMatches(false);

      if (result.success && result.matches && result.matches.length > 0) {
        router.push({
          pathname: "/match-results",
          params: {
            matches: JSON.stringify(result.matches),
            sourceItem: JSON.stringify({
              id: selectedItem.id,
              title: selectedItem.title,
              image_url: selectedItem.image_url,
            }),
            reportType: "lost",
          },
        });
      } else {
        // No matches found - show modal before redirecting
        setShowNoMatchModal(true);
      }
    } catch (error) {
      console.error("Error matching:", error);
      setSearchingMatches(false);
      setShowNoMatchModal(true);
    }
  };

  // Handle closing the no match modal
  const handleCloseNoMatchModal = () => {
    setShowNoMatchModal(false);
    router.replace("/home");
  };

  const renderReportCard = (item) => {
    const isLost = item.type === "lost";
    const isResolved = item.status === "resolved";
    const categoryIcon = CATEGORY_ICONS[item.category] || "category";
    const isMenuOpen = menuVisible === `${item.type}-${item.id}`;

    return (
      <TouchableOpacity
        key={`${item.type}-${item.id}`}
        className={`relative rounded-2xl mb-4 ${
          isDark ? "bg-surface-dark" : "bg-white"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: isMenuOpen ? 20 : 3,
          overflow: isMenuOpen ? "visible" : "hidden",
          zIndex: isMenuOpen ? 999 : 1,
        }}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        {/* Three dots menu button */}
        <TouchableOpacity
          className="absolute top-3 right-3 z-10 p-1"
          onPress={(e) => handleMenuPress(item, e)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons
            name="more-vert"
            size={20}
            color={isDark ? "#92c9a8" : "#64748b"}
          />
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <View
            className={`absolute top-10 right-3 rounded-xl py-2 min-w-[120px] ${
              isDark ? "bg-[#1a3d2a]" : "bg-white"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 20,
              zIndex: 999,
            }}
          >
            <TouchableOpacity
              className="flex-row items-center px-4 py-3"
              onPress={() => handleEditPress(item)}
            >
              <MaterialIcons
                name="edit"
                size={18}
                color={isDark ? "#92c9a8" : "#64748b"}
              />
              <Text
                className={`ml-3 text-sm font-medium ${
                  isDark ? "text-muted-dark" : "text-muted-light"
                }`}
              >
                Edit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center px-4 py-3"
              onPress={() => handleDeletePress(item)}
            >
              <MaterialIcons name="delete" size={18} color="#ef4444" />
              <Text className="ml-3 text-sm font-medium text-[#ef4444]">
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row p-4">
          {/* Image or Icon */}
          <View
            className={`w-20 h-20 rounded-xl items-center justify-center overflow-hidden ${
              isDark ? "bg-[#1a3d2a]" : "bg-gray-100"
            }`}
          >
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <MaterialIcons
                name={categoryIcon}
                size={36}
                color={isDark ? "#4ade80" : "#64748b"}
              />
            )}
          </View>

          {/* Details */}
          <View className="flex-1 ml-3 justify-center">
            <View className="mb-1">
              <View className="flex-row items-center flex-wrap gap-2">
                {/* Status Badge */}
                <View
                  className={`px-2 py-1 rounded-full ${
                    isResolved
                      ? "bg-[#dbeafe]"
                      : isLost
                      ? isDark
                        ? "bg-[#3d1f25]"
                        : "bg-[#fff1f2]"
                      : "bg-[#dcfce7]"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isResolved
                        ? "text-[#3b82f6]"
                        : isLost
                        ? isDark
                          ? "text-[#fda4af]"
                          : "text-[#f43f5e]"
                        : "text-[#22c55e]"
                    }`}
                  >
                    {isResolved ? "Resolved" : isLost ? "Lost" : "Found"}
                  </Text>
                </View>

                {/* Title */}
                <Text
                  className={`text-base font-semibold flex-1 ${
                    isDark ? "text-text-dark" : "text-text-light"
                  }`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View className="flex-row items-center mt-1">
              <MaterialIcons
                name="location-on"
                size={14}
                color={isDark ? "#92c9a8" : "#64748b"}
              />
              <Text
                className={`text-xs ml-1 flex-1 ${
                  isDark ? "text-muted-dark" : "text-muted-light"
                }`}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.location || "Unknown location"}
              </Text>
            </View>

            {/* Date and Reward */}
            <View className="flex-row items-center justify-between mt-2">
              <Text
                className={`text-xs ${
                  isDark ? "text-muted-dark" : "text-muted-light"
                }`}
              >
                {formatDate(item.date)}
              </Text>
              {item.reward && (
                <Text className="text-xs font-semibold text-primary">
                  ${item.reward} Reward
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedItem) return null;

    const isLost = selectedItem.type === "lost";
    const categoryLabel =
      CATEGORY_LABELS[selectedItem.category] ||
      selectedItem.category ||
      "Other";

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className={`rounded-t-3xl max-h-[90%] ${
              isDark ? "bg-surface-dark" : "bg-white"
            }`}
          >
            {/* Modal Header with X button */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200/10">
              <Text
                className={`text-xl font-bold ${
                  isDark ? "text-text-dark" : "text-text-light"
                }`}
              >
                Item Details
              </Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  isDark ? "bg-[#1a3d2a]" : "bg-gray-100"
                }`}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={isDark ? "#ffffff" : "#0f172a"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-6">
              {/* Item Image */}
              {selectedItem.image_url ? (
                <Image
                  source={{ uri: selectedItem.image_url }}
                  className="w-full h-56 rounded-xl mt-4"
                  resizeMode="cover"
                />
              ) : (
                <View
                  className={`w-full h-56 rounded-xl mt-4 items-center justify-center ${
                    isDark ? "bg-[#1a3d2a]" : "bg-gray-100"
                  }`}
                >
                  <MaterialIcons
                    name={CATEGORY_ICONS[selectedItem.category] || "category"}
                    size={64}
                    color={isDark ? "#4ade80" : "#94a3b8"}
                  />
                </View>
              )}

              {/* Status Badge */}
              <View className="mt-4">
                <View
                  className={`self-start px-3 py-1.5 rounded-full ${
                    isLost
                      ? isDark
                        ? "bg-[#3d1f25]"
                        : "bg-[#fff1f2]"
                      : "bg-[#dcfce7]"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isLost
                        ? isDark
                          ? "text-[#fda4af]"
                          : "text-[#f43f5e]"
                        : "text-[#22c55e]"
                    }`}
                  >
                    {isLost ? "Lost" : "Found"}
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text
                className={`text-2xl font-bold mt-3 ${
                  isDark ? "text-text-dark" : "text-text-light"
                }`}
              >
                {selectedItem.title}
              </Text>

              {/* Category */}
              <View className="flex-row items-center mt-3">
                <MaterialIcons
                  name="category"
                  size={18}
                  color={isDark ? "#92c9a8" : "#64748b"}
                />
                <Text
                  className={`ml-2 text-base ${
                    isDark ? "text-muted-dark" : "text-muted-light"
                  }`}
                >
                  {categoryLabel}
                </Text>
              </View>

              {/* Description */}
              {selectedItem.description && (
                <View className="mt-4">
                  <Text
                    className={`text-sm font-semibold mb-1 ${
                      isDark ? "text-muted-dark" : "text-muted-light"
                    }`}
                  >
                    Description
                  </Text>
                  <Text
                    className={`text-base leading-6 ${
                      isDark ? "text-text-dark" : "text-text-light"
                    }`}
                  >
                    {selectedItem.description}
                  </Text>
                </View>
              )}

              {/* Location */}
              <View className="mt-4">
                <Text
                  className={`text-sm font-semibold mb-1 ${
                    isDark ? "text-muted-dark" : "text-muted-light"
                  }`}
                >
                  {isLost ? "Last Seen" : "Location Found"}
                </Text>
                <View className="flex-row items-center">
                  <MaterialIcons
                    name="location-on"
                    size={18}
                    color={PRIMARY_COLOR}
                  />
                  <Text
                    className={`ml-2 text-base ${
                      isDark ? "text-text-dark" : "text-text-light"
                    }`}
                  >
                    {selectedItem.location || "Unknown location"}
                  </Text>
                </View>
              </View>

              {/* Date */}
              <View className="mt-4">
                <Text
                  className={`text-sm font-semibold mb-1 ${
                    isDark ? "text-muted-dark" : "text-muted-light"
                  }`}
                >
                  {isLost ? "Date Lost" : "Date Found"}
                </Text>
                <View className="flex-row items-center">
                  <MaterialIcons
                    name="schedule"
                    size={18}
                    color={PRIMARY_COLOR}
                  />
                  <Text
                    className={`ml-2 text-base ${
                      isDark ? "text-text-dark" : "text-text-light"
                    }`}
                  >
                    {formatFullDate(selectedItem.date)}
                  </Text>
                </View>
              </View>

              {/* Reward */}
              {selectedItem.reward && (
                <View className="mt-4">
                  <Text
                    className={`text-sm font-semibold mb-1 ${
                      isDark ? "text-muted-dark" : "text-muted-light"
                    }`}
                  >
                    Reward
                  </Text>
                  <Text className="text-2xl font-bold text-primary">
                    ${selectedItem.reward}
                  </Text>
                </View>
              )}

              {/* Notes */}
              {selectedItem.notes && (
                <View className="mt-4">
                  <Text
                    className={`text-sm font-semibold mb-1 ${
                      isDark ? "text-muted-dark" : "text-muted-light"
                    }`}
                  >
                    Additional Notes
                  </Text>
                  <Text
                    className={`text-base leading-6 ${
                      isDark ? "text-text-dark" : "text-text-light"
                    }`}
                  >
                    {selectedItem.notes}
                  </Text>
                </View>
              )}

              {/* Match Button for Lost Items */}
              {isLost && (
                <TouchableOpacity
                  className="flex-row items-center justify-center bg-primary py-4 rounded-xl mt-6"
                  onPress={handleMatchWithFound}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="search" size={20} color="#102217" />
                  <Text className="ml-2 text-base font-semibold text-[#102217]">
                    Match with found items
                  </Text>
                </TouchableOpacity>
              )}

              {/* Mark as Resolved Button for Lost Items */}
              {isLost && selectedItem.status !== "resolved" && (
                <TouchableOpacity
                  className="flex-row items-center justify-center bg-primary py-4 rounded-xl mt-3"
                  onPress={() => handleMarkAsResolved(selectedItem)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color="#0b1610"
                  />
                  <Text className="ml-2 text-base font-semibold text-[#0b1610]">
                    Mark as Resolved
                  </Text>
                </TouchableOpacity>
              )}

              {/* Mark as Resolved Button for Found Items */}
              {!isLost && selectedItem.status !== "resolved" && (
                <TouchableOpacity
                  className="flex-row items-center justify-center bg-primary py-4 rounded-xl mt-3"
                  onPress={() => handleMarkAsResolved(selectedItem)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color="#0b1610"
                  />
                  <Text className="ml-2 text-base font-semibold text-[#0b1610]">
                    Mark as Resolved
                  </Text>
                </TouchableOpacity>
              )}

              {/* Already Resolved Indicator */}
              {selectedItem.status === "resolved" && (
                <View className="flex-row items-center justify-center bg-[#dcfce7] py-4 rounded-xl mt-6">
                  <MaterialIcons name="verified" size={20} color="#22c55e" />
                  <Text className="ml-2 text-base font-semibold text-[#22c55e]">
                    Item Resolved
                  </Text>
                </View>
              )}

              <View className="h-6" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderSearchingModal = () => (
    <Modal
      visible={searchingMatches}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-[rgba(16,34,23,0.98)] justify-center items-center px-6">
        {/* Animated Search Icon */}
        <View className="mb-8">
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View className="w-28 h-28 rounded-full bg-[rgba(43,238,121,0.1)] items-center justify-center">
              <View className="w-20 h-20 rounded-full bg-[rgba(43,238,121,0.15)] items-center justify-center">
                <Animated.View
                  style={{ transform: [{ rotate: rotateInterpolate }] }}
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
        <Text className="text-2xl font-bold text-white mb-2">
          Finding a match...
        </Text>

        {/* Subtitle */}
        <Text className="text-base text-[#92c9a8] text-center mb-8">
          The system is finding a match for the{"\n"}lost item
        </Text>

        {/* Progress Section */}
        <View className="w-full max-w-[280px]">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-[#92c9a8]">Scanning database...</Text>
            <Text className="text-sm font-semibold text-primary">
              {Math.min(Math.round(searchProgress), 100)}%
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="h-2 bg-[rgba(43,238,121,0.1)] rounded-full overflow-hidden">
            <Animated.View
              className="h-full bg-primary rounded-full"
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDeleteModal = () => (
    <Modal
      visible={showDeleteModal}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancelDelete}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View
          className={`w-full max-w-sm rounded-3xl p-6 items-center ${
            isDark ? "bg-surface-dark" : "bg-white"
          }`}
        >
          {/* Warning Icon */}
          <View className="w-16 h-16 rounded-full bg-[rgba(239,68,68,0.1)] items-center justify-center mb-4">
            <MaterialIcons name="warning" size={32} color="#ef4444" />
          </View>

          {/* Title */}
          <Text
            className={`text-xl font-bold text-center mb-2 ${
              isDark ? "text-text-dark" : "text-text-light"
            }`}
          >
            Are you sure to delete this item?
          </Text>

          {/* Subtitle */}
          <Text
            className={`text-base text-center mb-6 ${
              isDark ? "text-muted-dark" : "text-muted-light"
            }`}
          >
            This action cannot be undone.
          </Text>

          {/* Buttons */}
          <View className="flex-row w-full gap-3">
            <TouchableOpacity
              className={`flex-1 py-3.5 rounded-xl items-center ${
                isDark ? "bg-[#1a3d2a]" : "bg-gray-100"
              }`}
              onPress={handleCancelDelete}
            >
              <Text
                className={`text-base font-semibold ${
                  isDark ? "text-text-dark" : "text-text-light"
                }`}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3.5 rounded-xl items-center bg-[#ef4444] ${
                deleting ? "opacity-60" : ""
              }`}
              onPress={handleConfirmDelete}
              disabled={deleting}
            >
              <Text className="text-base font-semibold text-white">
                {deleting ? "Deleting..." : "Yes"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDeleteSuccessModal = () => (
    <Modal
      visible={showDeleteSuccessModal}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-[rgba(16,34,23,0.95)] justify-center items-center p-6">
        <View className="w-[100px] h-[100px] rounded-full bg-[rgba(43,238,121,0.15)] justify-center items-center mb-6">
          <View className="w-[70px] h-[70px] rounded-[35px] bg-[rgba(43,238,121,0.25)] justify-center items-center">
            <MaterialIcons name="delete" size={36} color="#2bee79" />
          </View>
        </View>

        <Text className="text-2xl font-bold text-white mb-3 text-center">
          Item Deleted!
        </Text>

        <Text className="text-[15px] text-[#92c9a8] text-center mb-8 leading-[22px] px-5">
          Your item has been successfully deleted.
        </Text>

        <TouchableOpacity
          onPress={() => setShowDeleteSuccessModal(false)}
          className="bg-primary py-3.5 px-12 rounded-[25px]"
        >
          <Text className="text-base font-semibold text-[#102217]">Done</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  const renderResolvedSuccessModal = () => (
    <Modal
      visible={showResolvedSuccessModal}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-[rgba(16,34,23,0.95)] justify-center items-center p-6">
        <View className="w-[100px] h-[100px] rounded-full bg-[rgba(43,238,121,0.15)] justify-center items-center mb-6">
          <View className="w-[70px] h-[70px] rounded-[35px] bg-[rgba(43,238,121,0.25)] justify-center items-center">
            <MaterialIcons name="verified" size={36} color="#2bee79" />
          </View>
        </View>

        <Text className="text-2xl font-bold text-white mb-3 text-center">
          Item Resolved!
        </Text>

        <Text className="text-[15px] text-[#92c9a8] text-center mb-8 leading-[22px] px-5">
          The item has been marked as resolved. Thank you for helping!
        </Text>

        <TouchableOpacity
          onPress={() => setShowResolvedSuccessModal(false)}
          className="bg-primary py-3.5 px-12 rounded-[25px]"
        >
          <Text className="text-base font-semibold text-[#102217]">Done</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  return (
    <View
      className={`flex-1 ${
        isDark ? "bg-background-dark" : "bg-background-light"
      }`}
    >
      {/* Header */}
      <AppHeader />

      {/* Greeting */}
      <View className="px-5 pt-4 pb-2">
        <Text
          className={`text-2xl font-bold ${
            isDark ? "text-text-dark" : "text-text-light"
          }`}
        >
          My Reports
        </Text>
        <Text
          className={`text-sm mt-1 ${
            isDark ? "text-muted-dark" : "text-muted-light"
          }`}
        >
          Manage your lost and found reports
        </Text>
      </View>

      {/* Filters */}
      <View className="py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              className={`px-5 py-2.5 rounded-full ${
                activeFilter === filter
                  ? isDark
                    ? "bg-primary"
                    : "bg-primary"
                  : isDark
                  ? "bg-surface-dark"
                  : "bg-white border border-gray-200"
              }`}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-medium ${
                  activeFilter === filter
                    ? isDark
                      ? "text-[#0b1610]"
                      : "text-[#0b1610]"
                    : isDark
                    ? "text-muted-dark"
                    : "text-muted-light"
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reports List */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY_COLOR}
            colors={[PRIMARY_COLOR]}
          />
        }
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            <Text
              className={`mt-4 text-base ${
                isDark ? "text-muted-dark" : "text-muted-light"
              }`}
            >
              Loading your reports...
            </Text>
          </View>
        ) : filteredReports.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View
              className={`w-24 h-24 rounded-full items-center justify-center mb-4 ${
                isDark ? "bg-surface-dark" : "bg-gray-100"
              }`}
            >
              <MaterialIcons
                name="description"
                size={48}
                color={isDark ? "#92c9a8" : "#64748b"}
              />
            </View>
            <Text
              className={`text-xl font-semibold mb-2 ${
                isDark ? "text-text-dark" : "text-text-light"
              }`}
            >
              No reports yet
            </Text>
            <Text
              className={`text-sm text-center px-8 ${
                isDark ? "text-muted-dark" : "text-muted-light"
              }`}
            >
              {activeFilter === "All"
                ? "All items you've reported as lost or found will appear here."
                : `You haven't reported any ${activeFilter.toLowerCase()} items yet.`}
            </Text>
          </View>
        ) : (
          filteredReports.map(renderReportCard)
        )}
        <View className="h-[100px]" />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Detail Modal */}
      {renderDetailModal()}

      {/* Searching Modal */}
      {renderSearchingModal()}

      {/* Delete Confirmation Modal */}
      {renderDeleteModal()}

      {/* Delete Success Modal */}
      {renderDeleteSuccessModal()}

      {/* Resolved Success Modal */}
      {renderResolvedSuccessModal()}

      {/* No Match Found Modal */}
      <Modal
        visible={showNoMatchModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-[rgba(16,34,23,0.95)] justify-center items-center p-6">
          {/* Icon */}
          <View className="w-[100px] h-[100px] rounded-full bg-[rgba(234,179,8,0.15)] justify-center items-center mb-6">
            <View className="w-[70px] h-[70px] rounded-[35px] bg-[rgba(234,179,8,0.25)] justify-center items-center">
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
          <View className="bg-[rgba(34,197,94,0.1)] rounded-xl p-4 mb-8 w-full max-w-[300px]">
            <Text className="text-sm text-[#92c9a8] text-center leading-5">
              ✨ Don't worry! Your report is saved. You'll be notified if
              someone finds a matching item.
            </Text>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={handleCloseNoMatchModal}
            className="bg-[#22c55e] py-3.5 px-12 rounded-[25px]"
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
