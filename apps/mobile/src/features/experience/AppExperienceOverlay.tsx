import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { useAuthStore } from "../../store/authStore";
import { useAppNavigation, useNavigationStore } from "../../store/navigationStore";
import {
  DEFAULT_USER_EXPERIENCE_STATE,
  LimitedPremiumOffer,
  useExperienceStore
} from "../../store/experienceStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import {
  PREMIUM_YEARLY_LIFETIME_OFFER_PRICE,
  PREMIUM_YEARLY_PRICE,
  isPremiumPlan
} from "../../constants/premium";
import { AppTheme, radius, shadows, spacing, useAppTheme } from "../../theme";
import { PrimaryButton } from "../../components/PrimaryButton";

type TourTarget = "Dashboard" | "Subscriptions" | "AddSubscription" | "Statistics" | "Profile";

type TourStep = {
  id: string;
  target: TourTarget;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "dashboard",
    target: "Dashboard",
    eyebrow: "Etape 1",
    title: "Bienvenue dans ton cockpit",
    body: "On commence par l'accueil : tu y retrouves le total, les paiements a venir et les alertes utiles pour piloter ton budget.",
    cta: "Voir la suite"
  },
  {
    id: "subscriptions",
    target: "Subscriptions",
    eyebrow: "Etape 2",
    title: "Tous tes abonnements en un endroit",
    body: "Ici, tu peux filtrer, rechercher et archiver rapidement les services qui comptent le plus dans ton portefeuille.",
    cta: "Continuer"
  },
  {
    id: "add",
    target: "AddSubscription",
    eyebrow: "Etape 3",
    title: "Ajoute un abonnement en quelques tapes",
    body: "Le parcours guide te fait choisir le service, la facturation et les options sans te perdre dans les reglages.",
    cta: "Suivant"
  },
  {
    id: "statistics",
    target: "Statistics",
    eyebrow: "Etape 4",
    title: "Lis tes statistiques plus vite",
    body: "La zone statistiques t'aide a reperer les categories dominantes, les services actifs et les opportunites d'optimisation.",
    cta: "Encore un"
  },
  {
    id: "profile",
    target: "Profile",
    eyebrow: "Etape 5",
    title: "Ton espace et ton plan",
    body: "Le profil centralise ton plan actuel, les avantages Premium et les futures offres si tu veux aller plus loin.",
    cta: "Terminer le tour"
  }
];

