import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAppTranslation } from "../../i18n";
import { authService } from "../../services/authService";
import { AppTheme, radius, spacing, useAppTheme } from "../../theme";

export function AuthScreen(): JSX.Element {
  const theme = useAppTheme();
  const { locale, t } = useAppTranslation();
  const styles = createStyles(theme);
  const isFrench = locale === "fr";
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trimmedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const isPasswordValid = password.length >= 8;
  const isDisplayNameValid = !isRegisterMode || displayName.trim().length >= 2;
  const canSubmit = isEmailValid && isPasswordValid && isDisplayNameValid && !isSubmitting;
  const copy = {
    invalidEmail: isFrench
      ? "Renseigne une adresse email valide."
      : "Enter a valid email address.",
    invalidPassword: isFrench
      ? "Le mot de passe doit contenir au moins 8 caracteres."
      : "Password must contain at least 8 characters.",
    invalidDisplayName: isFrench
      ? "Ajoute un nom d'affichage d'au moins 2 caracteres."
      : "Add a display name with at least 2 characters.",
    resetNeedsEmail: isFrench
      ? "Renseigne d'abord une adresse email valide."
      : "Enter a valid email address first.",
    helperInvalidEmail: isFrench
      ? "Utilise une adresse email valide."
      : "Use a valid email address.",
    helperInvalidPassword: isFrench
      ? "Le mot de passe doit contenir au moins 8 caracteres."
      : "Password must contain at least 8 characters.",
    helperInvalidDisplayName: isFrench
      ? "Ajoute un nom visible d'au moins 2 caracteres."
      : "Add a visible name with at least 2 characters.",
    helperReady: isFrench
      ? "Tes identifiants sont prets."
      : "Your credentials are ready."
  };

  const handleSubmit = async () => {
    if (!isEmailValid) {
      Alert.alert(t("auth.loginErrorTitle"), copy.invalidEmail);
      return;
    }

    if (!isPasswordValid) {
      Alert.alert(t("auth.loginErrorTitle"), copy.invalidPassword);
      return;
    }

    if (!isDisplayNameValid) {
      Alert.alert(t("auth.loginErrorTitle"), copy.invalidDisplayName);
      return;
    }

    try {
      setIsSubmitting(true);

      if (isRegisterMode) {
        await authService.register(trimmedEmail, password, displayName.trim());
      } else {
        await authService.signIn(trimmedEmail, password);
      }
    } catch (error) {
      Alert.alert(
        t("auth.loginErrorTitle"),
        error instanceof Error ? error.message : t("common.retry")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isEmailValid) {
      Alert.alert(t("auth.resetErrorTitle"), copy.resetNeedsEmail);
      return;
    }

    try {
      await authService.sendPasswordReset(trimmedEmail);
      Alert.alert(t("auth.resetSentTitle"), t("auth.resetSentBody"));
    } catch (error) {
      Alert.alert(
        t("auth.resetErrorTitle"),
        error instanceof Error ? error.message : t("common.retry")
      );
    }
  };

  return (
    <Screen
      title={isRegisterMode ? t("auth.registerTitle") : t("auth.loginTitle")}
      subtitle={t("auth.subtitle")}
    >
      <View style={styles.card}>
        {isRegisterMode ? (
          <TextInput
            placeholder={t("auth.displayNamePlaceholder")}
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
        ) : null}
        <TextInput
          placeholder={t("auth.emailPlaceholder")}
          placeholderTextColor={theme.colors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder={t("auth.passwordPlaceholder")}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <PrimaryButton
          title={isRegisterMode ? t("auth.createAccount") : t("auth.signIn")}
          onPress={handleSubmit}
          disabled={!canSubmit}
        />
        {!isRegisterMode ? (
          <PrimaryButton
            title={t("auth.forgotPassword")}
            onPress={handleResetPassword}
            variant="secondary"
            disabled={!isEmailValid || isSubmitting}
          />
        ) : null}
        <Text style={styles.helperText}>
          {!isEmailValid
            ? copy.helperInvalidEmail
            : !isPasswordValid
              ? copy.helperInvalidPassword
              : isRegisterMode && !isDisplayNameValid
                ? copy.helperInvalidDisplayName
                : copy.helperReady}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isRegisterMode ? t("auth.haveAccount") : t("auth.noAccount")}
        </Text>
        <Text style={styles.switch} onPress={() => setIsRegisterMode((value) => !value)}>
          {isRegisterMode ? t("auth.signInInstead") : t("auth.createOne")}
        </Text>
      </View>
    </Screen>
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
    input: {
      minHeight: 54,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 18,
      paddingHorizontal: spacing.md,
      fontSize: 16,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surface
    },
    helperText: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.colors.textSecondary
    },
    footer: {
      alignItems: "center",
      gap: spacing.xs
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.textSecondary
    },
    switch: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.primary
    }
  });
