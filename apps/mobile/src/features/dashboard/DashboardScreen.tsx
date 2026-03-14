import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { Subscription } from "@subly/shared";

import { BrandLogo } from "../../components/BrandLogo";
import { ServiceLogo } from "../../components/ServiceLogo";
import { SubscriptionListItem } from "../../components/SubscriptionListItem";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { colors, radius, shadows, spacing } from "../../theme";
import {
  formatCurrency,
  formatInsightTitle,
  formatShortDate
} from "../../utils/format";

type BubbleLayout = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  size: number;
  floatX: number;
  floatY: number;
  duration: number;
};

const MAX_BUBBLES = 5;

export function DashboardScreen(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const isTablet = width >= 768;
  const navigation = useAppNavigation();
  const dashboard = useWorkspaceStore((state) => state.dashboard);
  const profile = useWorkspaceStore((state) => state.profile);
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const error = useWorkspaceStore((state) => state.error);
  const [showAnnualTotal, setShowAnnualTotal] = useState(true);
  const currency = profile?.currency ?? "EUR";
  const upcomingPayments = dashboard?.upcomingPayments ?? [];
  const insights = dashboard?.insights ?? [];
  const floatingSubscriptions = useMemo(
    () => selectBubbleSubscriptions(subscriptions, MAX_BUBBLES),
    [subscriptions]
  );
  const bubbleLayouts = useMemo(
    () => buildBubbleLayouts(width, isCompact, floatingSubscriptions, subscriptions),
    [floatingSubscriptions, isCompact, subscriptions, width]
  );
  const summaryLabel = showAnnualTotal ? "Total annuel" : "Total mensuel";
  const summaryValue = showAnnualTotal
    ? dashboard?.yearlyEstimate ?? 0
    : dashboard?.monthlySpending ?? 0;
  const summaryBadgeLabel = showAnnualTotal ? "A" : "M";

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={[styles.glow, styles.glowOrange]} />
        <View style={[styles.glow, styles.glowPurple]} />
        <View style={[styles.glow, styles.glowGreen]} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={[styles.topBar, isCompact ? styles.topBarCompact : null]}>
          <BrandLogo compact={isCompact} />
          <View style={styles.actionRow}>
            <IconActionButton kind="profile" onPress={() => navigation.navigate("Profile")} />
            <IconActionButton kind="settings" onPress={() => navigation.navigate("Settings")} />
          </View>
        </View>

        <View style={[styles.summaryCard, isCompact ? styles.summaryCardCompact : null]}>
          <Pressable
            style={styles.summaryCell}
            onPress={() => setShowAnnualTotal((previous) => !previous)}
          >
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeLabel}>{summaryBadgeLabel}</Text>
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>{summaryLabel}</Text>
              <Text style={[styles.summaryValue, isCompact ? styles.summaryValueCompactMobile : null]}>
                {formatCurrency(summaryValue, currency)}
              </Text>
              <Text style={styles.summaryHint}>Touchez pour basculer</Text>
            </View>
          </Pressable>

          <View style={[styles.summaryDivider, isCompact ? styles.summaryDividerCompact : null]} />

          <View style={styles.summaryCell}>
            <View style={[styles.summaryBadge, styles.summaryBadgeWarm]}>
              <Text style={styles.summaryBadgeLabel}>*</Text>
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Actif</Text>
              <Text
                style={[
                  styles.summaryValueCompact,
                  isCompact ? styles.summaryValueCompactMobile : null
                ]}
              >
                {String(dashboard?.subscriptionCount ?? subscriptions.length).padStart(2, "0")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.clusterWrap}>
          <View style={styles.clusterCaptionRow}>
            <Text style={styles.clusterTitle}>Bulles interactives</Text>
            <Text style={styles.clusterHint}>Touchez pour ouvrir</Text>
          </View>

          <View
            style={[
              styles.clusterStage,
              isCompact ? styles.clusterStageCompact : null,
              isTablet ? styles.clusterStageTablet : null
            ]}
          >
            <View style={[styles.clusterHaloLarge, getClusterHaloStyle(width, "large")]} />
            <View style={[styles.clusterHaloSmall, getClusterHaloStyle(width, "small")]} />
            {floatingSubscriptions.map((subscription, index) => (
              <FloatingSubscriptionBubble
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
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tous les abonnements</Text>
            <Pressable onPress={() => navigation.navigate("Subscriptions")}>
              <Text style={styles.sectionAction}>Tout voir</Text>
            </Pressable>
          </View>
          {subscriptions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {isLoading ? "Chargement..." : "Aucun abonnement pour le moment."}
              </Text>
              <Text style={styles.emptyBody}>
                {error ?? "Ajoute ton premier service pour lancer le tableau de bord."}
              </Text>
            </View>
          ) : (
            subscriptions.map((subscription) => (
              <SubscriptionListItem
                key={subscription.id}
                subscription={subscription}
                onPress={() =>
                  navigation.navigate("SubscriptionDetails", {
                    subscriptionId: subscription.id
                  })
                }
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Paiements a venir</Text>
            <Text style={styles.sectionMeta}>{upcomingPayments.length} a surveiller</Text>
          </View>
          {upcomingPayments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Rien d'immediat a surveiller.</Text>
              <Text style={styles.emptyBody}>
                Les prochains prelevements s'afficheront ici avec leur montant et leur date.
              </Text>
            </View>
          ) : (
            upcomingPayments.map((payment) => (
              <Pressable
                key={payment.subscriptionId}
                style={[styles.timelineCard, isCompact ? styles.timelineCardCompact : null]}
                onPress={() =>
                  navigation.navigate("SubscriptionDetails", {
                    subscriptionId: payment.subscriptionId
                  })
                }
              >
                <View style={styles.timelineIdentity}>
                  <Text style={styles.provider}>{payment.providerName}</Text>
                  <Text style={styles.dueDate}>
                    Prelevement le {formatShortDate(payment.dueDate)}
                  </Text>
                </View>
                <Text style={styles.amount}>{formatCurrency(payment.amount, currency)}</Text>
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertes rapides</Text>
          {insights.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Tout semble sous controle.</Text>
              <Text style={styles.emptyBody}>
                Subly affichera ici les doublons, les services peu utilises et les paiements
                sensibles.
              </Text>
            </View>
          ) : (
            insights.map((insight, index) => (
              <View key={`${insight.type}_${index}`} style={styles.insightCard}>
                <Text style={styles.insightTitle}>{formatInsightTitle(insight.type)}</Text>
                <Text style={styles.insightBody}>{insight.message}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function IconActionButton({
  kind,
  onPress
}: {
  kind: "profile" | "settings";
  onPress: () => void;
}): JSX.Element {
  return (
    <Pressable style={styles.iconAction} onPress={onPress}>
      {kind === "profile" ? <ProfileGlyph /> : <SettingsGlyph />}
    </Pressable>
  );
}

function ProfileGlyph(): JSX.Element {
  return (
    <View style={styles.profileGlyph}>
      <View style={styles.profileGlyphHead} />
      <View style={styles.profileGlyphBody} />
    </View>
  );
}

function SettingsGlyph(): JSX.Element {
  return (
    <View style={styles.settingsGlyph}>
      <View style={styles.settingsGlyphRing} />
      <View style={styles.settingsGlyphCenter} />
      <View style={[styles.settingsGlyphTick, styles.settingsGlyphTickTop]} />
      <View style={[styles.settingsGlyphTick, styles.settingsGlyphTickBottom]} />
      <View style={[styles.settingsGlyphTick, styles.settingsGlyphTickLeft]} />
      <View style={[styles.settingsGlyphTick, styles.settingsGlyphTickRight]} />
    </View>
  );
}

function FloatingSubscriptionBubble({
  subscription,
  layout,
  onPress
}: {
  subscription: Subscription;
  layout: BubbleLayout;
  onPress: () => void;
}): JSX.Element {
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
          outputRange: [1, 1.03, 1]
        })
      }
    ]
  };

  return (
    <Animated.View
      style={[
        styles.bubbleWrap,
        animatedStyle,
        {
          width: layout.size,
          height: layout.size,
          borderRadius: layout.size / 2,
          top: layout.top,
          bottom: layout.bottom,
          left: layout.left,
          right: layout.right
        }
      ]}
    >
      <Pressable
        style={[
          styles.bubble,
          {
            width: layout.size,
            height: layout.size,
            borderRadius: layout.size / 2
          }
        ]}
        onPress={onPress}
      >
        <View
          style={[
            styles.bubbleCore,
            {
              width: Math.round(layout.size * 0.76),
              height: Math.round(layout.size * 0.76),
              borderRadius: Math.round(layout.size * 0.38)
            }
          ]}
        >
          <ServiceLogo
            providerName={subscription.providerName}
            size={Math.round(layout.size * 0.5)}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden"
  },
  glow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999
  },
  glowOrange: {
    top: -80,
    right: -90,
    backgroundColor: colors.glowOrange
  },
  glowPurple: {
    top: 200,
    left: -130,
    backgroundColor: colors.glowPurple
  },
  glowGreen: {
    top: 420,
    right: -100,
    backgroundColor: colors.glowGreen
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl + 76,
    gap: spacing.lg
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  topBarCompact: {
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  iconAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.border
  },
  profileGlyph: {
    width: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  profileGlyphHead: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.textPrimary
  },
  profileGlyphBody: {
    width: 14,
    height: 7,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: colors.textPrimary
  },
  settingsGlyph: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  settingsGlyphRing: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.6,
    borderColor: colors.textPrimary
  },
  settingsGlyphCenter: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textPrimary
  },
  settingsGlyphTick: {
    position: "absolute",
    width: 2,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textPrimary
  },
  settingsGlyphTickTop: {
    top: 0
  },
  settingsGlyphTickBottom: {
    bottom: 0
  },
  settingsGlyphTickLeft: {
    left: 0,
    transform: [{ rotate: "90deg" }]
  },
  settingsGlyphTickRight: {
    right: 0,
    transform: [{ rotate: "90deg" }]
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  summaryCardCompact: {
    flexDirection: "column",
    alignItems: "stretch"
  },
  summaryCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  summaryDivider: {
    width: 1,
    alignSelf: "stretch",
    marginHorizontal: spacing.sm,
    backgroundColor: colors.border
  },
  summaryDividerCompact: {
    width: "100%",
    height: 1,
    marginHorizontal: 0,
    marginVertical: spacing.sm
  },
  summaryBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B2C12"
  },
  summaryBadgeWarm: {
    backgroundColor: "#362012"
  },
  summaryBadgeLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary
  },
  summaryText: {
    flex: 1,
    gap: 2
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary
  },
  summaryValueCompact: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary
  },
  summaryValueCompactMobile: {
    fontSize: 23,
    lineHeight: 28
  },
  summaryHint: {
    fontSize: 11,
    color: colors.textTertiary,
    textTransform: "uppercase"
  },
  clusterWrap: {
    gap: spacing.sm
  },
  clusterCaptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  clusterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary
  },
  clusterHint: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase"
  },
  clusterStage: {
    position: "relative",
    minHeight: 294,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.01)",
    overflow: "hidden",
    width: "100%",
    alignSelf: "center"
  },
  clusterStageCompact: {
    minHeight: 250
  },
  clusterStageTablet: {
    maxWidth: 540
  },
  clusterHaloLarge: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)"
  },
  clusterHaloSmall: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.025)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)"
  },
  bubbleWrap: {
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
  section: {
    gap: spacing.md
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary
  },
  sectionMeta: {
    fontSize: 13,
    color: colors.textSecondary
  },
  timelineCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  timelineCardCompact: {
    alignItems: "flex-start",
    flexDirection: "column"
  },
  timelineIdentity: {
    flex: 1,
    gap: 4
  },
  provider: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary
  },
  dueDate: {
    fontSize: 14,
    color: colors.textSecondary
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary
  },
  insightCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary
  },
  insightBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary
  },
  emptyCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary
  }
});

