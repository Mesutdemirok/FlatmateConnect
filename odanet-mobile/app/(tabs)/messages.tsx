import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useConversations } from "../../hooks/useConversations";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export default function Messages() {
  const { data: conversations, isLoading, error, refetch } = useConversations();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#EA580C" />
        <Text className="text-gray-600 mt-4">Mesajlar yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-6xl mb-4">🔐</Text>
        <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
          Giriş Yapın
        </Text>
        <Text className="text-base text-gray-600 text-center mb-6">
          Mesajlarınızı görüntülemek için giriş yapmanız gerekiyor
        </Text>
        <TouchableOpacity 
          className="bg-orange-600 px-8 py-3 rounded-lg"
          data-testid="login-button"
        >
          <Text className="text-white font-semibold text-base">Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderConversation = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white px-4 py-4 border-b border-gray-100"
      data-testid={`conversation-${item.id}`}
    >
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mr-3">
          <Text className="text-xl">
            {item.otherUser.firstName?.[0]?.toUpperCase() || "👤"}
          </Text>
        </View>

        {/* Message Info */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {item.otherUser.firstName} {item.otherUser.lastName}
          </Text>
          {item.lastMessage && (
            <Text className="text-sm text-gray-600" numberOfLines={1}>
              {item.lastMessage.content}
            </Text>
          )}
        </View>

        {/* Time */}
        {item.lastMessage && (
          <Text className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(item.lastMessage.createdAt), {
              addSuffix: true,
              locale: tr,
            })}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Text className="text-6xl mb-4">💬</Text>
      <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
        Henüz mesajınız yok
      </Text>
      <Text className="text-sm text-gray-600 text-center">
        İlan sahipleriyle iletişime geçtiğinizde mesajlarınız burada görünecek
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900">Mesajlar</Text>
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations || []}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={
          conversations?.length === 0
            ? { flex: 1 }
            : { paddingBottom: 16 }
        }
        data-testid="conversations-list"
      />
    </View>
  );
}
