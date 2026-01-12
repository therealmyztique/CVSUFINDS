import { Image, View } from "react-native";

export default function AppLogo() {
  return (
    <View className="items-center">
      <View className="w-28 h-28 mb-6 justify-center items-center rounded-3xl border-[3px] border-primary">
        <View className="absolute w-full h-full bg-primary/20 rounded-3xl shadow-lg shadow-primary" />
        <View className="w-full h-full bg-surface-dark-alt rounded-3xl justify-center items-center border-[0.1px] border-primary/60">
          <Image
            source={require("../assets/images/CvSUFindsLogo.png")}
            className="w-full h-full"
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="CvSU Finds logo"
          />
        </View>
      </View>
    </View>
  );
}
