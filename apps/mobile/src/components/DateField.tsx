import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { radius, shadows, spacing, useAppTheme } from "../theme";
import { toDateInputValue, toIsoDate } from "../utils/format";

type DateFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

type CalendarCell = {
  id: string;
  date: Date;
  isCurrentMonth: boolean;
};

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"] as const;

export function DateField({
  label,
  value,
  onChangeText,
  placeholder = "Selectionner une date"
}: DateFieldProps): JSX.Element {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthCursor(value));
  const selectedDateKey = useMemo(() => getDateKey(parseDateInput(value)), [value]);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric"
      }).format(visibleMonth),
    [visibleMonth]
  );
  const calendarCells = useMemo(() => buildCalendarCells(visibleMonth), [visibleMonth]);

  const openPicker = () => {
    setVisibleMonth(getMonthCursor(value));
    setPickerVisible(true);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.inputShell} onPress={openPicker}>
        <Text style={value ? styles.inputValue : styles.inputPlaceholder}>
          {value || placeholder}
        </Text>
        <Text style={styles.inputAction}>Calendrier</Text>
      </Pressable>

      <Modal
        visible={isPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setPickerVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Choisir une date</Text>
              <Pressable style={styles.closeButton} onPress={() => setPickerVisible(false)}>
                <Text style={styles.closeButtonLabel}>X</Text>
              </Pressable>
            </View>

            <View style={styles.monthRow}>
              <Pressable
                style={styles.monthNavButton}
                onPress={() => setVisibleMonth(shiftMonth(visibleMonth, -1))}
              >
                <Text style={styles.monthNavLabel}>‹</Text>
              </Pressable>
              <Text style={styles.monthLabel}>{capitalizeMonth(monthLabel)}</Text>
              <Pressable
                style={styles.monthNavButton}
                onPress={() => setVisibleMonth(shiftMonth(visibleMonth, 1))}
              >
                <Text style={styles.monthNavLabel}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekdayRow}>
              {WEEKDAY_LABELS.map((weekday, index) => (
                <Text key={`${weekday}_${index}`} style={styles.weekdayLabel}>
                  {weekday}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {calendarCells.map((cell) => {
                const cellKey = getDateKey(cell.date);
                const isSelected = cellKey === selectedDateKey;

                return (
                  <Pressable
                    key={cell.id}
                    style={[
                      styles.dayCell,
                      !cell.isCurrentMonth ? styles.dayCellMuted : null,
                      isSelected ? styles.dayCellSelected : null
                    ]}
                    onPress={() => {
                      onChangeText(toDateInputValue(cell.date.toISOString()));
                      setPickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayLabel,
                        !cell.isCurrentMonth ? styles.dayLabelMuted : null,
                        isSelected ? styles.dayLabelSelected : null
                      ]}
                    >
                      {cell.date.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.actions}>
              <Pressable
                style={styles.secondaryAction}
                onPress={() => {
                  const today = new Date();
                  onChangeText(toDateInputValue(today.toISOString()));
                  setVisibleMonth(getMonthCursor(toDateInputValue(today.toISOString())));
                }}
              >
                <Text style={styles.secondaryActionLabel}>Aujourd'hui</Text>
              </Pressable>
              <Pressable style={styles.primaryAction} onPress={() => setPickerVisible(false)}>
                <Text style={styles.primaryActionLabel}>Valider</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function parseDateInput(value: string) {
  if (!value.trim()) {
    return null;
  }

  try {
    return new Date(toIsoDate(value));
  } catch {
    return null;
  }
}

function getMonthCursor(value: string) {
  const parsedDate = parseDateInput(value) ?? new Date();
  return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
}

function shiftMonth(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function buildCalendarCells(monthDate: Date): CalendarCell[] {
  const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const dayOffset = (startOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(startOfMonth);
  gridStart.setDate(startOfMonth.getDate() - dayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + index);

    return {
      id: `${cellDate.getFullYear()}-${cellDate.getMonth()}-${cellDate.getDate()}`,
      date: cellDate,
      isCurrentMonth: cellDate.getMonth() === monthDate.getMonth()
    };
  });
}

function getDateKey(date: Date | null) {
  if (!date) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function capitalizeMonth(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    field: {
      gap: spacing.xs
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textPrimary
    },
    inputShell: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      backgroundColor: theme.colors.surfaceRaised,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md
    },
    inputValue: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.textPrimary
    },
    inputPlaceholder: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.textSecondary
    },
    inputAction: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      color: theme.colors.primary
    },
    modalRoot: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(3, 3, 6, 0.78)"
    },
    sheet: {
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
      backgroundColor: theme.colors.backgroundElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      ...shadows.card
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    closeButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    closeButtonLabel: {
      fontSize: 13,
      fontWeight: "800",
      color: theme.colors.textSecondary
    },
    monthRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md
    },
    monthNavButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    monthNavLabel: {
      fontSize: 24,
      lineHeight: 24,
      color: theme.colors.textPrimary
    },
    monthLabel: {
      flex: 1,
      textAlign: "center",
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    weekdayRow: {
      flexDirection: "row",
      gap: spacing.xs
    },
    weekdayLabel: {
      flex: 1,
      textAlign: "center",
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      color: theme.colors.textTertiary
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs
    },
    dayCell: {
      width: "13.28%",
      aspectRatio: 1,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    dayCellMuted: {
      opacity: 0.45
    },
    dayCellSelected: {
      backgroundColor: theme.colors.surfaceContrast,
      borderColor: theme.colors.primary
    },
    dayLabel: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    dayLabelMuted: {
      color: theme.colors.textSecondary
    },
    dayLabelSelected: {
      color: theme.colors.primary
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.md
    },
    secondaryAction: {
      flex: 1,
      minHeight: 46,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    secondaryActionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    primaryAction: {
      flex: 1,
      minHeight: 46,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary
    },
    primaryActionLabel: {
      fontSize: 13,
      fontWeight: "800",
      color: "#241602"
    }
  });
