import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";

interface SecondaryButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
}

export function SecondaryButton({ title, onPress, className, ...props }: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        borderColor: "#00A6A6",
        borderWidth: 1,
        paddingVertical: 12,
        borderRadius: 12,
      }}
      className={className}
      {...props}
    >
      <Text style={{
        color: "#00A6A6",
        textAlign: "center",
        fontWeight: "600",
        fontSize: 16,
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
