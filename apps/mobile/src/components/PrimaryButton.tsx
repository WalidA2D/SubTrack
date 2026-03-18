import { Pressable, StyleSheet, Text } from "react-native";

import { AppTheme, spacing, useAppTheme } from "../theme";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export function PrimaryButton({
  title,
  onPress,
  variant = "primary",
  disabled = false
}: PrimaryButtonProps): JSX.Element {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        variant === "primary" ? styles.primary : styles.secondary,
        disabled ? styles.disabled : null
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === "primary" ? styles.primaryLabel : styles.secondaryLabel
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    button: {
      minHeight: 54,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 18,
      paddingHorizontal: spacing.lg
    },
    primary: {
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.warning
    },
    secondary: {
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    disabled: {
      opacity: 0.5
    },
    label: {
      fontSize: 16,
      fontWeight: "700"
    },
    primaryLabel: {
      color: "#241602"
    },
    secondaryLabel: {
      color: theme.colors.textPrimary
    }
  });
