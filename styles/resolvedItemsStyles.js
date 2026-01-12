import { StyleSheet } from "react-native";

const PRIMARY = "#2bee79";
const LIGHT_BACKGROUND = "#f6f8f7";
const DARK_BACKGROUND = "#102217";
const DARK_SURFACE = "#193324";
const LIGHT_SURFACE = "#ffffff";
const LIGHT_BORDER = "#e2e8f0";
const DARK_BORDER = "#326747";
const LIGHT_TEXT = "#0f172a";
const DARK_TEXT = "#f8fafc";
const MUTED_LIGHT = "#64748b";
const MUTED_DARK = "#92c9a8";

export const resolvedItemsStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  containerLight: {
    backgroundColor: LIGHT_BACKGROUND,
  },
  containerDark: {
    backgroundColor: DARK_BACKGROUND,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerTitleLight: {
    color: LIGHT_TEXT,
  },
  headerTitleDark: {
    color: DARK_TEXT,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonLight: {
    backgroundColor: LIGHT_SURFACE,
  },
  headerButtonDark: {
    backgroundColor: DARK_SURFACE,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  statCardLight: {
    backgroundColor: LIGHT_SURFACE,
    borderWidth: 1,
    borderColor: LIGHT_BORDER,
  },
  statCardDark: {
    backgroundColor: DARK_SURFACE,
    borderWidth: 1,
    borderColor: DARK_BORDER,
  },
  statCardAccent: {
    backgroundColor: PRIMARY,
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statIconWrapperLight: {
    backgroundColor: "rgba(43,238,121,0.15)",
  },
  statIconWrapperDark: {
    backgroundColor: "rgba(43,238,121,0.2)",
  },
  statIconWrapperAccent: {
    backgroundColor: "rgba(16,34,23,0.15)",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 4,
  },
  statValueLight: {
    color: LIGHT_TEXT,
  },
  statValueDark: {
    color: DARK_TEXT,
  },
  statValueAccent: {
    color: DARK_BACKGROUND,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
  },
  statLabelLight: {
    color: MUTED_LIGHT,
  },
  statLabelDark: {
    color: MUTED_DARK,
  },
  statLabelAccent: {
    color: DARK_BACKGROUND,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionTitleLight: {
    color: LIGHT_TEXT,
  },
  sectionTitleDark: {
    color: DARK_TEXT,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    gap: 12,
  },
  itemCardLight: {
    backgroundColor: LIGHT_SURFACE,
    borderWidth: 1,
    borderColor: LIGHT_BORDER,
  },
  itemCardDark: {
    backgroundColor: DARK_SURFACE,
    borderWidth: 1,
    borderColor: DARK_BORDER,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: DARK_BACKGROUND,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  itemTitleLight: {
    color: LIGHT_TEXT,
  },
  itemTitleDark: {
    color: DARK_TEXT,
  },
  itemLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  itemLocationText: {
    fontSize: 12,
    fontWeight: "500",
  },
  itemLocationTextLight: {
    color: MUTED_LIGHT,
  },
  itemLocationTextDark: {
    color: MUTED_DARK,
  },
  itemDate: {
    fontSize: 11,
    fontWeight: "400",
  },
  itemDateLight: {
    color: MUTED_LIGHT,
  },
  itemDateDark: {
    color: MUTED_DARK,
  },
  returnedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(43,238,121,0.15)",
  },
  returnedBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: PRIMARY,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconWrapperLight: {
    backgroundColor: LIGHT_SURFACE,
  },
  emptyIconWrapperDark: {
    backgroundColor: DARK_SURFACE,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyTitleLight: {
    color: LIGHT_TEXT,
  },
  emptyTitleDark: {
    color: DARK_TEXT,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 250,
  },
  emptyTextLight: {
    color: MUTED_LIGHT,
  },
  emptyTextDark: {
    color: MUTED_DARK,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 16,
    paddingTop: 12,
    paddingHorizontal: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bottomNavLight: {
    backgroundColor: LIGHT_BACKGROUND,
    borderTopColor: LIGHT_BORDER,
  },
  bottomNavDark: {
    backgroundColor: DARK_BACKGROUND,
    borderTopColor: DARK_BORDER,
  },
  navItems: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  navButton: {
    alignItems: "center",
    gap: 4,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  navLabelActive: {
    color: PRIMARY,
  },
  navLabelInactive: {
    color: MUTED_LIGHT,
  },
  navLabelInactiveDark: {
    color: MUTED_DARK,
  },
});

export default resolvedItemsStyles;
