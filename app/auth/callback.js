import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const params = useLocalSearchParams();
  const [status, setStatus] = useState({
    state: "loading",
    message: "Verifying your account...",
  });

  const normalizedParams = useMemo(() => {
    return Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        key,
        Array.isArray(value) ? value[0] : value,
      ])
    );
  }, [params]);

  useEffect(() => {
    let isMounted = true;

    const handleAuthCallback = async () => {
      try {
        const { code, access_token, refresh_token, token, type, email } =
          normalizedParams;

        if (typeof code === "string") {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          router.replace("/home");
          return;
        }

        if (
          typeof access_token === "string" &&
          typeof refresh_token === "string"
        ) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) throw error;
          router.replace("/home");
          return;
        }

        if (
          typeof token === "string" &&
          typeof type === "string" &&
          typeof email === "string"
        ) {
          const { error } = await supabase.auth.verifyOtp({
            email,
            token,
            type,
          });
          if (error) throw error;

          if (!isMounted) return;
          setStatus({
            state: "success",
            message: "Email confirmed! Redirecting to login...",
          });

          // Auto-redirect to login after showing success message
          setTimeout(() => {
            if (isMounted) {
              router.replace("/login");
            }
          }, 2000);
          return;
        }

        if (!isMounted) return;
        setStatus({
          state: "error",
          message:
            "We could not process that verification link. Please try logging in manually.",
        });
      } catch (error) {
        if (!isMounted) return;
        setStatus({
          state: "error",
          message:
            error?.message ??
            "Something went wrong while handling the verification link.",
        });
      }
    };

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [normalizedParams, router]);

  return (
    <SafeAreaView
      className={`flex-1 justify-center px-6 ${
        isDark ? "bg-[#102217]" : "bg-[#f6f8f7]"
      }`}
    >
      <View
        className={`rounded-3xl py-8 px-6 shadow-lg ${
          isDark ? "bg-[#1a3022]" : "bg-white"
        }`}
      >
        {status.state === "loading" ? (
          <>
            <ActivityIndicator size="large" color="#2bee79" />
            <Text
              className={`text-[15px] leading-[22px] text-center mt-[18px] mb-6 ${
                isDark ? "text-[#cbd5f5]" : "text-[#475569]"
              }`}
            >
              {status.message}
            </Text>
          </>
        ) : status.state === "success" ? (
          <>
            <Text
              className={`text-2xl font-extrabold text-center mb-4 ${
                isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
              }`}
            >
              Email Verified ✓
            </Text>
            <Text
              className={`text-[15px] leading-[22px] text-center mt-[18px] mb-6 ${
                isDark ? "text-[#cbd5f5]" : "text-[#475569]"
              }`}
            >
              {status.message}
            </Text>
            <ActivityIndicator size="small" color="#2bee79" />
          </>
        ) : (
          <>
            <Text
              className={`text-2xl font-extrabold text-center mb-4 ${
                isDark ? "text-[#f8fafc]" : "text-[#0f172a]"
              }`}
            >
              Link Error
            </Text>
            <Text
              className={`text-[15px] leading-[22px] text-center mt-[18px] mb-6 ${
                isDark ? "text-[#cbd5f5]" : "text-[#475569]"
              }`}
            >
              {status.message}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              className="h-[52px] rounded-full justify-center items-center bg-[#334155]"
              onPress={() => router.replace("/signup")}
            >
              <Text className="text-base font-bold text-[#f8fafc]">
                Back to Sign Up
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
