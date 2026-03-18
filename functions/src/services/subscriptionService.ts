import { randomUUID } from "crypto";
import {
  FieldValue
} from "firebase-admin/firestore";
import {
  findCategoryPresetByName,
  FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION,
  FREE_PLAN_MAX_SUBSCRIPTIONS,
  Subscription,
  SubscriptionInput,
  SubscriptionQuery,
  toMonthlyAmount,
  toYearlyAmount
} from "@subly/shared";

import { db } from "../config/firebaseAdmin";
import { addBillingCycle } from "../utils/date";
import { ApiError } from "../utils/apiError";
import { normalizeProviderName } from "../utils/normalize";
import { buildInsights } from "./insightService";

const subscriptionsCollection = db.collection("subscriptions");
const usersCollection = db.collection("users");
const paymentsCollection = db.collection("payments");
const categoriesCollection = db.collection("categories");

function countsTowardLimit(status: Subscription["status"]): boolean {
  return status === "active" || status === "trial";
}

function sanitizeLogoMode(value: unknown): Subscription["logoMode"] {
  return value === "base" ? "base" : "option";
}

function mapSubscription(data: FirebaseFirestore.DocumentData): Subscription {
  return {
    ...data,
    logoMode: sanitizeLogoMode(data.logoMode),
    includedProviderNames: sanitizeIncludedProviderNames(
      String(data.providerName ?? ""),
      Array.isArray(data.includedProviderNames) ? data.includedProviderNames : []
    )
  } as Subscription;
}

