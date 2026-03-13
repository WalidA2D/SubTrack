import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAuthStore } from "../../store/authStore";
import { colors, radius, spacing } from "../../theme";

export function OnboardingScreen(): JSX.Element {
  const setOnboardingComplete = useAuthStore((state) => state.setOnboardingComplete);

  return (
    <Screen
      title="Subscription clarity, finally."
      subtitle="Track every recurring payment, catch expensive renewals early, and turn cluttered spend into simple decisions."
    >
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Built for real recurring spend</Text>
        <Text style={styles.heroTitle}>
          One dashboard for Netflix, SaaS, gyms, and every silent renewal.
        </Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>Monthly and yearly spend snapshots</Text>
          <Text style={styles.featureItem}>Trial-ending and payment reminders</Text>
          <Text style={styles.featureItem}>Unused and duplicate subscription insights</Text>
        </View>
      </View>
      <PrimaryButton title="Get Started" onPress={setOnboardingComplete} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E0E7FF",
    textTransform: "uppercase"
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700",
    color: colors.surface
  },
  featureList: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  featureItem: {
    fontSize: 15,
    lineHeight: 22,
    color: "#EEF2FF"
  }
});
