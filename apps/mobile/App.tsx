import { useEffect } from "react";

import { appConfig } from "./src/config/appConfig";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AppProviders } from "./src/providers/AppProviders";
import { useAuthStore } from "./src/store/authStore";
import { useWorkspaceStore } from "./src/store/workspaceStore";

export default function App(): JSX.Element {
  const setAuthResolved = useAuthStore((state) => state.setAuthResolved);
  const setSession = useAuthStore((state) => state.setSession);
  const session = useAuthStore((state) => state.session);
  const loadWorkspace = useWorkspaceStore((state) => state.loadWorkspace);
  const resetWorkspace = useWorkspaceStore((state) => state.reset);

  useEffect(() => {
    if (appConfig.authMode !== "firebase") {
      setAuthResolved(true);
      return;
    }

    let isMounted = true;
    let unsubscribe: (() => void) | undefined;
    setAuthResolved(false);

    void (async () => {
      try {
        const [{ onAuthStateChanged }, { firebaseAuth }] = await Promise.all([
          import("firebase/auth"),
          import("./src/config/firebase")
        ]);

        if (!isMounted) {
          return;
        }

        unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
          if (!isMounted) {
            return;
          }

          if (!user) {
            setSession(null);
            setAuthResolved(true);
            return;
          }

          setSession({
            uid: user.uid,
            email: user.email ?? "",
            displayName: user.displayName ?? "Utilisateur Subly"
          });
          setAuthResolved(true);
        });
      } catch {
        if (isMounted) {
          setAuthResolved(true);
        }
      }
    })();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [setAuthResolved, setSession]);

  useEffect(() => {
    if (!session) {
      resetWorkspace();
      return;
    }

    void loadWorkspace(true);
  }, [loadWorkspace, resetWorkspace, session]);

  return (
    <AppProviders>
      <AppNavigator />
    </AppProviders>
  );
}
