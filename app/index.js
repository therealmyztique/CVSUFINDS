import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View, useColorScheme } from "react-native";
import { supabase } from "../lib/supabaseClient";
import AppLogo from "../components/AppLogo";
import LoginButton from "../components/LogInButton";
import SignUpButton from "../components/SignUpButton";
import { welcomeStyles } from "../styles/welcomeStyles";

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if the user is already authenticated using Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // If authenticated, navigate to the home screen
          router.replace("/home");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading while checking auth
  if (checking) {
    return (
      <View
        style={[
          welcomeStyles.container,
          isDark ? welcomeStyles.containerDark : welcomeStyles.containerLight,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#2bee79" />
      </View>
    );
  }

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
          style={[
            welcomeStyles.title,
            isDark ? welcomeStyles.titleDark : welcomeStyles.titleLight,
          ]}
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
            isDark
              ? welcomeStyles.footerTextDark
              : welcomeStyles.footerTextLight,
          ]}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
