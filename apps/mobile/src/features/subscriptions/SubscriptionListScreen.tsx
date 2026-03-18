import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { SubscriptionListItem } from "../../components/SubscriptionListItem";
import { useAppTranslation } from "../../i18n";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { AppTheme, radius, spacing, useAppTheme } from "../../theme";
import {
  buildSubscriptionDisplayEntries,
  sortSubscriptionDisplayEntries
} from "../../utils/subscriptionLinks";
import { formatCurrency } from "../../utils/format";

export function SubscriptionListScreen(): JSX.Element {
  const navigation = useAppNavigation();
  const theme = useAppTheme();
  const { t } = useAppTranslation();
  const styles = createStyles(theme);
  const [search, setSearch] = useState("");
  const [archivingSubscriptionId, setArchivingSubscriptionId] = useState<string | null>(null);
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const dashboard = useWorkspaceStore((state) => state.dashboard);
  const profile = useWorkspaceStore((state) => state.profile);
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const archiveSubscription = useWorkspaceStore((state) => state.archiveSubscription);
  const currency = profile?.currency ?? "EUR";

  const subscriptionEntries = useMemo(
    () => sortSubscriptionDisplayEntries(buildSubscriptionDisplayEntries(subscriptions)),
    [subscriptions]
  );

  const filteredSubscriptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return subscriptionEntries;
    }

    return subscriptionEntries.filter(({ subscription, linkedParentProviderNames }) =>
      [subscription.providerName, ...(linkedParentProviderNames ?? [])].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [search, subscriptionEntries]);

  const handleArchiveSubscription = async (subscriptionId: string) => {
    if (archivingSubscriptionId) {
      return;
    }

    setArchivingSubscriptionId(subscriptionId);

    try {
      await archiveSubscription(subscriptionId);
    } catch {
      // The workspace store already exposes the error state if archiving fails.
    } finally {
      setArchivingSubscriptionId((current) =>
        current === subscriptionId ? null : current
      );
    }
  };

  return (
    <Screen
      title={t("subscriptions.title")}
      subtitle={t("subscriptions.subtitle")}
      action={<PrimaryButton title={t("common.back")} onPress={navigation.goBack} variant="secondary" />}
    >
      <View style={styles.heroRow}>
        <View style={styles.heroMetric}>
          <Text style={styles.heroLabel}>{t("subscriptions.active")}</Text>
          <Text style={styles.heroValue}>{subscriptions.length}</Text>
        </View>
        <View style={styles.heroMetric}>
          <Text style={styles.heroLabel}>{t("subscriptions.monthly")}</Text>
          <Text style={styles.heroValue}>
            {formatCurrency(dashboard?.monthlySpending ?? 0, currency)}
          </Text>
        </View>
      </View>

      <TextInput
        placeholder={t("subscriptions.searchPlaceholder")}
        placeholderTextColor={theme.colors.textSecondary}
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("subscriptions.all")}</Text>
        <Pressable onPress={() => navigation.navigate("AddSubscription")}>
          <Text style={styles.sectionAction}>{t("subscriptions.add")}</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {filteredSubscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {isLoading ? t("subscriptions.loading") : t("subscriptions.empty")}
            </Text>
            <Text style={styles.emptyBody}>{t("subscriptions.tryOther")}</Text>
          </View>
        ) : (
          filteredSubscriptions.map((entry) => (
            <SubscriptionListItem
              key={entry.id}
              subscription={entry.subscription}
              isIncludedLink={entry.isIncludedLink}
              linkedParentProviderNames={entry.linkedParentProviderNames}
              onArchive={
                entry.isIncludedLink
                  ? undefined
                  : () => handleArchiveSubscription(entry.subscription.id)
              }
              archiveLabel={t("subscriptions.archive")}
              archiveLoadingLabel={t("subscriptions.archiving")}
              isArchiving={!entry.isIncludedLink && archivingSubscriptionId === entry.subscription.id}
              onPress={() =>
                navigation.navigate("SubscriptionDetails", {
                  subscriptionId:
                    entry.isIncludedLink
                      ? entry.linkedParentSubscriptionIds?.[0] ?? entry.subscription.id
                      : entry.subscription.id
                })
              }
            />
          ))
        )}
      </View>
    </Screen>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    heroRow: {
      flexDirection: "row",
      gap: spacing.md
    },
    heroMetric: {
      flex: 1,
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: spacing.md,
      gap: 6
    },
    heroLabel: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      color: theme.colors.textTertiary
    },
    heroValue: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    search: {
      minHeight: 54,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 18,
      paddingHorizontal: spacing.md,
      fontSize: 16,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surfaceRaised
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
      color: theme.colors.textPrimary
    },
    sectionAction: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.primary
    },
    list: {
      gap: spacing.md
    },
    emptyState: {
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: 18,
      padding: spacing.lg,
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    emptyBody: {
      fontSize: 14,
      color: theme.colors.textSecondary
    }
  });
