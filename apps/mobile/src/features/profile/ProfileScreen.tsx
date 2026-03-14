import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAuthStore } from "../../store/authStore";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { colors, radius, spacing } from "../../theme";

export function ProfileScreen(): JSX.Element {
  const session = useAuthStore((state) => state.session);
  const navigation = useAppNavigation();
  const profile = useWorkspaceStore((state) => state.profile);
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const displayName = profile?.displayName ?? session?.displayName ?? "Sarah Martin";

  return (
    <Screen
      title="Profil"
      subtitle="Retrouve ici ton identite, ton plan actuel et les futurs controles de facturation."
      action={<PrimaryButton title="Retour" onPress={navigation.goBack} variant="secondary" />}
    >
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>{displayName.slice(0, 2).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{profile?.email ?? session?.email ?? "sarah@subly.app"}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {profile?.planTier === "premium" ? "Plan Premium" : "Plan Gratuit"}
          </Text>
        </View>
        <Text style={styles.meta}>Devise : {profile?.currency ?? "EUR"}</Text>
        <Text style={styles.meta}>Abonnements actifs : {subscriptions.length}</Text>
      </View>

      <View style={styles.premiumCard}>
        <Text style={styles.premiumTitle}>Passe au niveau Premium</Text>
        <Text style={styles.premiumBody}>
          Debloque les abonnements illimites, des rappels personnalises et des rapports
          exportables.
        </Text>
        <PrimaryButton title="Passer au Premium" onPress={() => undefined} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContrast,
    borderWidth: 1,
    borderColor: colors.borderStrong
  },
  avatarLabel: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary
  },
  email: {
    fontSize: 15,
    color: colors.textSecondary
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surfaceContrast
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary
  },
  premiumCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 184, 77, 0.34)"
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary
  },
  premiumBody: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary
  }
});
