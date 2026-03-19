import { PropsWithChildren } from "react";
import { StatusBar } from "expo-status-bar";

import { AppThemeContext, getAppTheme } from "../theme";
import { useWorkspaceStore } from "../store/workspaceStore";

export function AppProviders({ children }: PropsWithChildren): JSX.Element {
  const colorBlindMode = useWorkspaceStore((state) => state.profile?.colorBlindMode ?? false);
  const theme = getAppTheme(colorBlindMode);

  return (
    <AppThemeContext.Provider value={theme}>
      <StatusBar style={theme.statusBarStyle} />
      {children}
    </AppThemeContext.Provider>
  );
}
