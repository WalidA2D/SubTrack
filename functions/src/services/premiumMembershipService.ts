import { db } from "../config/firebaseAdmin";
import { normalizeProviderName } from "../utils/normalize";

const usersCollection = db.collection("users");
const subscriptionsCollection = db.collection("subscriptions");
const PREMIUM_MEMBERSHIP_PROVIDER_NAME = "Subly Premium";

type UserProfileRecord = {
  planTier?: "free" | "premium";
};

type PremiumSubscriptionRecord = {
  providerName?: string;
  archivedAt?: string | null;
  cancelAtPeriodEnd?: boolean;
  accessEndsAt?: string | null;
  nextBillingDate?: string | null;
};

export async function syncPremiumPlanStatus(userId: string): Promise<void> {
  const userReference = usersCollection.doc(userId);
  const userSnapshot = await userReference.get();

  if (!userSnapshot.exists) {
    return;
  }

  const profile = userSnapshot.data() as UserProfileRecord;

  if ((profile.planTier ?? "free") !== "premium") {
    return;
  }

  const subscriptionSnapshot = await subscriptionsCollection.where("userId", "==", userId).get();
  const premiumSubscription = subscriptionSnapshot.docs
    .map((document) => document.data() as PremiumSubscriptionRecord)
    .find(
      (subscription) =>
        !subscription.archivedAt &&
        normalizeProviderName(subscription.providerName ?? "") ===
          normalizeProviderName(PREMIUM_MEMBERSHIP_PROVIDER_NAME)
    );

  if (!premiumSubscription || !premiumSubscription.cancelAtPeriodEnd) {
    return;
  }

  const accessEndsAt = premiumSubscription.accessEndsAt ?? premiumSubscription.nextBillingDate;

  if (!accessEndsAt || Number.isNaN(new Date(accessEndsAt).getTime())) {
    return;
  }

  if (new Date(accessEndsAt).getTime() > Date.now()) {
    return;
  }

  await userReference.set(
    {
      planTier: "free",
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );
}
