import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SubscriptionStatus } from "@subly/shared";

import { PrimaryButton } from "../../components/PrimaryButton";
import { PromoCard } from "../../components/PromoCard";
import { Screen } from "../../components/Screen";
import { SubscriptionListItem } from "../../components/SubscriptionListItem";
import { isPremiumPlan } from "../../constants/premium";
import { useAppTranslation } from "../../i18n";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { AppTheme, radius, shadows, spacing, useAppTheme } from "../../theme";
import {
  buildSubscriptionDisplayEntries,
  sortSubscriptionDisplayEntries
} from "../../utils/subscriptionLinks";
import { formatCurrency } from "../../utils/format";

type StatusFilter = "all" | SubscriptionStatus;
type SortOption = "next_billing" | "price_desc" | "price_asc" | "provider";
type LinkFilter = "primary" | "included" | "all";
type DisplayEntry = ReturnType<typeof buildSubscriptionDisplayEntries>[number];
type ListSection = {
  key: string;
  title: string;
  subtitle: string;
  entries: DisplayEntry[];
};

const DUE_SOON_DAYS = 7;
const STATUS_FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "Tous" },
  { id: "active", label: "Actifs" },
  { id: "trial", label: "Essais" },
  { id: "cancelled", label: "Annules" }
];
const SORT_OPTIONS: Array<{ id: SortOption; label: string }> = [
  { id: "next_billing", label: "Proche" },
  { id: "price_desc", label: "Prix decroissant" },
  { id: "price_asc", label: "Prix croissant" },
  { id: "provider", label: "A-Z" }
];
const LINK_FILTERS: Array<{ id: LinkFilter; label: string }> = [
  { id: "primary", label: "Principaux" },
  { id: "included", label: "Inclus" },
  { id: "all", label: "Tous" }
];

