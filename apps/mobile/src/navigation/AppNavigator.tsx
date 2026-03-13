import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthScreen } from "../features/auth/AuthScreen";
import { OnboardingScreen } from "../features/auth/OnboardingScreen";
import { DashboardScreen } from "../features/dashboard/DashboardScreen";
import { ProfileScreen } from "../features/profile/ProfileScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { StatisticsScreen } from "../features/statistics/StatisticsScreen";
import { AddSubscriptionScreen } from "../features/subscriptions/AddSubscriptionScreen";
import { SubscriptionDetailsScreen } from "../features/subscriptions/SubscriptionDetailsScreen";
import { SubscriptionListScreen } from "../features/subscriptions/SubscriptionListScreen";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme";
import { MainTabParamList, RootStackParamList } from "./types";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs(): JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border
        }
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Subscriptions" component={SubscriptionListScreen} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator(): JSX.Element {
  const hasCompletedOnboarding = useAuthStore((state) => state.hasCompletedOnboarding);
  const session = useAuthStore((state) => state.session);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!hasCompletedOnboarding ? (
        <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : !session ? (
        <RootStack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <RootStack.Screen name="MainTabs" component={MainTabs} />
          <RootStack.Screen
            name="AddSubscription"
            component={AddSubscriptionScreen}
            options={{ presentation: "modal" }}
          />
          <RootStack.Screen name="SubscriptionDetails" component={SubscriptionDetailsScreen} />
          <RootStack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </RootStack.Navigator>
  );
}
