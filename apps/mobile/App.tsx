import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";

import { appConfig } from "./src/config/appConfig";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AppProviders } from "./src/providers/AppProviders";
import { useAuthStore } from "./src/store/authStore";
import { useWorkspaceStore } from "./src/store/workspaceStore";

export default function App(): JSX.Element {
  const setSession = useAuthStore((state) => state.setSession);
  const session = useAuthStore((state) => state.session);
  const loadWorkspace = useWorkspaceStore((state) => state.loadWorkspace);
  const resetWorkspace = useWorkspaceStore((state) => state.reset);

  useEffect(() => {
    if (appConfig.authMode !== "firebase") {
      return;
    }

    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const [{ onAuthStateChanged }, { firebaseAuth }] = await Promise.all([
        import("firebase/auth"),
        import("./src/config/firebase")
      ]);

      unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        if (!user) {
          setSession(null);
          return;
        }

        setSession({
          uid: user.uid,
          email: user.email ?? "",
          displayName: user.displayName ?? "Utilisateur Subly"
        });
      });
    })();

    return () => unsubscribe?.();
  }, [setSession]);

  useEffect(() => {
    if (!session) {
      resetWorkspace();
      return;
    }

    void loadWorkspace(true);
  }, [loadWorkspace, resetWorkspace, session]);

  return (
    <AppProviders>
      <StatusBar style="light" />
      <AppNavigator />
    </AppProviders>
  );
}
