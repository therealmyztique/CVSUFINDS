import { Image, View } from "react-native";
import { welcomeStyles } from "../styles/welcomeStyles";

export default function AppLogo() {
  return (
    <View style={welcomeStyles.logoSection}>
      <View style={welcomeStyles.logoWrapper}>
        <View style={welcomeStyles.logoGlow} />
        <View style={welcomeStyles.logoContainer}>
          <Image
            source={require("../../assets/images/CvSUFindsLogo.png")}
            style={welcomeStyles.logoImage}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="CvSU Finds logo"
          />
        </View>
      </View>
    </View>
  );
}
