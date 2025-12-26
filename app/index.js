import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import AppLogo from "./components/AppLogo";
import LoginButton from "./components/LogInButton";
import SignUpButton from "./components/SignUpButton";
import { welcomeStyles } from "./styles/welcomeStyles";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={welcomeStyles.container}>
      {/* Main content */}
      <View style={welcomeStyles.mainContent}>
        <AppLogo />
        <Text style={welcomeStyles.title}>CvSU Finds</Text>
        <Text style={welcomeStyles.subtitle}>
            Snap a photo. Find your item.
        </Text>
      </View>

      {/* Action buttons */}
      <View style={welcomeStyles.actions}>
        <SignUpButton onPress={() => router.push("/signup")} />
        <LoginButton onPress={() => router.push("/login")} />
        <Text style={welcomeStyles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>

    </View>
  );
}
