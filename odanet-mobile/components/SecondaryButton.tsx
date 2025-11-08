import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";

interface SecondaryButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
}

export function SecondaryButton({ title, onPress, ...props }: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="border border-odanet-primary py-3 rounded-xl active:bg-odanet-primary/10"
      {...props}
    >
      <Text className="text-odanet-primary text-center font-semibold text-base">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
