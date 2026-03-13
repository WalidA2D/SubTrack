import { useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, TextInput, View } from "react-native";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { SubscriptionListItem } from "../../components/SubscriptionListItem";
import { RootStackParamList } from "../../navigation/types";
import { sampleSubscriptions } from "../../types/mockData";
import { colors, spacing } from "../../theme";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function SubscriptionListScreen(): JSX.Element {
  const navigation = useNavigation<Navigation>();
  const [search, setSearch] = useState("");

  const filteredSubscriptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return sampleSubscriptions;
    }

    return sampleSubscriptions.filter((subscription) =>
      subscription.providerName.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <Screen
      title="Subscriptions"
      subtitle="Search, sort, and review every recurring payment in one place."
      action={<PrimaryButton title="+ Add" onPress={() => navigation.navigate("AddSubscription")} />}
    >
      <TextInput
        placeholder="Search Netflix, Spotify, Figma..."
        placeholderTextColor={colors.textSecondary}
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.list}>
        {filteredSubscriptions.map((subscription) => (
          <SubscriptionListItem
            key={subscription.id}
            subscription={subscription}
            onPress={() =>
              navigation.navigate("SubscriptionDetails", {
                subscriptionId: subscription.id
              })
            }
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface
  },
  list: {
    gap: spacing.md
  }
});
