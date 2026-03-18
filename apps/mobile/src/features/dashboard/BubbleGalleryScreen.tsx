import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import {
  Subscription
} from "@subly/shared";

import { MickeyBubble } from "../../components/MickeyBubble";
import { PrimaryButton } from "../../components/PrimaryButton";
import {
  isDisneyMickeyProvider
} from "../../components/providerBubbleVariants";
import { Screen } from "../../components/Screen";
import { ServiceLogo } from "../../components/ServiceLogo";
import { useAppTranslation } from "../../i18n";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { AppTheme, radius, shadows, spacing, useAppTheme } from "../../theme";

type FloatingBubbleLayout = {
  size: number;
  top: number;
  left: number;
  floatX: number;
  floatY: number;
  duration: number;
};

export function BubbleGalleryScreen(): JSX.Element {
  const navigation = useAppNavigation();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { t } = useAppTranslation();
  const { width, height } = useWindowDimensions();
  const isCompact = width < 380;
  const isTablet = width >= 768;
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const sortedSubscriptions = useMemo(
    () =>
      [...subscriptions].sort(
        (left, right) =>
          getComparableDateValue(left.nextBillingDate) - getComparableDateValue(right.nextBillingDate)
      ),
    [subscriptions]
  );
  const bubbleSize = isCompact ? 82 : isTablet ? 120 : 98;
  const stageWidth = getGalleryStageWidth(width);
  const stageHeight = getGalleryStageHeight(
    sortedSubscriptions.length,
    bubbleSize,
    isCompact,
    isTablet,
    height
  );
  const bubbleLayouts = useMemo(
    () =>
      buildFloatingBubbleLayouts(
        sortedSubscriptions,
        stageWidth,
        stageHeight,
        bubbleSize,
        isCompact,
        isTablet
      ),
    [bubbleSize, isCompact, isTablet, sortedSubscriptions, stageHeight, stageWidth]
  );

  return (
    <Screen
      title={t("dashboard.bubbles")}
      subtitle={t("dashboard.tapToOpen")}
      action={<PrimaryButton title={t("common.back")} onPress={navigation.goBack} variant="secondary" />}
    >
      {sortedSubscriptions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t("dashboard.noSubscriptions")}</Text>
          <Text style={styles.emptyBody}>{t("dashboard.addFirstService")}</Text>
        </View>
      ) : (
        <View style={[styles.stage, { height: stageHeight }]}>
          <View style={[styles.halo, styles.haloWarm]} />
          <View style={[styles.halo, styles.haloCool]} />
          <View style={[styles.halo, styles.haloMint]} />
          {sortedSubscriptions.map((subscription, index) => (
            <FloatingGalleryBubble
              key={subscription.id}
              subscription={subscription}
              layout={bubbleLayouts[index] ?? bubbleLayouts[0]}
              onPress={() =>
                navigation.navigate("SubscriptionDetails", {
                  subscriptionId: subscription.id
                })
              }
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

function FloatingGalleryBubble({
  subscription,
  layout,
  onPress
}: {
  subscription: Subscription;
  layout: FloatingBubbleLayout;
  onPress: () => void;
}): JSX.Element {
  const styles = createStyles(useAppTheme());
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: layout.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: layout.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [drift, layout.duration]);

  const animatedStyle = {
    transform: [
      {
        translateY: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [-layout.floatY, layout.floatY]
        })
      },
      {
        translateX: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [-layout.floatX, layout.floatX]
        })
      },
      {
        scale: drift.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.04, 1]
        })
      }
    ]
  };

  return (
    <Animated.View
      style={[
        animatedStyle,
        styles.floatingWrap,
        {
          top: layout.top,
          left: layout.left,
          width: layout.size,
          height: layout.size
        }
      ]}
    >
      <Pressable onPress={onPress}>
        <BubbleShell subscription={subscription} size={layout.size} />
      </Pressable>
    </Animated.View>
  );
}

function BubbleShell({
  subscription,
  size
}: {
  subscription: Subscription;
  size: number;
}): JSX.Element {
  if (isDisneyMickeyProvider(subscription.providerName)) {
    return (
      <MickeyBubble
        providerName={subscription.providerName}
        logoMode={subscription.logoMode}
        size={size}
      />
    );
  }

  return <SimpleBubble subscription={subscription} size={size} />;
}

function SimpleBubble({
  subscription,
  size
}: {
  subscription: Subscription;
  size: number;
}): JSX.Element {
  const styles = createStyles(useAppTheme());
  const coreSize = Math.round(size * 0.46);

  return (
    <View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size / 2)
        }
      ]}
    >
      <View
        style={[
          styles.bubbleCore,
          {
            width: coreSize,
            height: coreSize,
            borderRadius: Math.round(coreSize / 2)
          }
        ]}
      >
        <ServiceLogo
          providerName={subscription.providerName}
          logoMode={subscription.logoMode}
          size={Math.round(coreSize * 0.74)}
        />
      </View>
    </View>
  );
}

