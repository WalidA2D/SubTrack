import { PropsWithChildren, useEffect } from "react";
import { StatusBar } from "expo-status-bar";

import { setActiveLanguage } from "../i18n";
import { notificationService } from "../services/notificationService";
import { useAuthStore } from "../store/authStore";
import { AppThemeContext, getAppTheme } from "../theme";
import { useWorkspaceStore } from "../store/workspaceStore";

const EMPTY_FCM_TOKENS: string[] = [];

export function AppProviders({ children }: PropsWithChildren): JSX.Element {
  const session = useAuthStore((state) => state.session);
  const profile = useWorkspaceStore((state) => state.profile);
  const updateSettings = useWorkspaceStore((state) => state.updateSettings);
  const colorBlindMode = profile?.colorBlindMode ?? false;
  const fcmTokens = profile?.fcmTokens ?? EMPTY_FCM_TOKENS;
  const language = profile?.language ?? null;
  const notificationsEnabled = profile?.notificationPreferences?.notificationsEnabled ?? true;
  const theme = getAppTheme(colorBlindMode);

  useEffect(() => {
    setActiveLanguage(language);
  }, [language]);

  useEffect(() => {
    void notificationService.initialize();
  }, []);

  useEffect(() => {
    if (!session || !notificationsEnabled) {
      return;
    }

    let isCancelled = false;
    const syncPushToken = async (token: string | null) => {
      if (!token || isCancelled || fcmTokens.includes(token)) {
        return;
      }

      try {
        await updateSettings({
          fcmTokens: [...fcmTokens, token]
        });
      } catch {
        // Keep app startup smooth even if push token sync fails.
      }
    };

    void notificationService.registerForPush().then((token) => {
      void syncPushToken(token);
    });

    const unsubscribe = notificationService.listenForTokenRefresh((token) => {
      void syncPushToken(token);
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [fcmTokens, notificationsEnabled, session, updateSettings]);

  return (
    <AppThemeContext.Provider value={theme}>
      <StatusBar style={theme.statusBarStyle} />
      {children}
    </AppThemeContext.Provider>
  );
}
