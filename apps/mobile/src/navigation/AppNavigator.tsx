import { ReactNode, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";

import { AuthScreen } from "../features/auth/AuthScreen";
import { OnboardingScreen } from "../features/auth/OnboardingScreen";
import { BubbleGalleryScreen } from "../features/dashboard/BubbleGalleryScreen";
import { DashboardScreen } from "../features/dashboard/DashboardScreen";
import { AppExperienceOverlay } from "../features/experience/AppExperienceOverlay";
import { NotificationCenterScreen } from "../features/notifications/NotificationCenterScreen";
import { ProfileScreen } from "../features/profile/ProfileScreen";
import { LegalDocumentScreen } from "../features/settings/LegalDocumentScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { StatisticsCalendarScreen } from "../features/statistics/StatisticsCalendarScreen";
import { StatisticsScreen } from "../features/statistics/StatisticsScreen";
import { AddSubscriptionScreen } from "../features/subscriptions/AddSubscriptionScreen";
import { SubscriptionDetailsScreen } from "../features/subscriptions/SubscriptionDetailsScreen";
import { SubscriptionPdfExportScreen } from "../features/subscriptions/SubscriptionPdfExportScreen";
import { SubscriptionListScreen } from "../features/subscriptions/SubscriptionListScreen";
import { useAppTranslation } from "../i18n";
import { useAuthStore } from "../store/authStore";
import {
  useAppNavigation,
  useCurrentOverlayRoute,
  useNavigationStore
} from "../store/navigationStore";
import { AppTheme, radius, spacing, useAppTheme } from "../theme";

const EDGE_BACK_START_WIDTH = 28;
const EDGE_BACK_ACTIVATION_DISTANCE = 12;
const EDGE_BACK_COMMIT_DISTANCE = 64;
const EDGE_BACK_HORIZONTAL_BIAS = 1.2;

function MainTabs(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const isTablet = width >= 768;
  const theme = useAppTheme();
  const { t } = useAppTranslation();
  const styles = createStyles(theme);
  const activeTab = useNavigationStore((state) => state.activeTab);
  const setTab = useNavigationStore((state) => state.setTab);
  const navigation = useAppNavigation();

  const tabLabels = {
    Dashboard: t("nav.dashboard"),
    Statistics: t("nav.statistics")
  } as const;

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
                {tabLabels[tab as keyof typeof tabLabels]}
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
            <Text style={styles.plusLabel}>+</Text>
          </Pressable>
          {["Statistics"].map((tab) => (
            <Pressable key={tab} style={styles.tabButton} onPress={() => setTab(tab as never)}>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab ? styles.tabLabelActive : null
                ]}
              >
                {tabLabels[tab as keyof typeof tabLabels]}
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
  const theme = useAppTheme();
  const { t } = useAppTranslation();
  const styles = createStyles(theme);
  const hasCompletedOnboarding = useAuthStore((state) => state.hasCompletedOnboarding);
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved);
  const isStoreHydrated = useAuthStore((state) => state.isStoreHydrated);
  const session = useAuthStore((state) => state.session);
  const overlayRoute = useCurrentOverlayRoute();
  const resetNavigation = useNavigationStore((state) => state.resetNavigation);

  useEffect(() => {
    if (!session) {
      resetNavigation();
    }
  }, [resetNavigation, session]);

  if (!isAuthResolved || !isStoreHydrated) {
    return (
      <EdgeBackGestureShell>
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingTitle}>{t("nav.openingSpace")}</Text>
          <Text style={styles.loadingBody}>{t("nav.checkingSession")}</Text>
        </View>
      </EdgeBackGestureShell>
    );
  }

  if (session) {
    let content: JSX.Element;

    if (overlayRoute?.name === "AddSubscription") {
      content = <AddSubscriptionScreen />;
    } else if (overlayRoute?.name === "BubbleGallery") {
      content = <BubbleGalleryScreen />;
    } else if (overlayRoute?.name === "Subscriptions") {
      content = <SubscriptionListScreen />;
    } else if (overlayRoute?.name === "SubscriptionPdfExport") {
      content = <SubscriptionPdfExportScreen />;
    } else if (overlayRoute?.name === "SubscriptionDetails") {
      content = <SubscriptionDetailsScreen />;
    } else if (overlayRoute?.name === "StatisticsCalendar") {
      content = <StatisticsCalendarScreen />;
    } else if (overlayRoute?.name === "NotificationCenter") {
      content = <NotificationCenterScreen />;
    } else if (overlayRoute?.name === "Profile") {
      content = <ProfileScreen />;
    } else if (overlayRoute?.name === "Settings") {
      content = <SettingsScreen />;
    } else if (overlayRoute?.name === "LegalDocument") {
      content = <LegalDocumentScreen />;
    } else {
      content = <MainTabs />;
    }

    return (
      <EdgeBackGestureShell>
        <View style={edgeGestureStyles.shell}>
          {content}
          <AppExperienceOverlay />
        </View>
      </EdgeBackGestureShell>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <EdgeBackGestureShell>
        <OnboardingScreen />
      </EdgeBackGestureShell>
    );
  }

  return (
    <EdgeBackGestureShell>
      <AuthScreen />
    </EdgeBackGestureShell>
  );
}

