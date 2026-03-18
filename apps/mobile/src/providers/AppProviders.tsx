import { PropsWithChildren } from "react";
import { StatusBar } from "expo-status-bar";

import { AppThemeContext, getAppTheme } from "../theme";

export function AppProviders({ children }: PropsWithChildren): JSX.Element {
  const theme = getAppTheme(false);

  return (
    <AppThemeContext.Provider value={theme}>
      <StatusBar style={theme.statusBarStyle} />
      {children}
    </AppThemeContext.Provider>
  );
}
