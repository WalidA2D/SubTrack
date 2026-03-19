import {
  findServicePresetByProvider,
  normalizeCatalogKey,
  Subscription
} from "@subly/shared";

export type LinkedParentSubscriptionSummary = Pick<
  Subscription,
  "id" | "providerName" | "logoMode"
>;

export type SubscriptionDisplayEntry = {
  id: string;
  subscription: Subscription;
  isIncludedLink: boolean;
  linkedParentProviderNames?: string[];
  linkedParentSubscriptionIds?: string[];
  linkedParentSubscriptions?: LinkedParentSubscriptionSummary[];
};

function getAssociationKey(providerName: string): string {
  const preset = findServicePresetByProvider(providerName);
  return preset?.id ?? normalizeCatalogKey(providerName);
}

function appendUnique(values: string[] | undefined, nextValue: string): string[] {
  if (!nextValue.trim()) {
    return values ?? [];
  }

  const current = values ?? [];
  return current.includes(nextValue) ? current : [...current, nextValue];
}

function appendUniqueParentSubscription(
  values: LinkedParentSubscriptionSummary[] | undefined,
  nextValue: LinkedParentSubscriptionSummary
): LinkedParentSubscriptionSummary[] {
  const current = values ?? [];

  return current.some((value) => value.id === nextValue.id)
    ? current
    : [...current, nextValue];
}

export function buildSubscriptionDisplayEntries(
  subscriptions: Subscription[]
): SubscriptionDisplayEntry[] {
  const realEntries = new Map<string, SubscriptionDisplayEntry>();
  const subscriptionsByAssociationKey = new Map<string, Subscription[]>();
  const virtualEntries: SubscriptionDisplayEntry[] = [];
  const seenVirtualEntryIds = new Set<string>();

  subscriptions.forEach((subscription) => {
    realEntries.set(subscription.id, {
      id: subscription.id,
      subscription,
      isIncludedLink: false
    });

    const associationKey = getAssociationKey(subscription.providerName);

    if (!associationKey) {
      return;
    }

    const current = subscriptionsByAssociationKey.get(associationKey) ?? [];
    current.push(subscription);
    subscriptionsByAssociationKey.set(associationKey, current);
  });

  subscriptions.forEach((parentSubscription) => {
    (parentSubscription.includedProviderNames ?? []).forEach((includedProviderName) => {
      const associationKey = getAssociationKey(includedProviderName);

      if (!associationKey) {
        return;
      }

      const matchingSubscriptions =
        subscriptionsByAssociationKey
          .get(associationKey)
          ?.filter((subscription) => subscription.id !== parentSubscription.id) ?? [];

      if (matchingSubscriptions.length > 0) {
        matchingSubscriptions.forEach((matchingSubscription) => {
          const existingEntry = realEntries.get(matchingSubscription.id);

          if (!existingEntry) {
            return;
          }

          existingEntry.linkedParentProviderNames = appendUnique(
            existingEntry.linkedParentProviderNames,
            parentSubscription.providerName
          );
          existingEntry.linkedParentSubscriptionIds = appendUnique(
            existingEntry.linkedParentSubscriptionIds,
            parentSubscription.id
          );
          existingEntry.linkedParentSubscriptions = appendUniqueParentSubscription(
            existingEntry.linkedParentSubscriptions,
            {
              id: parentSubscription.id,
              providerName: parentSubscription.providerName,
              logoMode: parentSubscription.logoMode
            }
          );
        });
        return;
      }

      const virtualEntryId = `${parentSubscription.id}__included__${associationKey}`;

      if (seenVirtualEntryIds.has(virtualEntryId)) {
        return;
      }

      seenVirtualEntryIds.add(virtualEntryId);

      const preset = findServicePresetByProvider(includedProviderName);
      virtualEntries.push({
        id: virtualEntryId,
        isIncludedLink: true,
        linkedParentProviderNames: [parentSubscription.providerName],
        linkedParentSubscriptionIds: [parentSubscription.id],
        linkedParentSubscriptions: [
          {
            id: parentSubscription.id,
            providerName: parentSubscription.providerName,
            logoMode: parentSubscription.logoMode
          }
        ],
        subscription: {
          id: virtualEntryId,
          userId: parentSubscription.userId,
          providerName: includedProviderName,
          normalizedProviderName: normalizeCatalogKey(includedProviderName),
          includedProviderNames: [],
          logoMode: "option",
          categoryId: preset?.categorySlug
            ? `${parentSubscription.userId}_cat_${preset.categorySlug}`
            : parentSubscription.categoryId,
          categoryName: preset?.categoryName ?? parentSubscription.categoryName,
          price: 0,
          currency: parentSubscription.currency,
          billingFrequency: parentSubscription.billingFrequency,
          priceMonthly: 0,
          priceYearly: 0,
          nextBillingDate: parentSubscription.nextBillingDate,
          reminderDaysBefore: parentSubscription.reminderDaysBefore,
          status: parentSubscription.status,
          notes: `Inclus via ${parentSubscription.providerName}`,
          trialEndsAt: null,
          lastUsedAt: parentSubscription.lastUsedAt,
          usageCheckIn: parentSubscription.usageCheckIn,
          createdAt: parentSubscription.createdAt,
          updatedAt: parentSubscription.updatedAt,
          archivedAt: null
        }
      });
    });
  });

  return [...Array.from(realEntries.values()), ...virtualEntries];
}

export function sortSubscriptionDisplayEntries(
  entries: SubscriptionDisplayEntry[]
): SubscriptionDisplayEntry[] {
  return [...entries].sort((left, right) => {
    if (left.isIncludedLink !== right.isIncludedLink) {
      return Number(left.isIncludedLink) - Number(right.isIncludedLink);
    }

    if (!left.isIncludedLink && !right.isIncludedLink) {
      const byDate =
        new Date(left.subscription.nextBillingDate).getTime() -
        new Date(right.subscription.nextBillingDate).getTime();

      if (byDate !== 0) {
        return byDate;
      }

      return left.subscription.providerName.localeCompare(
        right.subscription.providerName,
        "fr",
        { sensitivity: "base" }
      );
    }

    const leftParents = left.linkedParentProviderNames?.join(", ") ?? "";
    const rightParents = right.linkedParentProviderNames?.join(", ") ?? "";
    const byParent = leftParents.localeCompare(rightParents, "fr", {
      sensitivity: "base"
    });

    if (byParent !== 0) {
      return byParent;
    }

    return left.subscription.providerName.localeCompare(
      right.subscription.providerName,
      "fr",
      { sensitivity: "base" }
    );
  });
}

export function getLinkedParentSubscriptions(
  targetSubscription: Subscription,
  subscriptions: Subscription[]
): Subscription[] {
  const targetKey = getAssociationKey(targetSubscription.providerName);

  if (!targetKey) {
    return [];
  }

  return subscriptions.filter((subscription) => {
    if (subscription.id === targetSubscription.id) {
      return false;
    }

    return (subscription.includedProviderNames ?? []).some(
      (includedProviderName) => getAssociationKey(includedProviderName) === targetKey
    );
  });
}
