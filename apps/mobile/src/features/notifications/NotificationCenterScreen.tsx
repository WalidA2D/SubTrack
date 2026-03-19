import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAppTranslation } from "../../i18n";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { AppTheme, radius, spacing, useAppTheme } from "../../theme";
import {
  formatCurrency,
  formatInsightMessage,
  formatInsightTitle,
  formatShortDate
} from "../../utils/format";

type NotificationCenterItem = {
  id: string;
  title: string;
  body: string;
  meta: string;
  tone: "orange" | "purple";
};

export function NotificationCenterScreen(): JSX.Element {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const navigation = useAppNavigation();
  const { t } = useAppTranslation();
  const dashboard = useWorkspaceStore((state) => state.dashboard);
  const profile = useWorkspaceStore((state) => state.profile);
  const currency = profile?.currency ?? "EUR";

  const alertItems = useMemo<NotificationCenterItem[]>(
    () =>
      (dashboard?.insights ?? []).map((insight, index) => ({
        id: `insight_${insight.type}_${index}`,
        title: formatInsightTitle(insight.type),
        body: formatInsightMessage(insight),
        meta: t("notifications.alertsSection"),
        tone: "purple"
      })),
    [dashboard?.insights, t]
  );

  const upcomingPaymentItems = useMemo<NotificationCenterItem[]>(
    () =>
      (dashboard?.upcomingPayments ?? []).map((payment) => ({
        id: `payment_${payment.subscriptionId}`,
        title: payment.providerName,
        body: t("dashboard.chargedOn", { date: formatShortDate(payment.dueDate) }),
        meta: formatCurrency(payment.amount, currency),
        tone: "orange"
      })),
    [currency, dashboard?.upcomingPayments, t]
  );

  const hasContent = alertItems.length > 0 || upcomingPaymentItems.length > 0;

  return (
    <Screen
      title={t("notifications.title")}
      subtitle={t("notifications.subtitle")}
      action={<PrimaryButton title={t("common.back")} onPress={navigation.goBack} variant="secondary" />}
    >
      {!hasContent ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t("notifications.emptyTitle")}</Text>
          <Text style={styles.emptyBody}>{t("notifications.emptyBody")}</Text>
        </View>
      ) : null}

      {alertItems.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("notifications.alertsSection")}</Text>
          <View style={styles.stack}>
            {alertItems.map((item) => (
              <NotificationRow key={item.id} item={item} />
            ))}
          </View>
        </View>
      ) : null}

      {upcomingPaymentItems.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("notifications.upcomingSection")}</Text>
          <View style={styles.stack}>
            {upcomingPaymentItems.map((item) => (
              <NotificationRow key={item.id} item={item} />
            ))}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

function NotificationRow({ item }: { item: NotificationCenterItem }): JSX.Element {
  const styles = createStyles(useAppTheme());

  return (
    <View style={styles.row}>
      <View style={[styles.toneDot, item.tone === "orange" ? styles.toneDotOrange : styles.toneDotPurple]} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowBody}>{item.body}</Text>
      </View>
      <Text style={styles.rowMeta}>{item.meta}</Text>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: radius.md,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    stack: {
      gap: spacing.sm
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    toneDot: {
      width: 10,
      height: 10,
      borderRadius: 999
    },
    toneDotOrange: {
      backgroundColor: theme.colors.primary
    },
    toneDotPurple: {
      backgroundColor: theme.colors.secondary
    },
    rowText: {
      flex: 1,
      gap: 4
    },
    rowTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    rowBody: {
      fontSize: 13,
      lineHeight: 19,
      color: theme.colors.textSecondary
    },
    rowMeta: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    emptyCard: {
      minHeight: 180,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      padding: spacing.xl,
      borderRadius: radius.md,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    emptyBody: {
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
      color: theme.colors.textSecondary
    }
  });
