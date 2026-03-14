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
      <View style={styles.pill}>
        <Text style={styles.pillText}>{label}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.helper}>{helper}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 140,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceContrast,
    borderWidth: 1,
    borderColor: colors.borderStrong
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: colors.textSecondary,
    textTransform: "uppercase"
  },
  label: {
    fontSize: 13,
    color: colors.textTertiary
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary
  },
  helper: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.primary
  }
});
