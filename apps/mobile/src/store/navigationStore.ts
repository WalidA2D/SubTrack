import { create } from "zustand";

import { MainTabParamList, RootStackParamList } from "../navigation/types";

type TabName = keyof MainTabParamList;
type OverlayName =
  | "AddSubscription"
  | "Subscriptions"
  | "SubscriptionDetails"
  | "Profile"
  | "Settings";

type OverlayRoute =
  | {
      name: "AddSubscription";
      params?: RootStackParamList["AddSubscription"];
    }
  | {
      name: "Subscriptions";
      params?: RootStackParamList["Subscriptions"];
    }
  | {
      name: "SubscriptionDetails";
      params: RootStackParamList["SubscriptionDetails"];
    }
  | {
      name: "Profile";
      params?: RootStackParamList["Profile"];
    }
  | {
      name: "Settings";
      params?: RootStackParamList["Settings"];
    };

type NavigationState = {
  activeTab: TabName;
  overlayRoute: OverlayRoute | null;
  setTab: (tab: TabName) => void;
  navigate: (name: keyof RootStackParamList | keyof MainTabParamList, params?: unknown) => void;
  goBack: () => void;
};

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: "Dashboard",
  overlayRoute: null,
  setTab: (tab) => set({ activeTab: tab, overlayRoute: null }),
  navigate: (name, params) => {
    const tabs: TabName[] = ["Dashboard", "Statistics"];

    if (tabs.includes(name as TabName)) {
      set({
        activeTab: name as TabName,
        overlayRoute: null
      });
      return;
    }

    const overlayName = name as OverlayName;

    set({
      overlayRoute: {
        name: overlayName,
        params
      } as OverlayRoute
    });
  },
  goBack: () =>
    set((state) => ({
      ...state,
      overlayRoute: null
    }))
}));

export function useAppNavigation() {
  const navigate = useNavigationStore((state) => state.navigate);
  const goBack = useNavigationStore((state) => state.goBack);

  return {
    navigate,
    goBack
  };
}

export function useCurrentOverlayRoute() {
  return useNavigationStore((state) => state.overlayRoute);
}
