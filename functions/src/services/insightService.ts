import { Subscription } from "@subly/shared";

export function buildInsights(subscriptions: Subscription[]) {
  const insights: Array<{
    type: string;
    message: string;
    providerName?: string;
    count?: number;
  }> = [];
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

  subscriptions.forEach((subscription) => {
    const lastUsedTime = subscription.lastUsedAt
      ? new Date(subscription.lastUsedAt).getTime()
      : null;

    if (subscription.usageCheckIn === "unused" || (lastUsedTime !== null && lastUsedTime < cutoff)) {
      insights.push({
        type: "unused_subscription",
        providerName: subscription.providerName,
        message: `${subscription.providerName} semble inactif depuis un moment.`
      });
    }
  });

  const duplicates = subscriptions.reduce<Record<string, Subscription[]>>((groups, subscription) => {
    const key = subscription.normalizedProviderName;
    groups[key] = [...(groups[key] ?? []), subscription];
    return groups;
  }, {});

  Object.values(duplicates).forEach((group) => {
    if (group.length > 1) {
      insights.push({
        type: "duplicate_subscription",
        providerName: group[0].providerName,
        count: group.length,
        message: `Tu as ${group.length} abonnements actifs pour ${group[0].providerName}.`
      });
    }
  });

  return insights.slice(0, 5);
}
