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
          .select("id, first_name, avatar_url")
          .in("id", reporterIds);

        if (profilesData) {
          profilesData.forEach((p) => {
            profilesMap[p.id] = {
              name: p.first_name || "Anonymous",
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
    <View className="flex-1 items-center justify-center py-16 px-6">
      <View
        className={`w-20 h-20 rounded-full items-center justify-center mb-5 ${
          isDark ? "bg-[#12251a]" : "bg-[#e8faf0]"
        }`}
      >
        <MaterialIcons name="check-circle" size={40} color={PRIMARY_COLOR} />
      </View>
      <Text
        className={`text-xl font-bold mb-2 text-center ${
          isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
        }`}
      >
        No Resolved Items Yet
      </Text>
      <Text
        className={`text-sm text-center leading-5 ${
          isDark ? "text-[#94a3b8]" : "text-[#64748b]"
        }`}
      >
        Items that have been successfully returned to their owners will appear
        here.
      </Text>
    </View>
  );

  return (
    <View className={`flex-1 ${isDark ? "bg-[#0b1610]" : "bg-[#f8fafc]"}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <Text
          className={`text-2xl font-bold ${
            isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
          }`}
        >
          Resolved History
        </Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.85}
            className={`w-10 h-10 rounded-xl items-center justify-center ${
              isDark ? "bg-[#12251a]" : "bg-[#f1f5f9]"
            }`}
          >
            <MaterialIcons
              name="search"
              size={22}
              color={isDark ? "#f8fafc" : "#0f172a"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            className={`w-10 h-10 rounded-xl items-center justify-center ${
              isDark ? "bg-[#12251a]" : "bg-[#f1f5f9]"
            }`}
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
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View className="flex-row gap-3 mb-6">
          <View
            className={`flex-1 rounded-2xl p-4 ${
              isDark ? "bg-[#12251a]" : "bg-white"
            }`}
            style={
              !isDark && {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }
            }
          >
            <View
              className={`w-11 h-11 rounded-xl items-center justify-center mb-3 ${
                isDark ? "bg-[#1a3d28]" : "bg-[#e8faf0]"
              }`}
            >
              <MaterialIcons
                name="check-circle"
                size={24}
                color={PRIMARY_COLOR}
              />
            </View>
            <Text
              className={`text-xs mb-1 ${
                isDark ? "text-[#94a3b8]" : "text-[#64748b]"
              }`}
            >
              Total Returned
            </Text>
            <Text
              className={`text-2xl font-bold ${
                isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
              }`}
            >
              {totalReturned}
            </Text>
          </View>

          <View className="flex-1 rounded-2xl p-4 bg-[#2bee79]">
            <View className="w-11 h-11 rounded-xl items-center justify-center mb-3 bg-[#102217]/20">
              <MaterialIcons name="calendar-today" size={24} color="#102217" />
            </View>
            <Text className="text-xs mb-1 text-[#102217]/70">This Month</Text>
            <Text className="text-2xl font-bold text-[#102217]">
              {thisMonthCount}
            </Text>
          </View>
        </View>

        {/* Recent Returns Section */}
        <View className="flex-row items-center justify-between mb-4">
          <Text
            className={`text-lg font-semibold ${
              isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
            }`}
          >
            Recent Returns
          </Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text className="text-sm font-medium text-[#2bee79]">View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-16 items-center justify-center">
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          </View>
        ) : resolvedItems.length === 0 ? (
          renderEmptyState()
        ) : (
          <View className="gap-3">
            {resolvedItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                className={`flex-row items-center rounded-2xl p-3 ${
                  isDark ? "bg-[#12251a]" : "bg-white"
                }`}
                style={
                  !isDark && {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }
                }
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
                  className="w-16 h-16 rounded-xl"
                />
                <View className="flex-1 ml-3">
                  <Text
                    className={`text-base font-semibold mb-1 ${
                      isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
                    }`}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <View className="flex-row items-center mb-1">
                    <MaterialIcons
                      name="location-on"
                      size={12}
                      color={mutedTextColor}
                    />
                    <Text
                      className={`text-xs ml-1 ${
                        isDark ? "text-[#94a3b8]" : "text-[#64748b]"
                      }`}
                      numberOfLines={1}
                    >
                      {item.location || "Unknown location"}
                    </Text>
                  </View>
                  <Text
                    className={`text-xs ${
                      isDark ? "text-[#94a3b8]" : "text-[#64748b]"
                    }`}
                  >
                    Resolved {formatDate(item.updated_at)}
                  </Text>
                </View>
                <View className="bg-[#2bee79]/20 px-3 py-1.5 rounded-full">
                  <Text className="text-xs font-semibold text-[#2bee79]">
                    Returned
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        className={`absolute bottom-0 left-0 right-0 pb-6 pt-3 px-6 border-t ${
          isDark ? "bg-[#0b1610] border-[#12251a]" : "bg-white border-[#f1f5f9]"
        }`}
      >
        <View className="flex-row items-center justify-around">
          <TouchableOpacity
            className="items-center py-2"
            activeOpacity={0.85}
            onPress={() => router.push("/home")}
          >
            <MaterialIcons name="home" size={26} color={mutedTextColor} />
            <Text
              className={`text-xs mt-1 ${
                isDark ? "text-[#94a3b8]" : "text-[#64748b]"
              }`}
            >
              Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center py-2" activeOpacity={0.85}>
            <MaterialIcons name="task-alt" size={26} color={PRIMARY_COLOR} />
            <Text
              className={`text-xs mt-1 ${
                isDark ? "text-[#94a3b8]" : "text-[#64748b]"
              }`}
            >
              Resolved Items
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center py-2"
            activeOpacity={0.85}
            onPress={() => router.push("/profile")}
          >
            <MaterialIcons name="person" size={26} color={mutedTextColor} />
            <Text
              className={`text-xs mt-1 ${
                isDark ? "text-[#94a3b8]" : "text-[#64748b]"
              }`}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
