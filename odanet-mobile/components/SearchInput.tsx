import { View, TextInput, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchInputProps extends TextInputProps {
  placeholder?: string;
}

export function SearchInput({ placeholder = "Şehir veya semt ara...", ...props }: SearchInputProps) {
  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: "#E5E5E5",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    }}>
      <Ionicons name="search" size={18} color="#666" />
      <TextInput
        style={{
          marginLeft: 8,
          flex: 1,
          fontSize: 16,
          color: "#333333",
        }}
        placeholder={placeholder}
        placeholderTextColor="#999"
        {...props}
      />
    </View>
  );
}
