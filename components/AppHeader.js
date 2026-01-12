import { StyleSheet, Text, View, useColorScheme } from "react-native";

const PRIMARY = "#2bee79";
const LIGHT_TEXT = "#0f172a";
const DARK_TEXT = "#f8fafc";

export default function AppHeader() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.header,
        isDark ? styles.headerSurfaceDark : styles.headerSurfaceLight,
        styles.headerShadow,
        isDark ? styles.headerShadowDark : null,
      ]}
    >
      <View style={{ width: 48 }} />

      <View style={styles.headerTitle}>
        <Text
          style={[
            styles.headerTitleText,
            isDark ? styles.headerTitleDark : styles.headerTitleLight,
          ]}
        >
          CvSU
        </Text>
        <Text style={[styles.headerTitleText, styles.headerTitleAccent]}>
          Finds
        </Text>
      </View>

      <View style={{ width: 48 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
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
});
