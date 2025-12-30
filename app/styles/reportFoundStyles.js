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

export const reportFoundStyles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
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
    position: "relative",
  },
  headerSurfaceLight: {
    backgroundColor: "rgba(246,248,247,0.85)",
  },
  headerSurfaceDark: {
    backgroundColor: "rgba(16,34,23,0.85)",
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  headerTitleLight: {
    color: LIGHT_TEXT,
  },
  headerTitleDark: {
    color: DARK_TEXT,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonLight: {
    backgroundColor: "transparent",
  },
  backButtonDark: {
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 180,
    gap: 24,
  },
  heroHeading: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  heroHeadingLight: {
    color: LIGHT_TEXT,
  },
  heroHeadingDark: {
    color: DARK_TEXT,
  },
  heroBody: {
    fontSize: 16,
    lineHeight: 22,
  },
  heroBodyLight: {
    color: MUTED_LIGHT,
  },
  heroBodyDark: {
    color: MUTED_DARK,
  },
  uploadCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderStyle: "dashed",
    aspectRatio: 16 / 9,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadCardLight: {
    borderColor: LIGHT_BORDER,
    backgroundColor: "#f1f5f9",
  },
  uploadCardDark: {
    borderColor: DARK_BORDER,
    backgroundColor: DARK_SURFACE,
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  uploadIconWrapper: {
    padding: 14,
    borderRadius: 999,
    backgroundColor: "rgba(43,238,121,0.2)",
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  inputGroup: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  labelLight: {
    color: LIGHT_TEXT,
  },
  labelDark: {
    color: DARK_TEXT,
  },
  optional: {
    fontSize: 13,
    fontWeight: "400",
  },
  optionalLight: {
    color: MUTED_LIGHT,
  },
  optionalDark: {
    color: MUTED_DARK,
  },
  textInput: {
    height: 56,
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  textInputLight: {
    backgroundColor: LIGHT_SURFACE,
    borderColor: LIGHT_BORDER,
    color: LIGHT_TEXT,
  },
  textInputDark: {
    backgroundColor: DARK_SURFACE,
    borderColor: DARK_BORDER,
    color: DARK_TEXT,
  },
  textArea: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
  },
  textAreaSmall: {
    minHeight: 80,
  },
  iconInput: {
    paddingRight: 48,
  },
  pickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerTriggerText: {
    flex: 1,
    textAlign: "center",
  },
  trailingIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -12,
  },
  pickerContainer: {
    position: "relative",
  },
  contactGrid: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  contactOption: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contactOptionLight: {
    backgroundColor: LIGHT_SURFACE,
    borderColor: LIGHT_BORDER,
  },
  contactOptionDark: {
    backgroundColor: DARK_SURFACE,
    borderColor: DARK_BORDER,
  },
  contactOptionActive: {
    borderColor: PRIMARY,
    backgroundColor: "rgba(43,238,121,0.12)",
  },
  contactOptionActiveDark: {
    backgroundColor: "rgba(43,238,121,0.16)",
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  contactLabelLight: {
    color: MUTED_LIGHT,
  },
  contactLabelDark: {
    color: MUTED_DARK,
  },
  contactLabelActive: {
    color: "#065f46",
  },
  contactLabelActiveDark: {
    color: PRIMARY,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
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
  submitButton: {
    height: 56,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: PRIMARY,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  submitText: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK_BACKGROUND,
  },
});

export default reportFoundStyles;
