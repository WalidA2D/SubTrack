import { useState } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";

import { Screen } from "../../components/Screen";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { colors, radius, shadows, spacing } from "../../theme";
import { formatCurrency, formatMonthLabel } from "../../utils/format";

const CHART_COLORS = [
  colors.primary,
  colors.secondary,
  colors.success,
  colors.danger,
  "#7BE7FF",
  "#F38BFF"
];

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

export function StatisticsScreen(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const statistics = useWorkspaceStore((state) => state.statistics);
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const profile = useWorkspaceStore((state) => state.profile);
  const currency = profile?.currency ?? "EUR";
  const categorySource = [...(statistics?.byCategory ?? [])].sort(
    (left, right) => right.amountMonthly - left.amountMonthly
  );
  const categoryTotal = categorySource.reduce((sum, item) => sum + item.amountMonthly, 0);
  const categoryData: CategorySlice[] = categorySource.slice(0, 6).map((item, index) => ({
    ...item,
    percentage: categoryTotal > 0 ? item.amountMonthly / categoryTotal : 0,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));
  const monthlyTrend = [...(statistics?.monthlyTrend ?? [])]
    .sort((left, right) => left.month.localeCompare(right.month))
    .slice(-6);
  const monthlyAverage =
    monthlyTrend.length > 0
      ? monthlyTrend.reduce((sum, item) => sum + item.amount, 0) / monthlyTrend.length
      : 0;
  const unusedCount = subscriptions.filter((item) => item.usageCheckIn === "unused").length;
  const biggestSubscription = statistics?.biggestSubscriptions[0];
  const topCategory = categoryData[0];

  return (
    <Screen
      title="Statistiques"
      subtitle="Barres, evolution mensuelle et comparaison des categories dans une seule vue."
    >
      <View style={styles.summaryGrid}>
        <SummaryCard
          compactWidth={isCompact}
          label="Actifs"
          value={String(statistics?.subscriptionCount ?? 0)}
          tone="orange"
        />
        <SummaryCard
          compactWidth={isCompact}
          label="Peu utilises"
          value={String(unusedCount)}
          tone="purple"
        />
        <SummaryCard
          compactWidth={isCompact}
          label="Moyenne / mois"
          value={formatCurrency(monthlyAverage, currency)}
          tone="green"
        />
        <SummaryCard
          compactWidth={isCompact}
          label="Top categorie"
          value={topCategory?.categoryName ?? "Aucune"}
          tone="red"
          compact
        />
      </View>

      <View style={styles.card}>
        <View style={[styles.sectionHeader, isCompact ? styles.sectionHeaderCompact : null]}>
          <View>
            <Text style={styles.sectionEyebrow}>Camembert</Text>
            <Text style={styles.cardTitle}>Depenses par categorie</Text>
          </View>
          <MetricPill label="Mensuel" value={formatCurrency(categoryTotal, currency)} />
        </View>
        <CategoryDonutChart compact={isCompact} data={categoryData} currency={currency} />
      </View>

      <View style={styles.card}>
        <View style={[styles.sectionHeader, isCompact ? styles.sectionHeaderCompact : null]}>
          <View>
            <Text style={styles.sectionEyebrow}>Barres</Text>
            <Text style={styles.cardTitle}>Comparatif par categorie</Text>
          </View>
          <MetricPill label="Leader" value={topCategory?.categoryName ?? "Aucune"} />
        </View>
        <CategoryBarChart compact={isCompact} data={categoryData} currency={currency} />
      </View>

      <View style={styles.card}>
        <View style={[styles.sectionHeader, isCompact ? styles.sectionHeaderCompact : null]}>
          <View>
            <Text style={styles.sectionEyebrow}>Courbe</Text>
            <Text style={styles.cardTitle}>Evolution par mois</Text>
          </View>
          <MetricPill
            label="Dernier mois"
            value={formatCurrency(monthlyTrend.at(-1)?.amount ?? 0, currency)}
          />
        </View>
        <MonthlyTrendChart compact={isCompact} data={monthlyTrend} currency={currency} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Temps fort</Text>
        <InsightRow
          label="Plus gros abonnement"
          value={
            biggestSubscription
              ? `${biggestSubscription.providerName} - ${formatCurrency(
                  biggestSubscription.amountMonthly,
                  currency
                )} / mois`
              : "Aucun abonnement actif"
          }
        />
        <InsightRow
          label="Dominante"
          value={
            topCategory
              ? `${topCategory.categoryName} - ${Math.round(topCategory.percentage * 100)}%`
              : "Aucune categorie"
          }
        />
        <InsightRow
          label="Sous surveillance"
          value={`${unusedCount} abonnement${unusedCount > 1 ? "s" : ""} peu utilise`}
        />
      </View>
    </Screen>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  compact = false,
  compactWidth = false
}: {
  label: string;
  value: string;
  tone: "orange" | "purple" | "green" | "red";
  compact?: boolean;
  compactWidth?: boolean;
}): JSX.Element {
  return (
    <View
      style={[
        styles.summaryCard,
        styles[`${tone}Card`],
        compactWidth ? styles.summaryCardCompactWidth : null
      ]}
    >
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text
        numberOfLines={compact ? 2 : 1}
        style={[styles.summaryValue, compact ? styles.summaryValueCompact : null]}
      >
        {value}
      </Text>
    </View>
  );
}

function MetricPill({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <View style={styles.metricPill}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.metricValue}>
        {value}
      </Text>
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
  if (data.length === 0) {
    return <EmptyState message="Ajoute quelques abonnements pour voir le camembert par categorie." />;
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
    ringSegments.push(data.at(-1)?.color ?? colors.surfaceContrast);
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
            <Text style={styles.donutCenterLabel}>Total mensuel</Text>
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
  if (data.length === 0) {
    return <EmptyState message="Ajoute quelques abonnements pour activer le graphique en barres." />;
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
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  if (data.length === 0) {
    return <EmptyState message="L'evolution mensuelle apparaitra ici des que tu auras de l'historique." />;
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
  return (
    <View style={styles.insightRow}>
      <Text style={styles.insightLabel}>{label}</Text>
      <Text style={styles.insightValue}>{value}</Text>
    </View>
  );
}

function EmptyState({ message }: { message: string }): JSX.Element {
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

const styles = StyleSheet.create({
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
    color: colors.textTertiary,
    letterSpacing: 0.8
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary
  },
  summaryValueCompact: {
    fontSize: 19,
    lineHeight: 24
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  sectionHeaderCompact: {
    flexDirection: "column",
    alignItems: "stretch"
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.textTertiary
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary
  },
  metricPill: {
    minWidth: 110,
    maxWidth: 180,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surfaceContrast,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    gap: 2
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: colors.textTertiary,
    letterSpacing: 0.8
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary
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
    backgroundColor: colors.glowPurple,
    opacity: 0.65
  },
  donutSurface: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.borderStrong
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
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
    color: colors.textTertiary
  },
  donutCenterValue: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: colors.textPrimary
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
    color: colors.textPrimary
  },
  legendMeta: {
    fontSize: 13,
    color: colors.textSecondary
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
    color: colors.textSecondary
  },
  barTrack: {
    width: "100%",
    height: 150,
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 6,
    borderRadius: 22,
    backgroundColor: colors.surfaceContrast,
    borderWidth: 1,
    borderColor: colors.borderStrong
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
    color: colors.textPrimary
  },
  trendSection: {
    gap: spacing.md
  },
  trendChart: {
    height: 190,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.borderStrong,
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
    backgroundColor: colors.border
  },
  trendSegment: {
    position: "absolute",
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.primaryStrong
  },
  trendPoint: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.primaryStrong
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
    backgroundColor: colors.surfaceContrast,
    borderWidth: 1,
    borderColor: colors.border
  },
  trendMonthCompact: {
    minWidth: "100%"
  },
  trendMonthLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary
  },
  trendMonthValue: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary
  },
  insightRow: {
    gap: 6,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  insightLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.textTertiary
  },
  insightValue: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary
  },
  emptyState: {
    minHeight: 160,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border
  },
  emptyStateText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: colors.textSecondary
  }
});
