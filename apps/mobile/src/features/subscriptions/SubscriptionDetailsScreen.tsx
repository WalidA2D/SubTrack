import { Alert, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { ServiceLogo } from "../../components/ServiceLogo";
import { useAppNavigation, useCurrentOverlayRoute } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { colors, radius, spacing } from "../../theme";
import {
  formatBillingFrequency,
  formatCurrency,
  formatLongDate,
  formatReminderDays,
  formatStatus,
  formatUsageCheckIn
} from "../../utils/format";

export function SubscriptionDetailsScreen(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const isTablet = width >= 768;
  const navigation = useAppNavigation();
  const route = useCurrentOverlayRoute();
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const archiveSubscription = useWorkspaceStore((state) => state.archiveSubscription);
  const subscription =
    subscriptions.find(
      (item) =>
        route?.name === "SubscriptionDetails" &&
        item.id === route.params.subscriptionId
    ) ?? null;

  if (!subscription) {
    return (
      <Screen
        title="Abonnement introuvable"
        subtitle="Reviens a la liste pour recharger les donnees."
        action={<PrimaryButton title="Retour" onPress={navigation.goBack} variant="secondary" />}
      >
        <View style={styles.card}>
          <Text style={styles.rowValue}>L'abonnement selectionne n'est plus disponible.</Text>
        </View>
      </Screen>
    );
  }

  const handleArchive = () => {
    Alert.alert(
      "Archiver l'abonnement ?",
      "Il disparaitra de la liste active mais restera trace dans l'historique Firestore.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Archiver",
          style: "destructive",
          onPress: async () => {
            try {
              await archiveSubscription(subscription.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                "Archivage impossible",
                error instanceof Error ? error.message : "Merci de reessayer."
              );
            }
          }
        }
      ]
    );
  };

  return (
    <Screen
      title={subscription.providerName}
      subtitle="Le detail de la facturation, des signaux d'usage et des actions disponibles."
      action={<PrimaryButton title="Retour" onPress={navigation.goBack} variant="secondary" />}
    >
      <View
        style={[
          styles.hero,
          isCompact ? styles.heroCompact : null,
          isTablet ? styles.heroTablet : null
        ]}
      >
        <ServiceLogo providerName={subscription.providerName} size={76} />
        <View style={styles.heroText}>
          <Text style={styles.amount}>
            {formatCurrency(subscription.price, subscription.currency)}
          </Text>
          <Text style={styles.meta}>{formatBillingFrequency(subscription.billingFrequency)}</Text>
          <Text style={styles.meta}>
            Prochain prelevement : {formatLongDate(subscription.nextBillingDate)}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <DetailRow compact={isCompact} label="Categorie" value={subscription.categoryName} />
        <DetailRow compact={isCompact} label="Statut" value={formatStatus(subscription.status)} />
        <DetailRow
          compact={isCompact}
          label="Rappel"
          value={formatReminderDays(subscription.reminderDaysBefore)}
        />
        <DetailRow
          compact={isCompact}
          label="Derniere utilisation"
          value={subscription.lastUsedAt ? formatLongDate(subscription.lastUsedAt) : "Non renseignee"}
        />
        <DetailRow compact={isCompact} label="Usage" value={formatUsageCheckIn(subscription.usageCheckIn)} />
        <DetailRow compact={isCompact} label="Notes" value={subscription.notes || "Aucune note"} />
      </View>

      <View style={[styles.actions, isTablet ? styles.actionsTablet : null]}>
        <PrimaryButton
          title="Modifier"
          onPress={() =>
            navigation.navigate("AddSubscription", {
              subscriptionId: subscription.id
            })
          }
        />
        <PrimaryButton title="Archiver" onPress={handleArchive} variant="secondary" />
      </View>
    </Screen>
  );
}

function DetailRow({
  label,
  value,
  compact = false
}: {
  label: string;
  value: string;
  compact?: boolean;
}): JSX.Element {
  return (
    <View style={[styles.row, compact ? styles.rowCompact : null]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, compact ? styles.rowValueCompact : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center"
  },
  heroCompact: {
    alignItems: "flex-start",
    flexDirection: "column"
  },
  heroTablet: {
    padding: spacing.xxl
  },
  heroText: {
    flex: 1,
    gap: spacing.xs
  },
  amount: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.textPrimary
  },
  meta: {
    fontSize: 15,
    color: colors.textSecondary
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  rowCompact: {
    flexDirection: "column"
  },
  rowLabel: {
    fontSize: 14,
    color: colors.textSecondary
  },
  rowValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary
  },
  rowValueCompact: {
    textAlign: "left"
  },
  actions: {
    gap: spacing.md
  },
  actionsTablet: {
    flexDirection: "row"
  }
});
