import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlanTier } from "@subly/shared";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type OfferSource = "welcome_tour" | "returning_repeat" | "premium_exit";

export type LimitedPremiumOffer = {
  id: string;
  source: OfferSource;
  startedAt: string;
  expiresAt: string;
  collapsed: boolean;
};

type UserExperienceState = {
  hasCompletedAppTour: boolean;
  tutorialCompletedAt: string | null;
  tutorialSkippedAt: string | null;
  activeOffer: LimitedPremiumOffer | null;
  lastOfferPresentedAt: string | null;
  nextOfferEligibleAt: string | null;
  offerAcceptedAt: string | null;
  discountPriceUnlocked: boolean;
  discountedPremiumActive: boolean;
  lastKnownPlanTier: PlanTier | null;
};

type ExperienceState = {
  users: Record<string, UserExperienceState>;
  ensureUser: (userId: string) => void;
  markTutorialDone: (userId: string, skipped: boolean) => void;
  startWelcomeOffer: (userId: string) => void;
  maybeStartRecurringOffer: (userId: string) => void;
  claimLifetimeOffer: (userId: string) => void;
  syncPlanState: (userId: string, planTier: PlanTier) => void;
  collapseOffer: (userId: string) => void;
  reopenOffer: (userId: string) => void;
  expireOffer: (userId: string) => void;
};

const OFFER_DURATION_MS = 60 * 60 * 1000;
export const DEFAULT_USER_EXPERIENCE_STATE: UserExperienceState = {
  hasCompletedAppTour: false,
  tutorialCompletedAt: null,
  tutorialSkippedAt: null,
  activeOffer: null,
  lastOfferPresentedAt: null,
  nextOfferEligibleAt: null,
  offerAcceptedAt: null,
  discountPriceUnlocked: false,
  discountedPremiumActive: false,
  lastKnownPlanTier: null
};

function getUserState(
  users: Record<string, UserExperienceState>,
  userId: string
): UserExperienceState {
  return {
    ...DEFAULT_USER_EXPERIENCE_STATE,
    ...(users[userId] ?? {})
  };
}

function buildOffer(source: OfferSource): LimitedPremiumOffer {
  const now = Date.now();

  return {
    id: `offer_${source}_${now}`,
    source,
    startedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + OFFER_DURATION_MS).toISOString(),
    collapsed: false
  };
}

function buildNextEligibilityDate(monthsToWait: number, fromDate = new Date()) {
  const nextDate = new Date(fromDate.getTime());
  nextDate.setMonth(nextDate.getMonth() + monthsToWait);
  return nextDate.toISOString();
}

function activateOffer(
  user: UserExperienceState,
  source: OfferSource
): UserExperienceState {
  const offer = buildOffer(source);

  return {
    ...user,
    activeOffer: offer,
    lastOfferPresentedAt: offer.startedAt,
    nextOfferEligibleAt: null
  };
}

