import { Text, TouchableOpacity, View } from "react-native";
import { welcomeStyles } from "../styles/welcomeStyles";

export default function SignUpButton({
  onPress,
  label = "Sign Up",
  style,
  textStyle,
  rightIcon,
  activeOpacity = 0.9,
}) {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      style={[
        welcomeStyles.signUpButton,
        rightIcon ? welcomeStyles.signUpButtonWithIcon : null,
        style,
      ]}
      onPress={onPress}
    >
      <Text style={[welcomeStyles.signUpText, textStyle]}>{label}</Text>
      {rightIcon ? (
        <View style={welcomeStyles.signUpIconWrapper}>{rightIcon}</View>
      ) : null}
    </TouchableOpacity>
  );
}
