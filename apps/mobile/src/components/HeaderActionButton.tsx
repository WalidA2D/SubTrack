import { Pressable, StyleSheet, View } from "react-native";

import { useAppTranslation } from "../i18n";
import { AppTheme, useAppTheme } from "../theme";

export type HeaderActionKind = "calendar" | "notifications" | "profile" | "settings";

type HeaderActionButtonProps = {
  kind: HeaderActionKind;
  onPress: () => void;
  size?: "sm" | "md";
};

export function HeaderActionButton({
  kind,
  onPress,
  size = "sm"
}: HeaderActionButtonProps): JSX.Element {
  const styles = createStyles(useAppTheme());
  const { locale } = useAppTranslation();
  const isFrench = locale === "fr";
  const accessibilityLabel =
    kind === "calendar"
      ? isFrench
        ? "Ouvrir le calendrier"
        : "Open calendar"
      : kind === "notifications"
        ? isFrench
          ? "Ouvrir le centre de notifications"
          : "Open notification center"
        : kind === "profile"
          ? isFrench
            ? "Ouvrir le profil"
            : "Open profile"
          : isFrench
            ? "Ouvrir les reglages"
            : "Open settings";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={[styles.button, size === "md" ? styles.buttonMedium : null]}
    >
      {kind === "calendar" ? <CalendarGlyph /> : null}
      {kind === "notifications" ? <NotificationGlyph /> : null}
      {kind === "profile" ? <ProfileGlyph /> : null}
      {kind === "settings" ? <SettingsGlyph /> : null}
    </Pressable>
  );
}

function NotificationGlyph(): JSX.Element {
  const styles = createStyles(useAppTheme());

  return (
    <View style={styles.notificationGlyph}>
      <View style={styles.notificationGlyphBody} />
      <View style={styles.notificationGlyphClapper} />
      <View style={styles.notificationGlyphHandle} />
    </View>
  );
}

function ProfileGlyph(): JSX.Element {
  const styles = createStyles(useAppTheme());

  return (
    <View style={styles.profileGlyph}>
      <View style={styles.profileGlyphHead} />
      <View style={styles.profileGlyphBody} />
    </View>
  );
}

function SettingsGlyph(): JSX.Element {
  const styles = createStyles(useAppTheme());

  return (
    <View style={styles.settingsGlyph}>
      <View style={styles.settingsGlyphRing} />
      <View style={styles.settingsGlyphCenter} />
      <View style={[styles.settingsGlyphTick, styles.settingsGlyphTickTop]} />
      <View style={[styles.settingsGlyphTick, styles.settingsGlyphTickBottom]} />
      <View style={[styles.settingsGlyphTick, styles.settingsGlyphTickLeft]} />
      <View style={[styles.settingsGlyphTick, styles.settingsGlyphTickRight]} />
    </View>
  );
}

function CalendarGlyph(): JSX.Element {
  const styles = createStyles(useAppTheme());

  return (
    <View style={styles.calendarGlyph}>
      <View style={styles.calendarGlyphTopBar} />
      <View style={styles.calendarGlyphRingLeft} />
      <View style={styles.calendarGlyphRingRight} />
      <View style={styles.calendarGlyphGrid}>
        {Array.from({ length: 4 }, (_, index) => (
          <View key={index} style={styles.calendarGlyphDot} />
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    button: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    buttonMedium: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surfaceRaised,
      borderColor: theme.colors.borderStrong
    },
    notificationGlyph: {
      width: 18,
      height: 18,
      alignItems: "center",
      justifyContent: "center"
    },
    notificationGlyphBody: {
      width: 12,
      height: 11,
      borderTopLeftRadius: 6,
      borderTopRightRadius: 6,
      borderBottomLeftRadius: 5,
      borderBottomRightRadius: 5,
      borderWidth: 1.6,
      borderColor: theme.colors.textPrimary,
      borderBottomWidth: 1.8
    },
    notificationGlyphClapper: {
      position: "absolute",
      bottom: 1,
      width: 4,
      height: 4,
      borderRadius: 999,
      backgroundColor: theme.colors.textPrimary
    },
    notificationGlyphHandle: {
      position: "absolute",
      top: 0,
      width: 4,
      height: 3,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
      backgroundColor: theme.colors.textPrimary
    },
    profileGlyph: {
      width: 18,
      alignItems: "center",
      justifyContent: "center",
      gap: 2
    },
    profileGlyphHead: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.colors.textPrimary
    },
    profileGlyphBody: {
      width: 14,
      height: 7,
      borderTopLeftRadius: 7,
      borderTopRightRadius: 7,
      backgroundColor: theme.colors.textPrimary
    },
    settingsGlyph: {
      width: 18,
      height: 18,
      alignItems: "center",
      justifyContent: "center"
    },
    settingsGlyphRing: {
      position: "absolute",
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 1.6,
      borderColor: theme.colors.textPrimary
    },
    settingsGlyphCenter: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.colors.textPrimary
    },
    settingsGlyphTick: {
      position: "absolute",
      width: 2,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.textPrimary
    },
    settingsGlyphTickTop: {
      top: 0
    },
    settingsGlyphTickBottom: {
      bottom: 0
    },
    settingsGlyphTickLeft: {
      left: 0,
      transform: [{ rotate: "90deg" }]
    },
    settingsGlyphTickRight: {
      right: 0,
      transform: [{ rotate: "90deg" }]
    },
    calendarGlyph: {
      width: 22,
      height: 22,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: theme.colors.textPrimary,
      position: "relative",
      overflow: "hidden"
    },
    calendarGlyphTopBar: {
      position: "absolute",
      top: 4,
      left: 0,
      right: 0,
      height: 5,
      backgroundColor: theme.colors.textPrimary
    },
    calendarGlyphRingLeft: {
      position: "absolute",
      top: 0,
      left: 4,
      width: 3,
      height: 6,
      borderRadius: 2,
      backgroundColor: theme.colors.textPrimary
    },
    calendarGlyphRingRight: {
      position: "absolute",
      top: 0,
      right: 4,
      width: 3,
      height: 6,
      borderRadius: 2,
      backgroundColor: theme.colors.textPrimary
    },
    calendarGlyphGrid: {
      position: "absolute",
      left: 4,
      right: 4,
      bottom: 4,
      top: 11,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignContent: "space-between"
    },
    calendarGlyphDot: {
      width: 4,
      height: 4,
      borderRadius: 999,
      backgroundColor: theme.colors.primary
    }
  });
