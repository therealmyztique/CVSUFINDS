import { StyleSheet } from "react-native";

const PRIMARY = "#2bee79";
const LIGHT_BACKGROUND = "#f6f8f7";
const DARK_BACKGROUND = "#102217";
const DARK_SURFACE = "#1a3022";
const LIGHT_TEXT = "#0f172a";
const DARK_TEXT = "#f8fafc";
const MUTED_LIGHT = "#64748b";
const MUTED_DARK = "#94a3b8";
const ERROR_LIGHT = "#b91c1c";
const ERROR_DARK = "#fca5a5";

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
    justifyContent: "space-between",
  },
  containerLight: {
    backgroundColor: LIGHT_BACKGROUND,
  },
  containerDark: {
    backgroundColor: DARK_BACKGROUND,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },
  titleLight: {
    color: LIGHT_TEXT,
  },
  titleDark: {
    color: DARK_TEXT,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    maxWidth: 320,
  },
  subtitleLight: {
    color: MUTED_LIGHT,
  },
  subtitleDark: {
    color: MUTED_DARK,
  },
  form: {
    flex: 1,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
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
  inputIcon: {
    position: "absolute",
    left: 18,
    zIndex: 1,
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
  eyeButton: {
    position: "absolute",
    right: 16,
    height: "100%",
    justifyContent: "center",
  },
  rememberForgotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rememberMeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  rememberMeTextLight: {
    color: "#64748b",
  },
  rememberMeTextDark: {
    color: "#94a3b8",
  },
  forgot: {
    alignSelf: "center",
  },
  forgotText: {
    color: PRIMARY,
    fontWeight: "600",
  },
  loginButton: {
    height: 56,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 12,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.65,
  },
  loginText: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK_BACKGROUND,
  },
  errorText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
  },
  errorTextLight: {
    color: ERROR_LIGHT,
  },
  errorTextDark: {
    color: ERROR_DARK,
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
  },
  footerTextLight: {
    color: MUTED_LIGHT,
  },
  footerTextDark: {
    color: MUTED_DARK,
  },
  signUp: {
    color: PRIMARY,
    fontWeight: "700",
  },
});
export default loginStyles;
