import { create } from "zustand";

import { MainTabParamList, RootStackParamList } from "../navigation/types";

type TabName = keyof MainTabParamList;
type OverlayName =
  | "AddSubscription"
  | "BubbleGallery"
  | "Subscriptions"
  | "SubscriptionDetails"
  | "Profile"
  | "Settings"
  | "LegalDocument";

type OverlayRoute =
  | {
      name: "AddSubscription";
      params?: RootStackParamList["AddSubscription"];
    }
  | {
      name: "BubbleGallery";
      params?: RootStackParamList["BubbleGallery"];
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
    }
  | {
      name: "LegalDocument";
      params: RootStackParamList["LegalDocument"];
    };

type NavigationSnapshot = {
  activeTab: TabName;
  overlayRoute: OverlayRoute | null;
};

type NavigationState = {
  activeTab: TabName;
  overlayRoute: OverlayRoute | null;
  history: NavigationSnapshot[];
  canGoBack: boolean;
  setTab: (tab: TabName) => void;
  navigate: (name: keyof RootStackParamList | keyof MainTabParamList, params?: unknown) => void;
  goBack: () => void;
  resetNavigation: () => void;
};

function createRootNavigationSnapshot(): NavigationSnapshot {
  return {
    activeTab: "Dashboard",
    overlayRoute: null
  };
}

function createCurrentSnapshot(state: NavigationState): NavigationSnapshot {
  return {
    activeTab: state.activeTab,
    overlayRoute: state.overlayRoute
  };
}

function areOverlayRoutesEqual(left: OverlayRoute | null, right: OverlayRoute | null) {
  if (!left && !right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return left.name === right.name && JSON.stringify(left.params ?? null) === JSON.stringify(right.params ?? null);
}

function areSnapshotsEqual(left: NavigationSnapshot, right: NavigationSnapshot) {
  return left.activeTab === right.activeTab && areOverlayRoutesEqual(left.overlayRoute, right.overlayRoute);
}

export const useNavigationStore = create<NavigationState>((set) => ({
  ...createRootNavigationSnapshot(),
  history: [],
  canGoBack: false,
  setTab: (tab) =>
    set((state) => {
      const nextSnapshot: NavigationSnapshot = {
        activeTab: tab,
        overlayRoute: null
      };

      if (areSnapshotsEqual(createCurrentSnapshot(state), nextSnapshot)) {
        return state;
      }

      const nextHistory = [...state.history, createCurrentSnapshot(state)];

      return {
        ...nextSnapshot,
        history: nextHistory,
        canGoBack: nextHistory.length > 0
      };
    }),
  navigate: (name, params) =>
    set((state) => {
    const tabs: TabName[] = ["Dashboard", "Statistics"];

    if (tabs.includes(name as TabName)) {
      const nextSnapshot: NavigationSnapshot = {
        activeTab: name as TabName,
        overlayRoute: null
      };

      if (areSnapshotsEqual(createCurrentSnapshot(state), nextSnapshot)) {
        return state;
      }

      const nextHistory = [...state.history, createCurrentSnapshot(state)];

      return {
        ...nextSnapshot,
        history: nextHistory,
        canGoBack: nextHistory.length > 0
      };
    }

    const overlayName = name as OverlayName;
    const nextSnapshot: NavigationSnapshot = {
      activeTab: state.activeTab,
      overlayRoute: {
        name: overlayName,
        params
      } as OverlayRoute
    };

    if (areSnapshotsEqual(createCurrentSnapshot(state), nextSnapshot)) {
      return state;
    }

    const nextHistory = [...state.history, createCurrentSnapshot(state)];

    return {
      ...nextSnapshot,
      history: nextHistory,
      canGoBack: nextHistory.length > 0
    };
  }),
  goBack: () =>
    set((state) => {
      if (state.history.length === 0) {
        if (!state.overlayRoute) {
          return state;
        }

        return {
          ...state,
          overlayRoute: null,
          canGoBack: false
        };
      }

      const previousSnapshot = state.history[state.history.length - 1];
      const nextHistory = state.history.slice(0, -1);

      return {
        ...previousSnapshot,
        history: nextHistory,
        canGoBack: nextHistory.length > 0
      };
    }),
  resetNavigation: () =>
    set({
      ...createRootNavigationSnapshot(),
      history: [],
      canGoBack: false
    })
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
