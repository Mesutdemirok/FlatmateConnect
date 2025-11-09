import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ListingCard } from "../../components/ListingCard";
import { colors, fonts, borderRadius, spacing } from "../../theme";

// Mock API hook (replace with your actual backend integration)
const useUserData = () => {
  const [refreshing, setRefreshing] = React.useState(false);
  const refetch = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  return {
    user: {
      id: "u1",
      name: "Elif Yılmaz",
      email: "elif.yilmaz@example.com",
      memberSince: "Aralık 2023",
      profileImageUrl: null,
    },
    userListings: [
      {
        id: "l101",
        title: "Kadıköy Lüks Oda",
        address: "Kadıköy, İstanbul",
        rentAmount: "12500",
        isNew: false,
        images: [
          {
            imagePath:
              "https://via.placeholder.com/400/6A5ACD/FFFFFF?text=Kadikoy+Oda",
          },
        ],
      },
      {
        id: "l102",
        title: "Beşiktaş Merkezde Daire",
        address: "Beşiktaş, İstanbul",
        rentAmount: "18000",
        isNew: true,
        images: [],
      },
    ],
    isLoading: false,
    refreshing,
    refetch,
  };
};

interface MenuItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  onPress: () => void;
  isDestructive?: boolean;
}

const MenuItem = ({
  icon,
  title,
  onPress,
  isDestructive = false,
}: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemContent}>
      <MaterialIcons
        name={icon}
        size={24}
        color={isDestructive ? colors.error : colors.textLight}
      />
      <Text
        style={[styles.menuItemText, isDestructive && styles.destructiveText]}
      >
        {title}
      </Text>
    </View>
    {!isDestructive && (
      <MaterialIcons name="chevron-right" size={22} color={colors.textLight} />
    )}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, userListings, isLoading, refetch, refreshing } = useUserData();

  const handleSignOut = () => {
    console.log("User signed out");
    router.replace("/login");
  };

  const handleCreateListing = () => router.push("/create-listing");
  const handleEditProfile = () => router.push("/edit-profile");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeAreaContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hesabım</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="close" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* BODY */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refetch}
              tintColor={colors.accent}
            />
          }
        >
          {/* USER INFO */}
          <View style={styles.userInfoSection}>
            {user.profileImageUrl ? (
              <Image
                source={{ uri: user.profileImageUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user.name[0]}</Text>
              </View>
            )}

            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>

            <TouchableOpacity
              onPress={handleEditProfile}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>Profili Düzenle</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* MY LISTINGS */}
          <Text style={styles.sectionHeading}>
            İlanlarım ({userListings.length})
          </Text>

          {isLoading ? (
            <ActivityIndicator color={colors.accent} size="large" />
          ) : userListings.length > 0 ? (
            userListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="apartment"
                size={44}
                color={colors.textLight}
              />
              <Text style={styles.emptyText}>
                Henüz yayınlanmış bir ilanınız yok.
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleCreateListing}
            style={styles.createButton}
          >
            <MaterialIcons name="add" size={20} color={colors.textWhite} />
            <Text style={styles.createButtonText}>Yeni İlan Oluştur</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* SETTINGS */}
          <Text style={styles.sectionHeading}>Hesap ve Ayarlar</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="notifications-none"
              title="Bildirim Ayarları"
              onPress={() => router.push("/settings/notifications")}
            />
            <MenuItem
              icon="lock-outline"
              title="Şifre ve Güvenlik"
              onPress={() => router.push("/settings/security")}
            />
            <MenuItem
              icon="help-outline"
              title="Yardım ve Destek"
              onPress={() => router.push("/help")}
            />
            <MenuItem
              icon="info-outline"
              title="Hakkımızda"
              onPress={() => router.push("/about")}
            />
          </View>

          {/* SIGN OUT */}
          <View style={styles.menuGroup}>
            <MenuItem
              icon="logout"
              title="Çıkış Yap"
              onPress={handleSignOut}
              isDestructive
            />
          </View>

          <Text style={styles.versionText}>
            Odanet v1.0.0 • Üyelik: {user.memberSince}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeAreaContainer: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  headerTitle: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.text,
  },
  backButton: {
    position: "absolute",
    right: spacing.base,
    padding: spacing.xs,
  },

  scrollContent: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
  },

  userInfoSection: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatarPlaceholder: {
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: colors.accent + "22",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: 95,
    height: 95,
    borderRadius: 48,
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: fonts.weight.bold,
    color: colors.accent,
  },
  userName: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.text,
  },
  userEmail: {
    fontSize: fonts.size.base,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  editButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  editButtonText: {
    color: colors.textWhite,
    fontWeight: fonts.weight.semibold,
    fontSize: fonts.size.sm,
  },

  sectionHeading: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  emptyState: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.base,
  },
  emptyText: {
    marginTop: spacing.sm,
    color: colors.textLight,
    fontSize: fonts.size.base,
    textAlign: "center",
  },

  createButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    gap: 6,
  },
  createButtonText: {
    color: colors.textWhite,
    fontWeight: fonts.weight.semibold,
    fontSize: fonts.size.base,
  },

  menuGroup: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: fonts.size.base,
    color: colors.text,
    marginLeft: spacing.md,
  },
  destructiveText: {
    color: colors.error,
    fontWeight: fonts.weight.semibold,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  versionText: {
    textAlign: "center",
    fontSize: fonts.size.sm,
    color: colors.textLight,
    marginTop: spacing.md,
  },
});
