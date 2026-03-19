import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "./PrimaryButton";
import { AppTheme, radius, spacing, useAppTheme } from "../theme";

type PromoCardProps = {
  eyebrow?: string;
  title: string;
  body: string;
  ctaLabel: string;
  onPress: () => void;
  tone?: "orange" | "purple" | "neutral";
};

export function PromoCard({
  eyebrow,
  title,
  body,
  ctaLabel,
  onPress,
  tone = "orange"
}: PromoCardProps): JSX.Element {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View
      style={[
        styles.card,
        tone === "orange" ? styles.cardOrange : null,
        tone === "purple" ? styles.cardPurple : null
      ]}
    >
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <PrimaryButton title={ctaLabel} onPress={onPress} />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceRaised
    },
    cardOrange: {
      borderColor: "rgba(255, 184, 77, 0.34)",
      backgroundColor: "rgba(255, 184, 77, 0.08)"
    },
    cardPurple: {
      borderColor: "rgba(140, 123, 255, 0.3)",
      backgroundColor: "rgba(140, 123, 255, 0.08)"
    },
    eyebrow: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.7,
      textTransform: "uppercase",
      color: theme.colors.primary
    },
    title: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    body: {
      fontSize: 14,
      lineHeight: 21,
      color: theme.colors.textSecondary
    }
  });
