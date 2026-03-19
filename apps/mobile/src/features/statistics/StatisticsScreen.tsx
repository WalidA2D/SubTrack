import { useMemo, useState } from "react";
import {
  Alert,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { Subscription } from "@subly/shared";

import { HeaderActionButton } from "../../components/HeaderActionButton";
import { PromoCard } from "../../components/PromoCard";
import { Screen } from "../../components/Screen";
import { isPremiumPlan } from "../../constants/premium";
import { useAppTranslation } from "../../i18n";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { AppTheme, radius, shadows, spacing, useAppTheme } from "../../theme";
import {
  formatCurrency,
  formatLongDate,
  formatMonthLabel,
  formatUsageCheckIn
} from "../../utils/format";

type CategorySlice = {
  categoryId: string;
  categoryName: string;
  amountMonthly: number;
  percentage: number;
  color: string;
};

type TrendPoint = {
  month: string;
  amount: number;
};

type ChartPoint = {
  x: number;
  y: number;
  label: string;
  amount: number;
};

type StatisticsDrilldown = "active" | "lowUsage" | "topCategory" | null;
type AverageMode = "monthly" | "yearly";
type RankedCategory = CategorySlice & {
  rank: number;
  amountYearly: number;
  subscriptionCount: number;
};
type LowUtilityReason = "unused" | "stale" | "duplicate_provider" | "duplicate_category";
type LowUtilityItem = {
  subscription: Subscription;
  reasons: LowUtilityReason[];
};

export function StatisticsScreen(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const navigation = useAppNavigation();
  const statistics = useWorkspaceStore((state) => state.statistics);
  const { locale, t } = useAppTranslation();
  const isFrench = locale === "fr";
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const profile = useWorkspaceStore((state) => state.profile);
  const isPremium = isPremiumPlan(profile);
  const [selectedDrilldown, setSelectedDrilldown] = useState<StatisticsDrilldown>(null);
  const [averageMode, setAverageMode] = useState<AverageMode>("monthly");
  const currency = profile?.currency ?? "EUR";
  const trackedSubscriptions = useMemo(
    () =>
      subscriptions.filter(
        (subscription) => subscription.status === "active" || subscription.status === "trial"
      ),
    [subscriptions]
  );
  const activeSubscriptions = useMemo(
    () =>
      [...trackedSubscriptions]
        .filter((subscription) => subscription.status === "active")
        .sort((left, right) => right.priceMonthly - left.priceMonthly),
    [trackedSubscriptions]
  );
  const lowUtilityItems = useMemo(
    () => getLowUtilitySubscriptions(trackedSubscriptions),
    [trackedSubscriptions]
  );
  const categorySource = [...(statistics?.byCategory ?? [])].sort(
    (left, right) => right.amountMonthly - left.amountMonthly
  );
  const categoryTotal = categorySource.reduce((sum, item) => sum + item.amountMonthly, 0);
  const categorySubscriptionCounts = useMemo(
    () =>
      trackedSubscriptions.reduce<Record<string, number>>((accumulator, subscription) => {
        accumulator[subscription.categoryId] = (accumulator[subscription.categoryId] ?? 0) + 1;
        return accumulator;
      }, {}),
    [trackedSubscriptions]
  );
  const categoryRanking: RankedCategory[] = categorySource.map((item, index) => ({
    ...item,
    rank: index + 1,
    amountYearly: Number((item.amountMonthly * 12).toFixed(2)),
    subscriptionCount: categorySubscriptionCounts[item.categoryId] ?? 0,
    percentage: categoryTotal > 0 ? item.amountMonthly / categoryTotal : 0,
    color: theme.chartColors[index % theme.chartColors.length]
  }));
  const categoryData: CategorySlice[] = categoryRanking.slice(0, 6).map((item) => ({
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    amountMonthly: item.amountMonthly,
    percentage: item.percentage,
    color: item.color
  }));
  const monthlyTrend = [...(statistics?.monthlyTrend ?? [])]
    .sort((left, right) => left.month.localeCompare(right.month))
    .slice(-6);
  const monthlyAverage =
    monthlyTrend.length > 0
      ? monthlyTrend.reduce((sum, item) => sum + item.amount, 0) / monthlyTrend.length
      : 0;
  const lowUtilityCount = lowUtilityItems.length;
  const biggestSubscription = statistics?.biggestSubscriptions[0];
  const topCategory = categoryRanking[0];
  const trialCount = trackedSubscriptions.filter(
    (subscription) => subscription.status === "trial"
  ).length;
  const averageLabel =
    averageMode === "monthly"
      ? t("statistics.averagePerMonth")
      : isFrench
        ? "Moyenne / an"
        : "Average / year";
  const averageValue =
    averageMode === "monthly" ? monthlyAverage : monthlyAverage * 12;
  const copy = {
    premiumTitle: isFrench ? "Disponible avec Premium" : "Available with Premium",
    later: isFrench ? "Plus tard" : "Later",
    viewPremium: isFrench ? "Voir Premium" : "See Premium",
    activeHelper: isFrench ? "Touchez pour voir la liste" : "Tap to view the list",
    lowUsageHelper: isFrench ? "Touchez pour ouvrir le detail" : "Tap to open details",
    premiumOnly: isFrench ? "Reserve au Premium" : "Premium only",
    switchAnnual: isFrench ? "Touchez pour passer en annuel" : "Tap to switch to yearly",
    switchMonthly: isFrench ? "Touchez pour revenir au mensuel" : "Tap to switch back to monthly",
    totalShare: (percentage: number) =>
      isFrench ? `${percentage}% du total` : `${percentage}% of total`,
    activeListEyebrow: isFrench ? "Liste active" : "Active list",
    lowUsageEyebrow: isFrench ? "A surveiller" : "To watch",
    activeListTitle: isFrench ? "Abonnements actifs" : "Active subscriptions",
    lowUsageTitle: isFrench ? "Abonnements peu utiles" : "Low-utility subscriptions",
    activeListBody: isFrench
      ? "Retrouve ici tous les abonnements actifs et ouvre une fiche en un tap."
      : "Find all active subscriptions here and open a detail sheet in one tap.",
    lowUsageBody: isFrench
      ? "Subly regroupe ici les services peu utilises, redondants ou a verifier."
      : "Subly groups low-usage, redundant or to-review services here.",
    subscriptions: isFrench ? "Abonnements" : "Subscriptions",
    close: isFrench ? "Fermer" : "Close",
    nextDue: isFrench ? "prochaine echeance le" : "next due on",
    noActiveNow: isFrench
      ? "Aucun abonnement actif a afficher pour le moment."
      : "No active subscription to show right now.",
    noLowUsage: isFrench
      ? "Aucun abonnement peu utile detecte sur la selection actuelle."
      : "No low-utility subscription detected in the current selection.",
    categoryRankMeta: (count: number, percentage: number) =>
      isFrench
        ? `${count} abonnement(s) · ${percentage}%`
        : `${count} subscription(s) · ${percentage}%`,
    categoryRankingEmpty: isFrench
      ? "Ajoute quelques abonnements pour construire le classement des categories."
      : "Add a few subscriptions to build the category ranking.",
    perMonth: isFrench ? "/ mois" : "/ month",
    simpleView: isFrench ? "Vue simple" : "Simple view",
    trackedCategories: isFrench ? "Categories suivies" : "Tracked categories",
    currentTrials: isFrench ? "Essais en cours" : "Current trials",
    calendarFeature: isFrench ? "Le calendrier des prelevements" : "The billing calendar",
    lowUsageFeature: isFrench
      ? "La detection des abonnements peu utiles et des doublons"
      : "Low-usage and duplicate detection",
    advancedStatsTitle: isFrench ? "Statistiques avancees" : "Advanced statistics",
    advancedStatsBody: isFrench
      ? "Passe au Premium pour debloquer les graphiques, le podium des categories, le calendrier des prelevements et la detection des doublons."
      : "Upgrade to Premium to unlock charts, category podium, billing calendar and duplicate detection.",
    seePremium: isFrench ? "Voir le Premium" : "See Premium"
  };

  const toggleDrilldown = (nextDrilldown: Exclude<StatisticsDrilldown, null>) => {
    setSelectedDrilldown((current) => (current === nextDrilldown ? null : nextDrilldown));
  };

  const handleOpenPremium = (feature: string) => {
    Alert.alert(copy.premiumTitle, `${feature} ${isFrench ? "fait partie des avantages Premium." : "is part of Premium benefits."}`, [
      {
        text: copy.later,
        style: "cancel"
      },
      {
        text: copy.viewPremium,
        onPress: () => navigation.navigate("Profile")
      }
    ]);
  };

  const statisticsHeaderAction = (
    <View style={styles.headerActionRow}>
      <HeaderActionButton
        kind="notifications"
        size="md"
        onPress={() => navigation.navigate("NotificationCenter")}
      />
      <HeaderActionButton
        kind="calendar"
        size="md"
        onPress={() =>
          isPremium
            ? navigation.navigate("StatisticsCalendar")
            : handleOpenPremium(copy.calendarFeature)
        }
      />
      <HeaderActionButton
        kind="profile"
        size="md"
        onPress={() => navigation.navigate("Profile")}
      />
      <HeaderActionButton
        kind="settings"
        size="md"
        onPress={() => navigation.navigate("Settings")}
      />
    </View>
  );

  return (
    <Screen
      title={t("statistics.title")}
      subtitle={t("statistics.subtitle")}
      action={statisticsHeaderAction}
      headerLayout="stacked"
    >
      <View style={styles.summaryGrid}>
        <SummaryCard
          compactWidth={isCompact}
          label={t("statistics.active")}
          value={String(activeSubscriptions.length)}
          tone="orange"
          onPress={() => toggleDrilldown("active")}
          selected={selectedDrilldown === "active"}
          helper={copy.activeHelper}
        />
        <SummaryCard
          compactWidth={isCompact}
          label={t("statistics.lowUsage")}
          value={isPremium ? String(lowUtilityCount) : "Premium"}
          tone="purple"
          onPress={() =>
            isPremium
              ? toggleDrilldown("lowUsage")
              : handleOpenPremium(copy.lowUsageFeature)
          }
          selected={isPremium && selectedDrilldown === "lowUsage"}
          helper={isPremium ? copy.lowUsageHelper : copy.premiumOnly}
        />
        <SummaryCard
          compactWidth={isCompact}
          label={averageLabel}
          value={formatCurrency(averageValue, currency)}
          tone="green"
          onPress={() =>
            setAverageMode((current) => (current === "monthly" ? "yearly" : "monthly"))
          }
          helper={
            averageMode === "monthly"
              ? copy.switchAnnual
              : copy.switchMonthly
          }
        />
        <SummaryCard
          compactWidth={isCompact}
          label={t("statistics.topCategory")}
          value={isPremium ? topCategory?.categoryName ?? t("statistics.none") : "Premium"}
          tone="red"
          compact
          helper={
            isPremium && topCategory
              ? copy.totalShare(Math.round(topCategory.percentage * 100))
              : copy.premiumOnly
          }
        />
      </View>

      {selectedDrilldown && (selectedDrilldown === "active" || isPremium) ? (
        <View style={styles.card}>
          <View style={[styles.sectionHeader, isCompact ? styles.sectionHeaderCompact : null]}>
            <View style={styles.drilldownHeaderText}>
              <Text style={styles.sectionEyebrow}>
                {selectedDrilldown === "active"
                  ? copy.activeListEyebrow
                  : copy.lowUsageEyebrow}
              </Text>
              <Text style={styles.cardTitle}>
                {selectedDrilldown === "active"
                  ? copy.activeListTitle
                  : copy.lowUsageTitle}
              </Text>
              <Text style={styles.drilldownDescription}>
                {selectedDrilldown === "active"
                  ? copy.activeListBody
                  : copy.lowUsageBody}
              </Text>
            </View>
            <View style={styles.drilldownActions}>
              <MetricPill
                label={copy.subscriptions}
                value={String(
                  selectedDrilldown === "active"
                    ? activeSubscriptions.length
                    : lowUtilityItems.length
                )}
              />
              <Pressable onPress={() => setSelectedDrilldown(null)}>
                <Text style={styles.drilldownDismiss}>{copy.close}</Text>
              </Pressable>
            </View>
          </View>

          {selectedDrilldown === "active" ? (
            activeSubscriptions.length > 0 ? (
              <View style={styles.drilldownList}>
                {activeSubscriptions.map((subscription) => (
                  <SubscriptionDrilldownRow
                    key={subscription.id}
                    subscription={subscription}
                    currency={currency}
                    subtitle={`${subscription.categoryName} · ${copy.nextDue} ${formatLongDate(
                      subscription.nextBillingDate
                    )}`}
                    chips={[formatUsageCheckIn(subscription.usageCheckIn)]}
                    onPress={() =>
                      navigation.navigate("SubscriptionDetails", {
                        subscriptionId: subscription.id
                      })
                    }
                  />
                ))}
              </View>
            ) : (
              <EmptyState message={copy.noActiveNow} />
            )
          ) : null}

          {selectedDrilldown === "lowUsage" ? (
            lowUtilityItems.length > 0 ? (
              <View style={styles.drilldownList}>
                {lowUtilityItems.map((item) => (
                  <SubscriptionDrilldownRow
                    key={item.subscription.id}
                    subscription={item.subscription}
                    currency={currency}
                    subtitle={`${item.subscription.categoryName} · ${buildLowUtilitySubtitle(
                      item.subscription,
                      isFrench
                    )}`}
                    chips={item.reasons.map((reason) =>
                      describeLowUtilityReason(reason, item.subscription.lastUsedAt ?? null, isFrench)
                    )}
                    onPress={() =>
                      navigation.navigate("SubscriptionDetails", {
                        subscriptionId: item.subscription.id
                      })
                    }
                  />
                ))}
              </View>
            ) : (
              <EmptyState message={copy.noLowUsage} />
            )
          ) : null}

          {selectedDrilldown === "topCategory" ? (
            categoryRanking.length > 0 ? (
              <View style={styles.drilldownList}>
                <CategoryPodium
                  compact={isCompact}
                  categories={categoryRanking.slice(0, 3)}
                  currency={currency}
                />
                <View style={styles.categoryRankingList}>
                  {categoryRanking.map((category) => (
                    <View key={category.categoryId} style={styles.categoryRankingRow}>
                      <View style={styles.categoryRankBadge}>
                        <Text style={styles.categoryRankBadgeLabel}>#{category.rank}</Text>
                      </View>
                      <View style={styles.categoryRankingText}>
                        <Text style={styles.categoryRankingTitle}>{category.categoryName}</Text>
                        <Text style={styles.categoryRankingMeta}>
                          {copy.categoryRankMeta(
                            category.subscriptionCount,
                            Math.round(category.percentage * 100)
                          )}
                        </Text>
                      </View>
                      <View style={styles.categoryRankingAmounts}>
                        <Text style={styles.categoryRankingAmount}>
                          {formatCurrency(category.amountMonthly, currency)}
                        </Text>
                        <Text style={styles.categoryRankingAmountMeta}>{copy.perMonth}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <EmptyState message={copy.categoryRankingEmpty} />
            )
          ) : null}
        </View>
      ) : null}

      {isPremium ? (
        <>
          <View style={styles.card}>
            <View style={[styles.sectionHeader, isCompact ? styles.sectionHeaderCompact : null]}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionEyebrow}>{t("statistics.pie")}</Text>
                <Text style={styles.cardTitle}>{t("statistics.spendByCategory")}</Text>
              </View>
              <MetricPill label={t("statistics.monthly")} value={formatCurrency(categoryTotal, currency)} />
            </View>
            <CategoryDonutChart compact={isCompact} data={categoryData} currency={currency} />
          </View>

          <View style={styles.card}>
            <View style={[styles.sectionHeader, isCompact ? styles.sectionHeaderCompact : null]}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionEyebrow}>{t("statistics.bars")}</Text>
                <Text style={styles.cardTitle}>{t("statistics.compareByCategory")}</Text>
              </View>
              <MetricPill label={t("statistics.leader")} value={topCategory?.categoryName ?? t("statistics.none")} />
            </View>
            <CategoryBarChart compact={isCompact} data={categoryData} currency={currency} />
          </View>

          <View style={styles.card}>
            <View style={[styles.sectionHeader, isCompact ? styles.sectionHeaderCompact : null]}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionEyebrow}>{t("statistics.curve")}</Text>
                <Text style={styles.cardTitle}>{t("statistics.evolutionByMonth")}</Text>
              </View>
              <MetricPill
                label={t("statistics.lastMonth")}
                value={formatCurrency(monthlyTrend.at(-1)?.amount ?? 0, currency)}
              />
            </View>
            <MonthlyTrendChart compact={isCompact} data={monthlyTrend} currency={currency} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("statistics.highlight")}</Text>
            <InsightRow
              label={t("statistics.biggestSubscription")}
              value={
                biggestSubscription
                  ? `${biggestSubscription.providerName} - ${formatCurrency(
                      biggestSubscription.amountMonthly,
                      currency
                    )} ${copy.perMonth}`
                  : t("statistics.noActiveSubscription")
              }
            />
            <InsightRow
              label={t("statistics.dominant")}
              value={
                topCategory
                  ? `${topCategory.categoryName} - ${Math.round(topCategory.percentage * 100)}%`
                  : t("statistics.noCategory")
              }
            />
            <InsightRow
              label={t("statistics.underWatch")}
              value={t("statistics.lightlyUsed", { count: lowUtilityCount })}
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{copy.simpleView}</Text>
            <InsightRow
              label={isFrench ? "Total mensuel" : "Monthly total"}
              value={formatCurrency(categoryTotal, currency)}
            />
            <InsightRow
              label={copy.trackedCategories}
              value={String(categoryRanking.length)}
            />
            <InsightRow
              label={copy.currentTrials}
              value={String(trialCount)}
            />
          </View>
          <PromoCard
            eyebrow="Premium"
            title={copy.advancedStatsTitle}
            body={copy.advancedStatsBody}
            ctaLabel={copy.seePremium}
            onPress={() => navigation.navigate("Profile")}
            tone="purple"
          />
        </>
      )}
    </Screen>
  );
}

