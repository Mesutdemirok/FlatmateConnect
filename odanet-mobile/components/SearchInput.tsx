import { View, TextInput, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchInputProps extends TextInputProps {
  placeholder?: string;
}

export function SearchInput({ placeholder = "Şehir veya semt ara...", ...props }: SearchInputProps) {
  return (
    <View className="flex-row items-center bg-white rounded-xl shadow-sm px-3 py-2 border border-gray-200">
      <Ionicons name="search" size={18} color="#666" />
      <TextInput
        className="ml-2 flex-1 text-base text-odanet-text"
        placeholder={placeholder}
        placeholderTextColor="#999"
        {...props}
      />
    </View>
  );
}
