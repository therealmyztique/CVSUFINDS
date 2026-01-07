import { StyleSheet } from "react-native";

const PRIMARY_COLOR = "#2bee79";

export const myReportsStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "#f0f5f2",
  },
  containerDark: {
    backgroundColor: "#0b1610",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLight: {
    backgroundColor: "rgba(246, 248, 247, 0.8)",
    borderBottomColor: "rgba(148,163,184,0.25)",
  },
  headerDark: {
    backgroundColor: "rgba(16, 34, 23, 0.8)",
    borderBottomColor: "rgba(248,250,252,0.05)",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationButtonLight: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationButtonDark: {
    backgroundColor: "#1A2C23",
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1,
    borderColor: "#fff",
  },
  headerLogo: {
    fontSize: 20,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    letterSpacing: -0.5,
  },
  greeting: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  greetingTitleLight: {
    color: "#0f172a",
  },
  greetingTitleDark: {
    color: "#ffffff",
  },
  greetingSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  greetingSubtitleLight: {
    color: "#64748b",
  },
  greetingSubtitleDark: {
    color: "#94a3b8",
  },
  filtersContainer: {
    paddingVertical: 12,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  filterButtonActive: {
    backgroundColor: "#1A2C23",
    borderColor: "transparent",
  },
  filterButtonActiveDark: {
    backgroundColor: "#2bee79",
    borderColor: "transparent",
  },
  filterButtonInactive: {
    backgroundColor: "transparent",
    borderColor: "#d1d5db",
  },
  filterButtonInactiveDark: {
    backgroundColor: "transparent",
    borderColor: "#374151",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  filterTextActiveDark: {
    color: "#102217",
  },
  filterTextInactive: {
    color: "#64748b",
  },
  filterTextInactiveDark: {
    color: "#9ca3af",
  },
  reportsList: {
    flex: 1,
  },
  reportsContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  reportCard: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    position: "relative",
  },
  reportCardLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  reportCardDark: {
    backgroundColor: "#1A2C23",
    borderColor: "#374151",
  },
  cardContent: {
    flexDirection: "row",
    gap: 16,
  },
  cardImage: {
    width: 112,
    height: 112,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cardImageLight: {
    backgroundColor: "#f1f5f9",
  },
  cardImageDark: {
    backgroundColor: "#0f1f17",
  },
  cardImageFull: {
    width: "100%",
    height: "100%",
  },
  cardDetails: {
    flex: 1,
    paddingVertical: 4,
  },
  cardHeader: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: "column",
    gap: 6,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeFound: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
  },
  statusBadgeResolved: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  statusBadgeLost: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  statusBadgeLostDark: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadgeTextFound: {
    color: "#16a34a",
  },
  statusBadgeTextResolved: {
    color: "#3b82f6",
  },
  statusBadgeTextLost: {
    color: "#dc2626",
  },
  statusBadgeTextLostDark: {
    color: "#f87171",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardTitleLight: {
    color: "#0f172a",
  },
  cardTitleDark: {
    color: "#ffffff",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  cardMetaText: {
    fontSize: 12,
    flex: 1,
  },
  cardMetaTextLight: {
    color: "#64748b",
  },
  cardMetaTextDark: {
    color: "#94a3b8",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  cardDate: {
    fontSize: 12,
    fontWeight: "500",
  },
  cardDateLight: {
    color: "#9ca3af",
  },
  cardDateDark: {
    color: "#6b7280",
  },
  rewardText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1fa855",
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
    color: "#64748b",
  },
  loadingTextDark: {
    color: "#94a3b8",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
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
    color: "#0f172a",
  },
  emptyTitleDark: {
    color: "#f8fafc",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptySubtitleLight: {
    color: "#64748b",
  },
  emptySubtitleDark: {
    color: "#94a3b8",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 34,
  },
  modalContainerLight: {
    backgroundColor: "#ffffff",
  },
  modalContainerDark: {
    backgroundColor: "#102217",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.25)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalTitleLight: {
    color: "#0f172a",
  },
  modalTitleDark: {
    color: "#ffffff",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  closeButtonLight: {
    backgroundColor: "#f1f5f9",
  },
  closeButtonDark: {
    backgroundColor: "#326747",
  },
  modalContent: {
    padding: 16,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
  },
  modalImagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalImagePlaceholderLight: {
    backgroundColor: "#f1f5f9",
  },
  modalImagePlaceholderDark: {
    backgroundColor: "#1A2C23",
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
  },
  detailTitleLight: {
    color: "#0f172a",
  },
  detailTitleDark: {
    color: "#ffffff",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailSection: {
    marginTop: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  detailLabelLight: {
    color: "#64748b",
  },
  detailLabelDark: {
    color: "#92c9a8",
  },
  detailText: {
    fontSize: 15,
  },
  detailTextLight: {
    color: "#334155",
  },
  detailTextDark: {
    color: "#f8fafc",
  },
  detailDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  detailDescriptionLight: {
    color: "#334155",
  },
  detailDescriptionDark: {
    color: "#f8fafc",
  },
  rewardTextLarge: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1fa855",
  },
  matchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  matchButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#102217",
  },
  resolveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  resolveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0b1610",
  },
  resolvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  resolvedBadgeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#22c55e",
  },
  // Searching modal styles
  searchingOverlay: {
    flex: 1,
    backgroundColor: "rgba(16, 34, 23, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  searchIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchIconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(34, 197, 94, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchingTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  searchingSubtitle: {
    fontSize: 15,
    color: "#92c9a8",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#92c9a8",
  },
  progressPercent: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 3,
  },
  // Menu styles
  menuButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 4,
  },
  dropdownMenu: {
    position: "absolute",
    top: 32,
    right: 8,
    zIndex: 20,
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownMenuLight: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dropdownMenuDark: {
    backgroundColor: "#1A2C23",
    borderWidth: 1,
    borderColor: "#374151",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dropdownItemTextLight: {
    color: "#0f172a",
  },
  dropdownItemTextDark: {
    color: "#f8fafc",
  },
  // Delete Modal styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  deleteModalContainer: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  deleteModalContainerLight: {
    backgroundColor: "#ffffff",
  },
  deleteModalContainerDark: {
    backgroundColor: "#102217",
  },
  deleteIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  deleteModalTitleLight: {
    color: "#0f172a",
  },
  deleteModalTitleDark: {
    color: "#ffffff",
  },
  deleteModalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  deleteModalSubtitleLight: {
    color: "#64748b",
  },
  deleteModalSubtitleDark: {
    color: "#94a3b8",
  },
  deleteModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteModalCancelButton: {},
  deleteModalCancelButtonLight: {
    backgroundColor: "#e2e8f0",
  },
  deleteModalCancelButtonDark: {
    backgroundColor: "#1A2C23",
  },
  deleteModalConfirmButton: {
    backgroundColor: "#ef4444",
  },
  deleteModalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteModalCancelTextLight: {
    color: "#0f172a",
  },
  deleteModalCancelTextDark: {
    color: "#ffffff",
  },
  deleteModalConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});

export default myReportsStyles;
