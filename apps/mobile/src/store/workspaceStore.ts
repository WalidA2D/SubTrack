import { create } from "zustand";
import {
  BillingFrequency,
  Subscription,
  SubscriptionInput,
  UpdateSettingsRequest,
  UserProfile
} from "@subly/shared";

import {
  DashboardSummary,
  StatisticsOverview,
  sublyApi
} from "../services/sublyApi";
import {
  PREMIUM_MEMBERSHIP_PROVIDER_NAME,
  PREMIUM_MONTHLY_AMOUNT,
  PREMIUM_YEARLY_AMOUNT,
  PREMIUM_YEARLY_LIFETIME_OFFER_AMOUNT
} from "../constants/premium";
import { buildCategoryId } from "../utils/format";
import { useAuthStore } from "./authStore";

export type PremiumPlanSelection = "monthly" | "yearly" | "yearly_discounted";

type WorkspaceState = {
  profile: UserProfile | null;
  subscriptions: Subscription[];
  dashboard: DashboardSummary | null;
  statistics: StatisticsOverview | null;
  isLoading: boolean;
  isSavingSubscription: boolean;
  isArchivingSubscription: boolean;
  isUpdatingSettings: boolean;
  isActivatingPremium: boolean;
  isSchedulingPremiumDowngrade: boolean;
  error: string | null;
  hydratedUserId: string | null;
  loadWorkspace: (force?: boolean) => Promise<void>;
  saveSubscription: (payload: SubscriptionInput, subscriptionId?: string) => Promise<void>;
  archiveSubscription: (subscriptionId: string) => Promise<void>;
  updateSettings: (payload: UpdateSettingsRequest) => Promise<void>;
  activatePremiumMembership: (selection: PremiumPlanSelection) => Promise<void>;
  schedulePremiumDowngrade: () => Promise<void>;
  reset: () => void;
};

const PREMIUM_CATEGORY_NAME = "Productivite";

function normalizeProviderName(value: string) {
  return value.trim().toLowerCase();
}

