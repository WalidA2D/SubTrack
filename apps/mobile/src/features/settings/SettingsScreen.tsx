import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Switch, Text, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { RootStackParamList } from "../../navigation/types";
import { colors, radius, spacing } from "../../theme";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen(): JSX.Element {
  const navigation = useNavigation<Navigation>();
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [trialReminders, setTrialReminders] = useState(true);
  const [insights, setInsights] = useState(true);

  return (
    <Screen
      title="Settings"
      subtitle="Control reminders, currency behavior, and account preferences."
    >
      <View style={styles.card}>
        <SettingsRow
          label="Payment reminders"
          value={paymentReminders}
          onValueChange={setPaymentReminders}
        />
        <SettingsRow
          label="Trial ending reminders"
          value={trialReminders}
          onValueChange={setTrialReminders}
        />
        <SettingsRow
          label="Insight notifications"
          value={insights}
          onValueChange={setInsights}
        />
      </View>
      <PrimaryButton title="Open Profile" onPress={() => navigation.navigate("Profile")} />
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
        trackColor={{ true: "#C7D2FE", false: "#E5E7EB" }}
        thumbColor={value ? colors.primary : "#FFFFFF"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md
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
  }
});