function buildBubbleLayouts(
  screenWidth: number,
  isCompact: boolean,
  visibleSubscriptions: Subscription[],
  allSubscriptions: Subscription[]
): BubbleLayout[] {
  const stageWidth = Math.min(Math.max(screenWidth - spacing.lg * 2, 280), 540);
  const centerLeft = stageWidth * (isCompact ? 0.33 : 0.38);
  const haloInset = isCompact ? 8 : 12;
  const baseLayouts = [
    {
      top: 16,
      left: centerLeft,
      floatX: 8,
      floatY: 10,
      duration: 4200
    },
    {
      top: 88,
      left: haloInset,
      floatX: -6,
      floatY: 8,
      duration: 4700
    },
    {
      top: isCompact ? 94 : 100,
      right: haloInset,
      floatX: 9,
      floatY: -9,
      duration: 5100
    },
    {
      bottom: isCompact ? 28 : 34,
      left: stageWidth * (isCompact ? 0.3 : 0.34),
      floatX: 6,
      floatY: 9,
      duration: 4600
    },
    {
      bottom: 16,
      right: stageWidth * (isCompact ? 0.23 : 0.28),
      floatX: -5,
      floatY: 7,
      duration: 4900
    }
  ];

  return baseLayouts.map((layout, index) => ({
    ...layout,
    size: getBubbleSizeForSubscription(visibleSubscriptions[index], allSubscriptions, isCompact)
  }));
}

