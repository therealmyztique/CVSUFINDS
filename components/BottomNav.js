import { MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";

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
      className={`absolute left-0 right-0 bottom-0 pt-3 pb-6 border-t ${
        isDark
          ? "bg-background-dark/[0.98] border-text-dark/10"
          : "bg-white/[0.98] border-muted-dark/25"
      }`}
    >
      <View className="flex-row justify-around items-center px-6">
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.path}
            className="items-center justify-center w-20 gap-1"
            activeOpacity={0.85}
            onPress={() => handlePress(item.path)}
          >
            <MaterialIcons
              name={item.icon}
              size={26}
              color={isActive(item.path) ? PRIMARY_COLOR : MUTED_COLOR}
            />
            <Text
              className={`text-[10px] font-semibold ${
                isActive(item.path)
                  ? "text-primary"
                  : isDark
                  ? "text-muted-dark"
                  : "text-muted-light"
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
