import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { supabase } from "../lib/supabaseClient";
import { resolvedItemsStyles as styles } from "./styles/resolvedItemsStyles";

const PRIMARY_COLOR = "#2bee79";
const MUTED_LIGHT_COLOR = "#64748b";
const MUTED_DARK_COLOR = "#94a3b8";

export default function ResolvedItemsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [loading, setLoading] = useState(true);
  const [resolvedItems, setResolvedItems] = useState([]);
  const [totalReturned, setTotalReturned] = useState(0);
  const [thisMonthCount, setThisMonthCount] = useState(0);

  const mutedTextColor = isDark ? MUTED_DARK_COLOR : MUTED_LIGHT_COLOR;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const fetchResolvedItems = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch resolved found reports
      const { data: foundData, error: foundError } = await supabase
        .from("found_reports")
        .select("*")
        .eq("status", "resolved")
        .order("updated_at", { ascending: false });

      // Fetch resolved lost reports
      const { data: lostData, error: lostError } = await supabase
        .from("lost_reports")
        .select("*")
        .eq("status", "resolved")
        .order("updated_at", { ascending: false });

      if (foundError) console.warn("Found reports error:", foundError);
      if (lostError) console.warn("Lost reports error:", lostError);

      const foundItems = (foundData || []).map((item) => ({
        ...item,
        type: "found",
        location: item.location_found,
      }));

      const lostItems = (lostData || []).map((item) => ({
        ...item,
        type: "lost",
        location: item.last_seen,
      }));

      // Combine and sort by resolved date
      const allResolved = [...foundItems, ...lostItems].sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      );

      // Get reporter profiles
      const reporterIds = [
        ...new Set(allResolved.map((r) => r.reporter_id)),
      ].filter(Boolean);

      let profilesMap = {};
      if (reporterIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, first_name, full_name, avatar_url")
          .in("id", reporterIds);

        if (profilesData) {
          profilesData.forEach((p) => {
            profilesMap[p.id] = {
              name: p.first_name || p.full_name || "Anonymous",
              avatar: p.avatar_url || "",
            };
          });
        }
      }

      const enrichedItems = allResolved.map((item) => ({
        ...item,
        reporter_name: profilesMap[item.reporter_id]?.name || "Anonymous",
        avatar_url: profilesMap[item.reporter_id]?.avatar || "",
      }));

      setResolvedItems(enrichedItems);
      setTotalReturned(enrichedItems.length);

      // Calculate this month's count
      const now = new Date();
      const thisMonth = enrichedItems.filter((item) => {
        const resolvedDate = new Date(item.updated_at);
        return (
          resolvedDate.getMonth() === now.getMonth() &&
          resolvedDate.getFullYear() === now.getFullYear()
        );
      });
      setThisMonthCount(thisMonth.length);
    } catch (error) {
      console.error("Error fetching resolved items:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResolvedItems();
  }, [fetchResolvedItems]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconWrapper,
          isDark ? styles.emptyIconWrapperDark : styles.emptyIconWrapperLight,
        ]}
      >
        <MaterialIcons name="check-circle" size={40} color={PRIMARY_COLOR} />
      </View>
      <Text
        style={[
          styles.emptyTitle,
          isDark ? styles.emptyTitleDark : styles.emptyTitleLight,
        ]}
      >
        No Resolved Items Yet
      </Text>
      <Text
        style={[
          styles.emptyText,
          isDark ? styles.emptyTextDark : styles.emptyTextLight,
        ]}
      >
        Items that have been successfully returned to their owners will appear
        here.
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            isDark ? styles.headerTitleDark : styles.headerTitleLight,
          ]}
        >
          Resolved History
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.headerButton,
              isDark ? styles.headerButtonDark : styles.headerButtonLight,
            ]}
          >
            <MaterialIcons
              name="search"
              size={22}
              color={isDark ? "#f8fafc" : "#0f172a"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.headerButton,
              isDark ? styles.headerButtonDark : styles.headerButtonLight,
            ]}
          >
            <MaterialIcons
              name="tune"
              size={22}
              color={isDark ? "#f8fafc" : "#0f172a"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              isDark ? styles.statCardDark : styles.statCardLight,
            ]}
          >
            <View
              style={[
                styles.statIconWrapper,
                isDark
                  ? styles.statIconWrapperDark
                  : styles.statIconWrapperLight,
              ]}
            >
              <MaterialIcons
                name="check-circle"
                size={24}
                color={PRIMARY_COLOR}
              />
            </View>
            <Text
              style={[
                styles.statLabel,
                isDark ? styles.statLabelDark : styles.statLabelLight,
              ]}
            >
              Total Returned
            </Text>
            <Text
              style={[
                styles.statValue,
                isDark ? styles.statValueDark : styles.statValueLight,
              ]}
            >
              {totalReturned}
            </Text>
          </View>

          <View style={[styles.statCard, styles.statCardAccent]}>
            <View
              style={[styles.statIconWrapper, styles.statIconWrapperAccent]}
            >
              <MaterialIcons name="calendar-today" size={24} color="#102217" />
            </View>
            <Text style={[styles.statLabel, styles.statLabelAccent]}>
              This Month
            </Text>
            <Text style={[styles.statValue, styles.statValueAccent]}>
              {thisMonthCount}
            </Text>
          </View>
        </View>

        {/* Recent Returns Section */}
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              isDark ? styles.sectionTitleDark : styles.sectionTitleLight,
            ]}
          >
            Recent Returns
          </Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          </View>
        ) : resolvedItems.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.itemsList}>
            {resolvedItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                style={[
                  styles.itemCard,
                  isDark ? styles.itemCardDark : styles.itemCardLight,
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/item-detail",
                    params: {
                      id: item.id,
                      title: item.title,
                      status: item.type === "found" ? "Found" : "Lost",
                      category: item.category,
                      description: item.description,
                      location: item.location,
                      dateTime:
                        item.type === "found" ? item.found_at : item.lost_at,
                      reward: item.reward,
                      notes: item.notes,
                      image: item.image_url,
                      author: item.reporter_name,
                      avatar: item.avatar_url,
                      contactPreference: item.contact_preference,
                      contactValue: item.contact_value,
                      reporterId: item.reporter_id,
                    },
                  })
                }
              >
                <Image
                  source={{
                    uri: item.image_url || "https://via.placeholder.com/150",
                  }}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text
                    style={[
                      styles.itemTitle,
                      isDark ? styles.itemTitleDark : styles.itemTitleLight,
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <View style={styles.itemLocation}>
                    <MaterialIcons
                      name="location-on"
                      size={12}
                      color={mutedTextColor}
                    />
                    <Text
                      style={[
                        styles.itemLocationText,
                        isDark
                          ? styles.itemLocationTextDark
                          : styles.itemLocationTextLight,
                      ]}
                      numberOfLines={1}
                    >
                      {item.location || "Unknown location"}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.itemDate,
                      isDark ? styles.itemDateDark : styles.itemDateLight,
                    ]}
                  >
                    Resolved {formatDate(item.updated_at)}
                  </Text>
                </View>
                <View style={styles.returnedBadge}>
                  <Text style={styles.returnedBadgeText}>Returned</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        style={[
          styles.bottomNav,
          isDark ? styles.bottomNavDark : styles.bottomNavLight,
        ]}
      >
        <View style={styles.navItems}>
          <TouchableOpacity
            style={styles.navButton}
            activeOpacity={0.85}
            onPress={() => router.push("/home")}
          >
            <MaterialIcons name="home" size={26} color={mutedTextColor} />
            <Text
              style={[
                styles.navLabel,
                isDark ? styles.navLabelInactiveDark : styles.navLabelInactive,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.85}>
            <MaterialIcons name="task-alt" size={26} color={PRIMARY_COLOR} />
            <Text
              style={[
                styles.navLabel,
                isDark
                  ? styles.navLabelInactiveDark
                  : styles.navLabelInactiveLight,
              ]}
            >
              Resolved Items
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            activeOpacity={0.85}
            onPress={() => router.push("/profile")}
          >
            <MaterialIcons name="person" size={26} color={mutedTextColor} />
            <Text
              style={[
                styles.navLabel,
                isDark ? styles.navLabelInactiveDark : styles.navLabelInactive,
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
