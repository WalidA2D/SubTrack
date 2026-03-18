import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAppTranslation } from "../../i18n";
import { authService } from "../../services/authService";
import { AppTheme, radius, spacing, useAppTheme } from "../../theme";

export function AuthScreen(): JSX.Element {
  const theme = useAppTheme();
  const { t } = useAppTranslation();
  const styles = createStyles(theme);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (isRegisterMode) {
        await authService.register(email.trim(), password, displayName.trim());
      } else {
        await authService.signIn(email.trim(), password);
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
    try {
      await authService.sendPasswordReset(email.trim());
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
          disabled={isSubmitting}
        />
        {!isRegisterMode ? (
          <PrimaryButton
            title={t("auth.forgotPassword")}
            onPress={handleResetPassword}
            variant="secondary"
          />
        ) : null}
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
