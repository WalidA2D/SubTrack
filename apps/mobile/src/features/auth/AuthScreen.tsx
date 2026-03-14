import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { authService } from "../../services/authService";
import { colors, radius, spacing } from "../../theme";

export function AuthScreen(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [displayName, setDisplayName] = useState("Nouveau membre");
  const [email, setEmail] = useState("demo@subly.app");
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
        "Connexion impossible",
        error instanceof Error ? error.message : "Merci de reessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      await authService.sendPasswordReset(email.trim());
      Alert.alert(
        "Email envoye",
        "Verifie ta boite mail pour reinitialiser ton mot de passe."
      );
    } catch (error) {
      Alert.alert(
        "Impossible d'envoyer l'email",
        error instanceof Error ? error.message : "Merci de reessayer."
      );
    }
  };

  return (
    <Screen
      title={isRegisterMode ? "Creer ton espace premium" : "Heureux de te revoir"}
      subtitle="Connexion securisee pour retrouver tous tes abonnements. Compte de test precharge : demo@subly.app"
    >
      <View style={[styles.heroStrip, isCompact ? styles.heroStripCompact : null]}>
        <View style={styles.heroMetric}>
          <Text style={styles.heroMetricLabel}>Compte test</Text>
          <Text style={styles.heroMetricValue}>demo@subly.app</Text>
        </View>
        <View style={styles.heroMetric}>
          <Text style={styles.heroMetricLabel}>Mot de passe</Text>
          <Text style={styles.heroMetricValue}>StrongPass!123</Text>
        </View>
      </View>
      <View style={styles.card}>
        {isRegisterMode ? (
          <TextInput
            placeholder="Nom d'affichage"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
          />
        ) : null}
        <TextInput
          placeholder="Adresse email"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <PrimaryButton
          title={isRegisterMode ? "Creer mon compte" : "Se connecter"}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
        {!isRegisterMode ? (
          <PrimaryButton
            title="Mot de passe oublie"
            onPress={handleResetPassword}
            variant="secondary"
          />
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isRegisterMode ? "Tu as deja un compte ?" : "Pas encore de compte ?"}
        </Text>
        <Text style={styles.switch} onPress={() => setIsRegisterMode((value) => !value)}>
          {isRegisterMode ? "Se connecter a la place" : "En creer un"}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroStrip: {
    flexDirection: "row",
    gap: spacing.md
  },
  heroStripCompact: {
    flexDirection: "column"
  },
  heroMetric: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6
  },
  heroMetricLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.textTertiary
  },
  heroMetricValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface
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
