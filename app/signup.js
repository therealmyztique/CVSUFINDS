import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
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

import { supabase } from "../lib/supabaseClient";
import AppLogo from "../components/AppLogo";
import SignUpButton from "../components/SignUpButton";
import { signupStyles as styles } from "../styles/signupStyles";

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
  const emailIsEdu = emailValue.endsWith(".edu") || emailValue.endsWith(".edu.ph");
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const trimmedStudentNumber = studentNumber.trim();
  const hasPasswordMinimum = password.length >= 8;
  const passwordsMatch = password === confirmPassword;
  const hasRequiredFields =
    Boolean(
      trimmedFirstName &&
        trimmedLastName &&
        emailValue &&
        password &&
        confirmPassword
    );

  const canSubmit =
    termsAccepted &&
    hasRequiredFields &&
    hasPasswordMinimum &&
    passwordsMatch;

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
          setErrorMessage("That email is already registered. Try logging in instead.");
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
          const normalizedProfileMessage = profileError.message?.toLowerCase?.() ?? "";

          if (
            normalizedProfileMessage.includes("duplicate key") &&
            normalizedProfileMessage.includes("profiles_email_key")
          ) {
            setErrorMessage("That email is already registered. Try logging in instead.");
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

      setInfoMessage("Check your inbox and tap the verification link to activate your account.");
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
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <AppLogo />
        </View>
        {/* Headline */}
        <View style={styles.headline}>
          <Text
            style={[
              styles.headlineTitle,
              isDark ? styles.headlineTitleDark : styles.headlineTitleLight,
            ]}
          >
            Create your{" "}
            <Text style={styles.headlineAccent}>account</Text>
          </Text>
          <Text
            style={[
              styles.headlineSubtitle,
              isDark ? styles.headlineSubtitleDark : styles.headlineSubtitleLight,
            ]}
          >
            Join the community to help reunite lost items with their owners across campus.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.rowItemLeft}>
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    isDark ? styles.labelDark : styles.labelLight,
                  ]}
                >
                  First Name
                </Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="person"
                    size={20}
                    style={styles.inputIcon}
                    color={iconColor("firstName")}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      isDark ? styles.inputDark : styles.inputLight,
                    ]}
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

            <View style={styles.rowItemRight}>
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    isDark ? styles.labelDark : styles.labelLight,
                  ]}
                >
                  Last Name
                </Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="person"
                    size={20}
                    style={styles.inputIcon}
                    color={iconColor("lastName")}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      isDark ? styles.inputDark : styles.inputLight,
                    ]}
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

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                isDark ? styles.labelDark : styles.labelLight,
              ]}
            >
              University Email
            </Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="school"
                size={20}
                style={styles.inputIcon}
                color={iconColor("email")}
              />
              <TextInput
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                ]}
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
                style={[
                  styles.indicator,
                  emailIsEdu ? styles.indicatorVisible : null,
                ]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                isDark ? styles.labelDark : styles.labelLight,
              ]}
            >
              Student Number
            </Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="badge"
                size={20}
                style={styles.inputIcon}
                color={iconColor("studentNumber")}
              />
              <TextInput
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                ]}
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
                size={20}
                style={styles.inputIcon}
                color={iconColor("password")}
              />
              <TextInput
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                ]}
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
                style={styles.eyeButton}
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
              style={[
                styles.helperText,
                isDark ? styles.helperTextDark : styles.helperTextLight,
              ]}
            >
              Minimum 8 characters.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                isDark ? styles.labelDark : styles.labelLight,
              ]}
            >
              Confirm Password
            </Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="lock-outline"
                size={20}
                style={styles.inputIcon}
                color={iconColor("confirmPassword")}
              />
              <TextInput
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                ]}
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
                style={styles.eyeButton}
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
                style={[
                  styles.helperText,
                  styles.helperTextError,
                  isDark ? styles.helperTextErrorDark : styles.helperTextErrorLight,
                ]}
              >
                Passwords must match.
              </Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                isDark ? styles.labelDark : styles.labelLight,
              ]}
            >
              Birthday
            </Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="cake"
                size={20}
                style={styles.inputIcon}
                color={iconColor("birthday")}
              />
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={openDatePicker}
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                  styles.dateButton,
                ]}
              >
                <Text
                  style={[
                    styles.dateText,
                    birthdayDisplay
                      ? isDark
                        ? styles.dateTextDark
                        : styles.dateTextLight
                      : styles.dateTextPlaceholder,
                  ]}
                >
                  {birthdayDisplay || "MM/DD/YYYY"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.termsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setTermsAccepted((prev) => !prev)}
              style={[
                styles.checkbox,
                isDark ? styles.checkboxDark : null,
                termsAccepted ? styles.checkboxChecked : null,
              ]}
            >
              {termsAccepted ? <View style={styles.checkboxMark} /> : null}
            </TouchableOpacity>
            <Text
              style={[
                styles.termsText,
                isDark ? styles.termsTextDark : styles.termsTextLight,
              ]}
            >
              By signing up, you agree to our
              <Text style={styles.termsLink}> Terms of Service</Text> and
              <Text style={styles.termsLink}> Privacy Policy</Text>.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View
        style={[styles.footer, isDark ? styles.footerDark : styles.footerLight]}
      >
        {errorMessage ? (
          <Text
            style={[
              styles.feedbackText,
              styles.feedbackError,
              isDark ? styles.feedbackErrorDark : styles.feedbackErrorLight,
            ]}
          >
            {errorMessage}
          </Text>
        ) : null}

        {infoMessage ? (
          <Text
            style={[
              styles.feedbackText,
              styles.feedbackInfo,
              isDark ? styles.feedbackInfoDark : styles.feedbackInfoLight,
            ]}
          >
            {infoMessage}
          </Text>
        ) : null}

        <SignUpButton
          onPress={handleSignUpPress}
          style={[
            styles.signUpButton,
            (loading || !canSubmit) ? styles.signUpButtonDisabled : null,
          ]}
          textStyle={styles.signUpButtonText}
          label={loading ? "Creating account..." : "Sign Up"}
          rightIcon={
            loading ? (
              <ActivityIndicator size="small" color="#102217" />
            ) : null
          }
          activeOpacity={loading || !canSubmit ? 1 : 0.9}
        />

        <Text
          style={[
            styles.footerPrompt,
            isDark ? styles.footerPromptDark : styles.footerPromptLight,
          ]}
        >
          Already have an account?
          <Text
            style={styles.footerLink}
            onPress={() => router.push("/login")}
          >
            {" "}Log in
          </Text>
        </Text>
      </View>

      {Platform.OS === "ios" && showIOSPicker ? (
        <View style={styles.iosPickerBackdrop}>
          <View
            style={[
              styles.iosPickerCard,
              isDark ? styles.iosPickerCardDark : styles.iosPickerCardLight,
            ]}
          >
            <DateTimePicker
              mode="date"
              display="spinner"
              value={birthday || new Date()}
              onChange={handleBirthdayChange}
              themeVariant={isDark ? "dark" : "light"}
            />
            <TouchableOpacity
              style={styles.iosPickerDone}
              onPress={closeIOSPicker}
            >
              <Text style={styles.iosPickerDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}
