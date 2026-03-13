import "react-native-gesture-handler";

import { useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppNavigator } from "./src/navigation/AppNavigator";
import { AppProviders } from "./src/providers/AppProviders";
import { useAuthStore } from "./src/store/authStore";
import { colors } from "./src/theme";

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.textPrimary,
    border: colors.border
  }
};

export default function App(): JSX.Element {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (!user) {
        setSession(null);
        return;
      }

      setSession({
        uid: user.uid,
        email: user.email ?? "",
        displayName: user.displayName ?? "Subly User"
      });
    });

    return unsubscribe;
  }, [setSession]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style="dark" />
            <AppNavigator />
          </NavigationContainer>
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
