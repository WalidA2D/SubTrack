import { Alert, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { ServiceLogo } from "../../components/ServiceLogo";
import { useAppNavigation, useCurrentOverlayRoute } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { AppTheme, radius, spacing, useAppTheme } from "../../theme";
import { getLinkedParentSubscriptions } from "../../utils/subscriptionLinks";
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
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const route = useCurrentOverlayRoute();
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const archiveSubscription = useWorkspaceStore((state) => state.archiveSubscription);
  const subscription =
    subscriptions.find(
      (item) =>
        route?.name === "SubscriptionDetails" &&
        item.id === route.params.subscriptionId
    ) ?? null;
  const linkedParentSubscriptions = subscription
    ? getLinkedParentSubscriptions(subscription, subscriptions)
    : [];

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
        <ServiceLogo
          providerName={subscription.providerName}
          logoMode={subscription.logoMode}
          size={76}
        />
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
        {subscription.trialEndsAt ? (
          <DetailRow
            compact={isCompact}
            label="Fin de l'essai"
            value={formatLongDate(subscription.trialEndsAt)}
          />
        ) : null}
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

      {linkedParentSubscriptions.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Abonnement lie</Text>
          <Text style={styles.sectionHint}>
            Cet abonnement est actuellement couvert ou rattache a :
          </Text>
          <View style={styles.includedWrap}>
            {linkedParentSubscriptions.map((parentSubscription) => (
              <View key={parentSubscription.id} style={styles.includedChip}>
                <ServiceLogo
                  providerName={parentSubscription.providerName}
                  logoMode={parentSubscription.logoMode}
                  size={30}
                />
                <Text style={styles.includedLabel}>{parentSubscription.providerName}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {(subscription.includedProviderNames?.length ?? 0) > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Services inclus</Text>
          <Text style={styles.sectionHint}>
            Ces services sont compris dans cet abonnement et peuvent faire partie de ses avantages.
          </Text>
          <View style={styles.includedWrap}>
            {(subscription.includedProviderNames ?? []).map((providerName) => (
              <View key={providerName} style={styles.includedChip}>
                <ServiceLogo providerName={providerName} size={30} />
                <Text style={styles.includedLabel}>{providerName}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

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
  const styles = createStyles(useAppTheme());

  return (
    <View style={[styles.row, compact ? styles.rowCompact : null]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, compact ? styles.rowValueCompact : null]}>{value}</Text>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  hero: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    color: theme.colors.textPrimary
  },
  meta: {
    fontSize: 15,
    color: theme.colors.textSecondary
  },
  card: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textSecondary
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
    color: theme.colors.textSecondary
  },
  rowValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textPrimary
  },
  rowValueCompact: {
    textAlign: "left"
  },
  includedWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  includedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 42,
    maxWidth: "100%",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceContrast,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong
  },
  includedLabel: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary
  },
  actions: {
    gap: spacing.md
  },
  actionsTablet: {
    flexDirection: "row"
  }
});
