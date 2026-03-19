import { useMemo, useState } from "react";
import { BillingFrequency, Subscription } from "@subly/shared";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppTheme, radius, shadows, spacing, useAppTheme } from "../theme";
import { formatCurrency, formatLongDate } from "../utils/format";
import { ServiceLogo } from "./ServiceLogo";

type CalendarZoom = "year" | "month" | "week" | "day";

type BillingOccurrence = {
  id: string;
  date: Date;
  dateKey: string;
  subscription: Subscription;
};

type PremiumBillingCalendarProps = {
  compact: boolean;
  currency: string;
  subscriptions: Subscription[];
  onOpenSubscription: (subscriptionId: string) => void;
};

const CALENDAR_VIEWS: Array<{ id: CalendarZoom; label: string }> = [
  { id: "year", label: "Annee" },
  { id: "month", label: "Mois" },
  { id: "week", label: "Semaine" },
  { id: "day", label: "Jour" }
];

export function PremiumBillingCalendar({
  compact,
  currency,
  subscriptions,
  onOpenSubscription
}: PremiumBillingCalendarProps): JSX.Element {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [zoom, setZoom] = useState<CalendarZoom>("year");
  const [cursorDate, setCursorDate] = useState(() => startOfDay(new Date()));
  const occurrenceRange = useMemo(
    () => ({
      start: new Date(cursorDate.getFullYear() - 2, 0, 1),
      end: new Date(cursorDate.getFullYear() + 3, 0, 0)
    }),
    [cursorDate]
  );
  const occurrences = useMemo(
    () => buildBillingOccurrences(subscriptions, occurrenceRange.start, occurrenceRange.end),
    [occurrenceRange.end, occurrenceRange.start, subscriptions]
  );
  const occurrencesByDate = useMemo(() => {
    return occurrences.reduce<Record<string, BillingOccurrence[]>>((accumulator, occurrence) => {
      accumulator[occurrence.dateKey] = [...(accumulator[occurrence.dateKey] ?? []), occurrence];
      return accumulator;
    }, {});
  }, [occurrences]);
  const visibleYears = useMemo(() => getVisibleYears(cursorDate), [cursorDate]);
  const monthCells = useMemo(() => getMonthCells(cursorDate), [cursorDate]);
  const weekDays = useMemo(() => getWeekDays(cursorDate), [cursorDate]);
  const dayEvents = occurrencesByDate[getDateKey(cursorDate)] ?? [];
  const headerLabel = getHeaderLabel(zoom, cursorDate);

  return (
    <View style={styles.card}>
      <View style={[styles.header, compact ? styles.headerCompact : null]}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Premium</Text>
          <Text style={styles.title}>Calendrier des abonnements</Text>
          <Text style={styles.body}>
            Repere rapidement les periodes chargees. Le point jaune signale au moins un
            prelevement, et la vue jour affiche les logos cliquables des abonnements prevus.
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.navButton}
            onPress={() => setCursorDate(shiftCursor(cursorDate, zoom, -1))}
          >
            <Text style={styles.navButtonLabel}>‹</Text>
          </Pressable>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeLabel}>{headerLabel}</Text>
          </View>
          <Pressable
            style={styles.navButton}
            onPress={() => setCursorDate(shiftCursor(cursorDate, zoom, 1))}
          >
            <Text style={styles.navButtonLabel}>›</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.viewSwitchRow}>
        {CALENDAR_VIEWS.map((view) => {
          const isActive = zoom === view.id;

          return (
            <Pressable
              key={view.id}
              style={[styles.viewSwitchChip, isActive ? styles.viewSwitchChipActive : null]}
              onPress={() => setZoom(view.id)}
            >
              <Text
                style={[
                  styles.viewSwitchLabel,
                  isActive ? styles.viewSwitchLabelActive : null
                ]}
              >
                {view.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {zoom === "year" ? (
        <View style={[styles.yearGrid, compact ? styles.yearGridCompact : null]}>
          {visibleYears.map((year) => {
            const yearHasBilling = occurrences.some(
              (occurrence) => occurrence.date.getFullYear() === year
            );
            const isSelected = cursorDate.getFullYear() === year;

            return (
              <Pressable
                key={year}
                style={[styles.periodCard, isSelected ? styles.periodCardActive : null]}
                onPress={() => {
                  setCursorDate(new Date(year, 0, 1));
                  setZoom("month");
                }}
              >
                <Text style={styles.periodTitle}>{year}</Text>
                <View style={styles.periodMetaRow}>
                  <Text style={styles.periodMeta}>Vue annuelle</Text>
                  {yearHasBilling ? <View style={styles.eventDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {zoom === "month" ? (
        <View style={[styles.monthGrid, compact ? styles.monthGridCompact : null]}>
          {monthCells.map((cell) => {
            const monthHasBilling = occurrences.some(
              (occurrence) =>
                occurrence.date.getFullYear() === cell.date.getFullYear() &&
                occurrence.date.getMonth() === cell.date.getMonth()
            );
            const isSelected =
              cursorDate.getFullYear() === cell.date.getFullYear() &&
              cursorDate.getMonth() === cell.date.getMonth();

            return (
              <Pressable
                key={cell.id}
                style={[styles.periodCard, isSelected ? styles.periodCardActive : null]}
                onPress={() => {
                  setCursorDate(cell.date);
                  setZoom("week");
                }}
              >
                <Text style={styles.periodTitle}>{cell.label}</Text>
                <View style={styles.periodMetaRow}>
                  <Text style={styles.periodMeta}>Mois</Text>
                  {monthHasBilling ? <View style={styles.eventDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {zoom === "week" ? (
        <View style={[styles.weekRow, compact ? styles.weekRowCompact : null]}>
          {weekDays.map((day) => {
            const dayHasBilling = Boolean(occurrencesByDate[getDateKey(day)]);
            const isSelected = getDateKey(day) === getDateKey(cursorDate);

            return (
              <Pressable
                key={getDateKey(day)}
                style={[styles.dayCard, isSelected ? styles.dayCardActive : null]}
                onPress={() => {
                  setCursorDate(day);
                  setZoom("day");
                }}
              >
                <Text style={styles.dayCardEyebrow}>
                  {new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(day)}
                </Text>
                <Text style={styles.dayCardValue}>{day.getDate()}</Text>
                {dayHasBilling ? <View style={styles.eventDot} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {zoom === "day" ? (
        <View style={styles.dayPanel}>
          <View style={styles.dayPanelHeader}>
            <Text style={styles.dayPanelTitle}>{formatLongDate(cursorDate.toISOString())}</Text>
            <Text style={styles.dayPanelMeta}>
              {dayEvents.length > 0
                ? `${dayEvents.length} abonnement(s) prevu(s)`
                : "Aucun abonnement prevu"}
            </Text>
          </View>

          {dayEvents.length > 0 ? (
            <View style={styles.dayEventList}>
              {dayEvents.map((occurrence) => (
                <Pressable
                  key={occurrence.id}
                  style={styles.dayEventRow}
                  onPress={() => onOpenSubscription(occurrence.subscription.id)}
                >
                  <View style={styles.dayEventIdentity}>
                    <ServiceLogo providerName={occurrence.subscription.providerName} size={44} />
                    <View style={styles.dayEventText}>
                      <Text style={styles.dayEventTitle}>
                        {occurrence.subscription.providerName}
                      </Text>
                      <Text style={styles.dayEventSubtitle}>
                        {occurrence.subscription.categoryName}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.dayEventAmountWrap}>
                    <Text style={styles.dayEventAmount}>
                      {formatCurrency(occurrence.subscription.price, currency)}
                    </Text>
                    <Text style={styles.dayEventHint}>Ouvrir</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Cette journee est libre. Change de jour, de semaine ou de mois pour voir les
                prochains prelevements.
              </Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

function buildBillingOccurrences(
  subscriptions: Subscription[],
  rangeStart: Date,
  rangeEnd: Date
) {
  const occurrences: BillingOccurrence[] = [];

  subscriptions.forEach((subscription) => {
    if (subscription.archivedAt) {
      return;
    }

    if (subscription.status !== "active" && subscription.status !== "trial") {
      return;
    }

    const initialDate = new Date(subscription.nextBillingDate);

    if (Number.isNaN(initialDate.getTime())) {
      return;
    }

    let cursor = startOfDay(initialDate);
    let guard = 0;

    while (cursor.getTime() < rangeStart.getTime() && guard < 260) {
      cursor = addCycle(cursor, subscription.billingFrequency);
      guard += 1;
    }

    while (cursor.getTime() <= rangeEnd.getTime() && guard < 260) {
      occurrences.push({
        id: `${subscription.id}_${getDateKey(cursor)}`,
        date: cursor,
        dateKey: getDateKey(cursor),
        subscription
      });

      cursor = addCycle(cursor, subscription.billingFrequency);
      guard += 1;
    }
  });

  return occurrences.sort((left, right) => left.date.getTime() - right.date.getTime());
}

function addCycle(date: Date, frequency: BillingFrequency) {
  const nextDate = new Date(date);

  if (frequency === "weekly") {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (frequency === "quarterly") {
    nextDate.setMonth(nextDate.getMonth() + 3);
  } else if (frequency === "yearly") {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return startOfDay(nextDate);
}

function getVisibleYears(cursorDate: Date) {
  const centerYear = cursorDate.getFullYear();

  return Array.from({ length: 5 }, (_, index) => centerYear - 2 + index);
}

function getMonthCells(cursorDate: Date) {
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(cursorDate.getFullYear(), index, 1);

    return {
      id: `${date.getFullYear()}-${index}`,
      date,
      label: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date)
    };
  });
}

function getWeekDays(cursorDate: Date) {
  const start = startOfWeek(cursorDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return startOfDay(date);
  });
}

function getHeaderLabel(zoom: CalendarZoom, cursorDate: Date) {
  if (zoom === "year") {
    const years = getVisibleYears(cursorDate);
    return `${years[0]} - ${years[years.length - 1]}`;
  }

  if (zoom === "month") {
    return String(cursorDate.getFullYear());
  }

  if (zoom === "week") {
    const weekDays = getWeekDays(cursorDate);
    return `${formatShortCalendarLabel(weekDays[0])} - ${formatShortCalendarLabel(
      weekDays[weekDays.length - 1]
    )}`;
  }

  return formatLongDate(cursorDate.toISOString());
}

function shiftCursor(cursorDate: Date, zoom: CalendarZoom, direction: -1 | 1) {
  const nextDate = new Date(cursorDate);

  if (zoom === "year") {
    nextDate.setFullYear(nextDate.getFullYear() + direction * 5);
    return startOfDay(nextDate);
  }

  if (zoom === "month") {
    nextDate.setFullYear(nextDate.getFullYear() + direction);
    return startOfDay(nextDate);
  }

  if (zoom === "week") {
    nextDate.setDate(nextDate.getDate() + direction * 7);
    return startOfDay(nextDate);
  }

  nextDate.setDate(nextDate.getDate() + direction);
  return startOfDay(nextDate);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const nextDate = startOfDay(date);
  const dayOffset = (nextDate.getDay() + 6) % 7;
  nextDate.setDate(nextDate.getDate() - dayOffset);
  return nextDate;
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function formatShortCalendarLabel(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit"
  }).format(date);
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: radius.md,
      padding: spacing.lg,
      gap: spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...shadows.card
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md
    },
    headerCompact: {
      flexDirection: "column"
    },
    headerText: {
      flex: 1,
      gap: 4
    },
    eyebrow: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: theme.colors.primary
    },
    title: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    body: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.colors.textSecondary
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm
    },
    navButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceContrast,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong
    },
    navButtonLabel: {
      fontSize: 22,
      lineHeight: 22,
      color: theme.colors.textPrimary
    },
    headerBadge: {
      minHeight: 38,
      maxWidth: 190,
      paddingHorizontal: spacing.md,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceContrast,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong
    },
    headerBadgeLabel: {
      fontSize: 12,
      fontWeight: "700",
      textAlign: "center",
      color: theme.colors.textPrimary
    },
    viewSwitchRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    viewSwitchChip: {
      minHeight: 38,
      paddingHorizontal: spacing.md,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceContrast,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    viewSwitchChipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: "rgba(255, 184, 77, 0.16)"
    },
    viewSwitchLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textSecondary
    },
    viewSwitchLabelActive: {
      color: theme.colors.textPrimary
    },
    yearGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md
    },
    yearGridCompact: {
      flexDirection: "column"
    },
    monthGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md
    },
    monthGridCompact: {
      gap: spacing.sm
    },
    periodCard: {
      minWidth: 104,
      flex: 1,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.md,
      backgroundColor: theme.colors.backgroundElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong
    },
    periodCardActive: {
      borderColor: theme.colors.primary
    },
    periodTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    periodMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm
    },
    periodMeta: {
      fontSize: 12,
      color: theme.colors.textSecondary
    },
    eventDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
      backgroundColor: "#F7D154"
    },
    weekRow: {
      flexDirection: "row",
      gap: spacing.sm
    },
    weekRowCompact: {
      flexWrap: "wrap"
    },
    dayCard: {
      flex: 1,
      minWidth: 78,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.xs,
      alignItems: "center",
      backgroundColor: theme.colors.backgroundElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong
    },
    dayCardActive: {
      borderColor: theme.colors.primary
    },
    dayCardEyebrow: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      color: theme.colors.textTertiary
    },
    dayCardValue: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    dayPanel: {
      gap: spacing.md
    },
    dayPanelHeader: {
      gap: 4
    },
    dayPanelTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    dayPanelMeta: {
      fontSize: 13,
      color: theme.colors.textSecondary
    },
    dayEventList: {
      gap: spacing.sm
    },
    dayEventRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      borderRadius: radius.md,
      padding: spacing.md,
      backgroundColor: theme.colors.backgroundElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong
    },
    dayEventIdentity: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md
    },
    dayEventText: {
      flex: 1,
      gap: 4
    },
    dayEventTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    dayEventSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary
    },
    dayEventAmountWrap: {
      alignItems: "flex-end",
      gap: 2
    },
    dayEventAmount: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    dayEventHint: {
      fontSize: 11,
      textTransform: "uppercase",
      color: theme.colors.primary
    },
    emptyState: {
      minHeight: 120,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
      backgroundColor: theme.colors.backgroundElevated,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    emptyStateText: {
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
      color: theme.colors.textSecondary
    }
  });
