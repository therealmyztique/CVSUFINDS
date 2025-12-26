import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";

import AppLogo from "./components/AppLogo";
import SignUpButton from "./components/SignUpButton";
import { signupStyles as styles } from "./styles/signupStyles";

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

  const emailValue = email.trim().toLowerCase();
  const emailIsEdu = emailValue.endsWith(".edu") || emailValue.endsWith(".edu.ph");

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
      <View style={styles.content}>
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
                    onChangeText={setFirstName}
                    onFocus={() => setFocusedField("firstName")}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="words"
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
                    onChangeText={setLastName}
                    onFocus={() => setFocusedField("lastName")}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="words"
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
      </View>

      {/* Sticky footer */}
      <View
        style={[styles.footer, isDark ? styles.footerDark : styles.footerLight]}
      >
        <SignUpButton
          onPress={() => {}}
          style={styles.signUpButton}
          textStyle={styles.signUpButtonText}
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
