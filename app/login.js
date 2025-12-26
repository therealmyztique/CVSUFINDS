import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import AppLogo from "./components/AppLogo";
import { loginStyles as styles } from "./styles/loginStyles";

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const placeholderColor = "#94a3b8";
  const iconColor = (field) =>
    focusedField === field ? "#2bee79" : isDark ? "#94a3b8" : "#94a3b8";

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
        {/* Username */}
        <View style={styles.inputGroup}>
          <Text
            style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}
          >
            Username or Email
          </Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="person"
              size={22}
              color={iconColor("username")}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
              placeholder="Enter your username"
              placeholderTextColor={placeholderColor}
              value={username}
              onChangeText={setUsername}
              onFocus={() => setFocusedField("username")}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text
            style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}
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
              style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
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

        {/* Forgot password */}
        <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login button */}
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Log In</Text>
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
          <Text
            style={styles.signUp}
            onPress={() => router.push("/signup")}
          >
            {" "}Sign Up
          </Text>
        </Text>
      </View>
    </View>
  );
}
