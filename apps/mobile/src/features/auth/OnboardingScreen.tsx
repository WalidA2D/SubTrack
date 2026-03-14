import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAuthStore } from "../../store/authStore";
import { colors, radius, spacing } from "../../theme";

export function OnboardingScreen(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const setOnboardingComplete = useAuthStore((state) => state.setOnboardingComplete);

  return (
    <Screen
      title="Pilote chaque abonnement comme un actif."
      subtitle="Subly transforme tes paiements recurrents en tableau de bord premium, avec rappels utiles et vue instantanee sur les services qui comptent."
    >
      <View style={styles.heroCard}>
        <View style={[styles.heroStats, isCompact ? styles.heroStatsCompact : null]}>
          <View style={[styles.statBubbleGreen, isCompact ? styles.statBubbleGreenCompact : null]} />
          <View style={[styles.statBubblePurple, isCompact ? styles.statBubblePurpleCompact : null]} />
          <View style={[styles.statCore, isCompact ? styles.statCoreCompact : null]}>
            <Text style={styles.coreLabel}>Ce mois-ci</Text>
            <Text style={styles.coreValue}>189,04 EUR</Text>
          </View>
        </View>
        <Text style={styles.eyebrow}>Dark premium dashboard</Text>
        <Text style={[styles.heroTitle, isCompact ? styles.heroTitleCompact : null]}>
          Un seul cockpit pour Netflix, tes SaaS, la salle de sport et les renouvellements que tu oublies trop souvent.
        </Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>Vue mensuelle et annuelle immediate</Text>
          <Text style={styles.featureItem}>Rappels avant paiement et fin d'essai</Text>
          <Text style={styles.featureItem}>Detection des doublons et usages faibles</Text>
        </View>
      </View>
      <PrimaryButton title="Commencer" onPress={setOnboardingComplete} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  heroStats: {
    height: 180,
    alignItems: "center",
    justifyContent: "center"
  },
  heroStatsCompact: {
    height: 160
  },
  statBubbleGreen: {
    position: "absolute",
    left: 24,
    bottom: 34,
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: colors.glowGreen,
    borderWidth: 1,
    borderColor: "rgba(69, 212, 139, 0.3)"
  },
  statBubbleGreenCompact: {
    left: 8,
    bottom: 28
  },
  statBubblePurple: {
    position: "absolute",
    right: 32,
    top: 14,
    width: 82,
    height: 82,
    borderRadius: 999,
    backgroundColor: colors.glowPurple,
    borderWidth: 1,
    borderColor: "rgba(140, 123, 255, 0.3)"
  },
  statBubblePurpleCompact: {
    right: 12,
    top: 8,
    width: 70,
    height: 70
  },
  statCore: {
    minWidth: 190,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContrast,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    gap: spacing.xs
  },
  statCoreCompact: {
    minWidth: 0,
    width: "100%"
  },
  coreLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.textSecondary
  },
  coreValue: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase"
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "700",
    color: colors.textPrimary
  },
  heroTitleCompact: {
    fontSize: 24,
    lineHeight: 31
  },
  featureList: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  featureItem: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary
  }
});