function buildFloatingBubbleLayouts(
  subscriptions: Subscription[],
  stageWidth: number,
  stageHeight: number,
  bubbleBaseSize: number,
  isCompact: boolean,
  isTablet: boolean
) {
  const columns = isTablet ? 4 : isCompact ? 2 : 3;
  const stagePadding = isTablet ? 28 : 14;
  const rowHeight = Math.round(bubbleBaseSize * (isTablet ? 1.6 : 1.45));
  const columnStep = (stageWidth - stagePadding * 2 - bubbleBaseSize) / (columns - 1);

  return subscriptions.map((subscription, index) => {
    const seed = hashText(`${subscription.id}_${subscription.providerName}`);
    const row = Math.floor(index / columns);
    const column = index % columns;
    const size = Math.round(
      bubbleBaseSize * (0.9 + ((seed % 5) * 0.05))
    );
    const maxLeft = Math.max(stagePadding, stageWidth - size - stagePadding);
    const maxTop = Math.max(stagePadding, stageHeight - size - stagePadding);
    const columnAnchor = stagePadding + column * columnStep;
    const rowAnchor =
      stagePadding +
      row * rowHeight +
      (column % 2 === 0 ? 0 : Math.round(bubbleBaseSize * 0.28));
    const leftJitter = mapSeed(seed, -18, 18);
    const topJitter = mapSeed(seed >> 3, -22, 22);

    return {
      size,
      left: clamp(Math.round(columnAnchor + leftJitter), stagePadding, maxLeft),
      top: clamp(Math.round(rowAnchor + topJitter), stagePadding, maxTop),
      floatX: 10 + (seed % 12),
      floatY: 14 + ((seed >> 5) % 16),
      duration: 3000 + (seed % 2600)
    } satisfies FloatingBubbleLayout;
  });
}

function getGalleryStageWidth(windowWidth: number) {
  const isCompact = windowWidth < 380;
  const isTablet = windowWidth >= 768;
  const horizontalPadding = isCompact ? spacing.md : isTablet ? spacing.xxxl : spacing.lg;
  const maxWidth = isTablet ? 820 : 560;

  return Math.min(maxWidth, windowWidth - horizontalPadding * 2);
}

function getGalleryStageHeight(
  count: number,
  bubbleBaseSize: number,
  isCompact: boolean,
  isTablet: boolean,
  windowHeight: number
) {
  const columns = isTablet ? 4 : isCompact ? 2 : 3;
  const rows = Math.max(1, Math.ceil(count / columns));
  const rowHeight = Math.round(bubbleBaseSize * (isTablet ? 1.6 : 1.45));
  const minHeight = Math.round(windowHeight * (isTablet ? 0.7 : 0.62));

  return Math.max(minHeight, rows * rowHeight + bubbleBaseSize + spacing.xl * 2);
}

function hashText(value: string) {
  let hash = 7;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function mapSeed(seed: number, min: number, max: number) {
  const normalized = (seed % 1000) / 1000;

  return min + (max - min) * normalized;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getComparableDateValue(dateString: string) {
  const date = new Date(dateString);
  const value = date.getTime();

  return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    stage: {
      position: "relative",
      overflow: "hidden",
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceRaised
    },
    halo: {
      position: "absolute",
      borderRadius: 999
    },
    haloWarm: {
      width: 220,
      height: 220,
      top: -40,
      left: -60,
      backgroundColor: theme.colors.glowOrange
    },
    haloCool: {
      width: 210,
      height: 210,
      top: 120,
      right: -70,
      backgroundColor: theme.colors.glowPurple
    },
    haloMint: {
      width: 180,
      height: 180,
      bottom: -30,
      left: "28%",
      backgroundColor: theme.colors.glowGreen
    },
    floatingWrap: {
      position: "absolute"
    },
    bubble: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
      ...shadows.card
    },
    bubbleCore: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.18)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)"
    },
    mickeyBubble: {
      position: "relative"
    },
    mickeyBubbleEar: {
      position: "absolute",
      backgroundColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
      ...shadows.card
    },
    mickeyBubbleEarLeft: {
      transform: [{ rotate: "-6deg" }]
    },
    mickeyBubbleEarRight: {
      transform: [{ rotate: "6deg" }]
    },
    mickeyBubbleHead: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
      ...shadows.card
    },
    mickeyBubbleCore: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.18)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)"
    },
    emptyCard: {
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: radius.md,
      padding: spacing.lg,
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    emptyBody: {
      fontSize: 14,
      color: theme.colors.textSecondary
    }
  });
