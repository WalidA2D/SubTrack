import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { KpiCard } from "../../components/KpiCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { RootStackParamList } from "../../navigation/types";
import { sampleInsights, sampleSubscriptions } from "../../types/mockData";
import { colors, radius, shadows, spacing } from "../../theme";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const monthlySpending = sampleSubscriptions.reduce(
  (total, subscription) => total + subscription.priceMonthly,
  0
);
const yearlyEstimate = sampleSubscriptions.reduce(
  (total, subscription) => total + subscription.priceYearly,
  0
);

export function DashboardScreen(): JSX.Element {
  const navigation = useNavigation<Navigation>();

  return (
    <Screen
      title="Dashboard"
      subtitle="A live snapshot of your recurring spending and the next actions worth taking."
      action={<PrimaryButton title="+ Add" onPress={() => navigation.navigate("AddSubscription")} />}
    >
      <View style={styles.kpiRow}>
        <KpiCard
          label="Monthly spend"
          value={`$${monthlySpending.toFixed(2)}`}
          helper="All active subscriptions normalized monthly"
        />
        <KpiCard
          label="Yearly estimate"
          value={`$${yearlyEstimate.toFixed(2)}`}
          helper="Projected recurring spend over 12 months"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming payments</Text>
        {sampleSubscriptions.slice(0, 3).map((subscription) => (
          <Pressable
            key={subscription.id}
            style={styles.timelineCard}
            onPress={() =>
              navigation.navigate("SubscriptionDetails", {
                subscriptionId: subscription.id
              })
            }
          >
            <View>
              <Text style={styles.provider}>{subscription.providerName}</Text>
              <Text style={styles.dueDate}>
                Charges on {subscription.nextBillingDate.slice(0, 10)}
              </Text>
            </View>
            <Text style={styles.amount}>${subscription.price.toFixed(2)}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick insights</Text>
        {sampleInsights.map((insight) => (
          <View key={insight.id} style={styles.insightCard}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightBody}>{insight.body}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kpiRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  section: {
    gap: spacing.md
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary
  },
  timelineCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadows.card
  },
  provider: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary
  },
  dueDate: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary
  },
  insightCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary
  },
  insightBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary
  }
});
