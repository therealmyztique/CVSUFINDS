import { StyleSheet } from "react-native";

export const welcomeStyles = StyleSheet.create({
  /* ---------- Layout ---------- */
  container: {
    flex: 1,
    justifyContent: "space-between",
  },

  containerDark: {
    backgroundColor: "#102217",
  },

  containerLight: {
    backgroundColor: "#f8fafc",
  },

  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  actions: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  actionsDark: {
    backgroundColor: "transparent",
  },

  actionsLight: {
    backgroundColor: "#f1f5f9",
  },

  /* ---------- Logo ---------- */
  logoSection: {
    alignItems: "center"
  },

  logoWrapper: {
    width: 112,
    height: 112,
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#2bee79",
  },

  logoGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(43,238,121,0.2)",
    borderRadius: 24,
    shadowColor: "#2bee79",
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },

  logoContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1c3024",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(43,238,121,0.6)",
  },

  title: {
    fontSize: 40,
    fontWeight: "900",
  },

  titleDark: {
    color: "#ffffff",
  },

  titleLight: {
    color: "#0f172a",
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: 260,
  },

  subtitleDark: {
    color: "#c4c4c4",
  },

  subtitleLight: {
    color: "#475569",
  },

  /* ---------- Illustration ---------- */
  illustration: {
    width: 256,
    height: 192,
    resizeMode: "contain",
    opacity: 0.9,
    marginTop: 24,
  },

  /* ---------- Buttons ---------- */
  signUpButton: {
    height: 56,
    borderRadius: 999,
    backgroundColor: "#2bee79",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  signUpText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#102217",
  },

  signUpButtonWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  signUpIconWrapper: {
    marginLeft: 8,
  },

  loginButton: {
    height: 56,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(43,238,121,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  loginButtonDark: {
    borderColor: "rgba(43,238,121,0.3)",
  },

  loginButtonLight: {
    borderColor: "rgba(16,34,23,0.15)",
  },

  loginText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2bee79",
  },

  loginTextDark: {
    color: "#2bee79",
  },

  loginTextLight: {
    color: "#15803d",
  },

  /* ---------- Footer ---------- */
  footerText: {
    marginTop: 24,
    marginBottom: 20,
    fontSize: 9,
    textAlign: "center",
  },

  footerTextDark: {
    color: "#94a3b8",
  },

  footerTextLight: {
    color: "#64748b",
  },
});
