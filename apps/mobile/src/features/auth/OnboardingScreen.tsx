import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAppTranslation } from "../../i18n";
import { useAuthStore } from "../../store/authStore";
import { AppTheme, radius, spacing, useAppTheme } from "../../theme";

export function OnboardingScreen(): JSX.Element {
  const theme = useAppTheme();
  const { t } = useAppTranslation();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const setOnboardingComplete = useAuthStore((state) => state.setOnboardingComplete);

  return (
    <Screen
      title={t("onboarding.title")}
      subtitle={t("onboarding.subtitle")}
    >
      <View style={styles.heroCard}>
        <View style={[styles.heroStats, isCompact ? styles.heroStatsCompact : null]}>
          <View style={[styles.statBubbleGreen, isCompact ? styles.statBubbleGreenCompact : null]} />
          <View style={[styles.statBubblePurple, isCompact ? styles.statBubblePurpleCompact : null]} />
          <View style={[styles.statCore, isCompact ? styles.statCoreCompact : null]}>
            <Text style={styles.coreLabel}>{t("onboarding.thisMonth")}</Text>
            <Text style={styles.coreValue}>189,04 EUR</Text>
          </View>
        </View>
        <Text style={styles.eyebrow}>{t("onboarding.eyebrow")}</Text>
        <Text style={[styles.heroTitle, isCompact ? styles.heroTitleCompact : null]}>
          {t("onboarding.hero")}
        </Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>{t("onboarding.feature1")}</Text>
          <Text style={styles.featureItem}>{t("onboarding.feature2")}</Text>
          <Text style={styles.featureItem}>{t("onboarding.feature3")}</Text>
        </View>
      </View>
      <PrimaryButton title={t("onboarding.start")} onPress={setOnboardingComplete} />
    </Screen>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    heroCard: {
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: radius.lg,
      padding: spacing.xl,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border
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
      backgroundColor: theme.colors.glowGreen,
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
      backgroundColor: theme.colors.glowPurple,
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
      backgroundColor: theme.colors.surfaceContrast,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
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
      color: theme.colors.textSecondary
    },
    coreValue: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    eyebrow: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.primary,
      textTransform: "uppercase"
    },
    heroTitle: {
      fontSize: 30,
      lineHeight: 38,
      fontWeight: "700",
      color: theme.colors.textPrimary
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
      color: theme.colors.textSecondary
    }
  });
