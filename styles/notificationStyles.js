import { StyleSheet } from "react-native";

const PRIMARY = "#2bee79";
const LIGHT_BG = "#f3f4f8";
const DARK_BG = "#0b1610";
const LIGHT_SURFACE = "#ffffff";
const DARK_SURFACE = "#102217";
const LIGHT_TEXT = "#0f172a";
const DARK_TEXT = "#f8fafc";
const MUTED_LIGHT = "#64748b";
const MUTED_DARK = "#94a3b8";

export const notificationStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: LIGHT_BG,
  },
  containerDark: {
    backgroundColor: DARK_BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.15)",
  },
  headerLight: {
    backgroundColor: LIGHT_SURFACE,
  },
  headerDark: {
    backgroundColor: DARK_SURFACE,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonLight: {
    backgroundColor: "#f1f5f9",
  },
  backButtonDark: {
    backgroundColor: "#1e3a2f",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  headerTitleLight: {
    color: LIGHT_TEXT,
  },
  headerTitleDark: {
    color: DARK_TEXT,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
  scrollContent: {
    padding: 16,
  },
  unreadHeader: {
    marginBottom: 12,
  },
  unreadHeaderText: {
    fontSize: 14,
    fontWeight: "600",
  },
  unreadHeaderTextLight: {
    color: MUTED_LIGHT,
  },
  unreadHeaderTextDark: {
    color: MUTED_DARK,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  notificationItemLight: {
    backgroundColor: LIGHT_SURFACE,
  },
  notificationItemDark: {
    backgroundColor: DARK_SURFACE,
  },
  notificationUnread: {
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY,
  },
  notificationUnreadLight: {
    backgroundColor: "#f0fdf4",
  },
  notificationUnreadDark: {
    backgroundColor: "#0f2318",
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  notificationTitleLight: {
    color: LIGHT_TEXT,
  },
  notificationTitleDark: {
    color: DARK_TEXT,
  },
  notificationTitleUnread: {
    fontWeight: "700",
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationMessageLight: {
    color: MUTED_LIGHT,
  },
  notificationMessageDark: {
    color: MUTED_DARK,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationTimeLight: {
    color: "#9ca3af",
  },
  notificationTimeDark: {
    color: "#6b7280",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
    marginTop: 4,
    marginRight: 4,
  },
  deleteButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  loadingTextLight: {
    color: MUTED_LIGHT,
  },
  loadingTextDark: {
    color: MUTED_DARK,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyIconContainerLight: {
    backgroundColor: "#e2e8f0",
  },
  emptyIconContainerDark: {
    backgroundColor: "#1e3a2f",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyTitleLight: {
    color: LIGHT_TEXT,
  },
  emptyTitleDark: {
    color: DARK_TEXT,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptySubtitleLight: {
    color: MUTED_LIGHT,
  },
  emptySubtitleDark: {
    color: MUTED_DARK,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    position: "relative",
  },
  modalContentLight: {
    backgroundColor: LIGHT_SURFACE,
  },
  modalContentDark: {
    backgroundColor: DARK_SURFACE,
  },
  modalCloseButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 1,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  modalTitleLight: {
    color: LIGHT_TEXT,
  },
  modalTitleDark: {
    color: DARK_TEXT,
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 12,
  },
  modalMessageLight: {
    color: MUTED_LIGHT,
  },
  modalMessageDark: {
    color: MUTED_DARK,
  },
  modalTime: {
    fontSize: 13,
    marginBottom: 20,
  },
  modalTimeLight: {
    color: "#9ca3af",
  },
  modalTimeDark: {
    color: "#6b7280",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    justifyContent: "center",
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    flex: 1,
    maxWidth: 160,
  },
  viewItemButton: {
    backgroundColor: "#3b82f6",
  },
  viewItemButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  messageUserButton: {
    backgroundColor: PRIMARY,
  },
  messageUserButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
