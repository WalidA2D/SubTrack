import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { authService } from "../../services/authService";
import { colors, radius, spacing } from "../../theme";

export function AuthScreen(): JSX.Element {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [displayName, setDisplayName] = useState("Sarah Miller");
  const [email, setEmail] = useState("sarah@subly.app");
  const [password, setPassword] = useState("StrongPass!123");
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
        "Authentication failed",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      await authService.sendPasswordReset(email.trim());
      Alert.alert("Reset email sent", "Check your inbox for password reset instructions.");
    } catch (error) {
      Alert.alert(
        "Unable to send reset email",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  };

  return (
    <Screen
      title={isRegisterMode ? "Create your account" : "Welcome back"}
      subtitle="Secure email sign-in powered by Firebase Authentication."
    >
      <View style={styles.card}>
        {isRegisterMode ? (
          <TextInput
            placeholder="Display name"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
          />
        ) : null}
        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <PrimaryButton
          title={isRegisterMode ? "Create Account" : "Sign In"}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
        {!isRegisterMode ? (
          <PrimaryButton title="Reset Password" onPress={handleResetPassword} variant="secondary" />
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isRegisterMode ? "Already have an account?" : "Need a new account?"}
        </Text>
        <Text style={styles.switch} onPress={() => setIsRegisterMode((value) => !value)}>
          {isRegisterMode ? "Sign in instead" : "Create one"}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: "#FCFCFD"
  },
  footer: {
    alignItems: "center",
    gap: spacing.xs
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary
  },
  switch: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary
  }
});
