import { StyleSheet } from "react-native";

const PRIMARY = "#2bee79";
const LIGHT_BACKGROUND = "#f6f8f7";
const DARK_BACKGROUND = "#102217";
const DARK_SURFACE = "#1a3022";
const LIGHT_TEXT = "#0f172a";
const DARK_TEXT = "#f8fafc";
const MUTED_LIGHT = "#64748b";
const MUTED_DARK = "#94a3b8";

export const signupStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  containerLight: {
    backgroundColor: LIGHT_BACKGROUND,
  },
  containerDark: {
    backgroundColor: DARK_BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  iconButtonLight: {
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    marginRight: 8,
  },
  brandText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: PRIMARY,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 200,
  },
  logoContainer: {
    alignItems: "center",
  },
  headline: {
    paddingBottom: 32,
  },
  headlineTitle: {
    fontSize: 32,
    fontWeight: "700",
    alignSelf: "center",
  },
  headlineTitleLight: {
    color: LIGHT_TEXT,
  },
  headlineTitleDark: {
    color: DARK_TEXT,
  },
  headlineAccent: {
    color: PRIMARY,
  },
  headlineSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    textAlign: "center",
  },
  headlineSubtitleLight: {
    color: MUTED_LIGHT,
  },
  headlineSubtitleDark: {
    color: MUTED_DARK,
  },
  form: {
    paddingBottom: 32,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  rowItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  rowItemRight: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
    marginBottom: 8,
  },
  labelLight: {
    color: LIGHT_TEXT,
  },
  labelDark: {
    color: DARK_TEXT,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    height: 56,
    borderRadius: 999,
    paddingLeft: 52,
    paddingRight: 52,
    fontSize: 16,
  },
  inputLight: {
    backgroundColor: "#ffffff",
    color: LIGHT_TEXT,
  },
  inputDark: {
    backgroundColor: DARK_SURFACE,
    color: DARK_TEXT,
  },
  inputIcon: {
    position: "absolute",
    left: 18,
    zIndex: 1,
  },
  indicator: {
    position: "absolute",
    right: 24,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
    opacity: 0,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  indicatorVisible: {
    opacity: 1,
  },
  dateButton: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  dateText: {
    fontSize: 16,
  },
  dateTextPlaceholder: {
    color: "#94a3b8",
  },
  dateTextLight: {
    color: LIGHT_TEXT,
  },
  dateTextDark: {
    color: DARK_TEXT,
  },
  termsRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    alignItems: "flex-start",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: MUTED_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 4,
  },
  checkboxDark: {
    borderColor: MUTED_DARK,
  },
  checkboxChecked: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  checkboxMark: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: DARK_BACKGROUND,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  termsTextLight: {
    color: MUTED_LIGHT,
  },
  termsTextDark: {
    color: MUTED_DARK,
  },
  termsLink: {
    color: PRIMARY,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  footerLight: {
    backgroundColor: "rgba(246,248,247,0.96)",
  },
  footerDark: {
    backgroundColor: "rgba(16,34,23,0.95)",
  },
  signUpButton: {
    height: 56,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  signUpButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK_BACKGROUND,
  },
  footerPrompt: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  footerPromptLight: {
    color: MUTED_LIGHT,
  },
  footerPromptDark: {
    color: MUTED_DARK,
  },
  footerLink: {
    color: PRIMARY,
  },
  iosPickerBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  iosPickerCard: {
    width: "100%",
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  iosPickerCardLight: {
    backgroundColor: "#ffffff",
  },
  iosPickerCardDark: {
    backgroundColor: DARK_SURFACE,
  },
  iosPickerDone: {
    marginTop: 12,
    alignSelf: "flex-end",
    marginRight: 24,
  },
  iosPickerDoneText: {
    fontSize: 16,
    fontWeight: "600",
    color: PRIMARY,
  },
});
