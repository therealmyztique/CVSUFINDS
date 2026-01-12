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
import { supabase } from "../lib/supabaseClient";
import AppLogo from "../components/AppLogo";
import { loginStyles as styles } from "../styles/loginStyles";

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
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      {/* ---------- Header ---------- */}
      <View style={styles.header}>
        <AppLogo />

        <Text
          style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}
        >
          Welcome Back
        </Text>
        <Text
          style={[
            styles.subtitle,
            isDark ? styles.subtitleDark : styles.subtitleLight,
          ]}
        >
          Log in to start matching lost items and reuniting them with owners.
        </Text>
      </View>

      {/* ---------- Form ---------- */}
      <View style={styles.form}>
        {/* Email */}
        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              isDark ? styles.labelDark : styles.labelLight,
            ]}
          >
            Email
          </Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="person"
              size={22}
              color={iconColor("email")}
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.input,
                isDark ? styles.inputDark : styles.inputLight,
              ]}
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
        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              isDark ? styles.labelDark : styles.labelLight,
            ]}
          >
            Password
          </Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="lock"
              size={22}
              color={iconColor("password")}
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.input,
                isDark ? styles.inputDark : styles.inputLight,
              ]}
              placeholder="Enter your password"
              placeholderTextColor={placeholderColor}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity
              style={styles.eyeButton}
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

        <View style={styles.rememberForgotRow}>
          <TouchableOpacity
            style={styles.rememberMe}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={rememberMe ? "check-box" : "check-box-outline-blank"}
              size={22}
              color={rememberMe ? "#2bee79" : placeholderColor}
            />
            <Text
              style={[
                styles.rememberMeText,
                isDark ? styles.rememberMeTextDark : styles.rememberMeTextLight,
              ]}
            >
              Remember Me
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login button */}
        {errorMessage ? (
          <Text
            style={[
              styles.errorText,
              isDark ? styles.errorTextDark : styles.errorTextLight,
            ]}
          >
            {errorMessage}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.loginButton,
            loading ? styles.loginButtonDisabled : null,
          ]}
          activeOpacity={loading ? 1 : 0.85}
          onPress={loginWithEmail}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#102217" />
          ) : (
            <Text style={styles.loginText}>Log In</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ---------- Footer ---------- */}
      <View style={styles.footer}>
        <Text
          style={[
            styles.footerText,
            isDark ? styles.footerTextDark : styles.footerTextLight,
          ]}
        >
          Don’t have an account?
          <Text style={styles.signUp} onPress={() => router.push("/signup")}>
            {" "}
            Sign Up
          </Text>
        </Text>
      </View>
    </View>
  );
}
