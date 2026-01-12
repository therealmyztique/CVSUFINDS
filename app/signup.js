import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import AppLogo from "../components/AppLogo";
import SignUpButton from "../components/SignUpButton";
import { supabase } from "../lib/supabaseClient";

export default function SignUpScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [birthday, setBirthday] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const emailValue = email.trim().toLowerCase();
  const emailIsEdu =
    emailValue.endsWith(".edu") || emailValue.endsWith(".edu.ph");
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const trimmedStudentNumber = studentNumber.trim();
  const hasPasswordMinimum = password.length >= 8;
  const passwordsMatch = password === confirmPassword;
  const hasRequiredFields = Boolean(
    trimmedFirstName &&
      trimmedLastName &&
      emailValue &&
      password &&
      confirmPassword
  );

  const canSubmit =
    termsAccepted && hasRequiredFields && hasPasswordMinimum && passwordsMatch;

  const formatNameInput = (value) => {
    if (!value) {
      return "";
    }

    const firstLetterIndex = value.search(/[A-Za-z]/);
    if (firstLetterIndex === -1) {
      return value;
    }

    const formattedFirstLetter = value[firstLetterIndex].toUpperCase();
    return (
      value.slice(0, firstLetterIndex) +
      formattedFirstLetter +
      value.slice(firstLetterIndex + 1)
    );
  };

  async function signUpWithEmail() {
    if (loading) {
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("You must accept the terms to continue.");
      return;
    }

    if (!trimmedFirstName || !trimmedLastName) {
      setErrorMessage("Please provide your first and last name.");
      return;
    }

    if (!emailValue) {
      setErrorMessage("Please enter your university email.");
      return;
    }

    if (!emailIsEdu) {
      setErrorMessage("Use your university email ending in .edu or .edu.ph.");
      return;
    }

    if (!password) {
      setErrorMessage("Create a password to continue.");
      return;
    }

    if (!hasPasswordMinimum) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (!confirmPassword) {
      setErrorMessage("Confirm your password to continue.");
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setInfoMessage("");

      const redirectTo = Linking.createURL("/auth/callback");

      const { data, error } = await supabase.auth.signUp({
        email: emailValue,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            first_name: trimmedFirstName,
            last_name: trimmedLastName,
            student_number: trimmedStudentNumber || null,
            birthday: birthday ? birthday.toISOString() : null,
          },
        },
      });
      if (error) {
        const normalizedMessage = error.message?.toLowerCase?.() ?? "";
        if (normalizedMessage.includes("already registered")) {
          setErrorMessage(
            "That email is already registered. Try logging in instead."
          );
        } else {
          setErrorMessage(error.message);
        }
        return;
      }
      if (data?.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          student_number: trimmedStudentNumber || null,
          birthday: birthday ? birthday.toISOString() : null,
          email: emailValue,
        });

        if (profileError && profileError.code !== "42P01") {
          const normalizedProfileMessage =
            profileError.message?.toLowerCase?.() ?? "";

          if (
            normalizedProfileMessage.includes("duplicate key") &&
            normalizedProfileMessage.includes("profiles_email_key")
          ) {
            setErrorMessage(
              "That email is already registered. Try logging in instead."
            );
          } else {
            setErrorMessage(profileError.message);
          }
          return;
        }
      }

      if (data?.session) {
        router.replace("/home");
        return;
      }

      setInfoMessage(
        "Check your inbox and tap the verification link to activate your account."
      );
    } catch (signUpError) {
      setErrorMessage(signUpError.message ?? "Unable to sign up right now.");
    } finally {
      setLoading(false);
    }
  }

  const handleSignUpPress = () => {
    if (loading) {
      return;
    }

    if (!canSubmit) {
      setErrorMessage("Complete all required fields before signing up.");
      return;
    }

    signUpWithEmail();
  };

  const placeholderColor = "#94a3b8";
  const iconColor = (field) =>
    focusedField === field ? "#2bee79" : isDark ? "#94a3b8" : "#94a3b8";

  const birthdayDisplay = useMemo(() => {
    if (!birthday) {
      return "";
    }
    try {
      return birthday.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "";
    }
  }, [birthday]);

  const handleBirthdayChange = (_event, selectedDate) => {
    if (selectedDate) {
      setBirthday(selectedDate);
    }
  };

  const closeIOSPicker = () => {
    setShowIOSPicker(false);
    setFocusedField(null);
  };

  const openDatePicker = () => {
    setFocusedField("birthday");
    const initialDate = birthday || new Date();

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        mode: "date",
        value: initialDate,
        onChange: (event, selectedDate) => {
          if (event.type === "set" && selectedDate) {
            setBirthday(selectedDate);
          }
          setFocusedField(null);
        },
      });
      return;
    }

    setShowIOSPicker(true);
  };

  return (
    <View
      className={`flex-1 px-6 pt-16 pb-8 ${
        isDark ? "bg-background-dark" : "bg-background-light"
      }`}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-6">
          <AppLogo />
        </View>

        {/* Headline */}
        <View className="mb-8">
          <Text
            className={`text-[28px] font-bold text-center mb-2 ${
              isDark ? "text-text-dark" : "text-text-light"
            }`}
          >
            Create your <Text className="text-primary">account</Text>
          </Text>
          <Text
            className={`text-[15px] text-center leading-[22px] ${
              isDark ? "text-muted-dark" : "text-muted-light"
            }`}
          >
            Join the community to help reunite lost items with their owners
            across campus.
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <View className="gap-2">
                <Text
                  className={`text-[13px] font-semibold ml-2 ${
                    isDark ? "text-text-dark" : "text-text-light"
                  }`}
                >
                  First Name
                </Text>
                <View className="relative justify-center">
                  <MaterialIcons
                    name="person"
                    size={20}
                    style={{ position: "absolute", left: 18, zIndex: 1 }}
                    color={iconColor("firstName")}
                  />
                  <TextInput
                    className={`h-14 rounded-full pl-[52px] pr-4 text-base ${
                      isDark
                        ? "bg-surface-dark-alt text-text-dark"
                        : "bg-white text-text-light"
                    }`}
                    placeholder="Jane"
                    placeholderTextColor={placeholderColor}
                    value={firstName}
                    onChangeText={(text) => setFirstName(formatNameInput(text))}
                    onFocus={() => setFocusedField("firstName")}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                </View>
              </View>
            </View>

            <View className="flex-1">
              <View className="gap-2">
                <Text
                  className={`text-[13px] font-semibold ml-2 ${
                    isDark ? "text-text-dark" : "text-text-light"
                  }`}
                >
                  Last Name
                </Text>
                <View className="relative justify-center">
                  <MaterialIcons
                    name="person"
                    size={20}
                    style={{ position: "absolute", left: 18, zIndex: 1 }}
                    color={iconColor("lastName")}
                  />
                  <TextInput
                    className={`h-14 rounded-full pl-[52px] pr-4 text-base ${
                      isDark
                        ? "bg-surface-dark-alt text-text-dark"
                        : "bg-white text-text-light"
                    }`}
                    placeholder="Doe"
                    placeholderTextColor={placeholderColor}
                    value={lastName}
                    onChangeText={(text) => setLastName(formatNameInput(text))}
                    onFocus={() => setFocusedField("lastName")}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                </View>
              </View>
            </View>
          </View>

          <View className="gap-2">
            <Text
              className={`text-[13px] font-semibold ml-2 ${
                isDark ? "text-text-dark" : "text-text-light"
              }`}
            >
              University Email
            </Text>
            <View className="relative justify-center">
              <MaterialIcons
                name="school"
                size={20}
                style={{ position: "absolute", left: 18, zIndex: 1 }}
                color={iconColor("email")}
              />
              <TextInput
                className={`h-14 rounded-full pl-[52px] pr-12 text-base ${
                  isDark
                    ? "bg-surface-dark-alt text-text-dark"
                    : "bg-white text-text-light"
                }`}
                placeholder="first.last@cvsu.edu.ph"
                placeholderTextColor={placeholderColor}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />
              <View
                className={`absolute right-4 w-2.5 h-2.5 rounded-full ${
                  emailIsEdu ? "bg-primary" : "bg-transparent"
                }`}
              />
            </View>
          </View>

          <View className="gap-2">
            <Text
              className={`text-[13px] font-semibold ml-2 ${
                isDark ? "text-text-dark" : "text-text-light"
              }`}
            >
              Student Number
            </Text>
            <View className="relative justify-center">
              <MaterialIcons
                name="badge"
                size={20}
                style={{ position: "absolute", left: 18, zIndex: 1 }}
                color={iconColor("studentNumber")}
              />
              <TextInput
                className={`h-14 rounded-full pl-[52px] pr-4 text-base ${
                  isDark
                    ? "bg-surface-dark-alt text-text-dark"
                    : "bg-white text-text-light"
                }`}
                placeholder="202300000"
                placeholderTextColor={placeholderColor}
                keyboardType="number-pad"
                value={studentNumber}
                onChangeText={setStudentNumber}
                onFocus={() => setFocusedField("studentNumber")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

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
                size={20}
                style={{ position: "absolute", left: 18, zIndex: 1 }}
                color={iconColor("password")}
              />
              <TextInput
                className={`h-14 rounded-full pl-[52px] pr-14 text-base ${
                  isDark
                    ? "bg-surface-dark-alt text-text-dark"
                    : "bg-white text-text-light"
                }`}
                placeholder="Create a password"
                placeholderTextColor={placeholderColor}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
              />
              <TouchableOpacity
                className="absolute right-4 p-1"
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={22}
                  color={iconColor("password")}
                />
              </TouchableOpacity>
            </View>
            <Text
              className={`text-xs ml-2 ${
                isDark ? "text-muted-dark" : "text-muted-light"
              }`}
            >
              Minimum 8 characters.
            </Text>
          </View>

          <View className="gap-2">
            <Text
              className={`text-[13px] font-semibold ml-2 ${
                isDark ? "text-text-dark" : "text-text-light"
              }`}
            >
              Confirm Password
            </Text>
            <View className="relative justify-center">
              <MaterialIcons
                name="lock-outline"
                size={20}
                style={{ position: "absolute", left: 18, zIndex: 1 }}
                color={iconColor("confirmPassword")}
              />
              <TextInput
                className={`h-14 rounded-full pl-[52px] pr-14 text-base ${
                  isDark
                    ? "bg-surface-dark-alt text-text-dark"
                    : "bg-white text-text-light"
                }`}
                placeholder="Re-enter your password"
                placeholderTextColor={placeholderColor}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedField("confirmPassword")}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
              />
              <TouchableOpacity
                className="absolute right-4 p-1"
                onPress={() => setShowConfirmPassword((prev) => !prev)}
              >
                <MaterialIcons
                  name={showConfirmPassword ? "visibility" : "visibility-off"}
                  size={22}
                  color={iconColor("confirmPassword")}
                />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && confirmPassword !== password ? (
              <Text
                className={`text-xs ml-2 ${
                  isDark ? "text-error-dark" : "text-error-light"
                }`}
              >
                Passwords must match.
              </Text>
            ) : null}
          </View>

          <View className="gap-2">
            <Text
              className={`text-[13px] font-semibold ml-2 ${
                isDark ? "text-text-dark" : "text-text-light"
              }`}
            >
              Birthday
            </Text>
            <View className="relative justify-center">
              <MaterialIcons
                name="cake"
                size={20}
                style={{ position: "absolute", left: 18, zIndex: 1 }}
                color={iconColor("birthday")}
              />
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={openDatePicker}
                className={`h-14 rounded-full pl-[52px] pr-4 justify-center ${
                  isDark ? "bg-surface-dark-alt" : "bg-white"
                }`}
              >
                <Text
                  className={`text-base ${
                    birthdayDisplay
                      ? isDark
                        ? "text-text-dark"
                        : "text-text-light"
                      : "text-[#94a3b8]"
                  }`}
                >
                  {birthdayDisplay || "MM/DD/YYYY"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row items-start gap-3 mt-2">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setTermsAccepted((prev) => !prev)}
              className={`w-5 h-5 rounded border-2 items-center justify-center mt-0.5 ${
                termsAccepted
                  ? "bg-primary border-primary"
                  : isDark
                  ? "border-muted-dark"
                  : "border-muted-light"
              }`}
            >
              {termsAccepted ? (
                <View className="w-2 h-2 rounded-sm bg-background-dark" />
              ) : null}
            </TouchableOpacity>
            <Text
              className={`flex-1 text-[13px] leading-[18px] ${
                isDark ? "text-muted-dark" : "text-muted-light"
              }`}
            >
              By signing up, you agree to our
              <Text className="text-primary font-semibold">
                {" "}
                Terms of Service
              </Text>{" "}
              and
              <Text className="text-primary font-semibold">
                {" "}
                Privacy Policy
              </Text>
              .
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View
        className={`pt-4 pb-2 border-t ${
          isDark
            ? "bg-background-dark border-surface-dark-alt"
            : "bg-background-light border-gray-200"
        }`}
      >
        {errorMessage ? (
          <Text
            className={`text-sm text-center mb-3 px-2 ${
              isDark ? "text-error-dark" : "text-error-light"
            }`}
          >
            {errorMessage}
          </Text>
        ) : null}

        {infoMessage ? (
          <Text
            className={`text-sm text-center mb-3 px-2 ${
              isDark ? "text-primary" : "text-primary"
            }`}
          >
            {infoMessage}
          </Text>
        ) : null}

        <SignUpButton
          onPress={handleSignUpPress}
          className={`h-14 rounded-full bg-primary justify-center items-center ${
            loading || !canSubmit ? "opacity-50" : ""
          }`}
          textClassName="text-background-dark text-base font-bold"
          label={loading ? "Creating account..." : "Sign Up"}
          rightIcon={
            loading ? <ActivityIndicator size="small" color="#102217" /> : null
          }
          activeOpacity={loading || !canSubmit ? 1 : 0.9}
        />

        <Text
          className={`text-sm text-center mt-4 ${
            isDark ? "text-muted-dark" : "text-muted-light"
          }`}
        >
          Already have an account?
          <Text
            className="text-primary font-semibold"
            onPress={() => router.push("/login")}
          >
            {" "}
            Log in
          </Text>
        </Text>
      </View>

      {Platform.OS === "ios" && showIOSPicker ? (
        <View className="absolute inset-0 bg-black/50 justify-end">
          <View
            className={`rounded-t-3xl pt-4 pb-8 ${
              isDark ? "bg-surface-dark-alt" : "bg-white"
            }`}
          >
            <DateTimePicker
              mode="date"
              display="spinner"
              value={birthday || new Date()}
              onChange={handleBirthdayChange}
              themeVariant={isDark ? "dark" : "light"}
            />
            <TouchableOpacity
              className="mx-6 h-12 rounded-full bg-primary justify-center items-center"
              onPress={closeIOSPicker}
            >
              <Text className="text-background-dark text-base font-bold">
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}
