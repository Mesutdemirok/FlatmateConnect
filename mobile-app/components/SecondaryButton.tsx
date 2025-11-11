import { TouchableOpacity, Text, TouchableOpacityProps, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, borderRadius, spacing } from "../theme";

interface SecondaryButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
}

export function SecondaryButton({ title, onPress, style, ...props }: SecondaryButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.container, style]} {...props}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBorder}
      >
        <View style={styles.inner}>
          <Text style={styles.text}>{title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  gradientBorder: {
    padding: 2,
  },
  inner: {
    backgroundColor: colors.textWhite,
    paddingVertical: spacing.base - 2,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md - 2,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.accent,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semibold,
  },
});
