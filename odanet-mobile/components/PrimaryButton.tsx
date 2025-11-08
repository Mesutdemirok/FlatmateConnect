import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
}

export function PrimaryButton({ title, onPress, ...props }: PrimaryButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} {...props}>
      <LinearGradient
        colors={["#00A6A6", "#007878"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="py-3 rounded-xl shadow-md"
      >
        <Text className="text-white text-center font-semibold text-base tracking-wide">
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
