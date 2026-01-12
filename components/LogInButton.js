import { Text, TouchableOpacity } from "react-native";
import { welcomeStyles } from "../styles/welcomeStyles";

export default function LoginButton({ onPress }) {
  return (
    <TouchableOpacity
      style={welcomeStyles.loginButton}
      onPress={onPress}
    >
      <Text style={welcomeStyles.loginText}>
        Log In
      </Text>
    </TouchableOpacity>
  );
}