function addBillingCycle(referenceDate: Date, billingFrequency: BillingFrequency) {
  const nextDate = new Date(referenceDate);

  if (billingFrequency === "weekly") {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (billingFrequency === "quarterly") {
    nextDate.setMonth(nextDate.getMonth() + 3);
  } else if (billingFrequency === "yearly") {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate.toISOString();
}

function buildPremiumMembershipPayload(
  selection: PremiumPlanSelection,
  currency: string,
  reminderDaysBefore: number
): SubscriptionInput {
  const billingFrequency: BillingFrequency = selection === "monthly" ? "monthly" : "yearly";
  const price =
    selection === "monthly"
      ? PREMIUM_MONTHLY_AMOUNT
      : selection === "yearly_discounted"
        ? PREMIUM_YEARLY_LIFETIME_OFFER_AMOUNT
        : PREMIUM_YEARLY_AMOUNT;
  const notes =
    selection === "monthly"
      ? "Abonnement genere automatiquement apres activation du plan Subly Premium mensuel."
      : selection === "yearly_discounted"
        ? "Abonnement genere automatiquement apres activation du plan Subly Premium annuel a -50%."
        : "Abonnement genere automatiquement apres activation du plan Subly Premium annuel.";

  return {
    providerName: PREMIUM_MEMBERSHIP_PROVIDER_NAME,
    includedProviderNames: [],
    logoMode: "base",
    categoryId: buildCategoryId(PREMIUM_CATEGORY_NAME),
    categoryName: PREMIUM_CATEGORY_NAME,
    price,
    currency,
    billingFrequency,
    nextBillingDate: addBillingCycle(new Date(), billingFrequency),
    reminderDaysBefore,
    notes,
    trialEndsAt: null,
    lastUsedAt: new Date().toISOString(),
    status: "active",
    cancelAtPeriodEnd: false,
    accessEndsAt: null
  };
}

async function fetchWorkspaceData() {
  const [profile, subscriptions, dashboard, statistics] = await Promise.all([
    sublyApi.getProfile(),
    sublyApi.listSubscriptions(),
    sublyApi.getDashboardSummary(),
    sublyApi.getStatisticsOverview()
  ]);

  return {
    profile,
    subscriptions,
    dashboard,
    statistics
  };
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  profile: null,
  subscriptions: [],
  dashboard: null,
  statistics: null,
  isLoading: false,
  isSavingSubscription: false,
  isArchivingSubscription: false,
  isUpdatingSettings: false,
  isActivatingPremium: false,
  isSchedulingPremiumDowngrade: false,
  error: null,
  hydratedUserId: null,

  async loadWorkspace(force = false) {
    const session = useAuthStore.getState().session;

    if (!session) {
      set({
        profile: null,
        subscriptions: [],
        dashboard: null,
        statistics: null,
        hydratedUserId: null,
        isLoading: false,
        isSavingSubscription: false,
        isArchivingSubscription: false,
        isUpdatingSettings: false,
        isActivatingPremium: false,
        isSchedulingPremiumDowngrade: false,
        error: null
      });
      return;
    }

    if (!force && get().hydratedUserId === session.uid && get().profile) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await fetchWorkspaceData();

      set({
        ...data,
        hydratedUserId: session.uid,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Impossible de charger l'espace Subly."
      });
    }
  },

  async saveSubscription(payload, subscriptionId) {
    set({ isSavingSubscription: true, error: null });

    try {
      if (subscriptionId) {
        await sublyApi.updateSubscription(subscriptionId, payload);
      } else {
        await sublyApi.createSubscription(payload);
      }

      const data = await fetchWorkspaceData();
      const session = useAuthStore.getState().session;

      set({
        ...data,
        hydratedUserId: session?.uid ?? null,
        isSavingSubscription: false,
        error: null
      });
    } catch (error) {
      set({
        isSavingSubscription: false,
        error: error instanceof Error ? error.message : "Impossible d'enregistrer l'abonnement."
      });
      throw error;
    }
  },

  async archiveSubscription(subscriptionId) {
    set({ isArchivingSubscription: true, error: null });

    try {
      await sublyApi.archiveSubscription(subscriptionId);
      const data = await fetchWorkspaceData();
      const session = useAuthStore.getState().session;

      set({
        ...data,
        hydratedUserId: session?.uid ?? null,
        isArchivingSubscription: false,
        error: null
      });
    } catch (error) {
      set({
        isArchivingSubscription: false,
        error: error instanceof Error ? error.message : "Impossible d'archiver l'abonnement."
      });
      throw error;
    }
  },

  async updateSettings(payload) {
    const previousProfile = get().profile;
    const optimisticProfile = previousProfile
      ? {
          ...previousProfile,
          ...(payload.currency ? { currency: payload.currency } : {}),
          ...(payload.language ? { language: payload.language } : {}),
          ...(payload.planTier ? { planTier: payload.planTier } : {}),
          ...(payload.colorBlindMode !== undefined
            ? { colorBlindMode: payload.colorBlindMode }
            : {}),
          ...(payload.fcmTokens !== undefined ? { fcmTokens: payload.fcmTokens } : {}),
          ...(payload.notificationPreferences
            ? {
                notificationPreferences: {
                  ...previousProfile.notificationPreferences,
                  ...payload.notificationPreferences
                }
              }
            : {})
        }
      : null;

    set({
      isUpdatingSettings: true,
      error: null,
      ...(optimisticProfile ? { profile: optimisticProfile } : {})
    });

    try {
      const profile = await sublyApi.updateSettings(payload);
      if (payload.currency) {
        const data = await fetchWorkspaceData();
        const session = useAuthStore.getState().session;

        set({
          ...data,
          hydratedUserId: session?.uid ?? null,
          isUpdatingSettings: false,
          error: null
        });
        return;
      }

      set((state) => ({
        ...state,
        profile,
        isUpdatingSettings: false,
        error: null
      }));
    } catch (error) {
      set({
        ...(previousProfile ? { profile: previousProfile } : {}),
        isUpdatingSettings: false,
        error:
          error instanceof Error ? error.message : "Impossible de mettre a jour les reglages."
      });
      throw error;
    }
  },

  async activatePremiumMembership(selection) {
    const session = useAuthStore.getState().session;
    const previousProfile = get().profile;

    if (!session || !previousProfile) {
      throw new Error("Impossible d'activer Premium sans session active.");
    }

    const premiumSubscription = get().subscriptions.find(
      (subscription) =>
        !subscription.archivedAt &&
        normalizeProviderName(subscription.providerName) ===
          normalizeProviderName(PREMIUM_MEMBERSHIP_PROVIDER_NAME)
    );
    const reminderDaysBefore =
      previousProfile.notificationPreferences?.defaultReminderDaysBefore ?? 3;
    const payload = buildPremiumMembershipPayload(
      selection,
      previousProfile.currency ?? "EUR",
      reminderDaysBefore
    );

    set({
      isActivatingPremium: true,
      error: null,
      profile: {
        ...previousProfile,
        planTier: "premium"
      }
    });

    try {
      await sublyApi.updateSettings({ planTier: "premium" });

      if (premiumSubscription) {
        await sublyApi.updateSubscription(premiumSubscription.id, payload);
      } else {
        await sublyApi.createSubscription(payload);
      }

      const data = await fetchWorkspaceData();

      set({
        ...data,
        hydratedUserId: session.uid,
        isActivatingPremium: false,
        error: null
      });
    } catch (error) {
      set({
        profile: previousProfile,
        isActivatingPremium: false,
        error:
          error instanceof Error ? error.message : "Impossible d'activer l'abonnement Premium."
      });
      throw error;
    }
  },

  async schedulePremiumDowngrade() {
    const session = useAuthStore.getState().session;
    const profile = get().profile;
    const premiumSubscription = get().subscriptions.find(
      (subscription) =>
        !subscription.archivedAt &&
        normalizeProviderName(subscription.providerName) ===
          normalizeProviderName(PREMIUM_MEMBERSHIP_PROVIDER_NAME)
    );

    if (!session || !profile || profile.planTier !== "premium") {
      throw new Error("Aucun abonnement Premium actif a programmer pour le moment.");
    }

    if (!premiumSubscription) {
      throw new Error("L'abonnement Subly Premium est introuvable sur ce compte.");
    }

    if (premiumSubscription.cancelAtPeriodEnd) {
      return;
    }

    const accessEndsAt = premiumSubscription.accessEndsAt ?? premiumSubscription.nextBillingDate;

    set({
      isSchedulingPremiumDowngrade: true,
      error: null
    });

    try {
      await sublyApi.updateSubscription(premiumSubscription.id, {
        status: "cancelled",
        cancelAtPeriodEnd: true,
        accessEndsAt
      });

      const data = await fetchWorkspaceData();

      set({
        ...data,
        hydratedUserId: session.uid,
        isSchedulingPremiumDowngrade: false,
        error: null
      });
    } catch (error) {
      set({
        isSchedulingPremiumDowngrade: false,
        error:
          error instanceof Error
            ? error.message
            : "Impossible de programmer le retour au plan gratuit."
      });
      throw error;
    }
  },

  reset() {
    set({
      profile: null,
      subscriptions: [],
      dashboard: null,
      statistics: null,
      isLoading: false,
      isSavingSubscription: false,
      isArchivingSubscription: false,
      isUpdatingSettings: false,
      isActivatingPremium: false,
      isSchedulingPremiumDowngrade: false,
      error: null,
      hydratedUserId: null
    });
  }
}));
