import { View, ScrollView, StyleSheet } from "react-native";
import { Text, Card, Avatar, Badge } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function MessagesScreen() {
  const mockMessages = [
    {
      id: "1",
      name: "Ahmet Yılmaz",
      lastMessage: "Oda hala müsait mi?",
      time: "10:30",
      unread: 2,
      avatar: "A",
    },
    {
      id: "2",
      name: "Ayşe Kaya",
      lastMessage: "Teşekkürler, yarın görüşürüz",
      time: "Dün",
      unread: 0,
      avatar: "AK",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView}>
        {mockMessages.length > 0 ? (
          <View style={styles.messagesList}>
            {mockMessages.map((message) => (
              <Card key={message.id} style={styles.messageCard}>
                <Card.Content style={styles.messageContent}>
                  <Avatar.Text
                    size={48}
                    label={message.avatar}
                    style={styles.avatar}
                    color="#FFFFFF"
                  />
                  <View style={styles.messageInfo}>
                    <View style={styles.messageHeader}>
                      <Text style={styles.messageName}>{message.name}</Text>
                      <Text style={styles.messageTime}>{message.time}</Text>
                    </View>
                    <View style={styles.messageTextRow}>
                      <Text
                        style={[
                          styles.messageText,
                          message.unread > 0 && styles.messageTextUnread,
                        ]}
                        numberOfLines={1}
                      >
                        {message.lastMessage}
                      </Text>
                      {message.unread > 0 && (
                        <Badge style={styles.badge} size={20}>
                          {message.unread}
                        </Badge>
                      )}
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Card style={styles.emptyCard}>
              <Card.Content>
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={80}
                  color="#CCCCCC"
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>Henüz mesajınız yok</Text>
                <Text style={styles.emptySubtitle}>
                  İlan sahipleriyle mesajlaşmaya başladığınızda burada görünecek
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  scrollView: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    gap: 12,
  },
  messageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 2,
  },
  messageContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#00A6A6",
  },
  messageInfo: {
    flex: 1,
    marginLeft: 12,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  messageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
  messageTime: {
    fontSize: 12,
    color: "#999999",
  },
  messageTextRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageText: {
    fontSize: 14,
    color: "#666666",
    flex: 1,
  },
  messageTextUnread: {
    fontWeight: "600",
    color: "#222222",
  },
  badge: {
    backgroundColor: "#00A6A6",
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 16,
    marginTop: 80,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 40,
  },
  emptyIcon: {
    alignSelf: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222222",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
});
