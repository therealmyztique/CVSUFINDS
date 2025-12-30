import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
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
      Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
    );
  }, [params]);

  useEffect(() => {
    let isMounted = true;

    const handleAuthCallback = async () => {
      try {
        const { code, access_token, refresh_token, token, type, email } = normalizedParams;

        if (typeof code === "string") {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          router.replace("/home");
          return;
        }

        if (typeof access_token === "string" && typeof refresh_token === "string") {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) throw error;
          router.replace("/home");
          return;
        }

        if (typeof token === "string" && typeof type === "string" && typeof email === "string") {
          const { error } = await supabase.auth.verifyOtp({
            email,
            token,
            type,
          });
          if (error) throw error;

          if (!isMounted) return;
          setStatus({
            state: "success",
            message: "Email confirmed! You can now log in with your credentials.",
          });
          return;
        }

        if (!isMounted) return;
        setStatus({
          state: "error",
          message: "We could not process that verification link. Please try logging in manually.",
        });
      } catch (error) {
        if (!isMounted) return;
        setStatus({
          state: "error",
          message: error?.message ?? "Something went wrong while handling the verification link.",
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
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      <View
        style={[
          styles.card,
          isDark ? styles.cardDark : styles.cardLight,
        ]}
      >
        {status.state === "loading" ? (
          <>
            <ActivityIndicator size="large" color="#2bee79" />
            <Text
              style={[
                styles.message,
                isDark ? styles.messageDark : styles.messageLight,
              ]}
            >
              {status.message}
            </Text>
          </>
        ) : (
          <>
            <Text
              style={[
                styles.title,
                isDark ? styles.titleDark : styles.titleLight,
              ]}
            >
              {status.state === "success" ? "Email Verified" : "Link Error"}
            </Text>
            <Text
              style={[
                styles.message,
                isDark ? styles.messageDark : styles.messageLight,
              ]}
            >
              {status.message}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.button, status.state === "success" ? styles.buttonPrimary : styles.buttonSecondary]}
              onPress={() =>
                router.replace(status.state === "success" ? "/login" : "/signup")
              }
            >
              <Text
                style={[
                  styles.buttonLabel,
                  status.state === "success"
                    ? styles.buttonLabelDarkOnLight
                    : styles.buttonLabelLightOnDark,
                ]}
              >
                {status.state === "success" ? "Go to Login" : "Back to Sign Up"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  containerLight: {
    backgroundColor: "#f6f8f7",
  },
  containerDark: {
    backgroundColor: "#102217",
  },
  card: {
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  cardLight: {
    backgroundColor: "#ffffff",
  },
  cardDark: {
    backgroundColor: "#1a3022",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
  },
  titleLight: {
    color: "#0f172a",
  },
  titleDark: {
    color: "#f8fafc",
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 18,
    marginBottom: 24,
  },
  messageLight: {
    color: "#475569",
  },
  messageDark: {
    color: "#cbd5f5",
  },
  button: {
    height: 52,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#2bee79",
  },
  buttonSecondary: {
    backgroundColor: "#334155",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  buttonLabelDarkOnLight: {
    color: "#102217",
  },
  buttonLabelLightOnDark: {
    color: "#f8fafc",
  },
});
