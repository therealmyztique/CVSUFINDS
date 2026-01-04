import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import FoundItems from "./components/FoundItems";
import LostItems from "./components/LostItems";
import { homeStyles as styles } from "./styles/homeStyles";

const FILTERS = ["All", "Lost", "Found"];

const FILTER_COLORS = {
  All: {
    lightBg: "#0f172a",
    darkBg: "#f8fafc",
    lightText: "#f8fafc",
    darkText: "#0b1610",
  },
  Lost: {
    lightBg: "#f43f5e",
    darkBg: "#fb7185",
    lightText: "#ffffff",
    darkText: "#0b1610",
  },
  Found: {
    lightBg: "#2bee79",
    darkBg: "#2bee79",
    lightText: "#0b1610",
    darkText: "#0b1610",
  },
};

const PRIMARY_COLOR = "#2bee79";
const SURFACE_ICON_COLOR = "#102217";
const LIGHT_TEXT_COLOR = "#0f172a";
const DARK_TEXT_COLOR = "#f8fafc";
const MUTED_LIGHT_COLOR = "#64748b";
const MUTED_DARK_COLOR = "#94a3b8";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeFilter, setActiveFilter] = useState("All");
  const [foundReports, setFoundReports] = useState([]);
  const [lostReports, setLostReports] = useState([]);

  const baseTextColor = isDark ? DARK_TEXT_COLOR : LIGHT_TEXT_COLOR;
  const mutedTextColor = isDark ? MUTED_DARK_COLOR : MUTED_LIGHT_COLOR;

  // Helper to calculate time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };
  // Transform found_reports data to match post format
  const transformedFoundPosts = useMemo(() => {
    return foundReports.map((report) => ({
      id: report.id,
      title: report.title,
      status: "Found",
      category: report.category || "other",
      location: report.location_found || "Unknown location",
      dateTime: report.found_at,
      author: report.reporter_name || "Anonymous",
      timeAgo: getTimeAgo(report.created_at),
      image: report.image_url || "https://via.placeholder.com/150",
      description: report.description,
      avatar: report.avatar_url,
      reward: report.reward,
      notes: report.notes,
      contactPreference: report.contact_preference,
      contactValue: report.contact_value,
      reporterId: report.reporter_id,
    }));
  }, [foundReports]);

  // Transform lost_reports data to match post format
  const transformedLostPosts = useMemo(() => {
    return lostReports.map((report) => ({
      id: report.id,
      title: report.title,
      status: "Lost",
      category: report.category || "other",
      location: report.last_seen || "Unknown location",
      dateTime: report.lost_at,
      author: report.reporter_name || "Anonymous",
      timeAgo: getTimeAgo(report.created_at),
      image: report.image_url || "https://via.placeholder.com/150",
      description: report.description,
      avatar: report.avatar_url,
      reward: report.reward,
      notes: report.notes,
      contactPreference: report.contact_preference,
      contactValue: report.contact_value,
      reporterId: report.reporter_id,
    }));
  }, [lostReports]);

  // Combine found and lost posts
  const transformedPosts = useMemo(() => {
    return [...transformedFoundPosts, ...transformedLostPosts].sort(
      (a, b) => new Date(b.timeAgo) - new Date(a.timeAgo)
    );
  }, [transformedFoundPosts, transformedLostPosts]);

  // Use database posts
  const allPosts = useMemo(() => {
    return transformedPosts || [];
  }, [transformedPosts]);

  const filteredPosts = useMemo(() => {
    if (!allPosts || allPosts.length === 0) {
      return [];
    }
    if (activeFilter === "All") {
      return allPosts;
    }
    return allPosts.filter((post) => post.status === activeFilter);
  }, [activeFilter, allPosts]);

  const handleFoundDataLoaded = useCallback((data) => {
    setFoundReports(data);
    console.log("Found reports loaded:", data);
  }, []);

  const handleLostDataLoaded = useCallback((data) => {
    setLostReports(data);
    console.log("Lost reports loaded:", data);
  }, []);

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      {/* FoundItems component fetches data and passes it via callback */}
      <FoundItems onDataLoaded={handleFoundDataLoaded} filter={activeFilter} />
      {/* LostItems component fetches data and passes it via callback */}
      <LostItems onDataLoaded={handleLostDataLoaded} filter={activeFilter} />

      <View
        style={[
          styles.header,
          isDark ? styles.headerSurfaceDark : styles.headerSurfaceLight,
          styles.headerShadow,
          isDark ? styles.headerShadowDark : null,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.bellButton,
            isDark ? styles.bellButtonDark : styles.bellButtonLight,
          ]}
        >
          <MaterialIcons name="notifications" size={26} color={baseTextColor} />
          <View style={styles.bellBadge} />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text
            style={[
              styles.headerTitleText,
              isDark ? styles.headerTitleDark : styles.headerTitleLight,
            ]}
          >
            CvSU
          </Text>
          <Text style={[styles.headerTitleText, styles.headerTitleAccent]}>
            Finds
          </Text>
        </View>

        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text
            style={[
              styles.heroHeading,
              isDark ? styles.heroHeadingDark : styles.heroHeadingLight,
            ]}
          >
            Hello, Student!
          </Text>
          <Text
            style={[
              styles.heroSubtitle,
              isDark ? styles.heroSubtitleDark : styles.heroSubtitleLight,
            ]}
          >
            Did you lose or find something today?
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.actionButton}
            onPress={() => router.push("/report-lost")}
          >
            <View style={styles.actionCircle}>
              <MaterialIcons
                name="search"
                size={32}
                color={SURFACE_ICON_COLOR}
              />
            </View>
            <Text
              style={[
                styles.actionText,
                isDark ? styles.actionTextDark : styles.actionTextLight,
              ]}
            >
              Report{"\n"}Lost Item
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.actionButton}
            onPress={() => router.push("/report-found")}
          >
            <View style={styles.actionCircle}>
              <MaterialIcons
                name="volunteer-activism"
                size={32}
                color={SURFACE_ICON_COLOR}
              />
            </View>
            <Text
              style={[
                styles.actionText,
                isDark ? styles.actionTextDark : styles.actionTextLight,
              ]}
            >
              Report{"\n"}Found Item
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filtersContainer]}
          style={styles.filtersSection}
        >
          {FILTERS.map((filter) => {
            const isActive = filter === activeFilter;
            const palette = FILTER_COLORS[filter];
            const activeBackground = palette
              ? isDark
                ? palette.darkBg
                : palette.lightBg
              : null;
            const activeTextColor = palette
              ? isDark
                ? palette.darkText
                : palette.lightText
              : null;
            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.85}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterChip,
                  isDark ? styles.filterChipDark : null,
                  isActive && activeBackground
                    ? {
                        backgroundColor: activeBackground,
                        borderColor: "transparent",
                      }
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    isDark ? styles.filterLabelDark : null,
                    isActive && activeTextColor
                      ? { color: activeTextColor }
                      : null,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              isDark ? styles.sectionTitleDark : styles.sectionTitleLight,
            ]}
          >
            Recent Posts
          </Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.postsGrid}>
          {filteredPosts.map((post) => {
            const isFound = post.status === "Found";
            return (
              <TouchableOpacity
                key={post.id}
                activeOpacity={0.92}
                style={[styles.postCard, isDark ? styles.postCardDark : null]}
                onPress={() =>
                  router.push({
                    pathname: "/item-detail",
                    params: {
                      id: post.id,
                      title: post.title,
                      status: post.status,
                      category: post.category,
                      description: post.description,
                      location: post.location,
                      dateTime: post.dateTime,
                      reward: post.reward,
                      notes: post.notes,
                      image: post.image,
                      author: post.author,
                      avatar: post.avatar,
                      contactPreference: post.contactPreference,
                      contactValue: post.contactValue,
                      reporterId: post.reporterId,
                    },
                  })
                }
              >
                <View style={styles.postImageWrapper}>
                  <Image
                    source={{ uri: post.image }}
                    style={{ width: "100%", height: "100%" }}
                  />
                  <View
                    style={[
                      styles.statusPill,
                      isFound ? styles.statusFound : styles.statusLost,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusLabel,
                        isFound
                          ? styles.statusLabelLight
                          : styles.statusLabelDark,
                      ]}
                    >
                      {post.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.postTitle,
                    isDark ? styles.postTitleDark : styles.postTitleLight,
                  ]}
                  numberOfLines={1}
                >
                  {post.title}
                </Text>

                <View style={styles.postMetaRow}>
                  <MaterialIcons
                    name="location-on"
                    size={16}
                    color={mutedTextColor}
                  />
                  <Text
                    style={[
                      styles.postMetaText,
                      isDark ? styles.postMetaDark : styles.postMetaLight,
                    ]}
                    numberOfLines={1}
                  >
                    {post.location}
                  </Text>
                </View>

                <View style={styles.postFooter}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                      <Image
                        source={{ uri: post.avatar }}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </View>
                    <Text
                      style={[
                        styles.avatarLabel,
                        isDark ? styles.avatarLabelDark : null,
                      ]}
                    >
                      {post.author}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.timeLabel,
                      isDark ? styles.timeLabelDark : null,
                    ]}
                  >
                    {post.timeAgo}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomNav,
          isDark ? styles.bottomNavDark : styles.bottomNavLight,
        ]}
      >
        <View style={styles.navItems}>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.85}>
            <MaterialIcons name="home" size={26} color={PRIMARY_COLOR} />
            <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            activeOpacity={0.85}
            onPress={() => router.push("/resolved-items")}
          >
            <MaterialIcons
              name="task-alt"
              size={26}
              color={isDark ? "#94a3b8" : "#94a3b8"}
            />
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
