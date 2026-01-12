import { Text, TouchableOpacity, useColorScheme } from "react-native";

export default function LoginButton({ onPress }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity
      className={`h-14 rounded-full border-2 justify-center items-center ${
        isDark ? "border-primary/30" : "border-text-light/15"
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-lg font-black ${
          isDark ? "text-primary" : "text-green-700"
        }`}
      >
        Log In
      </Text>
    </TouchableOpacity>
  );
}
