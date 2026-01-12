import { StyleSheet } from "react-native";

const PRIMARY = "#2bee79";
const LIGHT_BACKGROUND = "#f6f8f7";
const DARK_BACKGROUND = "#102217";
const LIGHT_SURFACE = "#ffffff";
const DARK_SURFACE = "#1a3022";
const LIGHT_TEXT = "#0f172a";
const DARK_TEXT = "#f8fafc";
const MUTED_LIGHT = "#64748b";
const MUTED_DARK = "#94a3b8";

export const editProfileStyles = StyleSheet.create({
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonLight: {
    backgroundColor: "rgba(15,23,42,0.06)",
  },
  backButtonDark: {
    backgroundColor: "rgba(248,250,252,0.08)",
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
    width: 44,
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    gap: 20,
  },
  inputGroup: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
  labelLight: {
    color: LIGHT_TEXT,
  },
  labelDark: {
    color: DARK_TEXT,
  },
  input: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    fontSize: 16,
  },
  inputLight: {
    backgroundColor: LIGHT_SURFACE,
    borderColor: "rgba(148,163,184,0.35)",
    color: LIGHT_TEXT,
  },
  inputDark: {
    backgroundColor: DARK_SURFACE,
    borderColor: "rgba(248,250,252,0.18)",
    color: DARK_TEXT,
  },
  inputDisabled: {
    opacity: 0.8,
  },
  inputDisabledLight: {
    color: MUTED_LIGHT,
  },
  inputDisabledDark: {
    color: MUTED_DARK,
  },
  helper: {
    fontSize: 12,
  },
  helperLight: {
    color: MUTED_LIGHT,
  },
  helperDark: {
    color: MUTED_DARK,
  },
  message: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
  },
  messageError: {
    color: "#f87171",
  },
  messageInfo: {
    color: "#34d399",
  },
  button: {
    height: 56,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK_BACKGROUND,
  },
  loadingState: {
    paddingVertical: 48,
    alignItems: "center",
    gap: 12,
  },
});

export default editProfileStyles;
