import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import "../global.css";
import { supabase } from "../lib/supabaseClient";

const PRIMARY_COLOR = "#2bee79";

const NOTIFICATION_ICONS = {
  match_found: "find-replace",
  item_claimed: "verified",
  item_resolved: "check-circle",
  message: "chat",
  system: "info",
};

const NOTIFICATION_COLORS = {
  match_found: "#3b82f6",
  item_claimed: "#22c55e",
  item_resolved: "#22c55e",
  message: "#8b5cf6",
  system: "#64748b",
};

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchNotifications();
        // Mark all as read when viewing
        markAllAsRead();
      }
    }, [userId, fetchNotifications])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await supabase.from("notifications").delete().eq("id", notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Show modal with notification details
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  const handleViewItem = () => {
    if (
      selectedNotification?.related_item_id &&
      selectedNotification?.related_item_type
    ) {
      handleCloseModal();
      router.push({
        pathname: "/item-detail",
        params: {
          id: selectedNotification.related_item_id,
          type: selectedNotification.related_item_type,
        },
      });
    }
  };

  const handleMessageUser = async () => {
    if (!selectedNotification?.contact_value) return;

    const contactValue = selectedNotification.contact_value;
    const contactPref = selectedNotification.contact_preference || "";

    try {
      let url = "";
      if (contactPref === "facebook" || contactValue.includes("facebook.com")) {
        // Facebook link
        url = contactValue.startsWith("http")
          ? contactValue
          : `https://facebook.com/${contactValue}`;
      } else if (contactPref === "email" || contactValue.includes("@")) {
        // Email
        url = `mailto:${contactValue}`;
      } else if (
        contactPref === "phone" ||
        /^[0-9+\-\s]+$/.test(contactValue)
      ) {
        // Phone number
        url = `tel:${contactValue.replace(/\s/g, "")}`;
      } else {
        // Default: try to open as URL or use as-is
        url = contactValue.startsWith("http")
          ? contactValue
          : `https://${contactValue}`;
      }

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.warn("Cannot open URL:", url);
      }
    } catch (error) {
      console.error("Error opening contact:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const clearAllNotifications = async () => {
    if (!userId) return;

    try {
      await supabase.from("notifications").delete().eq("user_id", userId);

      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const renderNotificationItem = (notification) => {
    const iconName = NOTIFICATION_ICONS[notification.type] || "notifications";
    const iconColor = NOTIFICATION_COLORS[notification.type] || "#64748b";

    return (
      <TouchableOpacity
        key={notification.id}
        className={`flex-row items-start p-4 rounded-2xl mb-3 ${
          isDark ? "bg-surface-dark" : "bg-white"
        } ${
          !notification.is_read
            ? `border-l-[3px] border-l-primary ${
                isDark ? "bg-[#0f2318]" : "bg-[#f0fdf4]"
              }`
            : ""
        }`}
        onPress={() => handleNotificationPress(notification)}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <MaterialIcons name={iconName} size={24} color={iconColor} />
        </View>

        {/* Content */}
        <View className="flex-1 mr-2">
          <Text
            className={`text-[15px] mb-1 ${
              isDark ? "text-text-dark" : "text-text-light"
            } ${!notification.is_read ? "font-bold" : "font-semibold"}`}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text
            className={`text-sm leading-5 mb-1.5 ${
              isDark ? "text-muted-dark" : "text-muted-light"
            }`}
            numberOfLines={2}
          >
            {notification.message}
          </Text>
          <Text
            className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            {formatDate(notification.created_at)}
          </Text>
        </View>

        {/* Unread indicator */}
        {!notification.is_read && (
          <View className="w-2.5 h-2.5 rounded-full bg-primary mt-1 mr-1" />
        )}

        {/* Delete button */}
        <TouchableOpacity
          className="p-1"
          onPress={() => deleteNotification(notification.id)}
        >
          <MaterialIcons
            name="close"
            size={18}
            color={isDark ? "#64748b" : "#94a3b8"}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <View
      className={`flex-1 ${isDark ? "bg-background-dark" : "bg-[#f3f4f8]"}`}
    >
      {/* Header */}
      <View
        className={`flex-row items-center justify-between pt-14 pb-4 px-4 border-b border-slate-400/15 ${
          isDark ? "bg-surface-dark" : "bg-white"
        }`}
      >
        <TouchableOpacity
          className={`w-10 h-10 rounded-full items-center justify-center ${
            isDark ? "bg-[#1e3a2f]" : "bg-slate-100"
          }`}
          onPress={() => router.back()}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? "#ffffff" : "#0f172a"}
          />
        </TouchableOpacity>

        <Text
          className={`text-xl font-bold flex-1 text-center ${
            isDark ? "text-text-dark" : "text-text-light"
          }`}
        >
          Notifications
        </Text>

        {notifications.length > 0 && (
          <TouchableOpacity
            className="py-2 px-3"
            onPress={clearAllNotifications}
          >
            <Text className="text-sm font-semibold text-red-500">
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center pt-[60px]">
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text
            className={`mt-3 text-sm ${
              isDark ? "text-muted-dark" : "text-muted-light"
            }`}
          >
            Loading notifications...
          </Text>
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <View
            className={`w-[100px] h-[100px] rounded-full items-center justify-center mb-5 ${
              isDark ? "bg-[#1e3a2f]" : "bg-slate-200"
            }`}
          >
            <MaterialIcons
              name="notifications-none"
              size={48}
              color={isDark ? "#4ade80" : "#64748b"}
            />
          </View>
          <Text
            className={`text-xl font-bold mb-2 ${
              isDark ? "text-text-dark" : "text-text-light"
            }`}
          >
            No notifications yet
          </Text>
          <Text
            className={`text-sm text-center leading-5 ${
              isDark ? "text-muted-dark" : "text-muted-light"
            }`}
          >
            We'll notify you when there's something new about your reports
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="p-4"
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
          {unreadCount > 0 && (
            <View className="mb-3">
              <Text
                className={`text-sm font-semibold ${
                  isDark ? "text-muted-dark" : "text-muted-light"
                }`}
              >
                {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
              </Text>
            </View>
          )}

          {notifications.map(renderNotificationItem)}

          <View className="h-10" />
        </ScrollView>
      )}

      {/* Notification Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-center items-center p-5"
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            className={`w-full max-w-[400px] rounded-[20px] p-6 items-center relative ${
              isDark ? "bg-surface-dark" : "bg-white"
            }`}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <TouchableOpacity
              className="absolute top-3 right-3 p-1 z-10"
              onPress={handleCloseModal}
            >
              <MaterialIcons
                name="close"
                size={24}
                color={isDark ? "#94a3b8" : "#64748b"}
              />
            </TouchableOpacity>

            {/* Modal Header Icon */}
            {selectedNotification && (
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{
                  backgroundColor: `${
                    NOTIFICATION_COLORS[selectedNotification.type] || "#64748b"
                  }20`,
                }}
              >
                <MaterialIcons
                  name={
                    NOTIFICATION_ICONS[selectedNotification.type] ||
                    "notifications"
                  }
                  size={32}
                  color={
                    NOTIFICATION_COLORS[selectedNotification.type] || "#64748b"
                  }
                />
              </View>
            )}

            {/* Title */}
            <Text
              className={`text-lg font-bold text-center mb-3 ${
                isDark ? "text-text-dark" : "text-text-light"
              }`}
            >
              {selectedNotification?.title || "Notification"}
            </Text>

            {/* Message/Details */}
            <Text
              className={`text-[15px] leading-[22px] text-center mb-3 ${
                isDark ? "text-muted-dark" : "text-muted-light"
              }`}
            >
              {selectedNotification?.message || "No details available."}
            </Text>

            {/* Time */}
            <Text
              className={`text-[13px] mb-5 ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {selectedNotification
                ? formatDate(selectedNotification.created_at)
                : ""}
            </Text>

            {/* Action Buttons */}
            <View className="flex-row gap-3 w-full justify-center">
              {selectedNotification?.contact_value && (
                <TouchableOpacity
                  className="flex-row items-center justify-center py-3 px-5 rounded-xl gap-2 flex-1 max-w-[160px] bg-primary"
                  onPress={handleMessageUser}
                >
                  <MaterialIcons name="chat" size={18} color="#ffffff" />
                  <Text className="text-white text-sm font-semibold">
                    Contact User
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
