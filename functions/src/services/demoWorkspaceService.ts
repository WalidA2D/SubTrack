import {
  DEFAULT_REMINDER_DAYS_BEFORE,
  DEFAULT_LANGUAGE,
  PaymentHistory,
  PREDEFINED_CATEGORY_PRESETS,
  Subscription,
  toMonthlyAmount,
  toYearlyAmount
} from "@subly/shared";

import { db } from "../config/firebaseAdmin";

type DemoUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
};

const usersCollection = db.collection("users");
const categoriesCollection = db.collection("categories");
const subscriptionsCollection = db.collection("subscriptions");
const paymentsCollection = db.collection("payments");
const notificationsCollection = db.collection("notifications");

function buildIsoDate(offsetDays: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  date.setUTCHours(9, 0, 0, 0);
  return date.toISOString();
}

function buildMonthlyPaymentDates(monthsBack: number[]): string[] {
  return monthsBack.map((monthsAgo) => {
    const date = new Date();
    date.setUTCMonth(date.getUTCMonth() - monthsAgo);
    date.setUTCDate(5);
    date.setUTCHours(8, 30, 0, 0);
    return date.toISOString();
  });
}

export async function ensureDemoWorkspace(user: DemoUser) {
  const userReference = usersCollection.doc(user.uid);
  const [userSnapshot, subscriptionsSnapshot] = await Promise.all([
    userReference.get(),
    subscriptionsCollection.where("userId", "==", user.uid).limit(1).get()
  ]);

  const now = new Date().toISOString();
  const existingProfile = userSnapshot.data() as { createdAt?: string } | undefined;
  const createdAt = existingProfile?.createdAt ?? now;

  if (!userSnapshot.exists) {
    await userReference.set(
      {
        id: user.uid,
        email: user.email ?? `${user.uid}@subly.local`,
        displayName: user.displayName ?? "Utilisateur Subly",
        photoUrl: null,
        planTier: "free",
        currency: "EUR",
        language: DEFAULT_LANGUAGE,
        colorBlindMode: false,
        notificationPreferences: {
          notificationsEnabled: true,
          paymentReminders: true,
          trialReminders: true,
          insightNotifications: true,
          defaultReminderDaysBefore: DEFAULT_REMINDER_DAYS_BEFORE
        },
        fcmTokens: [],
        createdAt,
        updatedAt: now
      },
      { merge: true }
    );
  }

  const categoryBatch = db.batch();
  const categories = PREDEFINED_CATEGORY_PRESETS.map((preset) => ({
    id: `${user.uid}_cat_${preset.slug}`,
    userId: user.uid,
    name: preset.name,
    icon: preset.icon,
    color: preset.color,
    isDefault: true,
    createdAt: now
  }));

  categories.forEach((category) => {
    categoryBatch.set(categoriesCollection.doc(category.id), category, { merge: true });
  });

  await categoryBatch.commit();

  if (!subscriptionsSnapshot.empty) {
    return;
  }

  const subscriptions: Subscription[] = [
    {
      id: `${user.uid}_sub_netflix`,
      userId: user.uid,
      providerName: "Netflix",
      normalizedProviderName: "netflix",
      includedProviderNames: [],
      logoMode: "option",
      categoryId: `${user.uid}_cat_divertissement`,
      categoryName: "Divertissement",
      price: 17.99,
      currency: "EUR",
      billingFrequency: "monthly",
      priceMonthly: toMonthlyAmount(17.99, "monthly"),
      priceYearly: toYearlyAmount(17.99, "monthly"),
      nextBillingDate: buildIsoDate(4),
      reminderDaysBefore: 3,
      status: "active",
      notes: "Forfait familial",
      trialEndsAt: null,
      lastUsedAt: buildIsoDate(-2),
      usageCheckIn: "active",
      createdAt: now,
      updatedAt: now,
      archivedAt: null
    },
    {
      id: `${user.uid}_sub_spotify`,
      userId: user.uid,
      providerName: "Spotify",
      normalizedProviderName: "spotify",
      includedProviderNames: [],
      logoMode: "option",
      categoryId: `${user.uid}_cat_musique`,
      categoryName: "Musique",
      price: 12.99,
      currency: "EUR",
      billingFrequency: "monthly",
      priceMonthly: toMonthlyAmount(12.99, "monthly"),
      priceYearly: toYearlyAmount(12.99, "monthly"),
      nextBillingDate: buildIsoDate(9),
      reminderDaysBefore: 2,
      status: "active",
      notes: "Abonnement Duo",
      trialEndsAt: null,
      lastUsedAt: buildIsoDate(-1),
      usageCheckIn: "active",
      createdAt: now,
      updatedAt: now,
      archivedAt: null
    },
    {
      id: `${user.uid}_sub_figma`,
      userId: user.uid,
      providerName: "Figma",
      normalizedProviderName: "figma",
      includedProviderNames: [],
      logoMode: "option",
      categoryId: `${user.uid}_cat_productivite`,
      categoryName: "Productivite",
      price: 16,
      currency: "EUR",
      billingFrequency: "monthly",
      priceMonthly: toMonthlyAmount(16, "monthly"),
      priceYearly: toYearlyAmount(16, "monthly"),
      nextBillingDate: buildIsoDate(2),
      reminderDaysBefore: 2,
      status: "active",
      notes: "Outil design freelance",
      trialEndsAt: null,
      lastUsedAt: buildIsoDate(-45),
      usageCheckIn: "unused",
      createdAt: now,
      updatedAt: now,
      archivedAt: null
    },
    {
      id: `${user.uid}_sub_chatgpt_plus`,
      userId: user.uid,
      providerName: "ChatGPT Plus",
      normalizedProviderName: "chatgpt_plus",
      includedProviderNames: [],
      logoMode: "option",
      categoryId: `${user.uid}_cat_productivite`,
      categoryName: "Productivite",
      price: 20,
      currency: "EUR",
      billingFrequency: "monthly",
      priceMonthly: toMonthlyAmount(20, "monthly"),
      priceYearly: toYearlyAmount(20, "monthly"),
      nextBillingDate: buildIsoDate(6),
      reminderDaysBefore: 2,
      status: "active",
      notes: "Assistant IA pour le travail quotidien",
      trialEndsAt: null,
      lastUsedAt: buildIsoDate(-1),
      usageCheckIn: "active",
      createdAt: now,
      updatedAt: now,
      archivedAt: null
    },
    {
      id: `${user.uid}_sub_neoness`,
      userId: user.uid,
      providerName: "Neoness",
      normalizedProviderName: "neoness",
      includedProviderNames: [],
      logoMode: "option",
      categoryId: `${user.uid}_cat_sport`,
      categoryName: "Sport",
      price: 29.9,
      currency: "EUR",
      billingFrequency: "monthly",
      priceMonthly: toMonthlyAmount(29.9, "monthly"),
      priceYearly: toYearlyAmount(29.9, "monthly"),
      nextBillingDate: buildIsoDate(1),
      reminderDaysBefore: 1,
      status: "active",
      notes: "Salle de sport proche du bureau",
      trialEndsAt: null,
      lastUsedAt: buildIsoDate(-3),
      usageCheckIn: "active",
      createdAt: now,
      updatedAt: now,
      archivedAt: null
    }
  ];

  const paymentDates = buildMonthlyPaymentDates([2, 1, 0]);
  const payments: PaymentHistory[] = subscriptions.flatMap((subscription) =>
    paymentDates.map((chargedAt, index) => ({
      id: `${subscription.id}_payment_${chargedAt.slice(0, 7)}`,
      userId: user.uid,
      subscriptionId: subscription.id,
      providerName: subscription.providerName,
      amount: subscription.price,
      currency: subscription.currency,
      status: "paid",
      billingPeriodStart: chargedAt,
      billingPeriodEnd: chargedAt,
      chargedAt,
      createdAt: paymentDates[Math.max(index - 1, 0)] ?? chargedAt
    }))
  );

  const seedBatch = db.batch();

  subscriptions.forEach((subscription) => {
    seedBatch.set(subscriptionsCollection.doc(subscription.id), subscription);
  });

  payments.forEach((payment) => {
    seedBatch.set(paymentsCollection.doc(payment.id), payment);
  });

  seedBatch.set(
    notificationsCollection.doc(`${user.uid}_notif_figma_unused`),
    {
      id: `${user.uid}_notif_figma_unused`,
      userId: user.uid,
      subscriptionId: `${user.uid}_sub_figma`,
      type: "unused_subscription",
      title: "Abonnement inactif",
      body: "Figma semble inactif depuis plusieurs semaines.",
      scheduledFor: buildIsoDate(0),
      status: "read",
      channels: ["in_app"],
      createdAt: now
    }
  );

  seedBatch.set(
    userReference,
    {
      activeSubscriptionCount: subscriptions.length,
      updatedAt: now
    },
    { merge: true }
  );

  await seedBatch.commit();
}
