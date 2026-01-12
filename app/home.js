import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import FoundItems from "../components/FoundItems";
import LostItems from "../components/LostItems";
import { supabase } from "../lib/supabaseClient";

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState(null);

  const baseTextColor = isDark ? DARK_TEXT_COLOR : LIGHT_TEXT_COLOR;
  const mutedTextColor = isDark ? MUTED_DARK_COLOR : MUTED_LIGHT_COLOR;

  // Fetch current user and check auth
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        // No user session, redirect to welcome screen
        router.replace("/");
      }
    };
    fetchUser();
  }, [router]);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [userId]);

  // Fetch unread count on focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchUnreadCount();
      }
    }, [userId, fetchUnreadCount])
  );

  // Subscribe to real-time notification updates
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel("notifications-home")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, fetchUnreadCount]);

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
      createdAt: report.created_at,
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
      createdAt: report.created_at,
    }));
  }, [lostReports]);

  // Combine found and lost posts
  const transformedPosts = useMemo(() => {
    return [...transformedFoundPosts, ...transformedLostPosts].sort(
      (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)
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
  }, []);

  const handleLostDataLoaded = useCallback((data) => {
    setLostReports(data);
  }, []);

  return (
    <View className={`flex-1 ${isDark ? "bg-[#0b1610]" : "bg-[#f0f5f2]"}`}>
      {/* FoundItems component fetches data and passes it via callback */}
      <FoundItems onDataLoaded={handleFoundDataLoaded} filter={activeFilter} />
      {/* LostItems component fetches data and passes it via callback */}
      <LostItems onDataLoaded={handleLostDataLoaded} filter={activeFilter} />

      {/* Header */}
      <AppHeader />

      {/* Notification Button Overlay */}
      <TouchableOpacity
        activeOpacity={0.85}
        className={`absolute top-12 right-4 z-50 w-11 h-11 rounded-full items-center justify-center ${
          isDark ? "bg-[#12251a]" : "bg-white"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={() => router.push("/notifications")}
      >
        <MaterialIcons name="notifications" size={26} color={baseTextColor} />
        {unreadCount > 0 && (
          <View className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
        )}
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="px-5 pt-6 pb-3">
          <Text
            className={`text-2xl font-bold mb-1 ${
              isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
            }`}
          >
            Hello, Student!
          </Text>
          <Text
            className={`text-base ${
              isDark ? "text-[#94a3b8]" : "text-[#64748b]"
            }`}
          >
            Did you lose or find something today?
          </Text>
        </View>

        {/* Action Buttons Row */}
        <View className="flex-row justify-center items-start gap-8 px-5 py-4">
          <TouchableOpacity
            activeOpacity={0.9}
            className="items-center w-32"
            onPress={() => router.push("/report-lost")}
          >
            <View
              className="w-24 h-24 rounded-full bg-[#2bee79] items-center justify-center mb-3"
              style={{
                shadowColor: "#2bee79",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <MaterialIcons
                name="search"
                size={32}
                color={SURFACE_ICON_COLOR}
              />
            </View>
            <Text
              className={`text-sm font-semibold text-center ${
                isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
              }`}
            >
              Report{"\n"}Lost Item
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            className="items-center w-32"
            onPress={() => router.push("/report-found")}
          >
            <View
              className="w-24 h-24 rounded-full bg-[#2bee79] items-center justify-center mb-3"
              style={{
                shadowColor: "#2bee79",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <MaterialIcons
                name="volunteer-activism"
                size={32}
                color={SURFACE_ICON_COLOR}
              />
            </View>
            <Text
              className={`text-sm font-semibold text-center ${
                isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
              }`}
            >
              Report{"\n"}Found Item
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          className="mb-4"
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
                className={`px-5 py-2 rounded-full border ${
                  isDark
                    ? "border-[#1e3a2f] bg-[#12251a]"
                    : "border-[#e2e8f0] bg-white"
                }`}
                style={
                  isActive && activeBackground
                    ? {
                        backgroundColor: activeBackground,
                        borderColor: "transparent",
                      }
                    : undefined
                }
              >
                <Text
                  className={`text-sm font-medium ${
                    isDark ? "text-[#94a3b8]" : "text-[#64748b]"
                  }`}
                  style={
                    isActive && activeTextColor
                      ? { color: activeTextColor }
                      : undefined
                  }
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Header */}
        <View className="flex-row justify-between items-center px-5 mb-3">
          <Text
            className={`text-lg font-bold ${
              isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
            }`}
          >
            Recent Posts
          </Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text className="text-sm font-semibold text-[#2bee79]">
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        <View className="flex-row flex-wrap justify-between px-5">
          {filteredPosts.map((post) => {
            const isFound = post.status === "Found";
            return (
              <TouchableOpacity
                key={post.id}
                activeOpacity={0.92}
                className={`w-[48%] rounded-2xl h-[230px] mb-4 overflow-hidden ${
                  isDark ? "bg-[#12251a]" : "bg-white"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
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
                {/* Post Image */}
                <View className="w-full h-[145px] relative">
                  {post.image ? (
                    <Image
                      source={{ uri: post.image }}
                      className="w-full h-full"
                    />
                  ) : (
                    <View
                      className={`w-full h-full items-center justify-center ${
                        isDark ? "bg-[#1e3a2f]" : "bg-[#e2e8f0]"
                      }`}
                    >
                      <MaterialIcons
                        name="image"
                        size={48}
                        color={isDark ? "#4ade80" : "#94a3b8"}
                      />
                    </View>
                  )}
                  {/* Status Badge */}
                  <View
                    className={`absolute top-2 left-2 px-2.5 py-1 rounded-full ${
                      isFound ? "bg-[#2bee79]" : "bg-[#f43f5e]"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isFound ? "text-[#0b1610]" : "text-white"
                      }`}
                    >
                      {post.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Post Content */}
                <View className="p-3">
                  <Text
                    className={`text-sm font-semibold mb-1.5 ${
                      isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
                    }`}
                    numberOfLines={1}
                  >
                    {post.title}
                  </Text>

                  {/* Location Row */}
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons
                      name="location-on"
                      size={16}
                      color={mutedTextColor}
                    />
                    <Text
                      className={`text-xs ml-1 flex-1 ${
                        isDark ? "text-[#94a3b8]" : "text-[#64748b]"
                      }`}
                      numberOfLines={1}
                    >
                      {post.location}
                    </Text>
                  </View>

                  {/* Footer Row */}
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                      <View
                        className={`w-6 h-6 rounded-full items-center justify-center overflow-hidden ${
                          isDark ? "bg-[#1e3a2f]" : "bg-[#e2e8f0]"
                        }`}
                      >
                        {post.avatar ? (
                          <Image
                            source={{ uri: post.avatar }}
                            className="w-full h-full"
                          />
                        ) : (
                          <MaterialIcons
                            name="person"
                            size={20}
                            color={isDark ? "#4ade80" : "#94a3b8"}
                          />
                        )}
                      </View>
                      <Text
                        className={`text-xs ml-1.5 flex-1 ${
                          isDark ? "text-[#94a3b8]" : "text-[#64748b]"
                        }`}
                        numberOfLines={1}
                      >
                        {post.author}
                      </Text>
                    </View>
                    <Text
                      className={`text-xs ${
                        isDark ? "text-[#64748b]" : "text-[#94a3b8]"
                      }`}
                    >
                      {post.timeAgo}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
