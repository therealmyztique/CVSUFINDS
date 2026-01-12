import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";

const PRIMARY_COLOR = "#2bee79";
const MUTED_COLOR = "#94a3b8";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const isActive = (path) => pathname === path;

  const navItems = [
    { path: "/home", icon: "home", label: "Home" },
    { path: "/my-reports", icon: "description", label: "My Reports" },
    { path: "/profile", icon: "person", label: "Profile" },
  ];

  const handlePress = (path) => {
    if (pathname !== path) {
      router.replace(path);
    }
  };

  return (
    <View
      style={[
        styles.bottomNav,
        isDark ? styles.bottomNavDark : styles.bottomNavLight,
      ]}
    >
      <View style={styles.navItems}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.path}
            style={styles.navButton}
            activeOpacity={0.85}
            onPress={() => handlePress(item.path)}
          >
            <MaterialIcons
              name={item.icon}
              size={26}
              color={isActive(item.path) ? PRIMARY_COLOR : MUTED_COLOR}
            />
            <Text
              style={[
                styles.navLabel,
                isActive(item.path)
                  ? styles.navLabelActive
                  : isDark
                  ? styles.navLabelInactiveDark
                  : styles.navLabelInactiveLight,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "rgba(255,255,255,0.98)",
    borderTopColor: "rgba(148,163,184,0.25)",
  },
  bottomNavDark: {
    backgroundColor: "rgba(11,22,16,0.98)",
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
    color: "#2bee79",
  },
  navLabelInactiveLight: {
    color: "#64748b",
  },
  navLabelInactiveDark: {
    color: "#94a3b8",
  },
});
