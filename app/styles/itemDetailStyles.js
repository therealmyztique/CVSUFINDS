import { StyleSheet } from "react-native";

const PRIMARY = "#2bee79";
const LOST_COLOR = "#f43f5e";
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

export const itemDetailStyles = StyleSheet.create({
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
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSurfaceLight: {
    backgroundColor: "rgba(246,248,247,0.95)",
  },
  headerSurfaceDark: {
    backgroundColor: "rgba(16,34,23,0.95)",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  headerTitleLight: {
    color: LIGHT_TEXT,
  },
  headerTitleDark: {
    color: DARK_TEXT,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonLight: {
    backgroundColor: "transparent",
  },
  headerButtonDark: {
    backgroundColor: "transparent",
  },
  content: {
    paddingBottom: 120,
  },
  imageCarousel: {
    width: "100%",
    aspectRatio: 1,
    position: "relative",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusBadgeFound: {
    backgroundColor: PRIMARY,
  },
  statusBadgeLost: {
    backgroundColor: LOST_COLOR,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  statusTextFound: {
    color: DARK_BACKGROUND,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    backgroundColor: "#ffffff",
  },
  detailsContainer: {
    padding: 20,
    gap: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: "700",
    flex: 1,
  },
  itemTitleLight: {
    color: LIGHT_TEXT,
  },
  itemTitleDark: {
    color: DARK_TEXT,
  },
  rewardBadge: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: "700",
    color: DARK_BACKGROUND,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryTagLight: {
    backgroundColor: LIGHT_SURFACE,
    borderWidth: 1,
    borderColor: LIGHT_BORDER,
  },
  categoryTagDark: {
    backgroundColor: DARK_SURFACE,
    borderWidth: 1,
    borderColor: DARK_BORDER,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
  },
  categoryTextLight: {
    color: MUTED_LIGHT,
  },
  categoryTextDark: {
    color: MUTED_DARK,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
  },
  userCardLight: {
    backgroundColor: LIGHT_SURFACE,
    borderWidth: 1,
    borderColor: LIGHT_BORDER,
  },
  userCardDark: {
    backgroundColor: DARK_SURFACE,
    borderWidth: 1,
    borderColor: DARK_BORDER,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DARK_SURFACE,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userNameLight: {
    color: LIGHT_TEXT,
  },
  userNameDark: {
    color: DARK_TEXT,
  },
  userRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 13,
  },
  ratingTextLight: {
    color: MUTED_LIGHT,
  },
  ratingTextDark: {
    color: MUTED_DARK,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionTitleLight: {
    color: LIGHT_TEXT,
  },
  sectionTitleDark: {
    color: DARK_TEXT,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  descriptionTextLight: {
    color: MUTED_LIGHT,
  },
  descriptionTextDark: {
    color: MUTED_DARK,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  infoCardLight: {
    backgroundColor: LIGHT_SURFACE,
    borderWidth: 1,
    borderColor: LIGHT_BORDER,
  },
  infoCardDark: {
    backgroundColor: DARK_SURFACE,
    borderWidth: 1,
    borderColor: DARK_BORDER,
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  infoIconWrapperFound: {
    backgroundColor: "rgba(43,238,121,0.15)",
  },
  infoIconWrapperLost: {
    backgroundColor: "rgba(244,63,94,0.15)",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoLabelLight: {
    color: MUTED_LIGHT,
  },
  infoLabelDark: {
    color: MUTED_DARK,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
  infoValueLight: {
    color: LIGHT_TEXT,
  },
  infoValueDark: {
    color: DARK_TEXT,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerLight: {
    backgroundColor: LIGHT_BACKGROUND,
    borderTopColor: LIGHT_BORDER,
  },
  footerDark: {
    backgroundColor: DARK_BACKGROUND,
    borderTopColor: DARK_BORDER,
  },
  contactButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  contactButtonFound: {
    backgroundColor: PRIMARY,
  },
  contactButtonLost: {
    backgroundColor: LOST_COLOR,
  },
  contactButtonText: {
    fontSize: 17,
    fontWeight: "700",
  },
  contactButtonTextFound: {
    color: DARK_BACKGROUND,
  },
  contactButtonTextLost: {
    color: "#ffffff",
  },
  notesSection: {
    gap: 8,
    padding: 16,
    borderRadius: 16,
  },
  notesSectionLight: {
    backgroundColor: "rgba(43,238,121,0.08)",
    borderWidth: 1,
    borderColor: "rgba(43,238,121,0.2)",
  },
  notesSectionDark: {
    backgroundColor: "rgba(43,238,121,0.1)",
    borderWidth: 1,
    borderColor: "rgba(43,238,121,0.2)",
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  notesLabelLight: {
    color: "#059669",
  },
  notesLabelDark: {
    color: PRIMARY,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  notesTextLight: {
    color: LIGHT_TEXT,
  },
  notesTextDark: {
    color: DARK_TEXT,
  },
});

export default itemDetailStyles;
