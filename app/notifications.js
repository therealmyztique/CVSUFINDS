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
import { supabase } from "../lib/supabaseClient";
import { notificationStyles as styles } from "./styles/notificationStyles";

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
        style={[
          styles.notificationItem,
          isDark ? styles.notificationItemDark : styles.notificationItemLight,
          !notification.is_read && styles.notificationUnread,
          !notification.is_read &&
            (isDark
              ? styles.notificationUnreadDark
              : styles.notificationUnreadLight),
        ]}
        onPress={() => handleNotificationPress(notification)}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View
          style={[
            styles.notificationIcon,
            { backgroundColor: `${iconColor}20` },
          ]}
        >
          <MaterialIcons name={iconName} size={24} color={iconColor} />
        </View>

        {/* Content */}
        <View style={styles.notificationContent}>
          <Text
            style={[
              styles.notificationTitle,
              isDark
                ? styles.notificationTitleDark
                : styles.notificationTitleLight,
              !notification.is_read && styles.notificationTitleUnread,
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text
            style={[
              styles.notificationMessage,
              isDark
                ? styles.notificationMessageDark
                : styles.notificationMessageLight,
            ]}
            numberOfLines={2}
          >
            {notification.message}
          </Text>
          <Text
            style={[
              styles.notificationTime,
              isDark
                ? styles.notificationTimeDark
                : styles.notificationTimeLight,
            ]}
          >
            {formatDate(notification.created_at)}
          </Text>
        </View>

        {/* Unread indicator */}
        {!notification.is_read && <View style={styles.unreadDot} />}

        {/* Delete button */}
        <TouchableOpacity
          style={styles.deleteButton}
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
          onPress={() => router.back()}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? "#ffffff" : "#0f172a"}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            isDark ? styles.headerTitleDark : styles.headerTitleLight,
          ]}
        >
          Notifications
        </Text>

        {notifications.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAllNotifications}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text
            style={[
              styles.loadingText,
              isDark ? styles.loadingTextDark : styles.loadingTextLight,
            ]}
          >
            Loading notifications...
          </Text>
        </View>
      ) : notifications.length === 0 ? (
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
              name="notifications-none"
              size={48}
              color={isDark ? "#4ade80" : "#64748b"}
            />
          </View>
          <Text
            style={[
              styles.emptyTitle,
              isDark ? styles.emptyTitleDark : styles.emptyTitleLight,
            ]}
          >
            No notifications yet
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              isDark ? styles.emptySubtitleDark : styles.emptySubtitleLight,
            ]}
          >
            We'll notify you when there's something new about your reports
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
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
            <View style={styles.unreadHeader}>
              <Text
                style={[
                  styles.unreadHeaderText,
                  isDark
                    ? styles.unreadHeaderTextDark
                    : styles.unreadHeaderTextLight,
                ]}
              >
                {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
              </Text>
            </View>
          )}

          {notifications.map(renderNotificationItem)}

          <View style={{ height: 40 }} />
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
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalContent,
              isDark ? styles.modalContentDark : styles.modalContentLight,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <TouchableOpacity
              style={styles.modalCloseButton}
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
                style={[
                  styles.modalIconContainer,
                  {
                    backgroundColor: `${
                      NOTIFICATION_COLORS[selectedNotification.type] ||
                      "#64748b"
                    }20`,
                  },
                ]}
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
              style={[
                styles.modalTitle,
                isDark ? styles.modalTitleDark : styles.modalTitleLight,
              ]}
            >
              {selectedNotification?.title || "Notification"}
            </Text>

            {/* Message/Details */}
            <Text
              style={[
                styles.modalMessage,
                isDark ? styles.modalMessageDark : styles.modalMessageLight,
              ]}
            >
              {selectedNotification?.message || "No details available."}
            </Text>

            {/* Time */}
            <Text
              style={[
                styles.modalTime,
                isDark ? styles.modalTimeDark : styles.modalTimeLight,
              ]}
            >
              {selectedNotification
                ? formatDate(selectedNotification.created_at)
                : ""}
            </Text>

            {/* Action Buttons */}
            <View style={styles.modalButtonsContainer}>
              {selectedNotification?.contact_value && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.messageUserButton]}
                  onPress={handleMessageUser}
                >
                  <MaterialIcons name="chat" size={18} color="#ffffff" />
                  <Text style={styles.messageUserButtonText}>Contact User</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
