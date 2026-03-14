import { Alert, StyleSheet, Switch, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { authService } from "../../services/authService";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { colors, radius, spacing } from "../../theme";

export function SettingsScreen(): JSX.Element {
  const navigation = useAppNavigation();
  const profile = useWorkspaceStore((state) => state.profile);
  const updateSettings = useWorkspaceStore((state) => state.updateSettings);
  const resetWorkspace = useWorkspaceStore((state) => state.reset);
  const preferences = profile?.notificationPreferences;

  const handleToggle = async (
    field: "paymentReminders" | "trialReminders" | "insightNotifications",
    value: boolean
  ) => {
    try {
      await updateSettings({
        notificationPreferences: {
          [field]: value
        }
      });
    } catch (error) {
      Alert.alert(
        "Mise a jour impossible",
        error instanceof Error ? error.message : "Merci de reessayer."
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      resetWorkspace();
    } catch (error) {
      Alert.alert(
        "Deconnexion impossible",
        error instanceof Error ? error.message : "Merci de reessayer."
      );
    }
  };

  return (
    <Screen
      title="Reglages"
      subtitle="Controle les rappels, la devise et les preferences de ton compte dans une interface plus calme et plus lisible."
      action={<PrimaryButton title="Retour" onPress={navigation.goBack} variant="secondary" />}
    >
      <View style={styles.card}>
        <SettingsRow
          label="Rappels de paiement"
          value={preferences?.paymentReminders ?? true}
          onValueChange={(value) => void handleToggle("paymentReminders", value)}
        />
        <SettingsRow
          label="Rappels de fin d'essai"
          value={preferences?.trialReminders ?? true}
          onValueChange={(value) => void handleToggle("trialReminders", value)}
        />
        <SettingsRow
          label="Notifications intelligentes"
          value={preferences?.insightNotifications ?? true}
          onValueChange={(value) => void handleToggle("insightNotifications", value)}
        />
        <View style={styles.currencyCard}>
          <Text style={styles.currencyLabel}>Devise active</Text>
          <Text style={styles.currencyValue}>{profile?.currency ?? "EUR"}</Text>
        </View>
      </View>
      <PrimaryButton title="Deconnexion" onPress={() => void handleSignOut()} variant="secondary" />
    </Screen>
  );
}

function SettingsRow({
  label,
  value,
  onValueChange
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}): JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: "#6A4A17", false: colors.surfaceContrast }}
        thumbColor={value ? colors.primary : "#FFFFFF"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  label: {
    fontSize: 15,
    color: colors.textPrimary
  },
  currencyCard: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs
  },
  currencyLabel: {
    fontSize: 14,
    color: colors.textSecondary
  },
  currencyValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary
  }
});
