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
import {
  Subscription
} from "@subly/shared";

import { BrandLogo } from "../../components/BrandLogo";
import { MickeyBubble } from "../../components/MickeyBubble";
import {
  isDisneyMickeyProvider
} from "../../components/providerBubbleVariants";
import { ServiceLogo } from "../../components/ServiceLogo";
import { SubscriptionListItem } from "../../components/SubscriptionListItem";
import { useAppTranslation } from "../../i18n";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { AppTheme, radius, shadows, spacing, useAppTheme } from "../../theme";
import {
  buildSubscriptionDisplayEntries,
  sortSubscriptionDisplayEntries
} from "../../utils/subscriptionLinks";
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

type BubbleLogoMetrics = {
  coreSize: number;
  logoSize: number;
  top: number;
  left: number;
  borderRadius: number;
};

const MAX_BUBBLES = 5;
const MAX_HOME_SUBSCRIPTIONS = 5;
const DUE_SOON_DAYS = 3;

export function DashboardScreen(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const isTablet = width >= 768;
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const navigation = useAppNavigation();
  const { t } = useAppTranslation();
  const dashboard = useWorkspaceStore((state) => state.dashboard);
  const profile = useWorkspaceStore((state) => state.profile);
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const error = useWorkspaceStore((state) => state.error);
  const archiveSubscription = useWorkspaceStore((state) => state.archiveSubscription);
  const [showAnnualTotal, setShowAnnualTotal] = useState(true);
  const [archivingSubscriptionId, setArchivingSubscriptionId] = useState<string | null>(null);
  const currency = profile?.currency ?? "EUR";
  const upcomingPayments = dashboard?.upcomingPayments ?? [];
  const insights = dashboard?.insights ?? [];
  const subscriptionEntries = useMemo(
    () => sortSubscriptionDisplayEntries(buildSubscriptionDisplayEntries(subscriptions)),
    [subscriptions]
  );
  const homeSubscriptions = useMemo(
    () =>
      [...subscriptionEntries]
        .slice(0, MAX_HOME_SUBSCRIPTIONS),
    [subscriptionEntries]
  );
  const floatingSubscriptions = useMemo(
    () => selectBubbleSubscriptions(subscriptions, MAX_BUBBLES),
    [subscriptions]
  );
  const bubbleLayouts = useMemo(
    () => buildBubbleLayouts(width, isCompact, floatingSubscriptions, subscriptions),
    [floatingSubscriptions, isCompact, subscriptions, width]
  );
  const summaryLabel = showAnnualTotal
    ? t("dashboard.summaryYearly")
    : t("dashboard.summaryMonthly");
  const summaryValue = showAnnualTotal
    ? dashboard?.yearlyEstimate ?? 0
    : dashboard?.monthlySpending ?? 0;

  const handleArchiveSubscription = async (subscriptionId: string) => {
    if (archivingSubscriptionId) {
      return;
    }

    setArchivingSubscriptionId(subscriptionId);

    try {
      await archiveSubscription(subscriptionId);
    } catch {
      // The workspace store already exposes the error state if archiving fails.
    } finally {
      setArchivingSubscriptionId((current) =>
        current === subscriptionId ? null : current
      );
    }
  };

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
              <SummaryTotalGlyph />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>{summaryLabel}</Text>
              <Text style={[styles.summaryValue, isCompact ? styles.summaryValueCompactMobile : null]}>
                {formatCurrency(summaryValue, currency)}
              </Text>
              <Text style={styles.summaryHint}>{t("dashboard.tapToToggle")}</Text>
            </View>
          </Pressable>

          <View style={[styles.summaryDivider, isCompact ? styles.summaryDividerCompact : null]} />

          <View style={styles.summaryCell}>
            <View style={[styles.summaryBadge, styles.summaryBadgeWarm]}>
              <SummaryFlameGlyph />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>{t("dashboard.active")}</Text>
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
            <View style={styles.clusterCaptionText}>
              <Text style={styles.clusterTitle}>{t("dashboard.bubbles")}</Text>
              <Text style={styles.clusterHint}>{t("dashboard.tapToOpen")}</Text>
            </View>
            <Pressable onPress={() => navigation.navigate("BubbleGallery")}>
              <Text style={styles.sectionAction}>{t("dashboard.seeAll")}</Text>
            </Pressable>
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
            <Text style={styles.sectionTitle}>{t("dashboard.allSubscriptions")}</Text>
            <Pressable onPress={() => navigation.navigate("Subscriptions")}>
              <Text style={styles.sectionAction}>{t("dashboard.seeAll")}</Text>
            </Pressable>
          </View>
          {subscriptions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {isLoading ? t("common.loading") : t("dashboard.noSubscriptions")}
              </Text>
              <Text style={styles.emptyBody}>
                {error ?? t("dashboard.addFirstService")}
              </Text>
            </View>
          ) : (
            homeSubscriptions.map((entry) => (
              <SubscriptionListItem
                key={entry.id}
                subscription={entry.subscription}
                isIncludedLink={entry.isIncludedLink}
                linkedParentProviderNames={entry.linkedParentProviderNames}
                isDueSoon={
                  entry.isIncludedLink
                    ? false
                    : isDateDueSoon(entry.subscription.nextBillingDate, DUE_SOON_DAYS)
                }
                onArchive={
                  entry.isIncludedLink
                    ? undefined
                    : () => handleArchiveSubscription(entry.subscription.id)
                }
                archiveLabel={t("subscriptions.archive")}
                archiveLoadingLabel={t("subscriptions.archiving")}
                isArchiving={
                  !entry.isIncludedLink && archivingSubscriptionId === entry.subscription.id
                }
                onPress={() =>
                  navigation.navigate("SubscriptionDetails", {
                    subscriptionId:
                      entry.isIncludedLink
                        ? entry.linkedParentSubscriptionIds?.[0] ?? entry.subscription.id
                        : entry.subscription.id
                  })
                }
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("dashboard.upcomingPayments")}</Text>
            <Text style={styles.sectionMeta}>
              {t("dashboard.toWatch", { count: upcomingPayments.length })}
            </Text>
          </View>
          {upcomingPayments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{t("dashboard.nothingImmediate")}</Text>
              <Text style={styles.emptyBody}>
                {t("dashboard.nextPaymentsBody")}
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
                    {t("dashboard.chargedOn", {
                      date: formatShortDate(payment.dueDate)
                    })}
                  </Text>
                </View>
                <Text style={styles.amount}>{formatCurrency(payment.amount, currency)}</Text>
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("dashboard.quickAlerts")}</Text>
          {insights.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{t("dashboard.everythingUnderControl")}</Text>
              <Text style={styles.emptyBody}>
                {t("dashboard.alertsBody")}
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
  const styles = createStyles(useAppTheme());

  return (
    <Pressable style={styles.iconAction} onPress={onPress}>
      {kind === "profile" ? <ProfileGlyph /> : <SettingsGlyph />}
    </Pressable>
  );
}

function ProfileGlyph(): JSX.Element {
  const styles = createStyles(useAppTheme());

  return (
    <View style={styles.profileGlyph}>
      <View style={styles.profileGlyphHead} />
      <View style={styles.profileGlyphBody} />
    </View>
  );
}

function SettingsGlyph(): JSX.Element {
  const styles = createStyles(useAppTheme());

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

function SummaryTotalGlyph(): JSX.Element {
  const styles = createStyles(useAppTheme());

  return (
    <View style={styles.summaryTotalGlyph}>
      <View style={styles.summaryTotalGlyphFlap} />
      <View style={styles.summaryTotalGlyphChip} />
    </View>
  );
}

function SummaryFlameGlyph(): JSX.Element {
  const styles = createStyles(useAppTheme());

  return (
    <View style={styles.summaryFlameGlyph}>
      <View style={styles.summaryFlameOuter} />
      <View style={styles.summaryFlameInner} />
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
          outputRange: [1, 1.03, 1]
        })
      }
    ]
  };
  const isDisneyBubble = isDisneyMickeyProvider(subscription.providerName);
  const isSpecialProviderBubble = isDisneyBubble;
  const useCategoryBubbleShapes = false;
  const isMusicBubble = useCategoryBubbleShapes && isMusicCategory(subscription.categoryName);
  const isAiBubble = useCategoryBubbleShapes && isAICategory(subscription.categoryName);
  const isStreamingBubble =
    useCategoryBubbleShapes && isStreamingCategory(subscription.categoryName);
  const isGamesBubble = useCategoryBubbleShapes && isGamesCategory(subscription.categoryName);
  const isProductivityBubble =
    useCategoryBubbleShapes && isProductivityCategory(subscription.categoryName);
  const isEducationBubble =
    useCategoryBubbleShapes && isEducationCategory(subscription.categoryName);
  const isEntertainmentBubble =
    useCategoryBubbleShapes && isEntertainmentCategory(subscription.categoryName);
  const isFinanceBubble = useCategoryBubbleShapes && isFinanceCategory(subscription.categoryName);
  const isSecurityBubble =
    useCategoryBubbleShapes && isSecurityCategory(subscription.categoryName);
  const isTravelBubble = useCategoryBubbleShapes && isTravelCategory(subscription.categoryName);
  const isSportBubble = useCategoryBubbleShapes && isSportCategory(subscription.categoryName);
  const isHealthBubble = useCategoryBubbleShapes && isHealthCategory(subscription.categoryName);
  const bubbleLogoMetrics = isDisneyBubble
    ? getSpecialBubbleLogoMetrics(subscription, layout.size)
    : null;
  const bubbleLogoMode = subscription.logoMode ?? "option";

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
        style={
          isSpecialProviderBubble
            ? [
                {
                  width: layout.size,
                  height: layout.size
                }
              ]
            : isAiBubble
            ? [
                styles.aiBubble,
                {
                  width: layout.size,
                  height: layout.size
                }
              ]
            : isMusicBubble
            ? [
                styles.musicBubble,
                {
                  width: layout.size,
                  height: layout.size
                }
              ]
            : isStreamingBubble
              ? [
                  styles.streamingBubble,
                  {
                    width: layout.size,
                    height: layout.size
                  }
                ]
              : isGamesBubble
                ? [
                    styles.gamesBubble,
                    {
                      width: layout.size,
                      height: layout.size
                    }
                  ]
                : isProductivityBubble
                  ? [
                      styles.productivityBubble,
                      {
                        width: layout.size,
                        height: layout.size
                      }
                    ]
                  : isEducationBubble
                    ? [
                        styles.educationBubble,
                        {
                          width: layout.size,
                          height: layout.size
                        }
                      ]
                  : isEntertainmentBubble
                    ? [
                        styles.entertainmentBubble,
                        {
                          width: layout.size,
                          height: layout.size
                        }
                      ]
                  : isFinanceBubble
                    ? [
                        styles.financeBubble,
                        {
                          width: layout.size,
                          height: layout.size
                        }
                      ]
                  : isSecurityBubble
                    ? [
                        styles.securityBubble,
                        {
                          width: layout.size,
                          height: layout.size
                        }
                      ]
                  : isTravelBubble
                    ? [
                        styles.travelBubble,
                        {
                          width: layout.size,
                          height: layout.size
                        }
                      ]
                  : isSportBubble
                    ? [
                        styles.sportBubble,
                        {
                          width: layout.size,
                          height: layout.size
                        }
                      ]
                  : isHealthBubble
                    ? [
                        styles.healthBubble,
                        {
                          width: layout.size,
                          height: layout.size
                        }
                      ]
            : [
                styles.bubble,
                {
                  width: layout.size,
                  height: layout.size,
                  borderRadius: layout.size / 2
                }
              ]
        }
        onPress={onPress}
      >
        {isDisneyBubble ? (
          <MickeyBubble
            providerName={subscription.providerName}
            logoMode={bubbleLogoMode}
            size={layout.size}
            coreScale={0.36}
            logoScale={0.9}
          />
        ) : isAiBubble ? (
          <>
            <View
              style={[
                styles.aiBubbleAntenna,
                {
                  width: Math.max(8, Math.round(layout.size * 0.06)),
                  height: Math.round(layout.size * 0.14),
                  borderRadius: Math.round(layout.size * 0.03),
                  top: Math.round(layout.size * 0.08),
                  left: Math.round(layout.size * 0.47)
                }
              ]}
            />
            <View
              style={[
                styles.aiBubbleAntennaTip,
                {
                  width: Math.round(layout.size * 0.12),
                  height: Math.round(layout.size * 0.12),
                  borderRadius: Math.round(layout.size * 0.06),
                  top: Math.round(layout.size * 0.02),
                  left: Math.round(layout.size * 0.44)
                }
              ]}
            />
            <View
              style={[
                styles.aiBubbleHead,
                {
                  width: Math.round(layout.size * 0.62),
                  height: Math.round(layout.size * 0.5),
                  borderRadius: Math.round(layout.size * 0.16),
                  top: Math.round(layout.size * 0.2),
                  left: Math.round(layout.size * 0.19)
                }
              ]}
            />
            <View
              style={[
                styles.aiBubbleEar,
                {
                  width: Math.round(layout.size * 0.1),
                  height: Math.round(layout.size * 0.18),
                  borderRadius: Math.round(layout.size * 0.05),
                  top: Math.round(layout.size * 0.35),
                  left: Math.round(layout.size * 0.09)
                }
              ]}
            />
            <View
              style={[
                styles.aiBubbleEar,
                {
                  width: Math.round(layout.size * 0.1),
                  height: Math.round(layout.size * 0.18),
                  borderRadius: Math.round(layout.size * 0.05),
                  top: Math.round(layout.size * 0.35),
                  left: Math.round(layout.size * 0.81)
                }
              ]}
            />
            <View
              style={[
                styles.aiBubbleEye,
                {
                  width: Math.round(layout.size * 0.08),
                  height: Math.round(layout.size * 0.08),
                  borderRadius: Math.round(layout.size * 0.04),
                  top: Math.round(layout.size * 0.31),
                  left: Math.round(layout.size * 0.33)
                }
              ]}
            />
            <View
              style={[
                styles.aiBubbleEye,
                {
                  width: Math.round(layout.size * 0.08),
                  height: Math.round(layout.size * 0.08),
                  borderRadius: Math.round(layout.size * 0.04),
                  top: Math.round(layout.size * 0.31),
                  left: Math.round(layout.size * 0.59)
                }
              ]}
            />
            <View
              style={[
                styles.aiBubbleMouth,
                {
                  width: Math.round(layout.size * 0.22),
                  height: Math.max(6, Math.round(layout.size * 0.05)),
                  borderRadius: Math.round(layout.size * 0.025),
                  top: Math.round(layout.size * 0.58),
                  left: Math.round(layout.size * 0.39)
                }
              ]}
            />
            <View
              style={[
                styles.aiBubbleCore,
                {
                  width: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.28),
                  height: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.28),
                  borderRadius:
                    bubbleLogoMetrics?.borderRadius ?? Math.round(layout.size * 0.14),
                  top: bubbleLogoMetrics?.top ?? Math.round(layout.size * 0.39),
                  left: bubbleLogoMetrics?.left ?? Math.round(layout.size * 0.36)
                }
              ]}
            >
              <ServiceLogo
                providerName={subscription.providerName}
                logoMode={bubbleLogoMode}
                size={bubbleLogoMetrics?.logoSize ?? Math.round(layout.size * 0.2)}
              />
            </View>
          </>
        ) : isMusicBubble ? (
          <>
            <View
              style={[
                styles.musicBubbleStem,
                {
                  width: Math.max(10, Math.round(layout.size * 0.14)),
                  height: Math.round(layout.size * 0.62),
                  borderRadius: Math.round(layout.size * 0.08),
                  top: Math.round(layout.size * 0.08),
                  left: Math.round(layout.size * 0.57)
                }
              ]}
            />
            <View
              style={[
                styles.musicBubbleFlag,
                {
                  width: Math.round(layout.size * 0.28),
                  height: Math.round(layout.size * 0.26),
                  borderTopLeftRadius: Math.round(layout.size * 0.18),
                  borderTopRightRadius: Math.round(layout.size * 0.14),
                  borderBottomLeftRadius: Math.round(layout.size * 0.16),
                  borderBottomRightRadius: Math.round(layout.size * 0.08),
                  top: Math.round(layout.size * 0.07),
                  left: Math.round(layout.size * 0.56)
                }
              ]}
            />
            <View
              style={[
                styles.musicBubbleHead,
                {
                  width: Math.round(layout.size * 0.62),
                  height: Math.round(layout.size * 0.48),
                  borderRadius: Math.round(layout.size * 0.22),
                  bottom: Math.round(layout.size * 0.08),
                  left: Math.round(layout.size * 0.08)
                }
              ]}
            >
              <View
                style={[
                  styles.musicBubbleCore,
                  {
                    width: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.42),
                    height: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.42),
                    borderRadius:
                      bubbleLogoMetrics?.borderRadius ?? Math.round(layout.size * 0.21)
                  }
                ]}
              >
                <ServiceLogo
                  providerName={subscription.providerName}
                  logoMode={bubbleLogoMode}
                  size={bubbleLogoMetrics?.logoSize ?? Math.round(layout.size * 0.28)}
                />
              </View>
            </View>
          </>
        ) : isStreamingBubble ? (
          <>
            <View
              style={[
                styles.streamingBubbleOutline,
                {
                  borderTopWidth: Math.round(layout.size * 0.33),
                  borderBottomWidth: Math.round(layout.size * 0.33),
                  borderLeftWidth: Math.round(layout.size * 0.58),
                  top: Math.round(layout.size * 0.16),
                  left: Math.round(layout.size * 0.18)
                }
              ]}
            />
            <View
              style={[
                styles.streamingBubbleTriangle,
                {
                  borderTopWidth: Math.round(layout.size * 0.28),
                  borderBottomWidth: Math.round(layout.size * 0.28),
                  borderLeftWidth: Math.round(layout.size * 0.5),
                  top: Math.round(layout.size * 0.21),
                  left: Math.round(layout.size * 0.24)
                }
              ]}
            />
            <View
              style={[
                styles.streamingBubbleCore,
                {
                  width: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.34),
                  height: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.34),
                  borderRadius:
                    bubbleLogoMetrics?.borderRadius ?? Math.round(layout.size * 0.17),
                  top: bubbleLogoMetrics?.top ?? Math.round(layout.size * 0.33),
                  left: bubbleLogoMetrics?.left ?? Math.round(layout.size * 0.2)
                }
              ]}
            >
              <ServiceLogo
                providerName={subscription.providerName}
                logoMode={bubbleLogoMode}
                size={bubbleLogoMetrics?.logoSize ?? Math.round(layout.size * 0.22)}
              />
            </View>
          </>
        ) : isGamesBubble ? (
          <>
            <View
              style={[
                styles.gamesBubbleShell,
                {
                  width: Math.round(layout.size * 0.68),
                  height: Math.round(layout.size * 0.34),
                  borderRadius: Math.round(layout.size * 0.15),
                  top: Math.round(layout.size * 0.3),
                  left: Math.round(layout.size * 0.16)
                }
              ]}
            />
            <View
              style={[
                styles.gamesBubbleGrip,
                styles.gamesBubbleGripLeft,
                {
                  width: Math.round(layout.size * 0.26),
                  height: Math.round(layout.size * 0.3),
                  borderRadius: Math.round(layout.size * 0.14),
                  top: Math.round(layout.size * 0.36),
                  left: Math.round(layout.size * 0.04)
                }
              ]}
            />
            <View
              style={[
                styles.gamesBubbleGrip,
                styles.gamesBubbleGripRight,
                {
                  width: Math.round(layout.size * 0.26),
                  height: Math.round(layout.size * 0.3),
                  borderRadius: Math.round(layout.size * 0.14),
                  top: Math.round(layout.size * 0.36),
                  left: Math.round(layout.size * 0.7)
                }
              ]}
            />
            <View
              style={[
                styles.gamesBubbleCore,
                {
                  width: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.28),
                  height: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.28),
                  borderRadius:
                    bubbleLogoMetrics?.borderRadius ?? Math.round(layout.size * 0.14),
                  top: bubbleLogoMetrics?.top ?? Math.round(layout.size * 0.33),
                  left: bubbleLogoMetrics?.left ?? Math.round(layout.size * 0.36)
                }
              ]}
            >
              <ServiceLogo
                providerName={subscription.providerName}
                logoMode={bubbleLogoMode}
                size={bubbleLogoMetrics?.logoSize ?? Math.round(layout.size * 0.18)}
              />
            </View>
            <View
              style={[
                styles.gamesBubbleDpadVertical,
                {
                  width: Math.max(6, Math.round(layout.size * 0.06)),
                  height: Math.round(layout.size * 0.18),
                  borderRadius: Math.round(layout.size * 0.03),
                  top: Math.round(layout.size * 0.39),
                  left: Math.round(layout.size * 0.2)
                }
              ]}
            />
            <View
              style={[
                styles.gamesBubbleDpadHorizontal,
                {
                  width: Math.round(layout.size * 0.18),
                  height: Math.max(6, Math.round(layout.size * 0.06)),
                  borderRadius: Math.round(layout.size * 0.03),
                  top: Math.round(layout.size * 0.45),
                  left: Math.round(layout.size * 0.14)
                }
              ]}
            />
            <View
              style={[
                styles.gamesBubbleButton,
                {
                  width: Math.round(layout.size * 0.08),
                  height: Math.round(layout.size * 0.08),
                  borderRadius: Math.round(layout.size * 0.04),
                  top: Math.round(layout.size * 0.39),
                  left: Math.round(layout.size * 0.74)
                }
              ]}
            />
            <View
              style={[
                styles.gamesBubbleButton,
                {
                  width: Math.round(layout.size * 0.08),
                  height: Math.round(layout.size * 0.08),
                  borderRadius: Math.round(layout.size * 0.04),
                  top: Math.round(layout.size * 0.47),
                  left: Math.round(layout.size * 0.81)
                }
              ]}
            />
            <View
              style={[
                styles.gamesBubbleButton,
                {
                  width: Math.round(layout.size * 0.08),
                  height: Math.round(layout.size * 0.08),
                  borderRadius: Math.round(layout.size * 0.04),
                  top: Math.round(layout.size * 0.55),
                  left: Math.round(layout.size * 0.74)
                }
              ]}
            />
            <View
              style={[
                styles.gamesBubbleButton,
                {
                  width: Math.round(layout.size * 0.08),
                  height: Math.round(layout.size * 0.08),
                  borderRadius: Math.round(layout.size * 0.04),
                  top: Math.round(layout.size * 0.47),
                  left: Math.round(layout.size * 0.67)
                }
              ]}
            />
          </>
        ) : isProductivityBubble ? (
          <>
            <View
              style={[
                styles.productivityBubbleHandle,
                {
                  width: Math.round(layout.size * 0.24),
                  height: Math.round(layout.size * 0.12),
                  borderTopLeftRadius: Math.round(layout.size * 0.08),
                  borderTopRightRadius: Math.round(layout.size * 0.08),
                  top: Math.round(layout.size * 0.18),
                  left: Math.round(layout.size * 0.38)
                }
              ]}
            />
            <View
              style={[
                styles.productivityBubbleBody,
                {
                  width: Math.round(layout.size * 0.7),
                  height: Math.round(layout.size * 0.48),
                  borderRadius: Math.round(layout.size * 0.16),
                  top: Math.round(layout.size * 0.3),
                  left: Math.round(layout.size * 0.15)
                }
              ]}
            />
            <View
              style={[
                styles.productivityBubbleLatch,
                {
                  width: Math.round(layout.size * 0.14),
                  height: Math.round(layout.size * 0.06),
                  borderRadius: Math.round(layout.size * 0.03),
                  top: Math.round(layout.size * 0.46),
                  left: Math.round(layout.size * 0.43)
                }
              ]}
            />
            <View
              style={[
                styles.productivityBubbleCore,
                {
                  width: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.28),
                  height: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.28),
                  borderRadius:
                    bubbleLogoMetrics?.borderRadius ?? Math.round(layout.size * 0.14),
                  top: bubbleLogoMetrics?.top ?? Math.round(layout.size * 0.4),
                  left: bubbleLogoMetrics?.left ?? Math.round(layout.size * 0.36)
                }
              ]}
            >
              <ServiceLogo
                providerName={subscription.providerName}
                logoMode={bubbleLogoMode}
                size={bubbleLogoMetrics?.logoSize ?? Math.round(layout.size * 0.18)}
              />
            </View>
          </>
        ) : isEducationBubble ? (
          <>
            <View
              style={[
                styles.educationBubblePage,
                styles.educationBubblePageLeft,
                {
                  width: Math.round(layout.size * 0.32),
                  height: Math.round(layout.size * 0.48),
                  borderTopLeftRadius: Math.round(layout.size * 0.12),
                  borderTopRightRadius: Math.round(layout.size * 0.06),
                  borderBottomLeftRadius: Math.round(layout.size * 0.08),
                  borderBottomRightRadius: Math.round(layout.size * 0.08),
                  top: Math.round(layout.size * 0.22),
                  left: Math.round(layout.size * 0.18)
                }
              ]}
            />
            <View
              style={[
                styles.educationBubblePage,
                styles.educationBubblePageRight,
                {
                  width: Math.round(layout.size * 0.32),
                  height: Math.round(layout.size * 0.48),
                  borderTopLeftRadius: Math.round(layout.size * 0.06),
                  borderTopRightRadius: Math.round(layout.size * 0.12),
                  borderBottomLeftRadius: Math.round(layout.size * 0.08),
                  borderBottomRightRadius: Math.round(layout.size * 0.08),
                  top: Math.round(layout.size * 0.22),
                  left: Math.round(layout.size * 0.5)
                }
              ]}
            />
            <View
              style={[
                styles.educationBubbleSpine,
                {
                  width: Math.max(10, Math.round(layout.size * 0.08)),
                  height: Math.round(layout.size * 0.52),
                  borderRadius: Math.round(layout.size * 0.04),
                  top: Math.round(layout.size * 0.21),
                  left: Math.round(layout.size * 0.46)
                }
              ]}
            />
            <View
              style={[
                styles.educationBubblePageLine,
                {
                  width: Math.round(layout.size * 0.14),
                  height: Math.max(3, Math.round(layout.size * 0.018)),
                  borderRadius: Math.round(layout.size * 0.01),
                  top: Math.round(layout.size * 0.36),
                  left: Math.round(layout.size * 0.23)
                }
              ]}
            />
            <View
              style={[
                styles.educationBubblePageLine,
                {
                  width: Math.round(layout.size * 0.14),
                  height: Math.max(3, Math.round(layout.size * 0.018)),
                  borderRadius: Math.round(layout.size * 0.01),
                  top: Math.round(layout.size * 0.46),
                  left: Math.round(layout.size * 0.23)
                }
              ]}
            />
            <View
              style={[
                styles.educationBubblePageLine,
                {
                  width: Math.round(layout.size * 0.14),
                  height: Math.max(3, Math.round(layout.size * 0.018)),
                  borderRadius: Math.round(layout.size * 0.01),
                  top: Math.round(layout.size * 0.36),
                  left: Math.round(layout.size * 0.62)
                }
              ]}
            />
            <View
              style={[
                styles.educationBubblePageLine,
                {
                  width: Math.round(layout.size * 0.14),
                  height: Math.max(3, Math.round(layout.size * 0.018)),
                  borderRadius: Math.round(layout.size * 0.01),
                  top: Math.round(layout.size * 0.46),
                  left: Math.round(layout.size * 0.62)
                }
              ]}
            />
            <View
              style={[
                styles.educationBubblePageEdge,
                {
                  width: Math.round(layout.size * 0.62),
                  height: Math.max(4, Math.round(layout.size * 0.024)),
                  borderRadius: Math.round(layout.size * 0.012),
                  top: Math.round(layout.size * 0.22),
                  left: Math.round(layout.size * 0.19)
                }
              ]}
            />
            <View
              style={[
                styles.educationBubblePageEdge,
                {
                  width: Math.round(layout.size * 0.62),
                  height: Math.max(4, Math.round(layout.size * 0.024)),
                  borderRadius: Math.round(layout.size * 0.012),
                  top: Math.round(layout.size * 0.68),
                  left: Math.round(layout.size * 0.19)
                }
              ]}
            />
            <View
              style={[
                styles.educationBubbleCore,
                {
                  width: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.26),
                  height: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.26),
                  borderRadius:
                    bubbleLogoMetrics?.borderRadius ?? Math.round(layout.size * 0.13),
                  top: bubbleLogoMetrics?.top ?? Math.round(layout.size * 0.42),
                  left: bubbleLogoMetrics?.left ?? Math.round(layout.size * 0.37)
                }
              ]}
            >
              <ServiceLogo
                providerName={subscription.providerName}
                logoMode={bubbleLogoMode}
                size={bubbleLogoMetrics?.logoSize ?? Math.round(layout.size * 0.19)}
              />
            </View>
          </>
        ) : isEntertainmentBubble ? (
          <>
            <View
              style={[
                styles.entertainmentBubbleBalloon,
                styles.entertainmentBubbleBalloonBack,
                styles.entertainmentBubbleBalloonTop,
                {
                  width: Math.round(layout.size * 0.24),
                  height: Math.round(layout.size * 0.28),
                  borderRadius: Math.round(layout.size * 0.13),
                  top: Math.round(layout.size * 0.08),
                  left: Math.round(layout.size * 0.39)
                }
              ]}
            />
            <View
              style={[
                styles.entertainmentBubbleBalloon,
                styles.entertainmentBubbleBalloonBack,
                styles.entertainmentBubbleBalloonLeft,
                {
                  width: Math.round(layout.size * 0.26),
                  height: Math.round(layout.size * 0.31),
                  borderRadius: Math.round(layout.size * 0.14),
                  top: Math.round(layout.size * 0.21),
                  left: Math.round(layout.size * 0.14)
                }
              ]}
            />
            <View
              style={[
                styles.entertainmentBubbleBalloon,
                styles.entertainmentBubbleBalloonBack,
                styles.entertainmentBubbleBalloonRight,
                {
                  width: Math.round(layout.size * 0.26),
                  height: Math.round(layout.size * 0.31),
                  borderRadius: Math.round(layout.size * 0.14),
                  top: Math.round(layout.size * 0.2),
                  left: Math.round(layout.size * 0.6)
                }
              ]}
            />
            <View
              style={[
                styles.entertainmentBubbleString,
                styles.entertainmentBubbleStringLeft,
                {
                  width: Math.max(3, Math.round(layout.size * 0.018)),
                  height: Math.round(layout.size * 0.26),
                  top: Math.round(layout.size * 0.44),
                  left: Math.round(layout.size * 0.33)
                }
              ]}
            />
            <View
              style={[
                styles.entertainmentBubbleString,
                styles.entertainmentBubbleStringRight,
                {
                  width: Math.max(3, Math.round(layout.size * 0.018)),
                  height: Math.round(layout.size * 0.27),
                  top: Math.round(layout.size * 0.43),
                  left: Math.round(layout.size * 0.66)
                }
              ]}
            />
            <View
              style={[
                styles.entertainmentBubbleString,
                {
                  width: Math.max(3, Math.round(layout.size * 0.018)),
                  height: Math.round(layout.size * 0.22),
                  top: Math.round(layout.size * 0.31),
                  left: Math.round(layout.size * 0.51)
                }
              ]}
            />
            <View
              style={[
                styles.entertainmentBubbleString,
                {
                  width: Math.max(3, Math.round(layout.size * 0.018)),
                  height: Math.round(layout.size * 0.18),
                  top: Math.round(layout.size * 0.6),
                  left: Math.round(layout.size * 0.5)
                }
              ]}
            />
            <View
              style={[
                styles.entertainmentBubbleBalloon,
                styles.entertainmentBubbleBalloonFront,
                {
                  width: Math.round(layout.size * 0.32),
                  height: Math.round(layout.size * 0.38),
                  borderRadius: Math.round(layout.size * 0.17),
                  top: Math.round(layout.size * 0.24),
                  left: Math.round(layout.size * 0.34)
                }
              ]}
            >
              <View
                style={[
                  styles.entertainmentBubbleCore,
                  {
                    width: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.24),
                    height: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.24),
                    borderRadius:
                      bubbleLogoMetrics?.borderRadius ?? Math.round(layout.size * 0.12)
                  }
                ]}
              >
                <ServiceLogo
                  providerName={subscription.providerName}
                  logoMode={bubbleLogoMode}
                  size={bubbleLogoMetrics?.logoSize ?? Math.round(layout.size * 0.18)}
                />
              </View>
            </View>
            <View
              style={[
                styles.entertainmentBubbleKnot,
                {
                  width: Math.round(layout.size * 0.08),
                  height: Math.round(layout.size * 0.08),
                  borderRadius: Math.round(layout.size * 0.018),
                  top: Math.round(layout.size * 0.58),
                  left: Math.round(layout.size * 0.46)
                }
              ]}
            />
          </>
        ) : isFinanceBubble ? (
          <>
            <View
              style={[
                styles.financeBubbleBody,
                {
                  width: Math.round(layout.size * 0.72),
                  height: Math.round(layout.size * 0.46),
                  borderRadius: Math.round(layout.size * 0.16),
                  top: Math.round(layout.size * 0.34),
                  left: Math.round(layout.size * 0.14)
                }
              ]}
            />
            <View
              style={[
                styles.financeBubbleFlap,
                {
                  width: Math.round(layout.size * 0.58),
                  height: Math.round(layout.size * 0.24),
                  borderRadius: Math.round(layout.size * 0.12),
                  top: Math.round(layout.size * 0.22),
                  left: Math.round(layout.size * 0.21)
                }
              ]}
            />
            <View
              style={[
                styles.financeBubbleStrap,
                {
                  width: Math.round(layout.size * 0.12),
                  height: Math.round(layout.size * 0.3),
                  borderRadius: Math.round(layout.size * 0.05),
                  top: Math.round(layout.size * 0.34),
                  left: Math.round(layout.size * 0.62)
                }
              ]}
            />
            <View
              style={[
                styles.financeBubbleClasp,
                {
                  width: Math.round(layout.size * 0.08),
                  height: Math.round(layout.size * 0.08),
                  borderRadius: Math.round(layout.size * 0.04),
                  top: Math.round(layout.size * 0.45),
                  left: Math.round(layout.size * 0.64)
                }
              ]}
            />
            <View
              style={[
                styles.financeBubbleCore,
                {
                  width: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.28),
                  height: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.28),
                  borderRadius:
                    bubbleLogoMetrics?.borderRadius ?? Math.round(layout.size * 0.14),
                  top: bubbleLogoMetrics?.top ?? Math.round(layout.size * 0.42),
                  left: bubbleLogoMetrics?.left ?? Math.round(layout.size * 0.27)
                }
              ]}
            >
              <ServiceLogo
                providerName={subscription.providerName}
                logoMode={bubbleLogoMode}
                size={bubbleLogoMetrics?.logoSize ?? Math.round(layout.size * 0.2)}
              />
            </View>
          </>
        ) : isSecurityBubble ? (
          <>
            <View
              style={[
                styles.securityBubbleShackle,
                {
                  width: Math.round(layout.size * 0.36),
                  height: Math.round(layout.size * 0.28),
                  borderTopLeftRadius: Math.round(layout.size * 0.18),
                  borderTopRightRadius: Math.round(layout.size * 0.18),
                  top: Math.round(layout.size * 0.12),
                  left: Math.round(layout.size * 0.32)
                }
              ]}
            />
            <View
              style={[
                styles.securityBubbleBody,
                {
                  width: Math.round(layout.size * 0.56),
                  height: Math.round(layout.size * 0.42),
                  borderRadius: Math.round(layout.size * 0.14),
                  top: Math.round(layout.size * 0.34),
                  left: Math.round(layout.size * 0.22)
                }
              ]}
            />
            <View
              style={[
                styles.securityBubbleKeyholeTop,
                {
                  width: Math.round(layout.size * 0.08),
                  height: Math.round(layout.size * 0.08),
                  borderRadius: Math.round(layout.size * 0.04),
                  top: Math.round(layout.size * 0.53),
                  left: Math.round(layout.size * 0.46)
                }
              ]}
            />
            <View
              style={[
                styles.securityBubbleKeyholeStem,
                {
                  width: Math.max(4, Math.round(layout.size * 0.03)),
                  height: Math.round(layout.size * 0.09),
                  borderRadius: Math.round(layout.size * 0.015),
                  top: Math.round(layout.size * 0.59),
                  left: Math.round(layout.size * 0.485)
                }
              ]}
            />
            <View
              style={[
                styles.securityBubbleCore,
                {
                  width: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.24),
                  height: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.24),
                  borderRadius:
                    bubbleLogoMetrics?.borderRadius ?? Math.round(layout.size * 0.12),
                  top: bubbleLogoMetrics?.top ?? Math.round(layout.size * 0.41),
                  left: bubbleLogoMetrics?.left ?? Math.round(layout.size * 0.38)
                }
              ]}
            >
              <ServiceLogo
                providerName={subscription.providerName}
                logoMode={bubbleLogoMode}
                size={bubbleLogoMetrics?.logoSize ?? Math.round(layout.size * 0.18)}
              />
            </View>
          </>
        ) : isTravelBubble ? (
          <>
            <View
              style={[
                styles.travelBubbleFuselage,
                {
                  width: Math.round(layout.size * 0.14),
                  height: Math.round(layout.size * 0.52),
                  borderRadius: Math.round(layout.size * 0.07),
                  top: Math.round(layout.size * 0.18),
                  left: Math.round(layout.size * 0.43)
                }
              ]}
            />
            <View
              style={[
                styles.travelBubbleNose,
                {
                  width: Math.round(layout.size * 0.14),
                  height: Math.round(layout.size * 0.14),
                  borderRadius: Math.round(layout.size * 0.07),
                  top: Math.round(layout.size * 0.08),
                  left: Math.round(layout.size * 0.43)
                }
              ]}
            />
            <View
              style={[
                styles.travelBubbleWing,
                styles.travelBubbleWingLeft,
                {
                  width: Math.round(layout.size * 0.3),
                  height: Math.round(layout.size * 0.12),
                  borderRadius: Math.round(layout.size * 0.05),
                  top: Math.round(layout.size * 0.37),
                  left: Math.round(layout.size * 0.13)
                }
              ]}
            />
            <View
              style={[
                styles.travelBubbleWing,
                styles.travelBubbleWingRight,
                {
                  width: Math.round(layout.size * 0.3),
                  height: Math.round(layout.size * 0.12),
                  borderRadius: Math.round(layout.size * 0.05),
                  top: Math.round(layout.size * 0.37),
                  left: Math.round(layout.size * 0.57)
                }
              ]}
            />
            <View
              style={[
                styles.travelBubbleTail,
                styles.travelBubbleTailLeft,
                {
                  width: Math.round(layout.size * 0.16),
                  height: Math.round(layout.size * 0.08),
                  borderRadius: Math.round(layout.size * 0.04),
                  top: Math.round(layout.size * 0.59),
                  left: Math.round(layout.size * 0.24)
                }
              ]}
            />
            <View
              style={[
                styles.travelBubbleTail,
                styles.travelBubbleTailRight,
                {
                  width: Math.round(layout.size * 0.16),
                  height: Math.round(layout.size * 0.08),
                  borderRadius: Math.round(layout.size * 0.04),
                  top: Math.round(layout.size * 0.59),
                  left: Math.round(layout.size * 0.6)
                }
              ]}
            />
            <View
              style={[
                styles.travelBubbleTailFin,
                {
                  width: Math.round(layout.size * 0.08),
                  height: Math.round(layout.size * 0.14),
                  borderRadius: Math.round(layout.size * 0.03),
                  top: Math.round(layout.size * 0.62),
                  left: Math.round(layout.size * 0.46)
                }
              ]}
            />
            <View
              style={[
                styles.travelBubbleCore,
                {
                  width: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.24),
                  height: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.24),
                  borderRadius:
                    bubbleLogoMetrics?.borderRadius ?? Math.round(layout.size * 0.12),
                  top: bubbleLogoMetrics?.top ?? Math.round(layout.size * 0.42),
                  left: bubbleLogoMetrics?.left ?? Math.round(layout.size * 0.38)
                }
              ]}
            >
              <ServiceLogo
                providerName={subscription.providerName}
                logoMode={bubbleLogoMode}
                size={bubbleLogoMetrics?.logoSize ?? Math.round(layout.size * 0.18)}
              />
            </View>
          </>
        ) : isHealthBubble ? (
          <>
            <Text
              style={[
                styles.healthBubbleHeartOutline,
                {
                  fontSize: Math.round(layout.size * 0.86),
                  lineHeight: Math.round(layout.size * 0.82),
                  top: Math.round(layout.size * 0.07)
                }
              ]}
            >
              {"\u2665"}
            </Text>
            <Text
              style={[
                styles.healthBubbleHeartFill,
                {
                  fontSize: Math.round(layout.size * 0.78),
                  lineHeight: Math.round(layout.size * 0.74),
                  top: Math.round(layout.size * 0.11)
                }
              ]}
            >
              {"\u2665"}
            </Text>
            <View
              style={[
                styles.healthBubbleCenter,
                {
                  top: Math.round(layout.size * 0.16),
                  bottom: Math.round(layout.size * 0.22)
                }
              ]}
            >
              <View
                style={[
                  styles.healthBubbleCore,
                  {
                    width: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.34),
                    height: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.34),
                    borderRadius:
                      bubbleLogoMetrics?.borderRadius ?? Math.round(layout.size * 0.17)
                  }
                ]}
              >
                <ServiceLogo
                  providerName={subscription.providerName}
                  logoMode={bubbleLogoMode}
                  size={bubbleLogoMetrics?.logoSize ?? Math.round(layout.size * 0.26)}
                />
              </View>
            </View>
          </>
        ) : isSportBubble ? (
          <>
            <View
              style={[
                styles.sportBubbleBar,
                {
                  width: Math.round(layout.size * 0.56),
                  height: Math.max(8, Math.round(layout.size * 0.1)),
                  borderRadius: Math.round(layout.size * 0.05),
                  top: Math.round(layout.size * 0.45),
                  left: Math.round(layout.size * 0.22)
                }
              ]}
            />
            <View
              style={[
                styles.sportBubblePlate,
                styles.sportBubblePlateLeft,
                {
                  width: Math.round(layout.size * 0.1),
                  height: Math.round(layout.size * 0.42),
                  borderRadius: Math.round(layout.size * 0.04),
                  top: Math.round(layout.size * 0.29),
                  left: Math.round(layout.size * 0.1)
                }
              ]}
            />
            <View
              style={[
                styles.sportBubblePlate,
                styles.sportBubblePlateLeft,
                {
                  width: Math.round(layout.size * 0.08),
                  height: Math.round(layout.size * 0.34),
                  borderRadius: Math.round(layout.size * 0.04),
                  top: Math.round(layout.size * 0.33),
                  left: Math.round(layout.size * 0.22)
                }
              ]}
            />
            <View
              style={[
                styles.sportBubblePlate,
                styles.sportBubblePlateRight,
                {
                  width: Math.round(layout.size * 0.08),
                  height: Math.round(layout.size * 0.34),
                  borderRadius: Math.round(layout.size * 0.04),
                  top: Math.round(layout.size * 0.33),
                  left: Math.round(layout.size * 0.7)
                }
              ]}
            />
            <View
              style={[
                styles.sportBubblePlate,
                styles.sportBubblePlateRight,
                {
                  width: Math.round(layout.size * 0.1),
                  height: Math.round(layout.size * 0.42),
                  borderRadius: Math.round(layout.size * 0.04),
                  top: Math.round(layout.size * 0.29),
                  left: Math.round(layout.size * 0.8)
                }
              ]}
            />
            <View
              style={[
                styles.sportBubbleCore,
                {
                  width: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.3),
                  height: bubbleLogoMetrics?.coreSize ?? Math.round(layout.size * 0.3),
                  borderRadius:
                    bubbleLogoMetrics?.borderRadius ?? Math.round(layout.size * 0.15),
                  top: bubbleLogoMetrics?.top ?? Math.round(layout.size * 0.35),
                  left: bubbleLogoMetrics?.left ?? Math.round(layout.size * 0.35)
                }
              ]}
            >
              <ServiceLogo
                providerName={subscription.providerName}
                logoMode={bubbleLogoMode}
                size={bubbleLogoMetrics?.logoSize ?? Math.round(layout.size * 0.22)}
              />
            </View>
          </>
        ) : (
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
              logoMode={bubbleLogoMode}
              size={Math.round(layout.size * 0.5)}
            />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
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
    backgroundColor: theme.colors.glowOrange
  },
  glowPurple: {
    top: 200,
    left: -130,
    backgroundColor: theme.colors.glowPurple
  },
  glowGreen: {
    top: 420,
    right: -100,
    backgroundColor: theme.colors.glowGreen
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
    borderColor: theme.colors.border
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
    backgroundColor: theme.colors.textPrimary
  },
  profileGlyphBody: {
    width: 14,
    height: 7,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: theme.colors.textPrimary
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
    borderColor: theme.colors.textPrimary
  },
  settingsGlyphCenter: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.textPrimary
  },
  settingsGlyphTick: {
    position: "absolute",
    width: 2,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textPrimary
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
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...shadows.card
  },
  summaryCardCompact: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: spacing.xs
  },
  summaryCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2
  },
  summaryDivider: {
    width: 1,
    alignSelf: "stretch",
    marginHorizontal: spacing.xs + 2,
    backgroundColor: theme.colors.border
  },
  summaryDividerCompact: {
    width: "100%",
    height: 1,
    marginHorizontal: 0,
    marginVertical: spacing.xs + 2
  },
  summaryBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B2C12"
  },
  summaryBadgeWarm: {
    backgroundColor: "#362012"
  },
  summaryTotalGlyph: {
    width: 18,
    height: 14,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: theme.colors.primary
  },
  summaryTotalGlyphFlap: {
    position: "absolute",
    top: 1,
    left: 2,
    width: 9,
    height: 4,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: theme.colors.primary
  },
  summaryTotalGlyphChip: {
    position: "absolute",
    right: 2,
    top: 5,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary
  },
  summaryFlameGlyph: {
    width: 16,
    height: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  summaryFlameOuter: {
    width: 12,
    height: 15,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 2,
    backgroundColor: theme.colors.primaryStrong,
    transform: [{ rotate: "45deg" }]
  },
  summaryFlameInner: {
    position: "absolute",
    top: 6,
    width: 6,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 2,
    backgroundColor: theme.colors.warning,
    transform: [{ rotate: "45deg" }]
  },
  summaryBadgeLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.primary
  },
  summaryText: {
    flex: 1,
    gap: 2
  },
  summaryLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  summaryValueCompact: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  summaryValueCompactMobile: {
    fontSize: 20,
    lineHeight: 24
  },
  summaryHint: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    textTransform: "uppercase"
  },
  clusterWrap: {
    gap: spacing.sm
  },
  clusterCaptionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  clusterCaptionText: {
    flex: 1,
    gap: 4
  },
  clusterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  clusterHint: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textSecondary,
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
  aiBubble: {
    position: "relative"
  },
  aiBubbleAntenna: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  aiBubbleAntennaTip: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...shadows.card
  },
  aiBubbleHead: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...shadows.card
  },
  aiBubbleEar: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  aiBubbleEye: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  aiBubbleMouth: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  aiBubbleCore: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)"
  },
  musicBubble: {
    position: "relative"
  },
  musicBubbleHead: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    transform: [{ rotate: "-18deg" }],
    ...shadows.card
  },
  musicBubbleCore: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)"
  },
  musicBubbleStem: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...shadows.card
  },
  musicBubbleFlag: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    transform: [{ rotate: "14deg" }],
    ...shadows.card
  },
  streamingBubble: {
    position: "relative"
  },
  streamingBubbleOutline: {
    position: "absolute",
    width: 0,
    height: 0,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "rgba(255,255,255,0.18)",
    ...shadows.card
  },
  streamingBubbleCore: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)"
  },
  streamingBubbleTriangle: {
    position: "absolute",
    width: 0,
    height: 0,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "rgba(255,255,255,0.08)"
  },
  gamesBubble: {
    position: "relative"
  },
  gamesBubbleShell: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...shadows.card
  },
  gamesBubbleGrip: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...shadows.card
  },
  gamesBubbleGripLeft: {
    transform: [{ rotate: "18deg" }]
  },
  gamesBubbleGripRight: {
    transform: [{ rotate: "-18deg" }]
  },
  gamesBubbleCore: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)"
  },
  gamesBubbleDpadVertical: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  gamesBubbleDpadHorizontal: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  gamesBubbleButton: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  productivityBubble: {
    position: "relative"
  },
  productivityBubbleHandle: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(255,255,255,0.18)"
  },
  productivityBubbleBody: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...shadows.card
  },
  productivityBubbleLatch: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  productivityBubbleCore: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)"
  },
  educationBubble: {
    position: "relative"
  },
  educationBubblePage: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...shadows.card
  },
  educationBubblePageLeft: {
    transform: [{ rotate: "-2deg" }]
  },
  educationBubblePageRight: {
    transform: [{ rotate: "2deg" }]
  },
  educationBubbleSpine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  educationBubblePageLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  educationBubblePageEdge: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.12)"
  },
  educationBubbleCore: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)"
  },
  entertainmentBubble: {
    position: "relative"
  },
  entertainmentBubbleBalloon: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...shadows.card
  },
  entertainmentBubbleBalloonBack: {
    backgroundColor: "rgba(255,255,255,0.08)"
  },
  entertainmentBubbleBalloonFront: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)"
  },
  entertainmentBubbleBalloonTop: {
    transform: [{ rotate: "-3deg" }]
  },
  entertainmentBubbleBalloonLeft: {
    transform: [{ rotate: "-11deg" }]
  },
  entertainmentBubbleBalloonRight: {
    transform: [{ rotate: "11deg" }]
  },
  entertainmentBubbleString: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  entertainmentBubbleStringLeft: {
    transform: [{ rotate: "17deg" }]
  },
  entertainmentBubbleStringRight: {
    transform: [{ rotate: "-17deg" }]
  },
  entertainmentBubbleKnot: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.14)",
    transform: [{ rotate: "45deg" }]
  },
  entertainmentBubbleCore: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)"
  },
  financeBubble: {
    position: "relative"
  },
  financeBubbleBody: {
    position: "absolute",
    backgroundColor: "rgba(131, 93, 44, 0.28)",
    borderWidth: 1,
    borderColor: "rgba(223, 189, 129, 0.34)",
    ...shadows.card
  },
  financeBubbleFlap: {
    position: "absolute",
    backgroundColor: "rgba(168, 122, 60, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(235, 205, 157, 0.3)"
  },
  financeBubbleStrap: {
    position: "absolute",
    backgroundColor: "rgba(92, 65, 33, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(214, 183, 129, 0.22)"
  },
  financeBubbleClasp: {
    position: "absolute",
    backgroundColor: "rgba(247, 225, 183, 0.38)",
    borderWidth: 1,
    borderColor: "rgba(255, 246, 222, 0.3)"
  },
  financeBubbleCore: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(54, 37, 16, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(240, 215, 172, 0.2)"
  },
  securityBubble: {
    position: "relative"
  },
  securityBubbleShackle: {
    position: "absolute",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.04)"
  },
  securityBubbleBody: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...shadows.card
  },
  securityBubbleKeyholeTop: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  securityBubbleKeyholeStem: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  securityBubbleCore: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)"
  },
  travelBubble: {
    position: "relative"
  },
  travelBubbleFuselage: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...shadows.card
  },
  travelBubbleNose: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...shadows.card
  },
  travelBubbleWing: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  travelBubbleWingLeft: {
    transform: [{ rotate: "-10deg" }]
  },
  travelBubbleWingRight: {
    transform: [{ rotate: "10deg" }]
  },
  travelBubbleTail: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  travelBubbleTailLeft: {
    transform: [{ rotate: "-14deg" }]
  },
  travelBubbleTailRight: {
    transform: [{ rotate: "14deg" }]
  },
  travelBubbleTailFin: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  travelBubbleCore: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)"
  },
  sportBubble: {
    position: "relative"
  },
  sportBubbleBar: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  sportBubblePlate: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...shadows.card
  },
  sportBubblePlateLeft: {
    transform: [{ rotate: "-4deg" }]
  },
  sportBubblePlateRight: {
    transform: [{ rotate: "4deg" }]
  },
  sportBubbleCore: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)"
  },
  healthBubble: {
    position: "relative"
  },
  healthBubbleHeartOutline: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: "rgba(255,255,255,0.18)",
    textShadowColor: "rgba(0,0,0,0.22)",
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 14
  },
  healthBubbleHeartFill: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: "rgba(255,255,255,0.08)"
  },
  healthBubbleCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center"
  },
  healthBubbleCore: {
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
    color: theme.colors.textPrimary
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  sectionMeta: {
    fontSize: 13,
    color: theme.colors.textSecondary
  },
  timelineCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    color: theme.colors.textPrimary
  },
  dueDate: {
    fontSize: 14,
    color: theme.colors.textSecondary
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.primary
  },
  insightCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.primary
  },
  insightBody: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textPrimary
  },
  emptyCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...shadows.card
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary
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

