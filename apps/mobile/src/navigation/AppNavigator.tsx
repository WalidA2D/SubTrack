import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

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
import {
  useAppNavigation,
  useCurrentOverlayRoute,
  useNavigationStore
} from "../store/navigationStore";
import { colors, spacing } from "../theme";

const TAB_LABELS = {
  Dashboard: "Accueil",
  Statistics: "Statistiques"
} as const;

function MainTabs(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const isTablet = width >= 768;
  const activeTab = useNavigationStore((state) => state.activeTab);
  const setTab = useNavigationStore((state) => state.setTab);
  const navigation = useAppNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {activeTab === "Dashboard" ? <DashboardScreen /> : null}
        {activeTab === "Statistics" ? <StatisticsScreen /> : null}
      </View>
      <View
        style={[
          styles.tabBarWrap,
          isTablet ? styles.tabBarWrapTablet : null
        ]}
      >
        <View
          style={[
            styles.tabBar,
            isCompact ? styles.tabBarCompact : null,
            isTablet ? styles.tabBarTablet : null
          ]}
        >
          {["Dashboard"].map((tab) => (
            <Pressable key={tab} style={styles.tabButton} onPress={() => setTab(tab as never)}>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab ? styles.tabLabelActive : null
                ]}
              >
                {TAB_LABELS[tab as keyof typeof TAB_LABELS]}
              </Text>
              <View
                style={[
                  styles.tabDot,
                  activeTab === tab ? styles.tabDotActive : null
                ]}
              />
            </Pressable>
          ))}
          <Pressable
            style={[
              styles.plusButton,
              isCompact ? styles.plusButtonCompact : null
            ]}
            onPress={() => navigation.navigate("AddSubscription")}
          >
            <Text
              style={styles.plusLabel}
            >
              +
            </Text>
          </Pressable>
          {["Statistics"].map((tab) => (
            <Pressable key={tab} style={styles.tabButton} onPress={() => setTab(tab as never)}>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab ? styles.tabLabelActive : null
                ]}
              >
                {TAB_LABELS[tab as keyof typeof TAB_LABELS]}
              </Text>
              <View
                style={[
                  styles.tabDot,
                  activeTab === tab ? styles.tabDotActive : null
                ]}
              />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

export function AppNavigator(): JSX.Element {
  const hasCompletedOnboarding = useAuthStore((state) => state.hasCompletedOnboarding);
  const session = useAuthStore((state) => state.session);
  const overlayRoute = useCurrentOverlayRoute();

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (overlayRoute?.name === "AddSubscription") {
    return <AddSubscriptionScreen />;
  }

  if (overlayRoute?.name === "Subscriptions") {
    return <SubscriptionListScreen />;
  }

  if (overlayRoute?.name === "SubscriptionDetails") {
    return <SubscriptionDetailsScreen />;
  }

  if (overlayRoute?.name === "Profile") {
    return <ProfileScreen />;
  }

  if (overlayRoute?.name === "Settings") {
    return <SettingsScreen />;
  }

  return <MainTabs />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1
  },
  tabBarWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background
  },
  tabBarWrapTablet: {
    alignItems: "center"
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised
  },
  tabBarCompact: {
    paddingHorizontal: spacing.sm
  },
  tabBarTablet: {
    maxWidth: 560
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 50
  },
  tabLabel: {
    fontSize: 13,
    color: colors.textTertiary,
    fontWeight: "600"
  },
  tabLabelActive: {
    color: colors.primary
  },
  tabDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "transparent"
  },
  tabDotActive: {
    backgroundColor: colors.primary
  },
  plusButton: {
    width: 58,
    height: 58,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: "#FFD18A",
    marginHorizontal: spacing.xs
  },
  plusButtonCompact: {
    width: 52,
    height: 52
  },
  plusLabel: {
    fontSize: 28,
    lineHeight: 28,
    fontWeight: "700",
    color: "#271604"
  }
});
