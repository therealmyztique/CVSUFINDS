import { MaterialIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { welcomeStyles } from "../styles/welcomeStyles";

export default function AppLogo() {
  return (
    <View style={welcomeStyles.logoSection}>
      <View style={welcomeStyles.logoWrapper}>
        <View style={welcomeStyles.logoGlow} />
        <View style={welcomeStyles.logoContainer}>
          <MaterialIcons
            name="travel-explore"
            size={56}
            color="#2bee79"
          />
        </View>
      </View>
    </View>
  );
}
