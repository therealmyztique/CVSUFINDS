import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import AppLogo from "../components/AppLogo";
import { supabase } from "../lib/supabaseClient";

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const placeholderColor = "#94a3b8";
  const iconColor = (field) =>
    focusedField === field ? "#2bee79" : isDark ? "#94a3b8" : "#94a3b8";

  async function loginWithEmail() {
    if (loading) {
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      // Store the session token in AsyncStorage only if "Remember Me" is checked
      if (rememberMe && data?.session) {
        await AsyncStorage.setItem("token", JSON.stringify(data.session));
      }

      router.replace("/home");
    } catch (authError) {
      setErrorMessage(authError.message ?? "Unable to log in right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      className={`flex-1 px-6 pt-16 pb-8 justify-between ${
        isDark ? "bg-background-dark" : "bg-background-light"
      }`}
    >
      {/* ---------- Header ---------- */}
      <View className="items-center mb-6">
        <AppLogo />

        <Text
          className={`text-3xl font-bold text-center ${
            isDark ? "text-text-dark" : "text-text-light"
          }`}
        >
          Welcome Back
        </Text>
        <Text
          className={`text-center text-sm leading-5 mt-3 max-w-[320px] ${
            isDark ? "text-muted-dark" : "text-muted-light"
          }`}
        >
          Log in to start matching lost items and reuniting them with owners.
        </Text>
      </View>

      {/* ---------- Form ---------- */}
      <View className="flex-1 gap-5">
        {/* Email */}
        <View className="gap-2">
          <Text
            className={`text-[13px] font-semibold ml-2 ${
              isDark ? "text-text-dark" : "text-text-light"
            }`}
          >
            Email
          </Text>
          <View className="relative justify-center">
            <MaterialIcons
              name="person"
              size={22}
              color={iconColor("email")}
              style={{ position: "absolute", left: 18, zIndex: 1 }}
            />
            <TextInput
              className={`h-14 rounded-full pl-[52px] pr-[52px] text-base ${
                isDark
                  ? "bg-surface-dark-alt text-text-dark"
                  : "bg-white text-text-light"
              }`}
              placeholder="Enter your email"
              placeholderTextColor={placeholderColor}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        {/* Password */}
        <View className="gap-2">
          <Text
            className={`text-[13px] font-semibold ml-2 ${
              isDark ? "text-text-dark" : "text-text-light"
            }`}
          >
            Password
          </Text>
          <View className="relative justify-center">
            <MaterialIcons
              name="lock"
              size={22}
              color={iconColor("password")}
              style={{ position: "absolute", left: 18, zIndex: 1 }}
            />
            <TextInput
              className={`h-14 rounded-full pl-[52px] pr-[52px] text-base ${
                isDark
                  ? "bg-surface-dark-alt text-text-dark"
                  : "bg-white text-text-light"
              }`}
              placeholder="Enter your password"
              placeholderTextColor={placeholderColor}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity
              className="absolute right-4 h-full justify-center"
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={22}
                color={iconColor("password")}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-2">
          <TouchableOpacity
            className="flex-row items-center gap-1.5"
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={rememberMe ? "check-box" : "check-box-outline-blank"}
              size={22}
              color={rememberMe ? "#2bee79" : placeholderColor}
            />
            <Text
              className={`text-sm font-medium ${
                isDark ? "text-muted-dark" : "text-muted-light"
              }`}
            >
              Remember Me
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login button */}
        {errorMessage ? (
          <Text
            className={`text-center text-[13px] font-semibold mb-3 ${
              isDark ? "text-error-dark" : "text-error-light"
            }`}
          >
            {errorMessage}
          </Text>
        ) : null}

        <TouchableOpacity
          className={`h-14 rounded-full bg-primary flex-row justify-center items-center px-6 mt-3 shadow-lg shadow-primary ${
            loading ? "opacity-65" : ""
          }`}
          activeOpacity={loading ? 1 : 0.85}
          onPress={loginWithEmail}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#102217" />
          ) : (
            <Text className="text-lg font-extrabold text-background-dark">
              Log In
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ---------- Footer ---------- */}
      <View className="items-center mt-8">
        <Text
          className={`text-sm ${
            isDark ? "text-muted-dark" : "text-muted-light"
          }`}
        >
          Don't have an account?
          <Text
            className="text-primary font-bold"
            onPress={() => router.push("/signup")}
          >
            {" "}
            Sign Up
          </Text>
        </Text>
      </View>
    </View>
  );
}
