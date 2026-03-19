import { Screen } from "../../components/Screen";
import { PremiumBillingCalendar } from "../../components/PremiumBillingCalendar";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";

export function StatisticsCalendarScreen(): JSX.Element {
  const navigation = useAppNavigation();
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const profile = useWorkspaceStore((state) => state.profile);
  const currency = profile?.currency ?? "EUR";
  const trackedSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "active" || subscription.status === "trial"
  );

  return (
    <Screen
      title="Calendrier"
      subtitle="Retrouve tes prelevements avec une vue annee, mois, semaine et jour."
      action={<PrimaryButton title="Retour" onPress={navigation.goBack} variant="secondary" />}
    >
      <PremiumBillingCalendar
        compact={false}
        currency={currency}
        subscriptions={trackedSubscriptions}
        onOpenSubscription={(subscriptionId) =>
          navigation.navigate("SubscriptionDetails", { subscriptionId })
        }
      />
    </Screen>
  );
}
