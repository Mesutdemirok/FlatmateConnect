import { View, TextInput, TextInputProps, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, borderRadius, spacing } from "../theme";

interface SearchInputProps extends TextInputProps {
  placeholder?: string;
}

export function SearchInput({ placeholder = "Şehir veya semt ara...", ...props }: SearchInputProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={colors.accent} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    marginLeft: spacing.sm,
    flex: 1,
    fontSize: fonts.size.base,
    color: colors.text,
  },
});