function formatRemainingTime(remainingMs: number) {
  const totalSeconds = Math.max(Math.ceil(remainingMs / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getOfferRemainingMs(offer: LimitedPremiumOffer | null, now: number) {
  if (!offer) {
    return 0;
  }

  return Math.max(new Date(offer.expiresAt).getTime() - now, 0);
}

export function AppExperienceOverlay(): JSX.Element | null {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const navigation = useAppNavigation();
  const resetNavigation = useNavigationStore((state) => state.resetNavigation);
  const session = useAuthStore((state) => state.session);
  const profile = useWorkspaceStore((state) => state.profile);
  const activatePremiumMembership = useWorkspaceStore((state) => state.activatePremiumMembership);
  const isActivatingPremium = useWorkspaceStore((state) => state.isActivatingPremium);
  const hydratedUserId = useWorkspaceStore((state) => state.hydratedUserId);
  const isWorkspaceLoading = useWorkspaceStore((state) => state.isLoading);
  const ensureUser = useExperienceStore((state) => state.ensureUser);
  const markTutorialDone = useExperienceStore((state) => state.markTutorialDone);
  const startWelcomeOffer = useExperienceStore((state) => state.startWelcomeOffer);
  const maybeStartRecurringOffer = useExperienceStore((state) => state.maybeStartRecurringOffer);
  const claimLifetimeOffer = useExperienceStore((state) => state.claimLifetimeOffer);
  const syncPlanState = useExperienceStore((state) => state.syncPlanState);
  const collapseOffer = useExperienceStore((state) => state.collapseOffer);
  const reopenOffer = useExperienceStore((state) => state.reopenOffer);
  const expireOffer = useExperienceStore((state) => state.expireOffer);
  const userExperience = useExperienceStore((state) =>
    session?.uid
      ? state.users[session.uid] ?? DEFAULT_USER_EXPERIENCE_STATE
      : null
  );
  const [activeTourStepIndex, setActiveTourStepIndex] = useState<number | null>(null);
  const [expiringOffer, setExpiringOffer] = useState<LimitedPremiumOffer | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const offerScale = useRef(new Animated.Value(1)).current;
  const offerOpacity = useRef(new Animated.Value(1)).current;
  const isPremium = isPremiumPlan(profile);
  const isWorkspaceReady =
    Boolean(session?.uid) &&
    hydratedUserId === session?.uid &&
    Boolean(profile) &&
    !isWorkspaceLoading;
  const visibleOffer = expiringOffer ?? userExperience?.activeOffer ?? null;
  const offerRemainingMs = getOfferRemainingMs(userExperience?.activeOffer ?? null, now);
  const countdownLabel = formatRemainingTime(offerRemainingMs);
  const currentTourStep =
    activeTourStepIndex !== null ? TOUR_STEPS[activeTourStepIndex] ?? null : null;
  const offerEyebrow =
    visibleOffer?.source === "premium_exit"
      ? "Offre de retour"
      : visibleOffer?.source === "returning_repeat"
        ? "Offre reservee"
        : "Offre de bienvenue";
  const offerSubtitle =
    visibleOffer?.source === "premium_exit"
      ? "Tu repasses sur un compte gratuit : tu peux activer ton Premium annuel a -50% pendant 1 heure."
      : "Pendant 1 heure seulement, active ton Premium annuel a -50%. Une fois activee, cette reduction reste valable tant que ton Premium reste actif.";

  useEffect(() => {
    if (!session?.uid) {
      setActiveTourStepIndex(null);
      setExpiringOffer(null);
      return;
    }

    ensureUser(session.uid);
  }, [ensureUser, session?.uid]);

  useEffect(() => {
    if (!session?.uid || !isWorkspaceReady || !profile) {
      return;
    }

    syncPlanState(session.uid, profile.planTier);
  }, [isWorkspaceReady, profile, session?.uid, syncPlanState]);

  useEffect(() => {
    if (!session?.uid || !isWorkspaceReady) {
      return;
    }

    if (!userExperience?.hasCompletedAppTour) {
      setActiveTourStepIndex((current) => current ?? 0);
      return;
    }

    if (isPremium) {
      return;
    }

    maybeStartRecurringOffer(session.uid);
  }, [
    isPremium,
    isWorkspaceReady,
    maybeStartRecurringOffer,
    session?.uid,
    userExperience?.hasCompletedAppTour
  ]);

  useEffect(() => {
    if (!currentTourStep) {
      return;
    }

    navigation.navigate(currentTourStep.target);
  }, [currentTourStep, navigation]);

  useEffect(() => {
    if (!session?.uid || !userExperience?.activeOffer || expiringOffer) {
      return;
    }

    if (offerRemainingMs > 0) {
      return;
    }

    const snapshot = userExperience.activeOffer;
    setExpiringOffer(snapshot);
    offerScale.setValue(1);
    offerOpacity.setValue(1);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(offerScale, {
          toValue: 1.08,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(offerOpacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true
        })
      ]),
      Animated.parallel([
        Animated.timing(offerScale, {
          toValue: 0.35,
          duration: 260,
          easing: Easing.in(Easing.back(1.4)),
          useNativeDriver: true
        }),
        Animated.timing(offerOpacity, {
          toValue: 0,
          duration: 260,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true
        })
      ])
    ]).start(() => {
      expireOffer(session.uid);
      setExpiringOffer(null);
      offerScale.setValue(1);
      offerOpacity.setValue(1);
    });
  }, [
    expiringOffer,
    expireOffer,
    offerOpacity,
    offerRemainingMs,
    offerScale,
    session?.uid,
    userExperience?.activeOffer
  ]);

  useEffect(() => {
    if (!userExperience?.activeOffer) {
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [userExperience?.activeOffer]);

  if (!session?.uid || !isWorkspaceReady || !userExperience) {
    return null;
  }

  const finishTour = (skipped: boolean) => {
    markTutorialDone(session.uid, skipped);
    resetNavigation();
    setActiveTourStepIndex(null);

    if (!isPremium) {
      startWelcomeOffer(session.uid);
    }
  };

  const handleOfferAction = async () => {
    try {
      claimLifetimeOffer(session.uid);
      await activatePremiumMembership("yearly_discounted");
      navigation.navigate("Subscriptions");
      Alert.alert(
        "Premium active",
        "Ton Premium annuel a -50% est actif et l'abonnement Subly Premium a ete ajoute automatiquement dans tes abonnements."
      );
    } catch (error) {
      Alert.alert(
        "Activation impossible",
        error instanceof Error ? error.message : "Impossible d'activer l'offre Premium pour le moment."
      );
    }
  };

  return (
    <>
      {currentTourStep ? (
        <View pointerEvents="box-none" style={styles.absoluteLayer}>
          <View style={styles.tutorialBackdrop} />
          <View style={styles.tutorialCardWrap}>
            <View style={styles.tutorialCard}>
              <View style={styles.tutorialHeader}>
                <Text style={styles.tutorialEyebrow}>{currentTourStep.eyebrow}</Text>
                <Pressable onPress={() => finishTour(true)}>
                  <Text style={styles.skipLabel}>Passer</Text>
                </Pressable>
              </View>
              <Text style={styles.tutorialTitle}>{currentTourStep.title}</Text>
              <Text style={styles.tutorialBody}>{currentTourStep.body}</Text>
              <View style={styles.progressRow}>
                {TOUR_STEPS.map((step, index) => (
                  <View
                    key={step.id}
                    style={[
                      styles.progressDot,
                      index === activeTourStepIndex ? styles.progressDotActive : null
                    ]}
                  />
                ))}
              </View>
              <View style={styles.tutorialActions}>
                {activeTourStepIndex !== null && activeTourStepIndex > 0 ? (
                  <PrimaryButton
                    title="Retour"
                    onPress={() =>
                      setActiveTourStepIndex((current) =>
                        current === null ? 0 : Math.max(current - 1, 0)
                      )
                    }
                    variant="secondary"
                  />
                ) : null}
                <PrimaryButton
                  title={currentTourStep.cta}
                  onPress={() => {
                    if ((activeTourStepIndex ?? 0) >= TOUR_STEPS.length - 1) {
                      finishTour(false);
                      return;
                    }

                    setActiveTourStepIndex((current) => (current ?? 0) + 1);
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      ) : null}

      {visibleOffer ? (
        <View pointerEvents="box-none" style={styles.absoluteLayer}>
          {visibleOffer.collapsed ? null : (
            <Pressable style={styles.offerBackdrop} onPress={() => collapseOffer(session.uid)} />
          )}

          {visibleOffer.collapsed ? (
            <Animated.View
              style={[
                styles.timerChipWrap,
                {
                  opacity: offerOpacity,
                  transform: [{ scale: offerScale }]
                }
              ]}
            >
              <Pressable style={styles.timerChip} onPress={() => reopenOffer(session.uid)}>
                <Text style={styles.timerChipLabel}>-50%</Text>
                <Text style={styles.timerChipTime}>
                  {expiringOffer ? "00:00" : countdownLabel}
                </Text>
              </Pressable>
            </Animated.View>
          ) : (
            <View style={styles.offerModalWrap}>
              <Animated.View
                style={[
                  styles.offerModal,
                  {
                    opacity: offerOpacity,
                    transform: [{ scale: offerScale }]
                  }
                ]}
              >
                <View style={styles.offerHeader}>
                  <View style={styles.offerHeaderText}>
                    <Text style={styles.offerEyebrow}>{offerEyebrow}</Text>
                    <Text style={styles.offerTitle}>Premium annuel a -50%</Text>
                    <Text style={styles.offerSubtitle}>
                      {offerSubtitle}
                    </Text>
                  </View>
                  <Pressable style={styles.offerCloseButton} onPress={() => collapseOffer(session.uid)}>
                    <Text style={styles.offerCloseLabel}>X</Text>
                  </Pressable>
                </View>

                <View style={styles.offerPriceCard}>
                  <Text style={styles.offerStrike}>{PREMIUM_YEARLY_PRICE}</Text>
                  <Text style={styles.offerDiscount}>{PREMIUM_YEARLY_LIFETIME_OFFER_PRICE}</Text>
                  <Text style={styles.offerTimerText}>
                    Temps restant : {expiringOffer ? "00:00" : countdownLabel}
                  </Text>
                  <Text style={styles.offerLifetimeHint}>
                    Ensuite, le tarif reste conserve tant que ton Premium reste actif.
                  </Text>
                </View>

                <View style={styles.offerFeatureList}>
                  <Text style={styles.offerFeatureItem}>Statistiques avancees, calendrier et classement detaille</Text>
                  <Text style={styles.offerFeatureItem}>Rappels personnalises et experience sans pub</Text>
                  <Text style={styles.offerFeatureItem}>Detection des doublons et services peu utiles</Text>
                </View>

                <View style={styles.offerActions}>
                  <PrimaryButton title="Plus tard" onPress={() => collapseOffer(session.uid)} variant="secondary" />
                  <PrimaryButton
                    title={isActivatingPremium ? "Activation..." : "Activer le -50%"}
                    onPress={() => void handleOfferAction()}
                    disabled={isActivatingPremium}
                  />
                </View>
              </Animated.View>
            </View>
          )}
        </View>
      ) : null}
    </>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    absoluteLayer: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 40
    },
    tutorialBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(4, 4, 8, 0.84)"
    },
    tutorialCardWrap: {
      flex: 1,
      justifyContent: "flex-end",
      padding: spacing.lg,
      paddingBottom: spacing.xxxl + 86
    },
    tutorialCard: {
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.backgroundElevated,
      ...shadows.card
    },
    tutorialHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md
    },
    tutorialEyebrow: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: theme.colors.primary
    },
    skipLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.textSecondary
    },
    tutorialTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    tutorialBody: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.textSecondary
    },
    progressRow: {
      flexDirection: "row",
      gap: spacing.xs
    },
    progressDot: {
      flex: 1,
      height: 6,
      borderRadius: 999,
      backgroundColor: theme.colors.surfaceContrast
    },
    progressDotActive: {
      backgroundColor: theme.colors.primary
    },
    tutorialActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: spacing.sm,
      flexWrap: "wrap"
    },
    offerBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(4, 4, 8, 0.7)"
    },
    offerModalWrap: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl
    },
    offerModal: {
      gap: spacing.lg,
      padding: spacing.xl,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: "rgba(255, 184, 77, 0.34)",
      backgroundColor: theme.colors.backgroundElevated,
      ...shadows.card
    },
    offerHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md
    },
    offerHeaderText: {
      flex: 1,
      gap: spacing.xs
    },
    offerEyebrow: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: theme.colors.primary
    },
    offerTitle: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    offerSubtitle: {
      fontSize: 14,
      lineHeight: 21,
      color: theme.colors.textSecondary
    },
    offerCloseButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    offerCloseLabel: {
      fontSize: 13,
      fontWeight: "800",
      color: theme.colors.textSecondary
    },
    offerPriceCard: {
      gap: spacing.xs,
      padding: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surfaceRaised
    },
    offerStrike: {
      fontSize: 14,
      textDecorationLine: "line-through",
      color: theme.colors.textSecondary
    },
    offerDiscount: {
      fontSize: 30,
      fontWeight: "800",
      color: theme.colors.primary
    },
    offerTimerText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    offerLifetimeHint: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.colors.textSecondary
    },
    offerFeatureList: {
      gap: spacing.sm
    },
    offerFeatureItem: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.textPrimary
    },
    offerActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-end",
      gap: spacing.sm
    },
    timerChipWrap: {
      position: "absolute",
      right: spacing.md,
      top: "42%"
    },
    timerChip: {
      minWidth: 74,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: "rgba(255, 184, 77, 0.34)",
      ...shadows.card
    },
    timerChipLabel: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.6,
      color: theme.colors.primary
    },
    timerChipTime: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.colors.textPrimary
    }
  });
