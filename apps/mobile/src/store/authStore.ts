import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { appConfig } from "../config/appConfig";

export type AuthSession = {
  uid: string;
  email: string;
  displayName: string;
};

type AuthState = {
  hasCompletedOnboarding: boolean;
  isAuthResolved: boolean;
  isStoreHydrated: boolean;
  session: AuthSession | null;
  setOnboardingComplete: () => void;
  setAuthResolved: (value: boolean) => void;
  setStoreHydrated: (value: boolean) => void;
  setSession: (session: AuthSession | null) => void;
  signOutLocally: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      isAuthResolved: appConfig.authMode !== "firebase",
      isStoreHydrated: false,
      session: null,
      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
      setAuthResolved: (value) => set({ isAuthResolved: value }),
      setStoreHydrated: (value) => set({ isStoreHydrated: value }),
      setSession: (session) => set({ session }),
      signOutLocally: () => set({ session: null })
    }),
    {
      name: "subly-auth-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding
      }),
      onRehydrateStorage: () => (state) => {
        state?.setStoreHydrated(true);
      }
    }
  )
);