function CalendarGlyph(): JSX.Element {
  const styles = createStyles(useAppTheme());

  return (
    <View style={styles.calendarGlyph}>
      <View style={styles.calendarGlyphTopBar} />
      <View style={styles.calendarGlyphRingLeft} />
      <View style={styles.calendarGlyphRingRight} />
      <View style={styles.calendarGlyphGrid}>
        {Array.from({ length: 4 }, (_, index) => (
          <View key={index} style={styles.calendarGlyphDot} />
        ))}
      </View>
    </View>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  compact = false,
  compactWidth = false,
  selected = false,
  helper,
  onPress
}: {
  label: string;
  value: string;
  tone: "orange" | "purple" | "green" | "red";
  compact?: boolean;
  compactWidth?: boolean;
  selected?: boolean;
  helper?: string;
  onPress?: () => void;
}): JSX.Element {
  const styles = createStyles(useAppTheme());

  const content = (
    <>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text
        numberOfLines={compact ? 2 : 1}
        style={[
          styles.summaryValue,
          compact ? styles.summaryValueCompact : null
        ]}
      >
        {value}
      </Text>
      {helper ? <Text style={styles.summaryHelper}>{helper}</Text> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.summaryCard,
          styles[`${tone}Card`],
          compactWidth ? styles.summaryCardCompactWidth : null,
          styles.summaryCardInteractive,
          selected ? styles.summaryCardSelected : null
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.summaryCard,
        styles[`${tone}Card`],
        compactWidth ? styles.summaryCardCompactWidth : null
      ]}
    >
      {content}
    </View>
  );
}

