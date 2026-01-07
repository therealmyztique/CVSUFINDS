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
import {
    findMatchesForLostItem,
    generateImageEmbedding,
} from "../lib/embeddingService";
import { supabase } from "../lib/supabaseClient";
import AppHeader from "./components/AppHeader";
import BottomNav from "./components/BottomNav";
import { myReportsStyles as styles } from "./styles/myReportsStyles";

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
  const [showResolvedSuccessModal, setShowResolvedSuccessModal] = useState(false);

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
      const { data: { user } } = await supabase.auth.getUser();
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
    return report.type.toLowerCase() === activeFilter.toLowerCase() && report.status !== "resolved";
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
    setMenuVisible(menuVisible === `${item.type}-${item.id}` ? null : `${item.type}-${item.id}`);
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
      const tableName = itemToDelete.type === "lost" ? "lost_reports" : "found_reports";
      
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

    const table = targetItem.type === "found" ? "found_reports" : "lost_reports";
    const typeLabel = targetItem.type === "found" ? "found" : "lost";

    if (targetItem.status === "resolved") {
      return;
    }

    try {
      console.log("Marking as resolved:", { id: targetItem.id, type: targetItem.type });
      
      // First, verify the item exists
      const { data: existingItem, error: fetchError } = await supabase
        .from(table)
        .select("id, status")
        .eq("id", targetItem.id)
        .single();
      
      console.log("Existing item check:", { existingItem, fetchError });
      
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

      console.log("Update response:", { data, error, count });

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
      
      console.log("Verify after update:", verifyData);

      if (verifyData?.status !== "resolved") {
        Alert.alert("Error", "Update appeared to succeed but status is still: " + verifyData?.status);
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
      const result = await findMatchesForLostItem(
        selectedItem.id,
        0.5,
        10
      );

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
        // No matches found - navigate to home with message
        router.replace("/home");
      }
    } catch (error) {
      console.error("Error matching:", error);
      setSearchingMatches(false);
      router.replace("/home");
    }
  };

  const renderReportCard = (item) => {
    const isLost = item.type === "lost";
    const isResolved = item.status === "resolved";
    const categoryIcon = CATEGORY_ICONS[item.category] || "category";
    const isMenuOpen = menuVisible === `${item.type}-${item.id}`;

    return (
      <TouchableOpacity
        key={`${item.type}-${item.id}`}
        style={[
          styles.reportCard,
          isDark ? styles.reportCardDark : styles.reportCardLight,
        ]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        {/* Three dots menu button */}
        <TouchableOpacity
          style={styles.menuButton}
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
            style={[
              styles.dropdownMenu,
              isDark ? styles.dropdownMenuDark : styles.dropdownMenuLight,
            ]}
          >
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleEditPress(item)}
            >
              <MaterialIcons
                name="edit"
                size={18}
                color={isDark ? "#92c9a8" : "#64748b"}
              />
              <Text
                style={[
                  styles.dropdownItemText,
                  isDark ? styles.dropdownItemTextDark : styles.dropdownItemTextLight,
                ]}
              >
                Edit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleDeletePress(item)}
            >
              <MaterialIcons name="delete" size={18} color="#ef4444" />
              <Text style={[styles.dropdownItemText, { color: "#ef4444" }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.cardContent}>
          {/* Image or Icon */}
          <View
            style={[
              styles.cardImage,
              isDark ? styles.cardImageDark : styles.cardImageLight,
            ]}
          >
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.cardImageFull}
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
          <View style={styles.cardDetails}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    isResolved
                      ? styles.statusBadgeResolved
                      : isLost
                      ? styles.statusBadgeLost
                      : styles.statusBadgeFound,
                    isDark && isLost && !isResolved && styles.statusBadgeLostDark,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isResolved
                        ? styles.statusBadgeTextResolved
                        : isLost
                        ? isDark
                          ? styles.statusBadgeTextLostDark
                          : styles.statusBadgeTextLost
                        : styles.statusBadgeTextFound,
                    ]}
                  >
                    {isResolved ? "Resolved" : isLost ? "Lost" : "Found"}
                  </Text>
                </View>

                {/* Title */}
                <Text
                  style={[
                    styles.cardTitle,
                    isDark ? styles.cardTitleDark : styles.cardTitleLight,
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.cardMeta}>
              <MaterialIcons
                name="location-on"
                size={14}
                color={isDark ? "#92c9a8" : "#64748b"}
              />
              <Text
                style={[
                  styles.cardMetaText,
                  isDark ? styles.cardMetaTextDark : styles.cardMetaTextLight,
                ]}
                numberOfLines={1}
              >
                {item.location || "Unknown location"}
              </Text>
            </View>

            {/* Date and Reward */}
            <View style={styles.cardFooter}>
              <Text
                style={[
                  styles.cardDate,
                  isDark ? styles.cardDateDark : styles.cardDateLight,
                ]}
              >
                {formatDate(item.date)}
              </Text>
              {item.reward && (
                <Text style={styles.rewardText}>${item.reward} Reward</Text>
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
      CATEGORY_LABELS[selectedItem.category] || selectedItem.category || "Other";

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              isDark ? styles.modalContainerDark : styles.modalContainerLight,
            ]}
          >
            {/* Modal Header with X button */}
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  isDark ? styles.modalTitleDark : styles.modalTitleLight,
                ]}
              >
                Item Details
              </Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={[
                  styles.closeButton,
                  isDark ? styles.closeButtonDark : styles.closeButtonLight,
                ]}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={isDark ? "#ffffff" : "#0f172a"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Item Image */}
              {selectedItem.image_url ? (
                <Image
                  source={{ uri: selectedItem.image_url }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.modalImagePlaceholder,
                    isDark
                      ? styles.modalImagePlaceholderDark
                      : styles.modalImagePlaceholderLight,
                  ]}
                >
                  <MaterialIcons
                    name={CATEGORY_ICONS[selectedItem.category] || "category"}
                    size={64}
                    color={isDark ? "#4ade80" : "#94a3b8"}
                  />
                </View>
              )}

              {/* Status Badge */}
              <View style={{ marginTop: 16 }}>
                <View
                  style={[
                    styles.statusBadge,
                    isLost ? styles.statusBadgeLost : styles.statusBadgeFound,
                    isDark && isLost && styles.statusBadgeLostDark,
                    { alignSelf: "flex-start" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isLost
                        ? isDark
                          ? styles.statusBadgeTextLostDark
                          : styles.statusBadgeTextLost
                        : styles.statusBadgeTextFound,
                    ]}
                  >
                    {isLost ? "Lost" : "Found"}
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text
                style={[
                  styles.detailTitle,
                  isDark ? styles.detailTitleDark : styles.detailTitleLight,
                ]}
              >
                {selectedItem.title}
              </Text>

              {/* Category */}
              <View style={styles.detailRow}>
                <MaterialIcons
                  name="category"
                  size={18}
                  color={isDark ? "#92c9a8" : "#64748b"}
                />
                <Text
                  style={[
                    styles.detailText,
                    isDark ? styles.detailTextDark : styles.detailTextLight,
                  ]}
                >
                  {categoryLabel}
                </Text>
              </View>

              {/* Description */}
              {selectedItem.description && (
                <View style={styles.detailSection}>
                  <Text
                    style={[
                      styles.detailLabel,
                      isDark ? styles.detailLabelDark : styles.detailLabelLight,
                    ]}
                  >
                    Description
                  </Text>
                  <Text
                    style={[
                      styles.detailDescription,
                      isDark
                        ? styles.detailDescriptionDark
                        : styles.detailDescriptionLight,
                    ]}
                  >
                    {selectedItem.description}
                  </Text>
                </View>
              )}

              {/* Location */}
              <View style={styles.detailSection}>
                <Text
                  style={[
                    styles.detailLabel,
                    isDark ? styles.detailLabelDark : styles.detailLabelLight,
                  ]}
                >
                  {isLost ? "Last Seen" : "Location Found"}
                </Text>
                <View style={styles.detailRow}>
                  <MaterialIcons
                    name="location-on"
                    size={18}
                    color={PRIMARY_COLOR}
                  />
                  <Text
                    style={[
                      styles.detailText,
                      isDark ? styles.detailTextDark : styles.detailTextLight,
                    ]}
                  >
                    {selectedItem.location || "Unknown location"}
                  </Text>
                </View>
              </View>

              {/* Date */}
              <View style={styles.detailSection}>
                <Text
                  style={[
                    styles.detailLabel,
                    isDark ? styles.detailLabelDark : styles.detailLabelLight,
                  ]}
                >
                  {isLost ? "Date Lost" : "Date Found"}
                </Text>
                <View style={styles.detailRow}>
                  <MaterialIcons
                    name="schedule"
                    size={18}
                    color={PRIMARY_COLOR}
                  />
                  <Text
                    style={[
                      styles.detailText,
                      isDark ? styles.detailTextDark : styles.detailTextLight,
                    ]}
                  >
                    {formatFullDate(selectedItem.date)}
                  </Text>
                </View>
              </View>

              {/* Reward */}
              {selectedItem.reward && (
                <View style={styles.detailSection}>
                  <Text
                    style={[
                      styles.detailLabel,
                      isDark ? styles.detailLabelDark : styles.detailLabelLight,
                    ]}
                  >
                    Reward
                  </Text>
                  <Text style={styles.rewardTextLarge}>
                    ${selectedItem.reward}
                  </Text>
                </View>
              )}

              {/* Notes */}
              {selectedItem.notes && (
                <View style={styles.detailSection}>
                  <Text
                    style={[
                      styles.detailLabel,
                      isDark ? styles.detailLabelDark : styles.detailLabelLight,
                    ]}
                  >
                    Additional Notes
                  </Text>
                  <Text
                    style={[
                      styles.detailDescription,
                      isDark
                        ? styles.detailDescriptionDark
                        : styles.detailDescriptionLight,
                    ]}
                  >
                    {selectedItem.notes}
                  </Text>
                </View>
              )}

              {/* Match Button for Lost Items */}
              {isLost && (
                <TouchableOpacity
                  style={styles.matchButton}
                  onPress={handleMatchWithFound}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="search" size={20} color="#102217" />
                  <Text style={styles.matchButtonText}>
                    Match with found items
                  </Text>
                </TouchableOpacity>
              )}

              {/* Mark as Resolved Button for Lost Items */}
              {isLost && selectedItem.status !== "resolved" && (
                <TouchableOpacity
                  style={styles.resolveButton}
                  onPress={() => handleMarkAsResolved(selectedItem)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="check-circle" size={20} color="#0b1610" />
                  <Text style={styles.resolveButtonText}>
                    Mark as Resolved
                  </Text>
                </TouchableOpacity>
              )}

              {/* Mark as Resolved Button for Found Items */}
              {!isLost && selectedItem.status !== "resolved" && (
                <TouchableOpacity
                  style={styles.resolveButton}
                  onPress={() => handleMarkAsResolved(selectedItem)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="check-circle" size={20} color="#ffffff" />
                  <Text style={styles.resolveButtonText}>
                    Mark as Resolved
                  </Text>
                </TouchableOpacity>
              )}

              {/* Already Resolved Indicator */}
              {selectedItem.status === "resolved" && (
                <View style={styles.resolvedBadge}>
                  <MaterialIcons name="verified" size={20} color="#22c55e" />
                  <Text style={styles.resolvedBadgeText}>Item Resolved</Text>
                </View>
              )}

              <View style={{ height: 24 }} />
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
      <View style={styles.searchingOverlay}>
        {/* Animated Search Icon */}
        <View style={{ marginBottom: 32 }}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View style={styles.searchIconOuter}>
              <View style={styles.searchIconInner}>
                <Animated.View
                  style={{ transform: [{ rotate: rotateInterpolate }] }}
                >
                  <MaterialIcons name="find-replace" size={36} color="#22c55e" />
                </Animated.View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Title */}
        <Text style={styles.searchingTitle}>Finding a match...</Text>

        {/* Subtitle */}
        <Text style={styles.searchingSubtitle}>
          The system is finding a match for the{"\n"}lost item
        </Text>

        {/* Progress Section */}
        <View style={{ width: "100%", maxWidth: 280 }}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Scanning database...</Text>
            <Text style={styles.progressPercent}>
              {Math.min(Math.round(searchProgress), 100)}%
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
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
      <View style={styles.deleteModalOverlay}>
        <View
          style={[
            styles.deleteModalContainer,
            isDark ? styles.deleteModalContainerDark : styles.deleteModalContainerLight,
          ]}
        >
          {/* Warning Icon */}
          <View style={styles.deleteIconContainer}>
            <MaterialIcons name="warning" size={32} color="#ef4444" />
          </View>

          {/* Title */}
          <Text
            style={[
              styles.deleteModalTitle,
              isDark ? styles.deleteModalTitleDark : styles.deleteModalTitleLight,
            ]}
          >
            Are you sure to delete this item?
          </Text>

          {/* Subtitle */}
          <Text
            style={[
              styles.deleteModalSubtitle,
              isDark ? styles.deleteModalSubtitleDark : styles.deleteModalSubtitleLight,
            ]}
          >
            This action cannot be undone.
          </Text>

          {/* Buttons */}
          <View style={styles.deleteModalButtons}>
            <TouchableOpacity
              style={[
                styles.deleteModalButton,
                styles.deleteModalCancelButton,
                isDark ? styles.deleteModalCancelButtonDark : styles.deleteModalCancelButtonLight,
              ]}
              onPress={handleCancelDelete}
            >
              <Text
                style={[
                  styles.deleteModalButtonText,
                  isDark ? styles.deleteModalCancelTextDark : styles.deleteModalCancelTextLight,
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.deleteModalButton,
                styles.deleteModalConfirmButton,
                deleting && { opacity: 0.6 },
              ]}
              onPress={handleConfirmDelete}
              disabled={deleting}
            >
              <Text style={styles.deleteModalConfirmText}>
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
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(16, 34, 23, 0.95)",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
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
            <MaterialIcons name="delete" size={36} color="#2bee79" />
          </View>
        </View>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#ffffff",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Item Deleted!
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: "#92c9a8",
            textAlign: "center",
            marginBottom: 32,
            lineHeight: 22,
            paddingHorizontal: 20,
          }}
        >
          Your item has been successfully deleted.
        </Text>

        <TouchableOpacity
          onPress={() => setShowDeleteSuccessModal(false)}
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
            Done
          </Text>
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
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(16, 34, 23, 0.95)",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
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
            <MaterialIcons name="verified" size={36} color="#2bee79" />
          </View>
        </View>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#ffffff",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Item Resolved!
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: "#92c9a8",
            textAlign: "center",
            marginBottom: 32,
            lineHeight: 22,
            paddingHorizontal: 20,
          }}
        >
          The item has been marked as resolved. Thank you for helping!
        </Text>

        <TouchableOpacity
          onPress={() => setShowResolvedSuccessModal(false)}
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
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      {/* Header */}
      <AppHeader />

      {/* Greeting */}
      <View style={styles.greeting}>
        <Text
          style={[
            styles.greetingTitle,
            isDark ? styles.greetingTitleDark : styles.greetingTitleLight,
          ]}
        >
          My Reports
        </Text>
        <Text
          style={[
            styles.greetingSubtitle,
            isDark ? styles.greetingSubtitleDark : styles.greetingSubtitleLight,
          ]}
        >
          Manage your lost and found reports
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                activeFilter === filter
                  ? isDark
                    ? styles.filterButtonActiveDark
                    : styles.filterButtonActive
                  : isDark
                  ? styles.filterButtonInactiveDark
                  : styles.filterButtonInactive,
              ]}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter
                    ? isDark
                      ? styles.filterTextActiveDark
                      : styles.filterTextActive
                    : isDark
                    ? styles.filterTextInactiveDark
                    : styles.filterTextInactive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reports List */}
      <ScrollView
        style={styles.reportsList}
        contentContainerStyle={styles.reportsContent}
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            <Text
              style={[
                styles.loadingText,
                isDark ? styles.loadingTextDark : styles.loadingTextLight,
              ]}
            >
              Loading your reports...
            </Text>
          </View>
        ) : filteredReports.length === 0 ? (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconContainer,
                isDark
                  ? styles.emptyIconContainerDark
                  : styles.emptyIconContainerLight,
              ]}
            >
              <MaterialIcons
                name="description"
                size={48}
                color={isDark ? "#92c9a8" : "#64748b"}
              />
            </View>
            <Text
              style={[
                styles.emptyTitle,
                isDark ? styles.emptyTitleDark : styles.emptyTitleLight,
              ]}
            >
              No reports yet
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                isDark ? styles.emptySubtitleDark : styles.emptySubtitleLight,
              ]}
            >
              {activeFilter === "All"
                ? "All items you've reported as lost or found will appear here."
                : `You haven't reported any ${activeFilter.toLowerCase()} items yet.`}
            </Text>
          </View>
        ) : (
          filteredReports.map(renderReportCard)
        )}
        <View style={{ height: 100 }} />
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
    </View>
  );
}