function sanitizeIncludedProviderNames(
  providerName: string,
  includedProviderNames: string[]
) {
  const currentProviderKey = normalizeProviderName(providerName);
  const seen = new Set<string>();

  return includedProviderNames
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .filter((value) => {
      const normalized = normalizeProviderName(value);

      if (!normalized || normalized === currentProviderKey || seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
}

async function getOwnedSubscriptions(userId: string): Promise<Subscription[]> {
  const snapshot = await subscriptionsCollection.where("userId", "==", userId).get();
  return snapshot.docs.map((document) => mapSubscription(document.data()));
}

async function ensureCanCreateSubscription(userId: string) {
  const userSnapshot = await usersCollection.doc(userId).get();

  if (!userSnapshot.exists) {
    throw new ApiError(404, "Profil utilisateur introuvable.");
  }

  const profile = userSnapshot.data() as {
    planTier?: "free" | "premium";
    activeSubscriptionCount?: number;
  };

  const activeCount = profile.activeSubscriptionCount ?? 0;

  if ((profile.planTier ?? "free") === "free" && activeCount >= FREE_PLAN_MAX_SUBSCRIPTIONS) {
    throw new ApiError(
      403,
      `La limite du plan gratuit (${FREE_PLAN_MAX_SUBSCRIPTIONS} abonnements) est atteinte. Passe au Premium pour des abonnements illimites.`
    );
  }
}

async function ensureIncludedProviderLimit(userId: string, includedProviderCount: number) {
  const userSnapshot = await usersCollection.doc(userId).get();

  if (!userSnapshot.exists) {
    throw new ApiError(404, "Profil utilisateur introuvable.");
  }

  const profile = userSnapshot.data() as {
    planTier?: "free" | "premium";
  };

  if (
    (profile.planTier ?? "free") === "free" &&
    includedProviderCount > FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION
  ) {
    throw new ApiError(
      403,
      `Le plan gratuit permet jusqu'a ${FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION} services inclus par abonnement. Passe au Premium pour en associer autant que tu veux.`
    );
  }
}

function buildSubscriptionRecord(
  userId: string,
  payload: SubscriptionInput,
  existing?: Subscription
): Subscription {
  const now = new Date().toISOString();
  const providerName = payload.providerName ?? existing?.providerName ?? "";
  const price = payload.price ?? existing?.price ?? 0;
  const billingFrequency = payload.billingFrequency ?? existing?.billingFrequency ?? "monthly";
  const status = payload.status ?? existing?.status ?? (payload.trialEndsAt ? "trial" : "active");

  return {
    id: existing?.id ?? randomUUID(),
    userId,
    providerName,
    normalizedProviderName: normalizeProviderName(
      providerName
    ),
    includedProviderNames: sanitizeIncludedProviderNames(
      providerName,
      payload.includedProviderNames ?? existing?.includedProviderNames ?? []
    ),
    logoMode: sanitizeLogoMode(payload.logoMode ?? existing?.logoMode),
    categoryId: payload.categoryId ?? existing?.categoryId ?? "",
    categoryName: payload.categoryName ?? existing?.categoryName ?? "",
    price,
    currency: payload.currency ?? existing?.currency ?? "EUR",
    billingFrequency,
    priceMonthly: toMonthlyAmount(price, billingFrequency),
    priceYearly: toYearlyAmount(price, billingFrequency),
    nextBillingDate: payload.nextBillingDate ?? existing?.nextBillingDate ?? now,
    reminderDaysBefore: payload.reminderDaysBefore ?? existing?.reminderDaysBefore ?? 3,
    status,
    notes: payload.notes ?? existing?.notes ?? "",
    trialEndsAt: payload.trialEndsAt ?? existing?.trialEndsAt ?? null,
    lastUsedAt: payload.lastUsedAt ?? existing?.lastUsedAt ?? null,
    usageCheckIn: existing?.usageCheckIn ?? "active",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    archivedAt: existing?.archivedAt ?? null
  };
}

async function updateUserSubscriptionCount(userId: string, delta: number) {
  if (delta === 0) {
    return;
  }

  await usersCollection.doc(userId).set(
    {
      activeSubscriptionCount: FieldValue.increment(delta),
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );
}

async function getSubscriptionOrThrow(subscriptionId: string): Promise<Subscription> {
  const snapshot = await subscriptionsCollection.doc(subscriptionId).get();

  if (!snapshot.exists) {
    throw new ApiError(404, "Abonnement introuvable.");
  }

  return mapSubscription(snapshot.data()!);
}

async function ensureCategoryDocument(
  userId: string,
  categoryId: string,
  categoryName: string
): Promise<void> {
  const categoryReference = categoriesCollection.doc(categoryId);
  const snapshot = await categoryReference.get();

  if (snapshot.exists) {
    return;
  }

  const preset = findCategoryPresetByName(categoryName);
  const now = new Date().toISOString();

  await categoryReference.set({
    id: categoryId,
    userId,
    name: categoryName,
    icon: preset?.icon ?? "square",
    color: preset?.color ?? "#8C7BFF",
    isDefault: Boolean(preset),
    createdAt: now
  });
}

export const subscriptionService = {
  async countAllActiveSubscriptions(): Promise<number> {
    const aggregateSnapshot = await subscriptionsCollection.where("status", "==", "active").count().get();
    return aggregateSnapshot.data().count;
  },

  async listSubscriptions(userId: string, query: SubscriptionQuery): Promise<Subscription[]> {
    let subscriptions = await getOwnedSubscriptions(userId);

    subscriptions = subscriptions.filter((subscription) => !subscription.archivedAt);

    if (query.status) {
      subscriptions = subscriptions.filter((subscription) => subscription.status === query.status);
    }

    if (query.categoryId) {
      subscriptions = subscriptions.filter(
        (subscription) => subscription.categoryId === query.categoryId
      );
    }

    if (query.search) {
      const search = query.search.toLowerCase();
      subscriptions = subscriptions.filter((subscription) =>
        subscription.providerName.toLowerCase().includes(search)
      );
    }

    if (query.sort === "price_desc") {
      subscriptions.sort((a, b) => b.priceMonthly - a.priceMonthly);
    }

    if (query.sort === "price_asc") {
      subscriptions.sort((a, b) => a.priceMonthly - b.priceMonthly);
    }

    if (query.sort === "next_billing") {
      subscriptions.sort(
        (a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()
      );
    }

    return subscriptions;
  },

  async createSubscription(userId: string, payload: SubscriptionInput): Promise<Subscription> {
    const subscription = buildSubscriptionRecord(userId, payload);

    if (countsTowardLimit(subscription.status)) {
      await ensureCanCreateSubscription(userId);
    }

    await ensureIncludedProviderLimit(userId, subscription.includedProviderNames.length);

    await ensureCategoryDocument(userId, subscription.categoryId, subscription.categoryName);
    await subscriptionsCollection.doc(subscription.id).set(subscription);

    if (countsTowardLimit(subscription.status)) {
      await updateUserSubscriptionCount(userId, 1);
    }

    return subscription;
  },

  async updateSubscription(
    userId: string,
    subscriptionId: string,
    payload: Partial<SubscriptionInput>
  ): Promise<{ id: string; updatedAt: string }> {
    const existing = await getSubscriptionOrThrow(subscriptionId);

    if (existing.userId !== userId) {
      throw new ApiError(403, "Tu n'as pas acces a cet abonnement.");
    }

    const updated = buildSubscriptionRecord(userId, payload as SubscriptionInput, existing);
    const before = countsTowardLimit(existing.status);
    const after = countsTowardLimit(updated.status);

    if (!before && after) {
      await ensureCanCreateSubscription(userId);
    }

    await ensureIncludedProviderLimit(userId, updated.includedProviderNames.length);

    await ensureCategoryDocument(userId, updated.categoryId, updated.categoryName);
    await subscriptionsCollection.doc(subscriptionId).set(updated, { merge: true });
    await updateUserSubscriptionCount(userId, Number(after) - Number(before));

    return {
      id: subscriptionId,
      updatedAt: updated.updatedAt
    };
  },

  async archiveSubscription(userId: string, subscriptionId: string): Promise<void> {
    const existing = await getSubscriptionOrThrow(subscriptionId);

    if (existing.userId !== userId) {
      throw new ApiError(403, "Tu n'as pas acces a cet abonnement.");
    }

    if (existing.archivedAt) {
      return;
    }

    await subscriptionsCollection.doc(subscriptionId).set(
      {
        status: "cancelled",
        archivedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );

    if (countsTowardLimit(existing.status)) {
      await updateUserSubscriptionCount(userId, -1);
    }
  },

  async getDashboardSummary(userId: string) {
    const subscriptions = (await getOwnedSubscriptions(userId)).filter(
      (subscription) =>
        !subscription.archivedAt &&
        (subscription.status === "active" || subscription.status === "trial")
    );

    const monthlySpending = subscriptions.reduce(
      (total, subscription) => total + subscription.priceMonthly,
      0
    );
    const yearlyEstimate = subscriptions.reduce(
      (total, subscription) => total + subscription.priceYearly,
      0
    );
    const upcomingPayments = subscriptions
      .filter((subscription) => new Date(subscription.nextBillingDate).getTime() >= Date.now())
      .sort(
        (a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()
      )
      .slice(0, 5)
      .map((subscription) => ({
        subscriptionId: subscription.id,
        providerName: subscription.providerName,
        amount: subscription.price,
        dueDate: subscription.nextBillingDate
      }));

    return {
      monthlySpending: Number(monthlySpending.toFixed(2)),
      yearlyEstimate: Number(yearlyEstimate.toFixed(2)),
      subscriptionCount: subscriptions.length,
      upcomingPayments,
      insights: buildInsights(subscriptions)
    };
  },

  async getStatisticsOverview(userId: string) {
    const subscriptions = (await getOwnedSubscriptions(userId)).filter(
      (subscription) =>
        !subscription.archivedAt &&
        (subscription.status === "active" || subscription.status === "trial")
    );

    const byCategoryMap = subscriptions.reduce<
      Record<string, { categoryId: string; categoryName: string; amountMonthly: number }>
    >((accumulator, subscription) => {
      const existing = accumulator[subscription.categoryId];

      accumulator[subscription.categoryId] = {
        categoryId: subscription.categoryId,
        categoryName: subscription.categoryName,
        amountMonthly: Number(
          ((existing?.amountMonthly ?? 0) + subscription.priceMonthly).toFixed(2)
        )
      };

      return accumulator;
    }, {});

    const paymentsSnapshot = await paymentsCollection
      .where("userId", "==", userId)
      .orderBy("chargedAt", "desc")
      .limit(24)
      .get();

    const monthlyTrendMap = paymentsSnapshot.docs.reduce<Record<string, number>>((accumulator, document) => {
      const payment = document.data() as {
        chargedAt: string;
        amount: number;
      };
      const month = payment.chargedAt.slice(0, 7);
      accumulator[month] = Number(((accumulator[month] ?? 0) + payment.amount).toFixed(2));
      return accumulator;
    }, {});

    const monthlyTrend =
      Object.entries(monthlyTrendMap)
        .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
        .map(([month, amount]) => ({ month, amount })) ||
      [];

    const fallbackTrend =
      monthlyTrend.length > 0
        ? monthlyTrend
        : [0, 1, 2].map((offset) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (2 - offset));

            return {
              month: date.toISOString().slice(0, 7),
              amount: Number(
                subscriptions
                  .reduce((total, subscription) => total + subscription.priceMonthly, 0)
                  .toFixed(2)
              )
            };
          });

    const biggestSubscriptions = [...subscriptions]
      .sort((a, b) => b.priceMonthly - a.priceMonthly)
      .slice(0, 5)
      .map((subscription) => ({
        subscriptionId: subscription.id,
        providerName: subscription.providerName,
        amountMonthly: subscription.priceMonthly
      }));

    return {
      byCategory: Object.values(byCategoryMap),
      monthlyTrend: fallbackTrend,
      subscriptionCount: subscriptions.length,
      biggestSubscriptions
    };
  }
};

export async function materializeDuePayments() {
  const now = Date.now();
  const snapshot = await subscriptionsCollection.where("nextBillingDate", "<=", new Date().toISOString()).get();

  for (const document of snapshot.docs) {
    const subscription = mapSubscription(document.data());

    if (subscription.archivedAt || !countsTowardLimit(subscription.status)) {
      continue;
    }

    let cursor = subscription.nextBillingDate;

    while (new Date(cursor).getTime() <= now) {
      const paymentId = `${subscription.id}_${cursor.slice(0, 10)}`;
      const paymentReference = paymentsCollection.doc(paymentId);
      const paymentSnapshot = await paymentReference.get();

      if (!paymentSnapshot.exists) {
        await paymentReference.set({
          id: paymentId,
          userId: subscription.userId,
          subscriptionId: subscription.id,
          providerName: subscription.providerName,
          amount: subscription.price,
          currency: subscription.currency,
          status: "paid",
          billingPeriodStart: cursor,
          billingPeriodEnd: addBillingCycle(cursor, subscription.billingFrequency),
          chargedAt: cursor,
          createdAt: new Date().toISOString()
        });
      }

      cursor = addBillingCycle(cursor, subscription.billingFrequency);
    }

    await subscriptionsCollection.doc(subscription.id).set(
      {
        nextBillingDate: cursor,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  }
}