export function SubscriptionListScreen(): JSX.Element {
  const navigation = useAppNavigation();
  const theme = useAppTheme();
  const { locale, t } = useAppTranslation();
  const styles = createStyles(theme);
  const isFrench = locale === "fr";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("next_billing");
  const [linkFilter, setLinkFilter] = useState<LinkFilter>("primary");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [archivingSubscriptionId, setArchivingSubscriptionId] = useState<string | null>(null);
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const dashboard = useWorkspaceStore((state) => state.dashboard);
  const profile = useWorkspaceStore((state) => state.profile);
  const isPremium = isPremiumPlan(profile);
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const archiveSubscription = useWorkspaceStore((state) => state.archiveSubscription);
  const currency = profile?.currency ?? "EUR";
  const statusFilters = [
    { id: "all" as const, label: isFrench ? "Tous" : "All" },
    { id: "active" as const, label: isFrench ? "Actifs" : "Active" },
    { id: "trial" as const, label: isFrench ? "Essais" : "Trials" },
    { id: "cancelled" as const, label: isFrench ? "Annules" : "Cancelled" }
  ];
  const sortOptions = [
    { id: "next_billing" as const, label: isFrench ? "Proche" : "Soonest" },
    { id: "price_desc" as const, label: isFrench ? "Prix decroissant" : "Highest price" },
    { id: "price_asc" as const, label: isFrench ? "Prix croissant" : "Lowest price" },
    { id: "provider" as const, label: "A-Z" }
  ];
  const linkFilters = [
    { id: "primary" as const, label: isFrench ? "Principaux" : "Primary" },
    { id: "included" as const, label: isFrench ? "Inclus" : "Included" },
    { id: "all" as const, label: isFrench ? "Tous" : "All" }
  ];
  const copy = {
    subtitle: isFrench
      ? "Trie, filtre et regroupe tes abonnements pour reperer plus vite ce qui merite une action."
      : "Sort, filter and group your subscriptions to spot faster what needs action.",
    portfolio: isFrench ? "Portefeuille" : "Portfolio",
    visibleSubscriptions: isFrench ? "abonnement(s) visibles" : "visible subscription(s)",
    currentSelection: isFrench ? "sur la selection courante" : "on the current selection",
    toWatch: isFrench ? "A surveiller" : "To watch",
    inNextDays: isFrench
      ? `dans les ${DUE_SOON_DAYS} prochains jours`
      : `in the next ${DUE_SOON_DAYS} days`,
    trials: isFrench ? "Essais" : "Trials",
    stillActive: isFrench ? "encore actifs" : "still active",
    freePlan: isFrench ? "Plan gratuit" : "Free plan",
    sponsoredCard: isFrench ? "Carte sponsorisee" : "Sponsored card",
    sponsoredBody: isFrench
      ? "Le plan gratuit peut afficher des cartes sponsorisees dans les vues de pilotage. Le Premium retire ces emplacements."
      : "The free plan may display sponsored cards in management views. Premium removes them.",
    goPremium: isFrench ? "Passer au Premium" : "Go Premium",
    exportPdf: isFrench ? "Exporter PDF" : "Export PDF",
    exportHint: isFrench
      ? "Rapport premium filtre et propre"
      : "Filtered premium report",
    premiumTitle: isFrench ? "Disponible avec Premium" : "Available with Premium",
    premiumLater: isFrench ? "Plus tard" : "Later",
    viewPremium: isFrench ? "Voir Premium" : "See Premium",
    exportFeature: isFrench ? "L'export PDF des abonnements" : "PDF export for subscriptions",
    display: isFrench ? "Affichage" : "Display",
    status: isFrench ? "Statut" : "Status",
    sort: isFrench ? "Tri" : "Sort",
    category: isFrench ? "Categorie" : "Category",
    reset: isFrench ? "Reinitialiser" : "Reset",
    allCategories: isFrench ? "Toutes" : "All",
    organizedView: isFrench ? "Vue organisee" : "Organized view",
    sortLabel: isFrench ? "Tri" : "Sort",
    filterHint: isFrench
      ? "Essaie un autre filtre ou reinitialise la selection courante."
      : "Try another filter or reset the current selection.",
    resetFilters: isFrench ? "Reinitialiser les filtres" : "Reset filters"
  };

  const subscriptionEntries = useMemo(
    () => sortSubscriptionDisplayEntries(buildSubscriptionDisplayEntries(subscriptions)),
    [subscriptions]
  );
  const categoryOptions = useMemo(() => {
    const names = [...new Set(subscriptions.map((subscription) => subscription.categoryName))];
    return ["all", ...names.sort((left, right) => left.localeCompare(right, "fr"))];
  }, [subscriptions]);
  const filteredSubscriptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const nextEntries = subscriptionEntries.filter((entry) => {
      const { subscription, linkedParentProviderNames } = entry;
      const hasLinkedParent = hasParentLink(entry);

      if (linkFilter === "primary" && hasLinkedParent) {
        return false;
      }

      if (linkFilter === "included" && !hasLinkedParent) {
        return false;
      }

      if (statusFilter !== "all" && subscription.status !== statusFilter) {
        return false;
      }

      if (categoryFilter !== "all" && subscription.categoryName !== categoryFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [subscription.providerName, subscription.categoryName, ...(linkedParentProviderNames ?? [])]
        .some((value) => value.toLowerCase().includes(query));
    });

    return [...nextEntries].sort((left, right) => {
      if (sortOption === "price_desc") {
        return right.subscription.priceMonthly - left.subscription.priceMonthly;
      }

      if (sortOption === "price_asc") {
        return left.subscription.priceMonthly - right.subscription.priceMonthly;
      }

      if (sortOption === "provider") {
        return left.subscription.providerName.localeCompare(right.subscription.providerName, "fr");
      }

      return (
        new Date(left.subscription.nextBillingDate).getTime() -
        new Date(right.subscription.nextBillingDate).getTime()
      );
    });
  }, [categoryFilter, linkFilter, search, sortOption, statusFilter, subscriptionEntries]);
  const hasActiveFilters =
    search.trim().length > 0 ||
    statusFilter !== "all" ||
    sortOption !== "next_billing" ||
    categoryFilter !== "all" ||
    linkFilter !== "primary";
  const activeSortLabel =
    sortOptions.find((option) => option.id === sortOption)?.label ??
    (isFrench ? "Proche" : "Soonest");
  const dueSoonCount = filteredSubscriptions.filter(
    (entry) =>
      !hasParentLink(entry) &&
      entry.subscription.status !== "trial" &&
      isDateDueSoon(entry.subscription.nextBillingDate, DUE_SOON_DAYS)
  ).length;
  const trialCount = filteredSubscriptions.filter((entry) => entry.subscription.status === "trial")
    .length;
  const monthlyTotal = filteredSubscriptions.reduce(
    (sum, entry) => sum + (entry.isIncludedLink ? 0 : entry.subscription.priceMonthly),
    0
  );
  const sections = useMemo(
    () => buildSections(filteredSubscriptions, statusFilter, linkFilter, isFrench),
    [filteredSubscriptions, isFrench, linkFilter, statusFilter]
  );

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

  const handleOpenPdfExport = () => {
    if (isPremium) {
      navigation.navigate("SubscriptionPdfExport");
      return;
    }

    Alert.alert(copy.premiumTitle, `${copy.exportFeature} ${isFrench ? "fait partie des avantages Premium." : "is part of Premium benefits."}`, [
      {
        text: copy.premiumLater,
        style: "cancel"
      },
      {
        text: copy.viewPremium,
        onPress: () => navigation.navigate("Profile")
      }
    ]);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortOption("next_billing");
    setLinkFilter("primary");
    setCategoryFilter("all");
  };

  return (
    <Screen
      title={t("subscriptions.title")}
      subtitle={copy.subtitle}
      action={<PrimaryButton title={t("common.back")} onPress={navigation.goBack} variant="secondary" />}
    >
      <View style={styles.heroRow}>
        <View style={styles.heroMetric}>
          <Text style={styles.heroLabel}>{copy.portfolio}</Text>
          <Text style={styles.heroValue}>{filteredSubscriptions.length}</Text>
          <Text style={styles.heroMeta}>{copy.visibleSubscriptions}</Text>
        </View>
        <View style={styles.heroMetric}>
          <Text style={styles.heroLabel}>{t("subscriptions.monthly")}</Text>
          <Text style={styles.heroValue}>{formatCurrency(monthlyTotal, currency)}</Text>
          <Text style={styles.heroMeta}>{copy.currentSelection}</Text>
        </View>
      </View>

      <View style={styles.heroRow}>
        <View style={styles.heroMetricMuted}>
          <Text style={styles.heroLabel}>{copy.toWatch}</Text>
          <Text style={styles.heroValueCompact}>{dueSoonCount}</Text>
          <Text style={styles.heroMeta}>{copy.inNextDays}</Text>
        </View>
        <View style={styles.heroMetricMuted}>
          <Text style={styles.heroLabel}>{copy.trials}</Text>
          <Text style={styles.heroValueCompact}>{trialCount}</Text>
          <Text style={styles.heroMeta}>{copy.stillActive}</Text>
        </View>
      </View>

      {!isPremium ? (
        <PromoCard
          eyebrow={copy.freePlan}
          title={copy.sponsoredCard}
          body={copy.sponsoredBody}
          ctaLabel={copy.goPremium}
          onPress={() => navigation.navigate("Profile")}
        />
      ) : null}

      <View style={styles.searchRow}>
        <TextInput
          placeholder={t("subscriptions.searchPlaceholder")}
          placeholderTextColor={theme.colors.textSecondary}
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />
        <Pressable style={styles.addButton} onPress={() => navigation.navigate("AddSubscription")}>
          <Text style={styles.addButtonLabel}>{t("subscriptions.add")}</Text>
        </Pressable>
      </View>

      <View style={styles.exportRow}>
        <Pressable style={styles.exportButton} onPress={handleOpenPdfExport}>
          <Text style={styles.exportButtonLabel}>{copy.exportPdf}</Text>
          <Text style={styles.exportButtonHint}>{copy.exportHint}</Text>
        </Pressable>
      </View>

      <View style={styles.filterBlock}>
        <Text style={styles.filterTitle}>{copy.display}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {linkFilters.map((option) => {
            const isActive = linkFilter === option.id;

            return (
              <Pressable
                key={option.id}
                onPress={() => setLinkFilter(option.id)}
                style={[styles.filterChip, isActive ? styles.filterChipActive : null]}
              >
                <Text
                  style={[
                    styles.filterChipLabel,
                    isActive ? styles.filterChipLabelActive : null
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.filterBlock}>
        <Text style={styles.filterTitle}>{copy.status}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {statusFilters.map((option) => {
            const isActive = statusFilter === option.id;

            return (
              <Pressable
                key={option.id}
                onPress={() => setStatusFilter(option.id)}
                style={[styles.filterChip, isActive ? styles.filterChipActive : null]}
              >
                <Text
                  style={[
                    styles.filterChipLabel,
                    isActive ? styles.filterChipLabelActive : null
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.filterBlock}>
        <Text style={styles.filterTitle}>{copy.sort}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {sortOptions.map((option) => {
            const isActive = sortOption === option.id;

            return (
              <Pressable
                key={option.id}
                onPress={() => setSortOption(option.id)}
                style={[styles.filterChip, isActive ? styles.filterChipActive : null]}
              >
                <Text
                  style={[
                    styles.filterChipLabel,
                    isActive ? styles.filterChipLabelActive : null
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.filterBlock}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>{copy.category}</Text>
          {hasActiveFilters ? (
            <Pressable onPress={resetFilters}>
              <Text style={styles.clearFilters}>{copy.reset}</Text>
            </Pressable>
          ) : null}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {categoryOptions.map((option) => {
            const isActive = categoryFilter === option;
            const label = option === "all" ? copy.allCategories : option;

            return (
              <Pressable
                key={option}
                onPress={() => setCategoryFilter(option)}
                style={[styles.filterChip, isActive ? styles.filterChipActive : null]}
              >
                <Text
                  style={[
                    styles.filterChipLabel,
                    isActive ? styles.filterChipLabelActive : null
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{copy.organizedView}</Text>
        <Text style={styles.sectionMeta}>{copy.sortLabel} : {activeSortLabel}</Text>
      </View>

      <View style={styles.list}>
        {filteredSubscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {isLoading ? t("subscriptions.loading") : t("subscriptions.empty")}
            </Text>
            <Text style={styles.emptyBody}>
              {hasActiveFilters
                ? copy.filterHint
                : t("subscriptions.tryOther")}
            </Text>
            {hasActiveFilters ? (
              <PrimaryButton title={copy.resetFilters} onPress={resetFilters} variant="secondary" />
            ) : null}
          </View>
        ) : (
          sections.map((section) => (
            <View key={section.key} style={styles.sectionCard}>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionCardTitle}>{section.title}</Text>
                <Text style={styles.sectionCardSubtitle}>{section.subtitle}</Text>
              </View>
              <View style={styles.sectionItems}>
                {section.entries.map((entry) => (
                  <SubscriptionListItem
                    key={entry.id}
                    subscription={entry.subscription}
                    isIncludedLink={entry.isIncludedLink}
                    linkedParentProviderNames={entry.linkedParentProviderNames}
                    linkedParentSubscriptions={entry.linkedParentSubscriptions}
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
                ))}
              </View>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}

function buildSections(
  entries: DisplayEntry[],
  statusFilter: StatusFilter,
  linkFilter: LinkFilter,
  isFrench: boolean
): ListSection[] {
  const includedEntries = entries.filter((entry) => hasParentLink(entry));
  const primaryEntries = entries.filter((entry) => !hasParentLink(entry));

  if (linkFilter === "included") {
    return [
      {
        key: "included",
        title: isFrench ? "Abonnements inclus" : "Included subscriptions",
        subtitle: isFrench
          ? `${includedEntries.length} abonnement(s) relies a une offre principale`
          : `${includedEntries.length} subscription(s) linked to a main offer`,
        entries: includedEntries
      }
    ];
  }

  if (statusFilter === "trial") {
    const trialSection: ListSection = {
      key: "trial",
      title: isFrench ? "Essais gratuits" : "Free trials",
      subtitle: isFrench
        ? `${entries.length} abonnement(s) en cours de conversion`
        : `${entries.length} subscription(s) in conversion`,
      entries
    };

    if (linkFilter !== "all" || includedEntries.length === 0) {
      return [trialSection];
    }

    return [
      {
        ...trialSection,
        entries: primaryEntries
      },
      {
        key: "included_trial",
        title: isFrench ? "Inclus relies" : "Linked included services",
        subtitle: isFrench
          ? `${includedEntries.length} abonnement(s) rattaches a une autre offre`
          : `${includedEntries.length} subscription(s) attached to another offer`,
        entries: includedEntries
      }
    ].filter((section) => section.entries.length > 0);
  }

  if (statusFilter === "cancelled") {
    const cancelledSection: ListSection = {
      key: "cancelled",
      title: isFrench ? "Abonnements annules" : "Cancelled subscriptions",
      subtitle: isFrench
        ? `${entries.length} abonnement(s) conserves pour suivi`
        : `${entries.length} subscription(s) kept for tracking`,
      entries
    };

    if (linkFilter !== "all" || includedEntries.length === 0) {
      return [cancelledSection];
    }

    return [
      {
        ...cancelledSection,
        entries: primaryEntries
      },
      {
        key: "included_cancelled",
        title: isFrench ? "Inclus relies" : "Linked included services",
        subtitle: isFrench
          ? `${includedEntries.length} abonnement(s) rattaches a une autre offre`
          : `${includedEntries.length} subscription(s) attached to another offer`,
        entries: includedEntries
      }
    ].filter((section) => section.entries.length > 0);
  }

  const trialEntries = primaryEntries.filter((entry) => entry.subscription.status === "trial");
  const dueSoonEntries = primaryEntries.filter(
    (entry) =>
      entry.subscription.status !== "trial" &&
      isDateDueSoon(entry.subscription.nextBillingDate, DUE_SOON_DAYS)
  );
  const remainingEntries = primaryEntries.filter(
    (entry) => !trialEntries.includes(entry) && !dueSoonEntries.includes(entry)
  );
  const sections: ListSection[] = [
    {
      key: "due_soon",
      title: isFrench ? "A payer bientot" : "Pay soon",
      subtitle: isFrench
        ? `${dueSoonEntries.length} abonnement(s) dans les ${DUE_SOON_DAYS} jours`
        : `${dueSoonEntries.length} subscription(s) within ${DUE_SOON_DAYS} days`,
      entries: dueSoonEntries
    },
    {
      key: "trial",
      title: isFrench ? "Essais gratuits" : "Free trials",
      subtitle: isFrench
        ? `${trialEntries.length} abonnement(s) a confirmer`
        : `${trialEntries.length} subscription(s) to confirm`,
      entries: trialEntries
    },
    {
      key: "other",
      title: isFrench ? "Reste du portefeuille" : "Rest of portfolio",
      subtitle: isFrench
        ? `${remainingEntries.length} abonnement(s) classes`
        : `${remainingEntries.length} subscription(s) sorted`,
      entries: remainingEntries
    }
  ];

  if (linkFilter === "all" && includedEntries.length > 0) {
    sections.push({
      key: "included",
      title: isFrench ? "Abonnements inclus" : "Included subscriptions",
      subtitle: isFrench
        ? `${includedEntries.length} abonnement(s) relies a une autre offre`
        : `${includedEntries.length} subscription(s) linked to another offer`,
      entries: includedEntries
    });
  }

  return sections.filter((section) => section.entries.length > 0);
}

function hasParentLink(entry: Pick<DisplayEntry, "isIncludedLink" | "linkedParentSubscriptionIds">) {
  return entry.isIncludedLink || (entry.linkedParentSubscriptionIds?.length ?? 0) > 0;
}

function isDateDueSoon(dateString: string, days: number): boolean {
  const now = Date.now();
  const dueTime = new Date(dateString).getTime();
  const diff = dueTime - now;

  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
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
      borderColor: theme.colors.borderStrong,
      padding: spacing.md,
      gap: 6
    },
    heroMetricMuted: {
      flex: 1,
      backgroundColor: theme.colors.surface,
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
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    heroValueCompact: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    heroMeta: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.colors.textSecondary
    },
    searchRow: {
      flexDirection: "row",
      gap: spacing.sm
    },
    exportRow: {
      alignItems: "flex-end"
    },
    search: {
      flex: 1,
      minHeight: 54,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 18,
      paddingHorizontal: spacing.md,
      fontSize: 16,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surfaceRaised
    },
    addButton: {
      minWidth: 110,
      minHeight: 54,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.warning
    },
    addButtonLabel: {
      fontSize: 14,
      fontWeight: "800",
      color: "#241602"
    },
    exportButton: {
      minHeight: 48,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 18,
      alignItems: "flex-start",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      ...shadows.card
    },
    exportButtonLabel: {
      fontSize: 13,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    exportButtonHint: {
      marginTop: 2,
      fontSize: 11,
      color: theme.colors.textSecondary
    },
    filterBlock: {
      gap: spacing.sm
    },
    filterHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md
    },
    filterTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    clearFilters: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.primary
    },
    filterRow: {
      gap: spacing.sm,
      paddingRight: spacing.lg
    },
    filterChip: {
      paddingHorizontal: spacing.md,
      minHeight: 38,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    filterChipActive: {
      backgroundColor: theme.colors.surfaceContrast,
      borderColor: theme.colors.primary
    },
    filterChipLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.textSecondary
    },
    filterChipLabelActive: {
      color: theme.colors.primary
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
    sectionMeta: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      color: theme.colors.primary
    },
    list: {
      gap: spacing.md
    },
    sectionCard: {
      gap: spacing.md,
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: spacing.md
    },
    sectionHeading: {
      gap: 4
    },
    sectionCardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    sectionCardSubtitle: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.textSecondary
    },
    sectionItems: {
      gap: spacing.md
    },
    emptyState: {
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: 18,
      padding: spacing.lg,
      gap: spacing.sm,
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
      lineHeight: 20,
      color: theme.colors.textSecondary
    }
  });