function isMusicCategory(categoryName: string) {
  return normalizeCategoryName(categoryName) === "musique";
}

function isAICategory(categoryName: string) {
  return normalizeCategoryName(categoryName) === "ai";
}

function isStreamingCategory(categoryName: string) {
  return normalizeCategoryName(categoryName) === "streaming";
}

function isGamesCategory(categoryName: string) {
  return normalizeCategoryName(categoryName) === "jeux";
}

function isProductivityCategory(categoryName: string) {
  return normalizeCategoryName(categoryName) === "productivite";
}

function isEducationCategory(categoryName: string) {
  return normalizeCategoryName(categoryName) === "education";
}

function isEntertainmentCategory(categoryName: string) {
  return normalizeCategoryName(categoryName) === "divertissement";
}

function isFinanceCategory(categoryName: string) {
  return normalizeCategoryName(categoryName) === "finances";
}

function isSecurityCategory(categoryName: string) {
  return normalizeCategoryName(categoryName) === "securite";
}

function isTravelCategory(categoryName: string) {
  return normalizeCategoryName(categoryName) === "voyage";
}

function isSportCategory(categoryName: string) {
  return normalizeCategoryName(categoryName) === "sport";
}

function isHealthCategory(categoryName: string) {
  return normalizeCategoryName(categoryName) === "sante";
}

