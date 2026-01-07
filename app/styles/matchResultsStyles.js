import { StyleSheet } from "react-native";

const PRIMARY = "#2bee79";
const LIGHT_BACKGROUND = "#f6f8f7";
const DARK_BACKGROUND = "#102217";
const DARK_SURFACE = "#182d21";
const DARK_SURFACE_HIGHLIGHT = "#1f3a2b";
const LIGHT_SURFACE = "#ffffff";
const LIGHT_BORDER = "#e2e8f0";
const DARK_BORDER = "#326747";
const LIGHT_TEXT = "#0f172a";
const DARK_TEXT = "#f8fafc";
const MUTED_LIGHT = "#64748b";
const MUTED_DARK = "#92c9a8";

export const matchResultsStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: LIGHT_BACKGROUND,
  },
  containerDark: {
    backgroundColor: DARK_BACKGROUND,
  },
  
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLight: {
    backgroundColor: "rgba(246,248,247,0.9)",
  },
  headerDark: {
    backgroundColor: "rgba(16,34,23,0.9)",
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonLight: {
    backgroundColor: "transparent",
  },
  backButtonDark: {
    backgroundColor: "transparent",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 48,
  },
  headerTitleLight: {
    color: LIGHT_TEXT,
  },
  headerTitleDark: {
    color: DARK_TEXT,
  },

  // Reference Card (Source Item)
  referenceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  referenceCardLight: {
    backgroundColor: LIGHT_SURFACE,
    borderColor: LIGHT_BORDER,
  },
  referenceCardDark: {
    backgroundColor: DARK_SURFACE,
    borderColor: "rgba(255,255,255,0.05)",
  },
  referenceCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  referenceImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  referenceImageLight: {
    borderColor: LIGHT_BORDER,
  },
  referenceImageDark: {
    borderColor: "rgba(255,255,255,0.1)",
  },
  referenceTextContainer: {
    flex: 1,
  },
  referenceLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  referenceLabelLight: {
    color: MUTED_LIGHT,
  },
  referenceLabelDark: {
    color: MUTED_DARK,
  },
  referenceTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  referenceTitleLight: {
    color: LIGHT_TEXT,
  },
  referenceTitleDark: {
    color: DARK_TEXT,
  },
  referenceIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(43,238,121,0.1)",
  },

  // Headline
  headlineContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headlineText: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headlineTextLight: {
    color: LIGHT_TEXT,
  },
  headlineTextDark: {
    color: DARK_TEXT,
  },
  headlineAccent: {
    color: PRIMARY,
  },
  headlineSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  headlineSubtextLight: {
    color: MUTED_LIGHT,
  },
  headlineSubtextDark: {
    color: MUTED_DARK,
  },

  // Results List
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 16,
  },

  // Hero Card (Top Match)
  heroCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(43,238,121,0.3)",
  },
  heroCardLight: {
    backgroundColor: LIGHT_SURFACE,
  },
  heroCardDark: {
    backgroundColor: DARK_SURFACE_HIGHLIGHT,
  },
  heroCardBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heroCardBadgeText: {
    color: DARK_BACKGROUND,
    fontSize: 12,
    fontWeight: "700",
  },
  heroCardImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#333",
  },
  heroCardContent: {
    padding: 16,
    gap: 12,
  },
  heroMatchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroMatchText: {
    color: PRIMARY,
    fontSize: 20,
    fontWeight: "700",
  },
  heroCardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  heroCardTitleLight: {
    color: LIGHT_TEXT,
  },
  heroCardTitleDark: {
    color: DARK_TEXT,
  },
  heroCardDescription: {
    fontSize: 14,
  },
  heroCardDescriptionLight: {
    color: MUTED_LIGHT,
  },
  heroCardDescriptionDark: {
    color: MUTED_DARK,
  },
  heroCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 50,
    gap: 8,
  },
  heroCardButtonText: {
    color: DARK_BACKGROUND,
    fontSize: 14,
    fontWeight: "700",
  },

  // Regular Match Card
  matchCard: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  matchCardLight: {
    backgroundColor: LIGHT_SURFACE,
    borderColor: LIGHT_BORDER,
  },
  matchCardDark: {
    backgroundColor: DARK_SURFACE,
    borderColor: "rgba(255,255,255,0.05)",
  },
  matchCardLowConfidence: {
    opacity: 0.8,
  },
  matchCardContent: {
    flex: 2,
    justifyContent: "space-between",
    gap: 12,
  },
  matchCardTextContainer: {
    gap: 4,
  },
  matchPercentHigh: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY,
  },
  matchPercentMedium: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6ee29d",
  },
  matchPercentLow: {
    fontSize: 16,
    fontWeight: "700",
  },
  matchPercentLowLight: {
    color: MUTED_LIGHT,
  },
  matchPercentLowDark: {
    color: MUTED_DARK,
  },
  matchCardTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  matchCardTitleLight: {
    color: LIGHT_TEXT,
  },
  matchCardTitleDark: {
    color: DARK_TEXT,
  },
  matchCardMeta: {
    fontSize: 12,
  },
  matchCardMetaLight: {
    color: MUTED_LIGHT,
  },
  matchCardMetaDark: {
    color: MUTED_DARK,
  },
  matchCardButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    gap: 6,
  },
  matchCardButtonLight: {
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  matchCardButtonDark: {
    backgroundColor: "rgba(43,238,121,0.2)",
  },
  matchCardButtonLowLight: {
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  matchCardButtonLowDark: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  matchCardButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  matchCardButtonTextLight: {
    color: LIGHT_TEXT,
  },
  matchCardButtonTextDark: {
    color: PRIMARY,
  },
  matchCardButtonTextLowLight: {
    color: MUTED_LIGHT,
  },
  matchCardButtonTextLowDark: {
    color: DARK_TEXT,
  },
  matchCardImage: {
    width: 96,
    aspectRatio: 3 / 4,
    borderRadius: 12,
    backgroundColor: "#333",
  },
  matchCardImageLow: {
    opacity: 0.7,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  footerLight: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderTopColor: LIGHT_BORDER,
  },
  footerDark: {
    backgroundColor: "rgba(16,34,23,0.95)",
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1,
  },
  footerButtonLight: {
    borderColor: LIGHT_BORDER,
    backgroundColor: "transparent",
  },
  footerButtonDark: {
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "transparent",
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  footerButtonTextLight: {
    color: MUTED_LIGHT,
  },
  footerButtonTextDark: {
    color: DARK_TEXT,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  emptyTextLight: {
    color: MUTED_LIGHT,
  },
  emptyTextDark: {
    color: MUTED_DARK,
  },
});
