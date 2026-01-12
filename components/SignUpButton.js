import { Text, TouchableOpacity, View } from "react-native";

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
      className={`h-14 rounded-full bg-primary justify-center items-center mb-4 ${
        rightIcon ? "flex-row" : ""
      }`}
      style={style}
      onPress={onPress}
    >
      <Text
        className="text-lg font-black text-background-dark"
        style={textStyle}
      >
        {label}
      </Text>
      {rightIcon ? <View className="ml-2">{rightIcon}</View> : null}
    </TouchableOpacity>
  );
}
