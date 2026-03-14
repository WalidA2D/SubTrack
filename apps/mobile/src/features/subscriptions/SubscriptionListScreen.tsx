import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { SubscriptionListItem } from "../../components/SubscriptionListItem";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { colors, radius, spacing } from "../../theme";
import { formatCurrency } from "../../utils/format";

export function SubscriptionListScreen(): JSX.Element {
  const navigation = useAppNavigation();
  const [search, setSearch] = useState("");
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const dashboard = useWorkspaceStore((state) => state.dashboard);
  const profile = useWorkspaceStore((state) => state.profile);
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const currency = profile?.currency ?? "EUR";

  const filteredSubscriptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return subscriptions;
    }

    return subscriptions.filter((subscription) =>
      subscription.providerName.toLowerCase().includes(query)
    );
  }, [search, subscriptions]);

  return (
    <Screen
      title="Abonnements"
      subtitle="Retrouve, recherche et pilote tous tes paiements recurrents dans une interface compacte et premium."
      action={<PrimaryButton title="Retour" onPress={navigation.goBack} variant="secondary" />}
    >
      <View style={styles.heroRow}>
        <View style={styles.heroMetric}>
          <Text style={styles.heroLabel}>Actifs</Text>
          <Text style={styles.heroValue}>{subscriptions.length}</Text>
        </View>
        <View style={styles.heroMetric}>
          <Text style={styles.heroLabel}>Mensuel</Text>
          <Text style={styles.heroValue}>
            {formatCurrency(dashboard?.monthlySpending ?? 0, currency)}
          </Text>
        </View>
      </View>

      <TextInput
        placeholder="Rechercher Netflix, Spotify, Figma..."
        placeholderTextColor={colors.textSecondary}
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tous les abonnements</Text>
        <Pressable onPress={() => navigation.navigate("AddSubscription")}>
          <Text style={styles.sectionAction}>Ajouter</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {filteredSubscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {isLoading ? "Chargement des abonnements..." : "Aucun abonnement trouve."}
            </Text>
            <Text style={styles.emptyBody}>
              Essaie un autre mot-cle ou ajoute un nouveau service.
            </Text>
          </View>
        ) : (
          filteredSubscriptions.map((subscription) => (
            <SubscriptionListItem
              key={subscription.id}
              subscription={subscription}
              onPress={() =>
                navigation.navigate("SubscriptionDetails", {
                  subscriptionId: subscription.id
                })
              }
            />
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  heroMetric: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: colors.textTertiary
  },
  heroValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary
  },
  search: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceRaised
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary
  },
  list: {
    gap: spacing.md
  },
  emptyState: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 18,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary
  },
  emptyBody: {
    fontSize: 14,
    color: colors.textSecondary
  }
});
