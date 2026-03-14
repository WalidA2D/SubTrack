import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Subscription } from "@subly/shared";

import { ServiceLogo } from "./ServiceLogo";
import { colors, radius, shadows, spacing } from "../theme";
import { formatBillingFrequency, formatCurrency, formatShortDate } from "../utils/format";

type SubscriptionListItemProps = {
  subscription: Subscription;
  onPress?: () => void;
};

export function SubscriptionListItem({
  subscription,
  onPress
}: SubscriptionListItemProps): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.row, isCompact ? styles.rowCompact : null]}>
        <View style={styles.identityRow}>
          <ServiceLogo providerName={subscription.providerName} size={52} />
          <View style={styles.identity}>
            <Text style={styles.provider}>{subscription.providerName}</Text>
            <Text style={styles.subline}>
              {subscription.categoryName} - {formatShortDate(subscription.nextBillingDate)}
            </Text>
          </View>
        </View>
        <View style={[styles.trailing, isCompact ? styles.trailingCompact : null]}>
          <Text style={styles.price}>{formatCurrency(subscription.price, subscription.currency)}</Text>
          <Text style={styles.meta}>{formatBillingFrequency(subscription.billingFrequency)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  rowCompact: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1
  },
  identity: {
    flex: 1,
    gap: 5
  },
  provider: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary
  },
  subline: {
    fontSize: 13,
    color: colors.textSecondary
  },
  trailing: {
    alignItems: "flex-end",
    gap: 5
  },
  trailingCompact: {
    minWidth: 88,
    alignItems: "flex-start"
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "capitalize"
  }
});
