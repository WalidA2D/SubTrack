import { Alert, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAppTranslation } from "../../i18n";
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
  const { locale } = useAppTranslation();
  const isFrench = locale === "fr";
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
  const copy = {
    notFoundTitle: isFrench ? "Abonnement introuvable" : "Subscription not found",
    notFoundSubtitle: isFrench
      ? "Reviens a la liste pour recharger les donnees."
      : "Go back to the list to reload the data.",
    back: isFrench ? "Retour" : "Back",
    notFoundBody: isFrench
      ? "L'abonnement selectionne n'est plus disponible."
      : "The selected subscription is no longer available.",
    archiveTitle: isFrench ? "Archiver l'abonnement ?" : "Archive subscription?",
    archiveBody: isFrench
      ? "Il disparaitra de la liste active mais restera trace dans l'historique Firestore."
      : "It will disappear from the active list but stay recorded in Firestore history.",
    cancel: isFrench ? "Annuler" : "Cancel",
    archive: isFrench ? "Archiver" : "Archive",
    archiveFailed: isFrench ? "Archivage impossible" : "Unable to archive",
    subtitle: isFrench
      ? "Le detail de la facturation, des signaux d'usage et des actions disponibles."
      : "Billing details, usage signals and available actions.",
    nextCharge: isFrench ? "Prochain prelevement" : "Next charge",
    category: isFrench ? "Categorie" : "Category",
    status: isFrench ? "Statut" : "Status",
    trialEnd: isFrench ? "Fin de l'essai" : "Trial end",
    reminder: isFrench ? "Rappel" : "Reminder",
    lastUse: isFrench ? "Derniere utilisation" : "Last usage",
    notProvided: isFrench ? "Non renseignee" : "Not provided",
    usage: isFrench ? "Usage" : "Usage",
    notes: isFrench ? "Notes" : "Notes",
    noNotes: isFrench ? "Aucune note" : "No notes",
    linkedSubscription: isFrench ? "Abonnement lie" : "Linked subscription",
    linkedHint: isFrench
      ? "Cet abonnement est actuellement couvert ou rattache a :"
      : "This subscription is currently covered or linked to:",
    includedServices: isFrench ? "Services inclus" : "Included services",
    includedHint: isFrench
      ? "Ces services sont compris dans cet abonnement et peuvent faire partie de ses avantages."
      : "These services are included in this subscription and may be part of its benefits.",
    edit: isFrench ? "Modifier" : "Edit"
  };

  if (!subscription) {
    return (
      <Screen
        title={copy.notFoundTitle}
        subtitle={copy.notFoundSubtitle}
        action={<PrimaryButton title={copy.back} onPress={navigation.goBack} variant="secondary" />}
      >
        <View style={styles.card}>
          <Text style={styles.rowValue}>{copy.notFoundBody}</Text>
        </View>
      </Screen>
    );
  }

  const handleArchive = () => {
    Alert.alert(
      copy.archiveTitle,
      copy.archiveBody,
      [
        { text: copy.cancel, style: "cancel" },
        {
          text: copy.archive,
          style: "destructive",
          onPress: async () => {
            try {
              await archiveSubscription(subscription.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                copy.archiveFailed,
                error instanceof Error ? error.message : (isFrench ? "Merci de reessayer." : "Please try again.")
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
      subtitle={copy.subtitle}
      action={<PrimaryButton title={copy.back} onPress={navigation.goBack} variant="secondary" />}
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
            {copy.nextCharge} : {formatLongDate(subscription.nextBillingDate)}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <DetailRow compact={isCompact} label={copy.category} value={subscription.categoryName} />
        <DetailRow compact={isCompact} label={copy.status} value={formatStatus(subscription.status)} />
        {subscription.trialEndsAt ? (
          <DetailRow
            compact={isCompact}
            label={copy.trialEnd}
            value={formatLongDate(subscription.trialEndsAt)}
          />
        ) : null}
        <DetailRow
          compact={isCompact}
          label={copy.reminder}
          value={formatReminderDays(subscription.reminderDaysBefore)}
        />
        <DetailRow
          compact={isCompact}
          label={copy.lastUse}
          value={subscription.lastUsedAt ? formatLongDate(subscription.lastUsedAt) : copy.notProvided}
        />
        <DetailRow compact={isCompact} label={copy.usage} value={formatUsageCheckIn(subscription.usageCheckIn)} />
        <DetailRow compact={isCompact} label={copy.notes} value={subscription.notes || copy.noNotes} />
      </View>

      {linkedParentSubscriptions.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{copy.linkedSubscription}</Text>
          <Text style={styles.sectionHint}>{copy.linkedHint}</Text>
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
          <Text style={styles.sectionTitle}>{copy.includedServices}</Text>
          <Text style={styles.sectionHint}>{copy.includedHint}</Text>
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
          title={copy.edit}
          onPress={() =>
            navigation.navigate("AddSubscription", {
              subscriptionId: subscription.id
            })
          }
        />
        <PrimaryButton title={copy.archive} onPress={handleArchive} variant="secondary" />
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
