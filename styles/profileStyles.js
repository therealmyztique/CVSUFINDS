import { StyleSheet } from "react-native";

const PRIMARY = "#2bee79";
const PRIMARY_MUTED = "rgba(43,238,121,0.12)";
const LIGHT_BACKGROUND = "#f0f5f2";
const DARK_BACKGROUND = "#0b1610";
const LIGHT_SURFACE = "#ffffff";
const DARK_SURFACE = "#162e21";
const LIGHT_TEXT = "#0f172a";
const DARK_TEXT = "#f8fafc";
const MUTED_LIGHT = "#64748b";
const MUTED_DARK = "#94a3b8";

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: LIGHT_BACKGROUND,
  },
  containerDark: {
    backgroundColor: DARK_BACKGROUND,
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
    backgroundColor: "rgba(246,248,247,0.92)",
  },
  headerSurfaceDark: {
    backgroundColor: "rgba(16,34,23,0.92)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  headerTitleLight: {
    color: LIGHT_TEXT,
  },
  headerTitleDark: {
    color: DARK_TEXT,
  },
  headerSpacer: {
    width: 48,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 160,
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarRing: {
    padding: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(43,238,121,0.4)",
    shadowColor: PRIMARY,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  avatarImage: {
    width: 132,
    height: 132,
    borderRadius: 66,
  },
  headingBlock: {
    alignItems: "center",
    gap: 4,
  },
  nameText: {
    fontSize: 26,
    fontWeight: "800",
  },
  nameTextLight: {
    color: LIGHT_TEXT,
  },
  nameTextDark: {
    color: DARK_TEXT,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  subtitleLight: {
    color: PRIMARY,
  },
  subtitleDark: {
    color: "rgba(43,238,121,0.8)",
  },
  subcaption: {
    fontSize: 12,
  },
  subcaptionLight: {
    color: MUTED_LIGHT,
  },
  subcaptionDark: {
    color: MUTED_DARK,
  },
  editButton: {
    marginTop: 24,
    alignSelf: "center",
    minWidth: 200,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK_BACKGROUND,
  },
  logoutButton: {
    marginTop: 28,
    alignSelf: "center",
    minWidth: 200,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f43f5e",
    shadowColor: "#f43f5e",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  logoutButtonDisabled: {
    opacity: 0.75,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 32,
    marginBottom: 12,
  },
  headingDivider: {
    width: 4,
    height: 22,
    borderRadius: 999,
    backgroundColor: PRIMARY,
  },
  headingText: {
    fontSize: 18,
    fontWeight: "700",
  },
  headingTextLight: {
    color: LIGHT_TEXT,
  },
  headingTextDark: {
    color: DARK_TEXT,
  },
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  contactItemLight: {
    backgroundColor: LIGHT_SURFACE,
    borderColor: "transparent",
  },
  contactItemDark: {
    backgroundColor: DARK_SURFACE,
    borderColor: "rgba(248,250,252,0.08)",
  },
  iconPill: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.06)",
  },
  iconPillDark: {
    backgroundColor: PRIMARY_MUTED,
  },
  iconTextLight: {
    color: MUTED_LIGHT,
  },
  iconTextDark: {
    color: PRIMARY,
  },
  contactMeta: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  contactLabelLight: {
    color: "#94a3b8",
  },
  contactLabelDark: {
    color: MUTED_DARK,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  contactValueLight: {
    color: LIGHT_TEXT,
  },
  contactValueDark: {
    color: DARK_TEXT,
  },
  contactAction: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
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
    backgroundColor: "rgba(16,34,23,0.9)",
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
    fontWeight: "700",
  },
  navLabelActive: {
    color: PRIMARY,
  },
  navLabelInactiveLight: {
    color: MUTED_LIGHT,
  },
  navLabelInactiveDark: {
    color: MUTED_DARK,
  },
});

export default profileStyles;
