import { StyleSheet } from "react-native";

const PRIMARY = "#2bee79";
const PRIMARY_DARK = "#1fa855";
const LIGHT_BACKGROUND = "#f0f5f2";
const DARK_BACKGROUND = "#0b1610";
const LIGHT_SURFACE = "#ffffff";
const DARK_SURFACE = "#12251a";
const LIGHT_TEXT = "#0f172a";
const DARK_TEXT = "#f8fafc";
const MUTED_LIGHT = "#64748b";
const MUTED_DARK = "#94a3b8";

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: LIGHT_BACKGROUND,
  },
  containerDark: {
    backgroundColor: DARK_BACKGROUND,
  },
  content: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSurfaceLight: {
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  headerSurfaceDark: {
    backgroundColor: "rgba(11,22,16,0.85)",
  },
  headerShadow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(148,163,184,0.25)",
  },
  headerShadowDark: {
    borderBottomColor: "rgba(248,250,252,0.08)",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  headerTitleText: {
    fontSize: 22,
    fontWeight: "700",
  },
  headerTitleLight: {
    color: LIGHT_TEXT,
  },
  headerTitleDark: {
    color: DARK_TEXT,
  },
  headerTitleAccent: {
    color: PRIMARY,
  },
  bellButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  bellButtonLight: {
    backgroundColor: "rgba(15,23,42,0.05)",
  },
  bellButtonDark: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  bellIconLight: {
    color: LIGHT_TEXT,
  },
  bellIconDark: {
    color: DARK_TEXT,
  },
  bellBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
  },
  bellButtonOverlay: {
    position: "absolute",
    top: 38,
    left: 16,
    zIndex: 10,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  heroHeading: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },
  heroHeadingLight: {
    color: LIGHT_TEXT,
  },
  heroHeadingDark: {
    color: DARK_TEXT,
  },
  heroSubtitle: {
    fontSize: 14,
  },
  heroSubtitleLight: {
    color: MUTED_LIGHT,
  },
  heroSubtitleDark: {
    color: MUTED_DARK,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  actionButton: {
    alignItems: "center",
    width: 128,
  },
  actionCircle: {
    width: 95,
    height: 95,
    borderRadius: 47,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 6,
  },
  actionText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
  },
  actionTextLight: {
    color: LIGHT_TEXT,
  },
  actionTextDark: {
    color: DARK_TEXT,
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 12,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 20,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.35)",
    backgroundColor: LIGHT_SURFACE,
  },
  filterChipDark: {
    backgroundColor: DARK_SURFACE,
    borderColor: "rgba(248,250,252,0.08)",
  },
  filterChipActive: {
    backgroundColor: LIGHT_TEXT,
    borderColor: "transparent",
  },
  filterChipActiveDark: {
    backgroundColor: DARK_TEXT,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: MUTED_LIGHT,
  },
  filterLabelDark: {
    color: MUTED_DARK,
  },
  filterLabelActive: {
    color: DARK_BACKGROUND,
  },
  filterLabelActiveDark: {
    color: LIGHT_BACKGROUND,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  postsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  postCard: {
    width: "48%",
    borderRadius: 20,
    padding: 10,
    backgroundColor: LIGHT_SURFACE,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
    shadowColor: "rgba(15,23,42,0.1)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  postCardDark: {
    backgroundColor: DARK_SURFACE,
    borderColor: "rgba(248,250,252,0.08)",
  },
  postImageWrapper: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 8,
    backgroundColor: "rgba(148,163,184,0.2)",
  },
  statusPill: {
    position: "absolute",
    top: 10,
    left: 10,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusFound: {
    backgroundColor: "rgba(43,238,121,0.9)",
  },
  statusLost: {
    backgroundColor: "rgba(244,63,94,0.85)",
  },
  statusLabelLight: {
    color: DARK_BACKGROUND,
  },
  statusLabelDark: {
    color: LIGHT_SURFACE,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  postTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  postTitleLight: {
    color: LIGHT_TEXT,
  },
  postTitleDark: {
    color: DARK_TEXT,
  },
  postMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  postMetaText: {
    fontSize: 12,
  },
  postMetaLight: {
    color: MUTED_LIGHT,
  },
  postMetaDark: {
    color: MUTED_DARK,
  },
  postFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(148,163,184,0.3)",
    overflow: "hidden",
  },
  avatarLabel: {
    fontSize: 10,
    color: MUTED_LIGHT,
  },
  avatarLabelDark: {
    color: "#b0bccd",
  },
  timeLabel: {
    fontSize: 10,
    color: MUTED_LIGHT,
  },
  timeLabelDark: {
    color: MUTED_DARK,
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bottomNavLight: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderTopColor: "rgba(148,163,184,0.25)",
  },
  bottomNavDark: {
    backgroundColor: "rgba(11,22,16,0.9)",
    borderTopColor: "rgba(248,250,252,0.08)",
  },
  navItems: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    gap: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "600",
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

export default homeStyles;
