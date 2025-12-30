import { useRouter } from "expo-router";
import { Text, View, useColorScheme } from "react-native";
import AppLogo from "./components/AppLogo";
import LoginButton from "./components/LogInButton";
import SignUpButton from "./components/SignUpButton";
import { welcomeStyles } from "./styles/welcomeStyles";

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        welcomeStyles.container,
        isDark ? welcomeStyles.containerDark : welcomeStyles.containerLight,
      ]}
    >
      {/* Main content */}
      <View style={welcomeStyles.mainContent}>
        <AppLogo />
        <Text
          style={[welcomeStyles.title, isDark ? welcomeStyles.titleDark : welcomeStyles.titleLight]}
        >
          CvSU Finds
        </Text>
        <Text
          style={[
            welcomeStyles.subtitle,
            isDark ? welcomeStyles.subtitleDark : welcomeStyles.subtitleLight,
          ]}
        >
            Snap a photo. Find your item.
        </Text>
      </View>

      {/* Action buttons */}
      <View
        style={[
          welcomeStyles.actions,
          isDark ? welcomeStyles.actionsDark : welcomeStyles.actionsLight,
        ]}
      >
        <SignUpButton onPress={() => router.push("/signup")} />
        <LoginButton onPress={() => router.push("/login")} />
        <Text
          style={[
            welcomeStyles.footerText,
            isDark ? welcomeStyles.footerTextDark : welcomeStyles.footerTextLight,
          ]}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>

    </View>
  );
}
