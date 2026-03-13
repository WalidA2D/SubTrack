import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { RootStackParamList } from "../../navigation/types";
import { colors, radius, spacing } from "../../theme";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type AddSubscriptionRoute = RouteProp<RootStackParamList, "AddSubscription">;

export function AddSubscriptionScreen(): JSX.Element {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<AddSubscriptionRoute>();
  const [providerName, setProviderName] = useState("Notion");
  const [price, setPrice] = useState("8");
  const [category, setCategory] = useState("Productivity");
  const [frequency, setFrequency] = useState("monthly");
  const [nextBillingDate, setNextBillingDate] = useState("2026-03-25");

  const isEditing = Boolean(route.params?.subscriptionId);

  const handleSave = () => {
    Alert.alert(
      isEditing ? "Subscription updated" : "Subscription created",
      "The form payload is ready to send to the /subscriptions endpoint."
    );
    navigation.goBack();
  };

  return (
    <Screen
      title={isEditing ? "Edit subscription" : "Add subscription"}
      subtitle="Capture billing details now. Advanced reminders and analytics attach automatically later."
    >
      <View style={styles.card}>
        <Field label="Provider name" value={providerName} onChangeText={setProviderName} />
        <Field label="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <Field label="Category" value={category} onChangeText={setCategory} />
        <Field label="Billing frequency" value={frequency} onChangeText={setFrequency} />
        <Field label="Next billing date" value={nextBillingDate} onChangeText={setNextBillingDate} />
        <PrimaryButton title="Save subscription" onPress={handleSave} />
      </View>
    </Screen>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "decimal-pad";
};

function Field({
  label,
  value,
  onChangeText,
  keyboardType = "default"
}: FieldProps): JSX.Element {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={colors.textSecondary}
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
  field: {
    gap: spacing.xs
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.textPrimary
  }
});
