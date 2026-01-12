import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View, useColorScheme } from "react-native";
import AppLogo from "../components/AppLogo";
import LoginButton from "../components/LogInButton";
import SignUpButton from "../components/SignUpButton";
import { supabase } from "../lib/supabaseClient";

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if the user is already authenticated using Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();
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
        className={`flex-1 justify-center items-center ${
          isDark ? "bg-background-dark" : "bg-slate-50"
        }`}
      >
        <ActivityIndicator size="large" color="#2bee79" />
      </View>
    );
  }

  return (
    <View
      className={`flex-1 justify-between ${
        isDark ? "bg-background-dark" : "bg-slate-50"
      }`}
    >
      {/* Main content */}
      <View className="flex-1 justify-center items-center px-6">
        <AppLogo />
        <Text
          className={`text-[40px] font-black ${
            isDark ? "text-white" : "text-text-light"
          }`}
        >
          CvSU Finds
        </Text>
        <Text
          className={`text-base text-center max-w-[260px] ${
            isDark ? "text-neutral-400" : "text-slate-600"
          }`}
        >
          Snap a photo. Find your item.
        </Text>
      </View>

      {/* Action buttons */}
      <View
        className={`px-6 pb-8 ${isDark ? "bg-transparent" : "bg-slate-100"}`}
      >
        <SignUpButton onPress={() => router.push("/signup")} />
        <LoginButton onPress={() => router.push("/login")} />
        <Text
          className={`mt-6 mb-5 text-[9px] text-center ${
            isDark ? "text-muted-dark" : "text-muted-light"
          }`}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