function EdgeBackGestureShell({ children }: { children: ReactNode }): JSX.Element {
  const canGoBack = useNavigationStore((state) => state.canGoBack);
  const goBack = useNavigationStore((state) => state.goBack);
  const touchStartXRef = useRef(Number.POSITIVE_INFINITY);
  const hasTriggeredRef = useRef(false);

  const resetGesture = () => {
    touchStartXRef.current = Number.POSITIVE_INFINITY;
    hasTriggeredRef.current = false;
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: (event) => {
          touchStartXRef.current =
            event.nativeEvent.locationX ?? event.nativeEvent.pageX ?? Number.POSITIVE_INFINITY;
          hasTriggeredRef.current = false;
          return false;
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          canGoBack &&
          touchStartXRef.current <= EDGE_BACK_START_WIDTH &&
          gestureState.dx > EDGE_BACK_ACTIVATION_DISTANCE &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * EDGE_BACK_HORIZONTAL_BIAS,
        onPanResponderRelease: (_, gestureState) => {
          if (
            canGoBack &&
            !hasTriggeredRef.current &&
            touchStartXRef.current <= EDGE_BACK_START_WIDTH &&
            gestureState.dx >= EDGE_BACK_COMMIT_DISTANCE &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * EDGE_BACK_HORIZONTAL_BIAS
          ) {
            hasTriggeredRef.current = true;
            goBack();
          }

          resetGesture();
        },
        onPanResponderTerminate: () => {
          resetGesture();
        },
        onPanResponderTerminationRequest: () => true
      }),
    [canGoBack, goBack]
  );

  return (
    <View style={edgeGestureStyles.shell} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

const edgeGestureStyles = StyleSheet.create({
  shell: {
    flex: 1
  }
});

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    content: {
      flex: 1
    },
    tabBarWrap: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      backgroundColor: theme.colors.background
    },
    tabBarWrapTablet: {
      alignItems: "center"
    },
    tabBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surfaceRaised
    },
    tabBarCompact: {
      paddingHorizontal: spacing.xs
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
      fontSize: 12,
      color: theme.colors.textTertiary,
      fontWeight: "600"
    },
    tabLabelActive: {
      color: theme.colors.primary
    },
    tabDot: {
      width: 5,
      height: 5,
      borderRadius: 999,
      backgroundColor: "transparent"
    },
    tabDotActive: {
      backgroundColor: theme.colors.primary
    },
    plusButton: {
      width: 58,
      height: 58,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.warning,
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
    },
    loadingScreen: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
      gap: spacing.sm,
      backgroundColor: theme.colors.background
    },
    loadingTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    loadingBody: {
      fontSize: 14,
      textAlign: "center",
      color: theme.colors.textSecondary
    }
  });
