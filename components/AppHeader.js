import { Text, View, useColorScheme } from "react-native";

export default function AppHeader() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      className={`px-4 pt-14 pb-4 flex-row items-center justify-between border-b ${
        isDark
          ? "bg-background-dark/85 border-text-dark/10"
          : "bg-white/85 border-muted-dark/25"
      }`}
    >
      <View className="w-12" />

      <View className="flex-row items-baseline">
        <Text
          className={`text-[22px] font-bold ${
            isDark ? "text-text-dark" : "text-text-light"
          }`}
        >
          CvSU
        </Text>
        <Text className="text-[22px] font-bold text-primary">Finds</Text>
      </View>

      <View className="w-12" />
    </View>
  );
}