export const useExperienceStore = create<ExperienceState>()(
  persist(
    (set, get) => ({
      users: {},

      ensureUser(userId) {
        set((state) => {
          if (state.users[userId]) {
            return state;
          }

          return {
            users: {
              ...state.users,
              [userId]: DEFAULT_USER_EXPERIENCE_STATE
            }
          };
        });
      },

      markTutorialDone(userId, skipped) {
        const now = new Date().toISOString();

        set((state) => {
          const current = getUserState(state.users, userId);

          return {
            users: {
              ...state.users,
              [userId]: {
                ...current,
                hasCompletedAppTour: true,
                tutorialCompletedAt: skipped ? current.tutorialCompletedAt : now,
                tutorialSkippedAt: skipped ? now : current.tutorialSkippedAt
              }
            }
          };
        });
      },

      startWelcomeOffer(userId) {
        set((state) => {
          const current = getUserState(state.users, userId);

          if (current.activeOffer || current.discountPriceUnlocked) {
            return state;
          }

          return {
            users: {
              ...state.users,
              [userId]: activateOffer(current, "welcome_tour")
            }
          };
        });
      },

      maybeStartRecurringOffer(userId) {
        set((state) => {
          const current = getUserState(state.users, userId);
          const now = Date.now();

          if (
            !current.hasCompletedAppTour ||
            current.activeOffer ||
            current.discountPriceUnlocked
          ) {
            return state;
          }

          if (!current.nextOfferEligibleAt) {
            return state;
          }

          if (new Date(current.nextOfferEligibleAt).getTime() > now) {
            return state;
          }

          return {
            users: {
              ...state.users,
              [userId]: activateOffer(current, "returning_repeat")
            }
          };
        });
      },

      claimLifetimeOffer(userId) {
        set((state) => {
          const current = getUserState(state.users, userId);
          const now = new Date().toISOString();

          return {
            users: {
              ...state.users,
              [userId]: {
                ...current,
                activeOffer: null,
                nextOfferEligibleAt: null,
                offerAcceptedAt: current.offerAcceptedAt ?? now,
                discountPriceUnlocked: true,
                discountedPremiumActive:
                  current.lastKnownPlanTier === "premium" || current.discountedPremiumActive
              }
            }
          };
        });
      },

      syncPlanState(userId, planTier) {
        set((state) => {
          const current = getUserState(state.users, userId);
          const previousPlanTier = current.lastKnownPlanTier;
          const now = new Date();

          const baseUser: UserExperienceState = {
            ...current,
            lastKnownPlanTier: planTier
          };

          if (planTier === "premium") {
            const nextUser: UserExperienceState = {
              ...baseUser,
              activeOffer: null,
              nextOfferEligibleAt: null,
              discountedPremiumActive: current.discountPriceUnlocked
            };

            if (JSON.stringify(nextUser) === JSON.stringify(current)) {
              return state;
            }

            return {
              users: {
                ...state.users,
                [userId]: nextUser
              }
            };
          }

          if (previousPlanTier === "premium" && planTier === "free") {
            const nextUser: UserExperienceState = current.discountedPremiumActive
              ? {
                  ...baseUser,
                  activeOffer: null,
                  discountPriceUnlocked: false,
                  discountedPremiumActive: false,
                  nextOfferEligibleAt: buildNextEligibilityDate(6, now)
                }
              : activateOffer(
                  {
                    ...baseUser,
                    discountedPremiumActive: false
                  },
                  "premium_exit"
                );

            return {
              users: {
                ...state.users,
                [userId]: nextUser
              }
            };
          }

          if (previousPlanTier === planTier) {
            if (current.lastKnownPlanTier === planTier) {
              return state;
            }
          }

          return {
            users: {
              ...state.users,
              [userId]: baseUser
            }
          };
        });
      },

      collapseOffer(userId) {
        set((state) => {
          const current = getUserState(state.users, userId);

          if (!current.activeOffer) {
            return state;
          }

          return {
            users: {
              ...state.users,
              [userId]: {
                ...current,
                activeOffer: {
                  ...current.activeOffer,
                  collapsed: true
                }
              }
            }
          };
        });
      },

      reopenOffer(userId) {
        set((state) => {
          const current = getUserState(state.users, userId);

          if (!current.activeOffer) {
            return state;
          }

          return {
            users: {
              ...state.users,
              [userId]: {
                ...current,
                activeOffer: {
                  ...current.activeOffer,
                  collapsed: false
                }
              }
            }
          };
        });
      },

      expireOffer(userId) {
        set((state) => {
          const current = getUserState(state.users, userId);

          if (!current.activeOffer) {
            return state;
          }

          return {
            users: {
              ...state.users,
              [userId]: {
                ...current,
                activeOffer: null,
                nextOfferEligibleAt: buildNextEligibilityDate(2, new Date())
              }
            }
          };
        });
      }
    }),
    {
      name: "subly-experience-store",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

export function getCurrentUserExperience(userId: string | null | undefined) {
  if (!userId) {
    return DEFAULT_USER_EXPERIENCE_STATE;
  }

  return getUserState(useExperienceStore.getState().users, userId);
}
