import { create } from "zustand";
import {
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
import { useAuthStore } from "./authStore";

type WorkspaceState = {
  profile: UserProfile | null;
  subscriptions: Subscription[];
  dashboard: DashboardSummary | null;
  statistics: StatisticsOverview | null;
  isLoading: boolean;
  error: string | null;
  hydratedUserId: string | null;
  loadWorkspace: (force?: boolean) => Promise<void>;
  saveSubscription: (payload: SubscriptionInput, subscriptionId?: string) => Promise<void>;
  archiveSubscription: (subscriptionId: string) => Promise<void>;
  updateSettings: (payload: UpdateSettingsRequest) => Promise<void>;
  reset: () => void;
};

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
    set({ isLoading: true, error: null });

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
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Impossible d'enregistrer l'abonnement."
      });
      throw error;
    }
  },

  async archiveSubscription(subscriptionId) {
    set({ isLoading: true, error: null });

    try {
      await sublyApi.archiveSubscription(subscriptionId);
      const data = await fetchWorkspaceData();
      const session = useAuthStore.getState().session;

      set({
        ...data,
        hydratedUserId: session?.uid ?? null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        isLoading: false,
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
          ...(payload.colorBlindMode !== undefined
            ? { colorBlindMode: payload.colorBlindMode }
            : {}),
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
      isLoading: true,
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
          isLoading: false,
          error: null
        });
        return;
      }

      set((state) => ({
        ...state,
        profile,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      set({
        ...(previousProfile ? { profile: previousProfile } : {}),
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Impossible de mettre a jour les reglages."
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
      error: null,
      hydratedUserId: null
    });
  }
}));
