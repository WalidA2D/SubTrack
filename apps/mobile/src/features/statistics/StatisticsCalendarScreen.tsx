import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { PremiumBillingCalendar } from "../../components/PremiumBillingCalendar";
import { useAppTranslation } from "../../i18n";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { AppTheme, spacing, useAppTheme } from "../../theme";

export function StatisticsCalendarScreen(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const navigation = useAppNavigation();
  const { locale } = useAppTranslation();
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const profile = useWorkspaceStore((state) => state.profile);
  const currency = profile?.currency ?? "EUR";
  const trackedSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "active" || subscription.status === "trial"
  );

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={[styles.glow, styles.glowOrange]} />
        <View style={[styles.glow, styles.glowPurple]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={navigation.goBack} style={styles.backButton}>
            <Text style={styles.backButtonLabel}>{"<"}</Text>
          </Pressable>
          <Text style={[styles.title, isCompact ? styles.titleCompact : null]}>
            {locale === "fr" ? "Ton calendrier" : "Your calendar"}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <PremiumBillingCalendar
          compact={isCompact}
          currency={currency}
          subscriptions={trackedSubscriptions}
          onOpenSubscription={(subscriptionId) =>
            navigation.navigate("SubscriptionDetails", { subscriptionId })
          }
        />
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    backgroundLayer: {
      ...StyleSheet.absoluteFillObject,
      overflow: "hidden"
    },
    glow: {
      position: "absolute",
      width: 240,
      height: 240,
      borderRadius: 999
    },
    glowOrange: {
      top: -80,
      right: -70,
      backgroundColor: theme.colors.glowOrange
    },
    glowPurple: {
      top: 180,
      left: -120,
      backgroundColor: theme.colors.glowPurple
    },
    content: {
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      paddingTop: spacing.xxxl,
      paddingBottom: spacing.xxxl + 36,
      paddingHorizontal: spacing.lg,
      gap: spacing.xl
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: theme.colors.borderStrong
    },
    backButtonLabel: {
      fontSize: 22,
      lineHeight: 22,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    title: {
      flex: 1,
      fontSize: 28,
      fontWeight: "800",
      textAlign: "center",
      color: theme.colors.textPrimary
    },
    titleCompact: {
      fontSize: 24
    },
    headerSpacer: {
      width: 38,
      height: 38
    }
  });
