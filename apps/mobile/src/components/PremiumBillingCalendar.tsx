import { useEffect, useMemo, useRef, useState } from "react";
import { BillingFrequency, Subscription } from "@subly/shared";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { getActiveFormatLocale, useAppTranslation } from "../i18n";
import { AppTheme, radius, shadows, spacing, useAppTheme } from "../theme";
import { formatCurrency } from "../utils/format";
import { ServiceLogo } from "./ServiceLogo";

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

const YEAR_CHIP_WIDTH = 84;
const YEAR_CHIP_SPACING = spacing.sm;

export function PremiumBillingCalendar({
  compact,
  currency,
  subscriptions,
  onOpenSubscription
}: PremiumBillingCalendarProps): JSX.Element {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { locale } = useAppTranslation();
  const today = useMemo(() => startOfDay(new Date()), []);
  const todayKey = getDateKey(today);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(() => today);
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const yearListRef = useRef<FlatList<number>>(null);
  const formatLocale = getActiveFormatLocale();

  const monthStart = useMemo(() => startOfMonth(visibleMonth), [visibleMonth]);
  const monthEnd = useMemo(() => endOfMonth(visibleMonth), [visibleMonth]);
  const calendarWeeks = useMemo(() => buildMonthWeeks(visibleMonth), [visibleMonth]);
  const occurrences = useMemo(
    () => buildBillingOccurrences(subscriptions, monthStart, monthEnd),
    [monthEnd, monthStart, subscriptions]
  );
  const occurrencesByDate = useMemo(
    () =>
      occurrences.reduce<Record<string, BillingOccurrence[]>>((accumulator, occurrence) => {
        accumulator[occurrence.dateKey] = [...(accumulator[occurrence.dateKey] ?? []), occurrence];
        return accumulator;
      }, {}),
    [occurrences]
  );
  const selectedDateKey = getDateKey(selectedDate);
  const selectedDayEvents = occurrencesByDate[selectedDateKey] ?? [];
  const monthLabel = new Intl.DateTimeFormat(formatLocale, {
    month: "long",
    year: "numeric"
  }).format(visibleMonth);
  const yearOptions = useMemo(() => {
    const centerYear = visibleMonth.getFullYear();

    return Array.from({ length: 21 }, (_, index) => centerYear - 10 + index);
  }, [visibleMonth]);
  const initialYearIndex = useMemo(
    () => Math.max(yearOptions.findIndex((year) => year === today.getFullYear()), 0),
    [today, yearOptions]
  );
  const monthOptions = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(formatLocale, { month: "long" });

    return Array.from({ length: 12 }, (_, index) => ({
      index,
      label: formatter.format(new Date(2026, index, 1))
    }));
  }, [formatLocale]);
  const dayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(formatLocale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, index) => {
      const label = formatter.format(new Date(Date.UTC(2026, 2, 1 + index)));
      return locale === "fr" ? label.toLowerCase() : label;
    });
  }, [formatLocale, locale]);

  useEffect(() => {
    const activeYearIndex = yearOptions.findIndex((year) => year === visibleMonth.getFullYear());

    if (activeYearIndex < 0) {
      return;
    }

    const animationFrame = requestAnimationFrame(() => {
      yearListRef.current?.scrollToIndex({
        animated: true,
        index: activeYearIndex,
        viewPosition: 0.5
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [visibleMonth, yearOptions]);

  const handleChangeMonth = (direction: -1 | 1) => {
    const nextMonth = addMonths(visibleMonth, direction);
    setVisibleMonth(nextMonth);
    setSelectedDate(startOfMonth(nextMonth));
    setIsMonthPickerVisible(false);
  };

  const handleSelectYear = (year: number) => {
    const nextMonth = startOfMonth(new Date(year, visibleMonth.getMonth(), 1));
    setVisibleMonth(nextMonth);
    setSelectedDate(startOfMonth(nextMonth));
    setIsMonthPickerVisible(false);
  };

  const handleSelectMonth = (monthIndex: number) => {
    const nextMonth = startOfMonth(new Date(visibleMonth.getFullYear(), monthIndex, 1));
    setVisibleMonth(nextMonth);
    setSelectedDate(startOfMonth(nextMonth));
    setIsMonthPickerVisible(false);
  };

  return (
    <View style={styles.calendar}>
      <View style={styles.monthHeader}>
        <Pressable
          hitSlop={8}
          onPress={() => setIsMonthPickerVisible((currentValue) => !currentValue)}
          style={styles.monthSelectorButton}
        >
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Text style={styles.monthSelectorChevron}>{isMonthPickerVisible ? "^" : "v"}</Text>
        </Pressable>
        <View style={styles.monthNavigation}>
          <Pressable
            hitSlop={8}
            onPress={() => handleChangeMonth(-1)}
            style={styles.monthNavButton}
          >
            <Text style={styles.monthNavLabel}>{"<"}</Text>
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => handleChangeMonth(1)}
            style={styles.monthNavButton}
          >
            <Text style={styles.monthNavLabel}>{">"}</Text>
          </Pressable>
        </View>
      </View>

      {isMonthPickerVisible ? (
        <View style={styles.monthPicker}>
          <View style={styles.monthPickerGrid}>
            {monthOptions.map((monthOption) => {
              const isActive = monthOption.index === visibleMonth.getMonth();

              return (
                <Pressable
                  key={monthOption.index}
                  hitSlop={8}
                  onPress={() => handleSelectMonth(monthOption.index)}
                  style={[styles.monthChip, isActive ? styles.monthChipActive : null]}
                >
                  <Text
                    style={[
                      styles.monthChipLabel,
                      isActive ? styles.monthChipLabelActive : null
                    ]}
                  >
                    {monthOption.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <FlatList
        ref={yearListRef}
        data={yearOptions}
        horizontal
        initialScrollIndex={initialYearIndex}
        keyExtractor={(year) => String(year)}
        renderItem={({ item: year }) => {
          const isActive = year === visibleMonth.getFullYear();

          return (
            <Pressable
              hitSlop={8}
              onPress={() => handleSelectYear(year)}
              style={[styles.yearChip, isActive ? styles.yearChipActive : null]}
            >
              <Text style={[styles.yearChipLabel, isActive ? styles.yearChipLabelActive : null]}>
                {year}
              </Text>
            </Pressable>
          );
        }}
        getItemLayout={(_, index) => ({
          index,
          length: YEAR_CHIP_WIDTH + YEAR_CHIP_SPACING,
          offset: (YEAR_CHIP_WIDTH + YEAR_CHIP_SPACING) * index
        })}
        onScrollToIndexFailed={(info) => {
          yearListRef.current?.scrollToOffset({
            animated: true,
            offset: (YEAR_CHIP_WIDTH + YEAR_CHIP_SPACING) * info.index
          });
        }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.yearScrollContent}
      />

      <View style={styles.weekdayRow}>
        {dayLabels.map((label) => (
          <View key={label} style={styles.weekdayCell}>
            <Text style={styles.weekdayLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {calendarWeeks.map((week, weekIndex) => (
          <View key={`week_${weekIndex}`} style={styles.weekRow}>
            {week.map((day, dayIndex) => {
              if (!day) {
                return (
                  <View
                    key={`empty_${weekIndex}_${dayIndex}`}
                    style={[styles.dayCell, styles.dayCellEmpty]}
                  />
                );
              }

              const dateKey = getDateKey(day);
              const isSelected = dateKey === selectedDateKey;
              const isToday = dateKey === todayKey;
              const hasBilling = Boolean(occurrencesByDate[dateKey]?.length);

              return (
                <Pressable
                  key={dateKey}
                  onPress={() => setSelectedDate(day)}
                  style={[
                    styles.dayCell,
                    compact ? styles.dayCellCompact : null,
                    isToday ? styles.dayCellToday : null,
                    isSelected ? styles.dayCellSelected : null
                  ]}
                >
                  <Text
                    style={[
                      styles.dayLabel,
                      isToday && !isSelected ? styles.dayLabelToday : null,
                      isSelected ? styles.dayLabelSelected : null
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                  {hasBilling ? (
                    <View
                      style={[
                        styles.eventDot,
                        isSelected ? styles.eventDotSelected : null
                      ]}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {selectedDayEvents.length > 0 ? (
        <View style={styles.eventList}>
          {selectedDayEvents.map((occurrence) => (
            <Pressable
              key={occurrence.id}
              onPress={() => onOpenSubscription(occurrence.subscription.id)}
              style={styles.eventCard}
            >
              <View style={styles.eventIdentity}>
                <ServiceLogo providerName={occurrence.subscription.providerName} size={42} />
                <View style={styles.eventText}>
                  <Text numberOfLines={1} style={styles.eventTitle}>
                    {occurrence.subscription.providerName}
                  </Text>
                  <Text numberOfLines={1} style={styles.eventSubtitle}>
                    {occurrence.subscription.categoryName}
                  </Text>
                </View>
              </View>
              <Text style={styles.eventAmount}>
                {formatCurrency(occurrence.subscription.price, currency)}
              </Text>
            </Pressable>
          ))}
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

function buildMonthWeeks(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmptyCells = firstDayOfMonth.getDay();
  const cells: Array<Date | null> = Array.from({ length: leadingEmptyCells }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: Array<Array<Date | null>> = [];

  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return weeks;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date: Date, amount: number) {
  return startOfMonth(new Date(date.getFullYear(), date.getMonth() + amount, 1));
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    calendar: {
      gap: spacing.lg
    },
    monthHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md
    },
    monthSelectorButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm
    },
    monthLabel: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    monthSelectorChevron: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.colors.textSecondary
    },
    monthNavigation: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm
    },
    monthNavButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: theme.colors.borderStrong
    },
    monthNavLabel: {
      fontSize: 20,
      lineHeight: 20,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    monthPicker: {
      borderRadius: radius.lg,
      padding: spacing.md,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      ...shadows.card
    },
    monthPickerGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    monthChip: {
      flexBasis: "31%",
      minHeight: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    monthChipActive: {
      backgroundColor: theme.colors.surfaceContrast,
      borderColor: theme.colors.primaryStrong
    },
    monthChipLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      textTransform: "capitalize"
    },
    monthChipLabelActive: {
      color: theme.colors.textPrimary
    },
    yearScrollContent: {
      gap: spacing.sm,
      paddingRight: spacing.md
    },
    yearChip: {
      width: YEAR_CHIP_WIDTH,
      minHeight: 42,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    yearChipActive: {
      backgroundColor: theme.colors.surfaceContrast,
      borderColor: theme.colors.primaryStrong,
      ...shadows.card
    },
    yearChipLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textSecondary
    },
    yearChipLabelActive: {
      color: theme.colors.textPrimary
    },
    weekdayRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs
    },
    weekdayCell: {
      flex: 1,
      alignItems: "center"
    },
    weekdayLabel: {
      fontSize: 13,
      fontWeight: "700",
      textTransform: "lowercase",
      color: theme.colors.textSecondary
    },
    grid: {
      gap: spacing.xs
    },
    weekRow: {
      flexDirection: "row",
      gap: spacing.xs
    },
    dayCell: {
      flex: 1,
      aspectRatio: 0.88,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#0B0B10",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.04)",
      position: "relative"
    },
    dayCellCompact: {
      aspectRatio: 0.8,
      borderRadius: 12
    },
    dayCellEmpty: {
      backgroundColor: "transparent",
      borderColor: "transparent"
    },
    dayCellToday: {
      borderColor: theme.colors.primaryStrong
    },
    dayCellSelected: {
      backgroundColor: theme.colors.white,
      borderColor: theme.colors.white,
      ...shadows.card
    },
    dayLabel: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    dayLabelToday: {
      color: theme.colors.primary
    },
    dayLabelSelected: {
      color: theme.colors.background
    },
    eventDot: {
      position: "absolute",
      bottom: 8,
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: theme.colors.secondary
    },
    eventDotSelected: {
      backgroundColor: theme.colors.background
    },
    eventList: {
      gap: spacing.sm,
      paddingTop: spacing.xs
    },
    eventCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      ...shadows.card
    },
    eventIdentity: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md
    },
    eventText: {
      flex: 1,
      gap: 2
    },
    eventTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    eventSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary
    },
    eventAmount: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.colors.textPrimary
    }
  });