function MetricPill({ label, value }: { label: string; value: string }): JSX.Element {
  const styles = createStyles(useAppTheme());

  return (
    <View style={styles.metricPill}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.metricValue}>
        {value}
      </Text>
    </View>
  );
}

function SubscriptionDrilldownRow({
  subscription,
  currency,
  subtitle,
  chips,
  onPress
}: {
  subscription: Subscription;
  currency: string;
  subtitle: string;
  chips?: string[];
  onPress: () => void;
}): JSX.Element {
  const styles = createStyles(useAppTheme());
  const { locale } = useAppTranslation();
  const isFrench = locale === "fr";

  return (
    <Pressable style={styles.subscriptionDrilldownRow} onPress={onPress}>
      <View style={styles.subscriptionDrilldownHeader}>
        <View style={styles.subscriptionDrilldownText}>
          <Text style={styles.subscriptionDrilldownTitle}>{subscription.providerName}</Text>
          <Text style={styles.subscriptionDrilldownSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.subscriptionDrilldownAmountWrap}>
          <Text style={styles.subscriptionDrilldownAmount}>
            {formatCurrency(subscription.priceMonthly, currency)}
          </Text>
          <Text style={styles.subscriptionDrilldownAmountMeta}>
            {isFrench ? "/ mois" : "/ month"}
          </Text>
        </View>
      </View>
      {chips?.length ? (
        <View style={styles.subscriptionDrilldownChipWrap}>
          {chips.map((chip) => (
            <View key={`${subscription.id}-${chip}`} style={styles.subscriptionDrilldownChip}>
              <Text style={styles.subscriptionDrilldownChipLabel}>{chip}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

function CategoryPodium({
  categories,
  compact,
  currency
}: {
  categories: RankedCategory[];
  compact: boolean;
  currency: string;
}): JSX.Element {
  const styles = createStyles(useAppTheme());
  const { locale } = useAppTranslation();
  const isFrench = locale === "fr";
  const podiumOrder = [categories[1], categories[0], categories[2]].filter(Boolean) as RankedCategory[];

  return (
    <View style={[styles.podiumRow, compact ? styles.podiumRowCompact : null]}>
      {podiumOrder.map((category) => (
        <View
          key={category.categoryId}
          style={[
            styles.podiumStep,
            category.rank === 1
              ? styles.podiumStepFirst
              : category.rank === 2
                ? styles.podiumStepSecond
                : styles.podiumStepThird,
            compact ? styles.podiumStepCompact : null
          ]}
        >
          <View style={styles.podiumBadge}>
            <Text style={styles.podiumBadgeLabel}>#{category.rank}</Text>
          </View>
          <Text numberOfLines={1} style={styles.podiumTitle}>
            {category.categoryName}
          </Text>
          <Text style={styles.podiumMeta}>
            {isFrench
              ? `${category.subscriptionCount} abonnement(s)`
              : `${category.subscriptionCount} subscription(s)`}
          </Text>
          <Text style={styles.podiumAmount}>
            {formatCurrency(category.amountMonthly, currency)}
          </Text>
          <Text style={styles.podiumAmountMeta}>{isFrench ? "/ mois" : "/ month"}</Text>
        </View>
      ))}
    </View>
  );
}

function CategoryDonutChart({
  data,
  currency,
  compact
}: {
  data: CategorySlice[];
  currency: string;
  compact: boolean;
}): JSX.Element {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { locale, t } = useAppTranslation();
  const isFrench = locale === "fr";

  if (data.length === 0) {
    return <EmptyState message={t("statistics.emptyPie")} />;
  }

  const segmentCount = 72;
  const ringSegments: string[] = [];

  data.forEach((item, index) => {
    const remainingSlots = segmentCount - ringSegments.length;
    const isLast = index === data.length - 1;
    const sliceCount = isLast
      ? remainingSlots
      : Math.max(1, Math.round(item.percentage * segmentCount));

    for (let cursor = 0; cursor < Math.min(sliceCount, remainingSlots); cursor += 1) {
      ringSegments.push(item.color);
    }
  });

  while (ringSegments.length < segmentCount) {
    ringSegments.push(data.at(-1)?.color ?? theme.colors.surfaceContrast);
  }

  const size = compact ? 186 : 220;
  const center = size / 2;
  const outerRadius = compact ? 64 : 78;
  const markerLength = compact ? 26 : 34;
  const markerThickness = compact ? 8 : 10;
  const total = data.reduce((sum, item) => sum + item.amountMonthly, 0);

  return (
    <View style={[styles.donutLayout, compact ? styles.donutLayoutCompact : null]}>
      <View style={styles.donutWrap}>
        <View style={[styles.donutHalo, { width: size, height: size, borderRadius: size / 2 }]} />
        <View style={[styles.donutSurface, { width: size, height: size, borderRadius: size / 2 }]}>
          {ringSegments.map((segmentColor, index) => {
            const angle = (-Math.PI / 2) + (index / segmentCount) * Math.PI * 2;
            const left = center + Math.cos(angle) * outerRadius - markerThickness / 2;
            const top = center + Math.sin(angle) * outerRadius - markerLength / 2;

            return (
              <View
                key={`${segmentColor}-${index}`}
                style={[
                  styles.ringSegment,
                  {
                    backgroundColor: segmentColor,
                    left,
                    top,
                    width: markerThickness,
                    height: markerLength,
                    transform: [{ rotate: `${angle + Math.PI / 2}rad` }]
                  }
                ]}
              />
            );
          })}
          <View
            style={[
              styles.donutCenter,
              compact ? styles.donutCenterCompact : null
            ]}
          >
            <Text style={styles.donutCenterLabel}>
              {isFrench ? "Total mensuel" : "Monthly total"}
            </Text>
            <Text style={styles.donutCenterValue}>{formatCurrency(total, currency)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.legendColumn}>
        {data.map((item) => (
          <View key={item.categoryId} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <View style={styles.legendTextWrap}>
              <Text numberOfLines={1} style={styles.legendTitle}>
                {item.categoryName}
              </Text>
              <Text style={styles.legendMeta}>
                {Math.round(item.percentage * 100)}% - {formatCurrency(item.amountMonthly, currency)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function CategoryBarChart({
  data,
  currency,
  compact
}: {
  data: CategorySlice[];
  currency: string;
  compact: boolean;
}): JSX.Element {
  const styles = createStyles(useAppTheme());
  const { t } = useAppTranslation();

  if (data.length === 0) {
    return <EmptyState message={t("statistics.emptyBar")} />;
  }

  const maxAmount = Math.max(...data.map((item) => item.amountMonthly), 1);

  return (
    <ScrollView
      horizontal={compact}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={compact ? styles.barChartScrollContent : undefined}
    >
      <View style={[styles.barChartWrap, compact ? styles.barChartWrapCompact : null]}>
        <View style={[styles.barChartArea, compact ? styles.barChartAreaCompact : null]}>
          {data.map((item) => (
            <View
              key={item.categoryId}
              style={[styles.barColumn, compact ? styles.barColumnCompact : null]}
            >
              <Text numberOfLines={1} style={styles.barAmount}>
                {formatCurrency(item.amountMonthly, currency)}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: item.color,
                      height: `${Math.max((item.amountMonthly / maxAmount) * 100, 12)}%`
                    }
                  ]}
                />
              </View>
              <Text numberOfLines={1} style={styles.barLabel}>
                {shrinkLabel(item.categoryName)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function MonthlyTrendChart({
  data,
  currency,
  compact
}: {
  data: TrendPoint[];
  currency: string;
  compact: boolean;
}): JSX.Element {
  const styles = createStyles(useAppTheme());
  const { t } = useAppTranslation();
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  if (data.length === 0) {
    return <EmptyState message={t("statistics.emptyTrend")} />;
  }

  const chartPaddingX = 16;
  const chartPaddingTop = 18;
  const chartPaddingBottom = 18;
  const plotWidth = Math.max(chartSize.width - chartPaddingX * 2, 1);
  const plotHeight = Math.max(chartSize.height - chartPaddingTop - chartPaddingBottom, 1);
  const values = data.map((item) => item.amount);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = Math.max(maxValue - minValue, 1);
  const points: ChartPoint[] = data.map((item, index) => ({
    x:
      chartPaddingX +
      (data.length === 1 ? 0.5 : index / (data.length - 1)) * plotWidth,
    y:
      chartPaddingTop +
      (1 - (item.amount - minValue) / range) * plotHeight,
    label: formatMonthLabel(item.month),
    amount: item.amount
  }));

  return (
    <View style={styles.trendSection}>
      <View
        onLayout={(event: LayoutChangeEvent) => {
          const { width: chartWidth, height } = event.nativeEvent.layout;
          setChartSize({ width: chartWidth, height });
        }}
        style={[styles.trendChart, compact ? styles.trendChartCompact : null]}
      >
        <View style={[styles.trendGridLine, { top: chartPaddingTop }]} />
        <View style={[styles.trendGridLine, { top: chartPaddingTop + plotHeight / 2 }]} />
        <View style={[styles.trendGridLine, { top: chartPaddingTop + plotHeight }]} />

        {points.slice(1).map((point, index) => {
          const previousPoint = points[index];
          const deltaX = point.x - previousPoint.x;
          const deltaY = point.y - previousPoint.y;
          const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const centerX = (point.x + previousPoint.x) / 2;
          const centerY = (point.y + previousPoint.y) / 2;
          const angle = Math.atan2(deltaY, deltaX);

          return (
            <View
              key={`${previousPoint.label}-${point.label}`}
              style={[
                styles.trendSegment,
                {
                  width: length,
                  left: centerX - length / 2,
                  top: centerY - 2,
                  transform: [{ rotate: `${angle}rad` }]
                }
              ]}
            />
          );
        })}

        {points.map((point) => (
          <View
            key={point.label}
            style={[
              styles.trendPoint,
              {
                left: point.x - 6,
                top: point.y - 6
              }
            ]}
          />
        ))}
      </View>

      <View style={[styles.trendFooter, compact ? styles.trendFooterCompact : null]}>
        {points.map((point) => (
          <View
            key={`${point.label}-meta`}
            style={[styles.trendMonth, compact ? styles.trendMonthCompact : null]}
          >
            <Text style={styles.trendMonthLabel}>{point.label}</Text>
            <Text style={styles.trendMonthValue}>{formatCurrency(point.amount, currency)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function InsightRow({ label, value }: { label: string; value: string }): JSX.Element {
  const styles = createStyles(useAppTheme());

  return (
    <View style={styles.insightRow}>
      <Text style={styles.insightLabel}>{label}</Text>
      <Text style={styles.insightValue}>{value}</Text>
    </View>
  );
}

function EmptyState({ message }: { message: string }): JSX.Element {
  const styles = createStyles(useAppTheme());

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>{message}</Text>
    </View>
  );
}

function shrinkLabel(value: string) {
  const firstWord = value.split(/\s+/)[0] ?? value;

  return firstWord.length > 8 ? `${firstWord.slice(0, 7)}.` : firstWord;
}

function buildLowUtilitySubtitle(subscription: Subscription, isFrench: boolean) {
  if (subscription.lastUsedAt) {
    return isFrench
      ? `derniere activite le ${formatLongDate(subscription.lastUsedAt)}`
      : `last activity on ${formatLongDate(subscription.lastUsedAt)}`;
  }

  return formatUsageCheckIn(subscription.usageCheckIn);
}

function describeLowUtilityReason(
  reason: LowUtilityReason,
  lastUsedAt: string | null,
  isFrench: boolean
) {
  if (reason === "unused") {
    return isFrench ? "Usage signale comme faible" : "Marked as low usage";
  }

  if (reason === "stale") {
    return lastUsedAt
      ? isFrench
        ? `Inactif depuis le ${formatLongDate(lastUsedAt)}`
        : `Inactive since ${formatLongDate(lastUsedAt)}`
      : isFrench
        ? "Pas d'activite recente"
        : "No recent activity";
  }

  if (reason === "duplicate_provider") {
    return isFrench ? "Doublon de service possible" : "Possible duplicate service";
  }

  return isFrench ? "Categorie deja surchargee" : "Category already overloaded";
}

function getLowUtilitySubscriptions(subscriptions: Subscription[]): LowUtilityItem[] {
  const lowUtilityReasons = new Map<string, Set<LowUtilityReason>>();
  const staleUsageCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

  subscriptions.forEach((subscription) => {
    const lastUsedTime = subscription.lastUsedAt
      ? new Date(subscription.lastUsedAt).getTime()
      : null;

    if (
      subscription.usageCheckIn === "unused" ||
      (lastUsedTime !== null && lastUsedTime < staleUsageCutoff)
    ) {
      if (subscription.usageCheckIn === "unused") {
        addLowUtilityReason(lowUtilityReasons, subscription.id, "unused");
      }

      if (lastUsedTime !== null && lastUsedTime < staleUsageCutoff) {
        addLowUtilityReason(lowUtilityReasons, subscription.id, "stale");
      }
    }
  });

  markExtraSubscriptionsAsLowUtility(
    subscriptions,
    (subscription) => subscription.normalizedProviderName,
    "duplicate_provider",
    lowUtilityReasons
  );

  markExtraSubscriptionsAsLowUtility(
    subscriptions.filter((subscription) =>
      LOW_UTILITY_CATEGORY_KEYS.has(normalizeCategoryName(subscription.categoryName))
    ),
    (subscription) => normalizeCategoryName(subscription.categoryName),
    "duplicate_category",
    lowUtilityReasons
  );

  return subscriptions
    .filter((subscription) => lowUtilityReasons.has(subscription.id))
    .map((subscription) => ({
      subscription,
      reasons: Array.from(lowUtilityReasons.get(subscription.id) ?? [])
    }))
    .sort((left, right) => {
      if (right.reasons.length !== left.reasons.length) {
        return right.reasons.length - left.reasons.length;
      }

      return right.subscription.priceMonthly - left.subscription.priceMonthly;
    });
}

function addLowUtilityReason(
  lowUtilityReasons: Map<string, Set<LowUtilityReason>>,
  subscriptionId: string,
  reason: LowUtilityReason
) {
  const currentReasons = lowUtilityReasons.get(subscriptionId) ?? new Set<LowUtilityReason>();
  currentReasons.add(reason);
  lowUtilityReasons.set(subscriptionId, currentReasons);
}

function markExtraSubscriptionsAsLowUtility<T extends {
  id: string;
  priceMonthly: number;
  nextBillingDate?: string;
}>(
  subscriptions: T[],
  getGroupKey: (subscription: T) => string,
  reason: LowUtilityReason,
  lowUtilityReasons: Map<string, Set<LowUtilityReason>>
) {
  const groups = subscriptions.reduce<Record<string, T[]>>((accumulator, subscription) => {
    const key = getGroupKey(subscription);
    accumulator[key] = [...(accumulator[key] ?? []), subscription];
    return accumulator;
  }, {});

  Object.values(groups).forEach((group) => {
    if (group.length <= 1) {
      return;
    }

    const sortedGroup = [...group].sort((left, right) => {
      if (left.priceMonthly !== right.priceMonthly) {
        return left.priceMonthly - right.priceMonthly;
      }

      return (left.nextBillingDate ?? "").localeCompare(right.nextBillingDate ?? "");
    });

    sortedGroup.slice(1).forEach((subscription) => {
      addLowUtilityReason(lowUtilityReasons, subscription.id, reason);
    });
  });
}

function normalizeCategoryName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const LOW_UTILITY_CATEGORY_KEYS = new Set(["musique", "streaming", "ai", "securite"]);

const createStyles = (theme: AppTheme) => StyleSheet.create({
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  summaryCard: {
    width: "47%",
    minHeight: 110,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.xs,
    ...shadows.card
  },
  summaryCardCompactWidth: {
    width: "100%"
  },
  summaryCardInteractive: {
    overflow: "hidden"
  },
  summaryCardSelected: {
    borderColor: theme.colors.white
  },
  orangeCard: {
    backgroundColor: "rgba(255, 184, 77, 0.12)",
    borderColor: "rgba(255, 184, 77, 0.24)"
  },
  purpleCard: {
    backgroundColor: "rgba(140, 123, 255, 0.12)",
    borderColor: "rgba(140, 123, 255, 0.22)"
  },
  greenCard: {
    backgroundColor: "rgba(69, 212, 139, 0.12)",
    borderColor: "rgba(69, 212, 139, 0.22)"
  },
  redCard: {
    backgroundColor: "rgba(255, 102, 122, 0.12)",
    borderColor: "rgba(255, 102, 122, 0.22)"
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: theme.colors.textTertiary,
    letterSpacing: 0.8
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  summaryValueCompact: {
    fontSize: 19,
    lineHeight: 24
  },
  summaryHelper: {
    marginTop: "auto",
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.textSecondary
  },
  card: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...shadows.card
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    flexWrap: "wrap"
  },
  sectionHeaderCompact: {
    flexDirection: "column",
    alignItems: "stretch"
  },
  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: theme.colors.textTertiary
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  drilldownHeaderText: {
    flex: 1,
    gap: 6
  },
  drilldownDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.textSecondary
  },
  drilldownActions: {
    alignItems: "flex-end",
    gap: spacing.sm
  },
  drilldownDismiss: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary
  },
  drilldownList: {
    gap: spacing.md
  },
  metricPill: {
    alignSelf: "flex-start",
    minWidth: 110,
    maxWidth: 180,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: theme.colors.surfaceContrast,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    gap: 2
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: theme.colors.textTertiary,
    letterSpacing: 0.8
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  subscriptionDrilldownRow: {
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong
  },
  subscriptionDrilldownHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  subscriptionDrilldownText: {
    flex: 1,
    gap: 4
  },
  subscriptionDrilldownTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  subscriptionDrilldownSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textSecondary
  },
  subscriptionDrilldownAmountWrap: {
    alignItems: "flex-end",
    gap: 2
  },
  subscriptionDrilldownAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  subscriptionDrilldownAmountMeta: {
    fontSize: 11,
    textTransform: "uppercase",
    color: theme.colors.textTertiary
  },
  subscriptionDrilldownChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  subscriptionDrilldownChip: {
    minHeight: 32,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceContrast,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  subscriptionDrilldownChipLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  podiumRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md
  },
  podiumRowCompact: {
    gap: spacing.sm
  },
  podiumStep: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong
  },
  podiumStepCompact: {
    paddingHorizontal: spacing.xs,
    minWidth: 0
  },
  podiumStepFirst: {
    minHeight: 180,
    borderColor: theme.colors.primary
  },
  podiumStepSecond: {
    minHeight: 148
  },
  podiumStepThird: {
    minHeight: 132
  },
  podiumBadge: {
    minWidth: 44,
    minHeight: 28,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceContrast,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong
  },
  podiumBadgeLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  podiumTitle: {
    marginTop: spacing.md,
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  podiumMeta: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.textSecondary
  },
  podiumAmount: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.primary
  },
  podiumAmountMeta: {
    marginTop: 2,
    fontSize: 11,
    textTransform: "uppercase",
    color: theme.colors.textTertiary
  },
  categoryRankingList: {
    gap: spacing.sm
  },
  categoryRankingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  categoryRankBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceContrast,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong
  },
  categoryRankBadgeLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  categoryRankingText: {
    flex: 1,
    gap: 4
  },
  categoryRankingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  categoryRankingMeta: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.textSecondary
  },
  categoryRankingAmounts: {
    alignItems: "flex-end",
    gap: 2
  },
  categoryRankingAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  categoryRankingAmountMeta: {
    fontSize: 11,
    textTransform: "uppercase",
    color: theme.colors.textTertiary
  },
  donutLayout: {
    gap: spacing.lg
  },
  donutLayoutCompact: {
    alignItems: "center"
  },
  donutWrap: {
    alignItems: "center",
    justifyContent: "center"
  },
  donutHalo: {
    position: "absolute",
    backgroundColor: theme.colors.glowPurple,
    opacity: 0.65
  },
  donutSurface: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong
  },
  ringSegment: {
    position: "absolute",
    borderRadius: 999
  },
  donutCenter: {
    width: 124,
    height: 124,
    borderRadius: 62,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    gap: 4
  },
  donutCenterCompact: {
    width: 106,
    height: 106,
    borderRadius: 53
  },
  donutCenterLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: theme.colors.textTertiary
  },
  donutCenterValue: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: theme.colors.textPrimary
  },
  legendColumn: {
    gap: spacing.sm
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 4
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 999
  },
  legendTextWrap: {
    flex: 1,
    gap: 2
  },
  legendTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  legendMeta: {
    fontSize: 13,
    color: theme.colors.textSecondary
  },
  barChartWrap: {
    gap: spacing.md,
    width: "100%"
  },
  barChartWrapCompact: {
    minWidth: 520
  },
  barChartScrollContent: {
    paddingRight: spacing.sm
  },
  barChartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
    minHeight: 240
  },
  barChartAreaCompact: {
    minHeight: 220
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm
  },
  barColumnCompact: {
    minWidth: 76
  },
  barAmount: {
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    color: theme.colors.textSecondary
  },
  barTrack: {
    width: "100%",
    height: 150,
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 6,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceContrast,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong
  },
  barFill: {
    width: "100%",
    minHeight: 20,
    borderRadius: 16
  },
  barLabel: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    color: theme.colors.textPrimary
  },
  trendSection: {
    gap: spacing.md
  },
  trendChart: {
    height: 190,
    borderRadius: radius.md,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    overflow: "hidden"
  },
  trendChartCompact: {
    height: 170
  },
  trendGridLine: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: theme.colors.border
  },
  trendSegment: {
    position: "absolute",
    height: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.primaryStrong
  },
  trendPoint: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: theme.colors.white,
    borderWidth: 3,
    borderColor: theme.colors.primaryStrong
  },
  trendFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  trendFooterCompact: {
    flexDirection: "column"
  },
  trendMonth: {
    minWidth: "31%",
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: theme.colors.surfaceContrast,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  trendMonthCompact: {
    minWidth: "100%"
  },
  trendMonthLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  trendMonthValue: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.textSecondary
  },
  insightRow: {
    gap: 6,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  insightLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: theme.colors.textTertiary
  },
  insightValue: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textPrimary
  },
  emptyState: {
    minHeight: 160,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  emptyStateText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: theme.colors.textSecondary
  },
  headerActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  headerIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    ...shadows.card
  },
  calendarGlyph: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: theme.colors.textPrimary,
    position: "relative",
    overflow: "hidden"
  },
  calendarGlyphTopBar: {
    position: "absolute",
    top: 4,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: theme.colors.textPrimary
  },
  calendarGlyphRingLeft: {
    position: "absolute",
    top: 0,
    left: 4,
    width: 3,
    height: 6,
    borderRadius: 2,
    backgroundColor: theme.colors.textPrimary
  },
  calendarGlyphRingRight: {
    position: "absolute",
    top: 0,
    right: 4,
    width: 3,
    height: 6,
    borderRadius: 2,
    backgroundColor: theme.colors.textPrimary
  },
  calendarGlyphGrid: {
    position: "absolute",
    left: 4,
    right: 4,
    bottom: 4,
    top: 11,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "space-between"
  },
  calendarGlyphDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.primary
  }
});
