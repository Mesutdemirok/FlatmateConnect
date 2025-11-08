import { TouchableOpacity, Text, TouchableOpacityProps, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
}

export function PrimaryButton({ title, onPress, className, ...props }: PrimaryButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className={className} {...props}>
      <LinearGradient
        colors={["#00A6A6", "#007878"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingVertical: 12,
          borderRadius: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        <Text style={{
          color: "#FFFFFF",
          textAlign: "center",
          fontWeight: "600",
          fontSize: 16,
          letterSpacing: 0.5,
        }}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
