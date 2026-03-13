import { Pressable, StyleSheet, Text, View } from "react-native";
import { Subscription } from "@subly/shared";

import { colors, radius, shadows, spacing } from "../theme";

type SubscriptionListItemProps = {
  subscription: Subscription;
  onPress?: () => void;
};

export function SubscriptionListItem({
  subscription,
  onPress
}: SubscriptionListItemProps): JSX.Element {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.identity}>
          <Text style={styles.provider}>{subscription.providerName}</Text>
          <Text style={styles.category}>{subscription.categoryName}</Text>
        </View>
        <Text style={styles.price}>
          {subscription.currency} {subscription.price.toFixed(2)}
        </Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.meta}>{subscription.billingFrequency}</Text>
        <Text style={styles.meta}>Next: {subscription.nextBillingDate.slice(0, 10)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  identity: {
    flex: 1,
    gap: 4
  },
  provider: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary
  },
  category: {
    fontSize: 14,
    color: colors.textSecondary
  },
  price: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: "capitalize"
  }
});
