import { z } from "zod";

import { DEFAULT_LANGUAGE } from "../constants/preferences";

export const billingFrequencySchema = z.enum([
  "weekly",
  "monthly",
  "quarterly",
  "yearly"
]);
export const subscriptionStatusSchema = z.enum(["active", "trial", "paused", "cancelled"]);
export const planTierSchema = z.enum(["free", "premium"]);
export const notificationTypeSchema = z.enum(["payment_due", "trial_ending", "unused_subscription", "duplicate_subscription"]);
export const paymentStatusSchema = z.enum(["scheduled", "paid", "missed"]);
export const usageCheckInSchema = z.enum(["active", "unused", "uncertain"]);
export const subscriptionLogoModeSchema = z.enum(["option", "base"]);

export const notificationPreferencesSchema = z.object({
  paymentReminders: z.boolean(),
  trialReminders: z.boolean(),
  insightNotifications: z.boolean(),
  defaultReminderDaysBefore: z.number().int().min(0).max(30)
});

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().min(1),
  photoUrl: z.string().url().nullable().optional(),
  planTier: planTierSchema,
  currency: z.string().length(3),
  language: z.string().min(1).default(DEFAULT_LANGUAGE),
  colorBlindMode: z.boolean().default(false),
  notificationPreferences: notificationPreferencesSchema,
  activeSubscriptionCount: z.number().int().min(0),
  fcmTokens: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const subscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  providerName: z.string().min(1),
  normalizedProviderName: z.string().min(1),
  includedProviderNames: z.array(z.string().min(1)).default([]),
  logoMode: subscriptionLogoModeSchema.default("option"),
  categoryId: z.string(),
  categoryName: z.string(),
  price: z.number().positive(),
  currency: z.string().length(3),
  billingFrequency: billingFrequencySchema,
  priceMonthly: z.number().nonnegative(),
  priceYearly: z.number().nonnegative(),
  nextBillingDate: z.string(),
  reminderDaysBefore: z.number().int().min(0).max(30),
  status: subscriptionStatusSchema,
  notes: z.string().max(500).optional(),
  trialEndsAt: z.string().nullable().optional(),
  lastUsedAt: z.string().nullable().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  accessEndsAt: z.string().nullable().optional(),
  usageCheckIn: usageCheckInSchema.default("active"),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable().optional()
});

export const paymentHistorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  subscriptionId: z.string(),
  providerName: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  status: paymentStatusSchema,
  billingPeriodStart: z.string(),
  billingPeriodEnd: z.string(),
  chargedAt: z.string(),
  createdAt: z.string()
});

export const notificationRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subscriptionId: z.string().nullable().optional(),
  type: notificationTypeSchema,
  title: z.string(),
  body: z.string(),
  scheduledFor: z.string(),
  status: z.enum(["scheduled", "sent", "failed", "read"]),
  channels: z.array(z.enum(["push", "email", "in_app"])),
  createdAt: z.string()
});

export const categorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string()
});

export type BillingFrequency = z.infer<typeof billingFrequencySchema>;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;
export type PlanTier = z.infer<typeof planTierSchema>;
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type UsageCheckIn = z.infer<typeof usageCheckInSchema>;
export type SubscriptionLogoMode = z.infer<typeof subscriptionLogoModeSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type Subscription = z.infer<typeof subscriptionSchema>;
export type PaymentHistory = z.infer<typeof paymentHistorySchema>;
export type NotificationRecord = z.infer<typeof notificationRecordSchema>;
export type Category = z.infer<typeof categorySchema>;