function getClusterHaloStyle(screenWidth: number, kind: "large" | "small") {
  const stageWidth = Math.min(Math.max(screenWidth - spacing.lg * 2, 280), 540);

  if (kind === "large") {
    const size = Math.min(stageWidth * 0.5, 220);

    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      top: 52,
      left: stageWidth * 0.28
    };
  }

  const size = Math.min(stageWidth * 0.34, 148);

  return {
    width: size,
    height: size,
    borderRadius: size / 2,
    top: 82,
    left: stageWidth * 0.38
  };
}

function selectBubbleSubscriptions(
  subscriptions: Subscription[],
  maxCount: number
) {
  const sortedByPrice = [...subscriptions].sort(
    (left, right) => right.priceMonthly - left.priceMonthly
  );
  const visible = sortedByPrice.slice(0, maxCount);
  const latestSubscription = [...subscriptions].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  )[0];

  if (latestSubscription && !visible.some((item) => item.id === latestSubscription.id)) {
    visible.pop();
    visible.push(latestSubscription);
  }

  return visible.sort((left, right) => right.priceMonthly - left.priceMonthly);
}

function getBubbleSizeForSubscription(
  subscription: Subscription | undefined,
  allSubscriptions: Subscription[],
  isCompact: boolean
) {
  const minSize = isCompact ? 54 : 58;
  const maxSize = isCompact ? 108 : 124;

  if (!subscription || allSubscriptions.length === 0) {
    return Math.round((minSize + maxSize) / 2);
  }

  const monthlyPrices = allSubscriptions.map((item) => item.priceMonthly);
  const minPrice = Math.min(...monthlyPrices);
  const maxPrice = Math.max(...monthlyPrices);

  if (minPrice === maxPrice) {
    return Math.round((minSize + maxSize) / 2);
  }

  const normalized = (subscription.priceMonthly - minPrice) / (maxPrice - minPrice);

  return Math.round(minSize + normalized * (maxSize - minSize));
}
