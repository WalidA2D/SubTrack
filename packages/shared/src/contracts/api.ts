import { z } from "zod";

import {
  billingFrequencySchema,
  planTierSchema,
  subscriptionLogoModeSchema,
  subscriptionStatusSchema
} from "../models/domain";

export const registerRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2)
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email()
});

export const subscriptionInputSchema = z.object({
  providerName: z.string().min(1),
  includedProviderNames: z.array(z.string().min(1)).default([]).optional(),
  logoMode: subscriptionLogoModeSchema.default("option").optional(),
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
  price: z.number().positive(),
  currency: z.string().length(3),
  billingFrequency: billingFrequencySchema,
  nextBillingDate: z.string(),
  reminderDaysBefore: z.number().int().min(0).max(30).default(3),
  notes: z.string().max(500).optional(),
  trialEndsAt: z.string().nullable().optional(),
  lastUsedAt: z.string().nullable().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  accessEndsAt: z.string().nullable().optional(),
  status: subscriptionStatusSchema.optional()
});

export const subscriptionQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  status: subscriptionStatusSchema.optional(),
  sort: z.enum(["price_desc", "price_asc", "next_billing"]).optional()
});

export const updateSettingsSchema = z.object({
  currency: z.string().length(3).optional(),
  language: z.string().min(1).optional(),
  planTier: planTierSchema.optional(),
  colorBlindMode: z.boolean().optional(),
  notificationPreferences: z
    .object({
      paymentReminders: z.boolean().optional(),
      trialReminders: z.boolean().optional(),
      insightNotifications: z.boolean().optional(),
      defaultReminderDaysBefore: z.number().int().min(0).max(30).optional()
    })
    .optional()
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionInputSchema>;
export type SubscriptionQuery = z.infer<typeof subscriptionQuerySchema>;
export type UpdateSettingsRequest = z.infer<typeof updateSettingsSchema>;
