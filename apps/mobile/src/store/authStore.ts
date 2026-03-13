import { create } from "zustand";

export type AuthSession = {
  uid: string;
  email: string;
  displayName: string;
};

type AuthState = {
  hasCompletedOnboarding: boolean;
  session: AuthSession | null;
  setOnboardingComplete: () => void;
  setSession: (session: AuthSession | null) => void;
  signOutLocally: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  hasCompletedOnboarding: false,
  session: null,
  setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
  setSession: (session) => set({ session }),
  signOutLocally: () => set({ session: null })
}));
