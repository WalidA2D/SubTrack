import { StyleSheet, Text, View } from "react-native";

import { colors, radius, shadows, spacing } from "../theme";

type KpiCardProps = {
  label: string;
  value: string;
  helper: string;
};

export function KpiCard({ label, value, helper }: KpiCardProps): JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.helper}>{helper}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 132,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary
  },
  value: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary
  },
  helper: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.secondary
  }
});
