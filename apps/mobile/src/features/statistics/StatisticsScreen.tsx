import { StyleSheet, Text, View } from "react-native";

import { Screen } from "../../components/Screen";
import { sampleCategorySpend, sampleSubscriptions } from "../../types/mockData";
import { colors, radius, spacing } from "../../theme";

export function StatisticsScreen(): JSX.Element {
  return (
    <Screen
      title="Statistics"
      subtitle="From category splits to your most expensive services, Subly turns recurring spend into clear trends."
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Spend by category</Text>
        {sampleCategorySpend.map((item) => (
          <View key={item.category} style={styles.chartRow}>
            <View style={styles.rowHeader}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${item.percentage}%` }]} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Highlights</Text>
        <Text style={styles.highlight}>Biggest subscription: Core Gym at $28.00 / month</Text>
        <Text style={styles.highlight}>
          Total active subscriptions: {sampleSubscriptions.length}
        </Text>
        <Text style={styles.highlight}>Risk detected: 1 subscription marked unused</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary
  },
  chartRow: {
    gap: spacing.xs
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  category: {
    fontSize: 14,
    color: colors.textPrimary
  },
  amount: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary
  },
  track: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 999
  },
  fill: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.secondary
  },
  highlight: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary
  }
});
