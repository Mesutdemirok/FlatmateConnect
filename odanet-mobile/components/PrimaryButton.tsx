import { TouchableOpacity, Text, TouchableOpacityProps, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, borderRadius, spacing } from "../theme";

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
}

export function PrimaryButton({ title, onPress, style, ...props }: PrimaryButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.container, style]} {...props}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.textWhite,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
  },
});
