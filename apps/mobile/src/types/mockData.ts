import { Subscription } from "@subly/shared";

export const sampleSubscriptions: Subscription[] = [
  {
    id: "sub_netflix_01",
    userId: "uid_123",
    providerName: "Netflix",
    normalizedProviderName: "netflix",
    includedProviderNames: [],
    logoMode: "option",
    categoryId: "cat_entertainment",
    categoryName: "Entertainment",
    price: 15.99,
    currency: "USD",
    billingFrequency: "monthly",
    priceMonthly: 15.99,
    priceYearly: 191.88,
    nextBillingDate: "2026-03-21T00:00:00.000Z",
    reminderDaysBefore: 3,
    status: "active",
    notes: "Family plan",
    trialEndsAt: null,
    lastUsedAt: "2026-03-01T00:00:00.000Z",
    usageCheckIn: "active",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-03-13T10:00:00.000Z",
    archivedAt: null
  },
  {
    id: "sub_spotify_01",
    userId: "uid_123",
    providerName: "Spotify",
    normalizedProviderName: "spotify",
    includedProviderNames: [],
    logoMode: "option",
    categoryId: "cat_music",
    categoryName: "Music",
    price: 10.99,
    currency: "USD",
    billingFrequency: "monthly",
    priceMonthly: 10.99,
    priceYearly: 131.88,
    nextBillingDate: "2026-03-29T00:00:00.000Z",
    reminderDaysBefore: 2,
    status: "active",
    notes: "Family streaming",
    trialEndsAt: null,
    lastUsedAt: "2026-03-11T00:00:00.000Z",
    usageCheckIn: "active",
    createdAt: "2026-01-12T00:00:00.000Z",
    updatedAt: "2026-03-13T10:00:00.000Z",
    archivedAt: null
  },
  {
    id: "sub_figma_01",
    userId: "uid_123",
    providerName: "Figma",
    normalizedProviderName: "figma",
    includedProviderNames: [],
    logoMode: "option",
    categoryId: "cat_productivity",
    categoryName: "Productivity",
    price: 20,
    currency: "USD",
    billingFrequency: "monthly",
    priceMonthly: 20,
    priceYearly: 240,
    nextBillingDate: "2026-03-18T00:00:00.000Z",
    reminderDaysBefore: 2,
    status: "active",
    notes: "Freelance design work",
    trialEndsAt: null,
    lastUsedAt: "2026-02-05T00:00:00.000Z",
    usageCheckIn: "unused",
    createdAt: "2025-11-22T00:00:00.000Z",
    updatedAt: "2026-03-13T10:00:00.000Z",
    archivedAt: null
  },
  {
    id: "sub_gym_01",
    userId: "uid_123",
    providerName: "Core Gym",
    normalizedProviderName: "core gym",
    includedProviderNames: [],
    logoMode: "option",
    categoryId: "cat_health",
    categoryName: "Health",
    price: 28,
    currency: "USD",
    billingFrequency: "monthly",
    priceMonthly: 28,
    priceYearly: 336,
    nextBillingDate: "2026-03-16T00:00:00.000Z",
    reminderDaysBefore: 1,
    status: "active",
    notes: "Student membership",
    trialEndsAt: null,
    lastUsedAt: "2026-03-12T00:00:00.000Z",
    usageCheckIn: "active",
    createdAt: "2025-08-10T00:00:00.000Z",
    updatedAt: "2026-03-13T10:00:00.000Z",
    archivedAt: null
  }
];

export const sampleInsights = [
  {
    id: "ins_1",
    title: "Unused subscription",
    body: "Figma has not been marked as used in 36 days."
  },
  {
    id: "ins_2",
    title: "Reminder opportunity",
    body: "Core Gym renews tomorrow. Cancel now if you do not plan to use it."
  }
];

export const sampleCategorySpend = [
  { category: "Entertainment", amount: 15.99, percentage: 21 },
  { category: "Music", amount: 10.99, percentage: 15 },
  { category: "Productivity", amount: 20, percentage: 27 },
  { category: "Health", amount: 28, percentage: 37 }
];
