import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { RootStackParamList } from "../../navigation/types";
import { sampleSubscriptions } from "../../types/mockData";
import { colors, radius, spacing } from "../../theme";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type DetailsRoute = RouteProp<RootStackParamList, "SubscriptionDetails">;

export function SubscriptionDetailsScreen(): JSX.Element {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<DetailsRoute>();
  const subscription =
    sampleSubscriptions.find((item) => item.id === route.params.subscriptionId) ??
    sampleSubscriptions[0];

  return (
    <Screen
      title={subscription.providerName}
      subtitle="A detailed view of billing, usage signals, and subscription actions."
    >
      <View style={styles.hero}>
        <Text style={styles.amount}>${subscription.price.toFixed(2)}</Text>
        <Text style={styles.meta}>{subscription.billingFrequency} billing</Text>
        <Text style={styles.meta}>Next charge: {subscription.nextBillingDate.slice(0, 10)}</Text>
      </View>

      <View style={styles.card}>
        <DetailRow label="Category" value={subscription.categoryName} />
        <DetailRow label="Status" value={subscription.status} />
        <DetailRow label="Reminder" value={`${subscription.reminderDaysBefore} days before`} />
        <DetailRow label="Last used" value={subscription.lastUsedAt?.slice(0, 10) ?? "Not set"} />
        <DetailRow label="Notes" value={subscription.notes ?? "No notes"} />
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          title="Edit Subscription"
          onPress={() =>
            navigation.navigate("AddSubscription", {
              subscriptionId: subscription.id
            })
          }
        />
        <PrimaryButton title="Mark As Paid" onPress={() => undefined} variant="secondary" />
      </View>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.xs
  },
  amount: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.surface
  },
  meta: {
    fontSize: 15,
    color: "#E0E7FF",
    textTransform: "capitalize"
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
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
    color: colors.textPrimary,
    textTransform: "capitalize"
  },
  actions: {
    gap: spacing.md
  }
});
