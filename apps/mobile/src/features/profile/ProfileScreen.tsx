import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAuthStore } from "../../store/authStore";
import { colors, radius, spacing } from "../../theme";

export function ProfileScreen(): JSX.Element {
  const session = useAuthStore((state) => state.session);

  return (
    <Screen
      title="Profile"
      subtitle="Account identity, premium status, and future billing controls live here."
    >
      <View style={styles.card}>
        <Text style={styles.name}>{session?.displayName ?? "Sarah Miller"}</Text>
        <Text style={styles.email}>{session?.email ?? "sarah@subly.app"}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Free plan</Text>
        </View>
      </View>

      <View style={styles.premiumCard}>
        <Text style={styles.premiumTitle}>Unlock premium analytics</Text>
        <Text style={styles.premiumBody}>
          Add unlimited subscriptions, custom reminder sequences, and export-ready reports.
        </Text>
        <PrimaryButton title="Upgrade to Premium" onPress={() => undefined} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm
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
  badge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: "#EEF2FF"
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary
  },
  premiumCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.surface
  },
  premiumBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#E0E7FF"
  }
});