function normalizeCategoryName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getComparableDateValue(dateString: string) {
  const date = new Date(dateString);
  const value = date.getTime();

  return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
}

function isDateDueSoon(dateString: string, dayThreshold: number) {
  const dueDate = new Date(dateString);

  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDueDate = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );
  const diffInDays = Math.round(
    (startOfDueDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffInDays >= 0 && diffInDays <= dayThreshold;
}

function getSpecialBubbleLogoMetrics(
  subscription: Subscription,
  bubbleSize: number
): BubbleLogoMetrics | null {
  if (isDisneyMickeyProvider(subscription.providerName)) {
    return createBubbleLogoMetrics(bubbleSize, 0.36, 0.9, 0.35, 0.41);
  }

  const normalizedCategory = normalizeCategoryName(subscription.categoryName);

  if (normalizedCategory === "ai") {
    return createBubbleLogoMetrics(bubbleSize, 0.28, 0.72, 0.36, 0.39);
  }

  if (normalizedCategory === "musique") {
    return createBubbleLogoMetrics(bubbleSize, 0.44, 0.72, 0.17, 0.45);
  }

  if (normalizedCategory === "streaming") {
    return createBubbleLogoMetrics(bubbleSize, 0.4, 0.72, 0.24, 0.31);
  }

  if (normalizedCategory === "jeux") {
    return createBubbleLogoMetrics(bubbleSize, 0.34, 0.7, 0.33, 0.32);
  }

  if (normalizedCategory === "productivite") {
    return createBubbleLogoMetrics(bubbleSize, 0.34, 0.7, 0.33, 0.38);
  }

  if (normalizedCategory === "education") {
    return createBubbleLogoMetrics(bubbleSize, 0.26, 0.72, 0.37, 0.42);
  }

  if (normalizedCategory === "divertissement") {
    return createBubbleLogoMetrics(bubbleSize, 0.24, 0.72, 0.38, 0.34);
  }

  if (normalizedCategory === "finances") {
    return createBubbleLogoMetrics(bubbleSize, 0.28, 0.72, 0.27, 0.42);
  }

  if (normalizedCategory === "securite") {
    return createBubbleLogoMetrics(bubbleSize, 0.24, 0.72, 0.38, 0.41);
  }

  if (normalizedCategory === "voyage") {
    return createBubbleLogoMetrics(bubbleSize, 0.24, 0.72, 0.38, 0.42);
  }

  if (normalizedCategory === "sport") {
    return createBubbleLogoMetrics(bubbleSize, 0.3, 0.74, 0.35, 0.35);
  }

  if (normalizedCategory === "sante") {
    return createBubbleLogoMetrics(bubbleSize, 0.34, 0.78, 0.33, 0.36);
  }

  return null;
}

function createBubbleLogoMetrics(
  bubbleSize: number,
  coreRatio: number,
  logoRatio: number,
  leftRatio: number,
  topRatio: number
): BubbleLogoMetrics {
  const coreSize = Math.round(bubbleSize * coreRatio);

  return {
    coreSize,
    logoSize: Math.round(coreSize * logoRatio),
    top: Math.round(bubbleSize * topRatio),
    left: Math.round(bubbleSize * leftRatio),
    borderRadius: Math.round(coreSize / 2)
  };
}
