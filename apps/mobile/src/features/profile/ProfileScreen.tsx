import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import {
  FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION,
  FREE_PLAN_MAX_SUBSCRIPTIONS,
  Subscription
} from "@subly/shared";

import {
  FREE_PLAN_FEATURES,
  PREMIUM_COMPARISON_ROWS,
  PREMIUM_MONTHLY_PRICE,
  PREMIUM_MEMBERSHIP_PROVIDER_NAME,
  PREMIUM_PLAN_FEATURES,
  PREMIUM_YEARLY_LIFETIME_OFFER_AMOUNT,
  PREMIUM_YEARLY_LIFETIME_OFFER_PRICE,
  PREMIUM_YEARLY_PRICE,
  type PremiumFeatureState,
  isPremiumPlan
} from "../../constants/premium";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAuthStore } from "../../store/authStore";
import {
  DEFAULT_USER_EXPERIENCE_STATE,
  useExperienceStore
} from "../../store/experienceStore";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { AppTheme, radius, shadows, spacing, useAppTheme } from "../../theme";
import { formatCurrency, formatLongDate } from "../../utils/format";

type OfferPlan = {
  id: "free" | "premium_monthly" | "premium_yearly";
  title: string;
  price: string;
  subtitle: string;
  features: Array<{
    label: string;
    state?: PremiumFeatureState;
  }>;
  highlight?: string;
  tone: "neutral" | "orange" | "purple";
  cta: string;
};

function buildOfferPlans(hasDiscountedYearlyPrice: boolean, hasLifetimeOfferLocked: boolean): OfferPlan[] {
  return [
    {
      id: "free",
      title: "Gratuit",
      price: "0 EUR",
      subtitle: "Pour demarrer sans engagement",
      features: FREE_PLAN_FEATURES.map((label) => ({ label })),
      tone: "neutral",
      cta: "Rester gratuit"
    },
    {
      id: "premium_monthly",
      title: "Premium",
      price: PREMIUM_MONTHLY_PRICE,
      subtitle: "Flexible et sans engagement annuel",
      features: [
        ...PREMIUM_PLAN_FEATURES.map((label) => ({ label })),
        { label: "Synchronisation cloud", state: "coming_soon" },
        { label: "Sauvegarde automatique", state: "coming_soon" },
        { label: "Partage avec un proche", state: "coming_soon" }
      ],
      highlight: "Le plus souple",
      tone: "orange",
      cta: "Choisir le mensuel"
    },
    {
      id: "premium_yearly",
      title: "Premium annuel",
      price: hasDiscountedYearlyPrice
        ? PREMIUM_YEARLY_LIFETIME_OFFER_PRICE
        : PREMIUM_YEARLY_PRICE,
      subtitle: hasLifetimeOfferLocked
        ? "Ton -50% est verrouille tant que ton Premium reste actif"
        : hasDiscountedYearlyPrice
          ? "Offre annuelle reservee pendant une heure"
          : "La formule la plus rentable",
      features: [
        { label: "Tout Premium" },
        {
          label: hasDiscountedYearlyPrice
            ? "Tarif annuel a -50% tant que Premium actif"
            : "33% moins cher"
        },
        { label: "Synchronisation cloud", state: "coming_soon" },
        { label: "Sauvegarde automatique", state: "coming_soon" },
        { label: "Partage avec un proche", state: "coming_soon" }
      ],
      highlight: hasLifetimeOfferLocked
        ? "Tarif verrouille"
        : hasDiscountedYearlyPrice
          ? "Offre -50%"
          : "Meilleure offre",
      tone: "purple",
      cta: "Choisir l'annuel"
    }
  ];
}

function countsTowardPlanUsage(status: Subscription["status"]) {
  return status === "active" || status === "trial";
}

function getPremiumPlanLabel(subscription: Subscription | null) {
  if (!subscription) {
    return "Premium";
  }

  if (subscription.billingFrequency === "yearly") {
    return Math.abs(subscription.price - PREMIUM_YEARLY_LIFETIME_OFFER_AMOUNT) < 0.001
      ? "Premium annuel -50%"
      : "Premium annuel";
  }

  return "Premium mensuel";
}

export function ProfileScreen(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const navigation = useAppNavigation();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const session = useAuthStore((state) => state.session);
  const profile = useWorkspaceStore((state) => state.profile);
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const activatePremiumMembership = useWorkspaceStore((state) => state.activatePremiumMembership);
  const isActivatingPremium = useWorkspaceStore((state) => state.isActivatingPremium);
  const schedulePremiumDowngrade = useWorkspaceStore((state) => state.schedulePremiumDowngrade);
  const isSchedulingPremiumDowngrade = useWorkspaceStore(
    (state) => state.isSchedulingPremiumDowngrade
  );
  const claimLifetimeOffer = useExperienceStore((state) => state.claimLifetimeOffer);
  const userExperience = useExperienceStore((state) =>
    session?.uid
      ? state.users[session.uid] ?? DEFAULT_USER_EXPERIENCE_STATE
      : DEFAULT_USER_EXPERIENCE_STATE
  );
  const displayName = profile?.displayName ?? session?.displayName ?? "Sarah Martin";
  const [isPremiumModalVisible, setPremiumModalVisible] = useState(false);
  const isPremium = isPremiumPlan(profile);
  const premiumSubscription =
    subscriptions.find(
      (subscription) =>
        !subscription.archivedAt &&
        subscription.providerName.trim().toLowerCase() ===
          PREMIUM_MEMBERSHIP_PROVIDER_NAME.trim().toLowerCase()
    ) ?? null;
  const activeSubscriptionCount = subscriptions.filter(
    (subscription) => !subscription.archivedAt && countsTowardPlanUsage(subscription.status)
  ).length;
  const remainingFreeSlots = Math.max(FREE_PLAN_MAX_SUBSCRIPTIONS - activeSubscriptionCount, 0);
  const freePlanUsageRatio = Math.min(
    activeSubscriptionCount / FREE_PLAN_MAX_SUBSCRIPTIONS,
    1
  );
  const hasLifetimeOfferLocked = userExperience.discountPriceUnlocked;
  const hasActiveLimitedOffer = Boolean(userExperience.activeOffer);
  const hasDiscountedYearlyPrice = hasLifetimeOfferLocked || hasActiveLimitedOffer;
  const offerPlans = buildOfferPlans(hasDiscountedYearlyPrice, hasLifetimeOfferLocked);
  const premiumPlanLabel = getPremiumPlanLabel(premiumSubscription);
  const premiumPriceLabel = premiumSubscription
    ? formatCurrency(premiumSubscription.price, premiumSubscription.currency)
    : null;
  const premiumNextBillingLabel = premiumSubscription
    ? formatLongDate(premiumSubscription.nextBillingDate)
    : null;
  const premiumAccessEndsLabel = premiumSubscription
    ? formatLongDate(premiumSubscription.accessEndsAt ?? premiumSubscription.nextBillingDate)
    : null;

  const handleSelectOffer = async (offer: OfferPlan) => {
    if (offer.id === "free") {
      setPremiumModalVisible(false);
      return;
    }

    try {
      if (offer.id === "premium_yearly") {
        if (session?.uid && hasDiscountedYearlyPrice) {
          claimLifetimeOffer(session.uid);
        }

        await activatePremiumMembership(
          hasDiscountedYearlyPrice ? "yearly_discounted" : "yearly"
        );
        setPremiumModalVisible(false);
        Alert.alert(
          "Premium active",
          "Ton abonnement Subly Premium annuel a ete ajoute automatiquement dans tes abonnements avec le bon tarif."
        );
        return;
      }

      await activatePremiumMembership("monthly");
      setPremiumModalVisible(false);
      Alert.alert(
        "Premium active",
        "Ton abonnement Subly Premium mensuel a ete ajoute automatiquement dans tes abonnements."
      );
    } catch (error) {
      Alert.alert(
        "Activation impossible",
        error instanceof Error ? error.message : "Impossible d'activer Premium pour le moment."
      );
    }
  };

  const handleSchedulePremiumDowngrade = () => {
    if (!premiumSubscription) {
      Alert.alert(
        "Abonnement Premium introuvable",
        "Subly n'a pas retrouve la ligne de facturation Premium a programmer."
      );
      return;
    }

    Alert.alert(
      "Repasser au gratuit",
      `Ton Premium restera actif jusqu'au ${premiumAccessEndsLabel}. Aucun nouveau prelevement ne sera programme apres cette date.`,
      [
        {
          text: "Garder Premium",
          style: "cancel"
        },
        {
          text: "Confirmer",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await schedulePremiumDowngrade();
                Alert.alert(
                  "Retour au gratuit programme",
                  `Ton compte restera Premium jusqu'au ${premiumAccessEndsLabel}, puis repassera automatiquement sur la formule gratuite.`
                );
              } catch (error) {
                Alert.alert(
                  "Programmation impossible",
                  error instanceof Error
                    ? error.message
                    : "Impossible de programmer le retour au gratuit."
                );
              }
            })();
          }
        }
      ]
    );
  };

  return (
    <>
      <Screen
        title="Profil"
        subtitle="Retrouve ici ton identite, ton plan actuel et la nouvelle grille d'avantages Premium."
        action={<PrimaryButton title="Retour" onPress={navigation.goBack} variant="secondary" />}
      >
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>{displayName.slice(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{profile?.email ?? session?.email ?? "sarah@subly.app"}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {isPremium ? "Plan Premium" : "Plan Gratuit"}
            </Text>
          </View>
          <Text style={styles.meta}>Devise : {profile?.currency ?? "EUR"}</Text>
          <Text style={styles.meta}>Abonnements actifs : {activeSubscriptionCount}</Text>
        </View>

        <View style={styles.usageCard}>
          <Text style={styles.usageTitle}>
            {isPremium ? "Capacite ouverte" : "Progression sur le plan gratuit"}
          </Text>
          <Text style={styles.usageBody}>
            {isPremium
              ? "Tu peux ajouter autant d'abonnements et de services inclus que necessaire, avec toutes les fonctions avancees deja ouvertes."
              : `Tu utilises ${activeSubscriptionCount}/${FREE_PLAN_MAX_SUBSCRIPTIONS} abonnements disponibles sur le plan gratuit.`}
          </Text>
          {!isPremium ? (
            <>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(12, freePlanUsageRatio * 100)}%`
                    }
                  ]}
                />
              </View>
              <Text style={styles.usageHint}>
                {remainingFreeSlots > 0
                  ? `Encore ${remainingFreeSlots} emplacement(s) avant de devoir passer au Premium.`
                  : "La limite du plan gratuit est atteinte. Le Premium debloque l'ajout illimite."}
              </Text>
              <Text style={styles.usageHint}>
                Les services inclus restent limites a {FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION} par abonnement en version gratuite.
              </Text>
              <Text style={styles.usageHint}>
                Les rappels personnalises, la detection des doublons et la suppression des pubs sont reserves au Premium.
              </Text>
              {hasDiscountedYearlyPrice ? (
                <Text style={styles.usageHintStrong}>
                  Ton offre annuelle a -50% est deja reservee. Une fois le Premium active avec elle, ce tarif reste valable tant que ton Premium reste actif.
                </Text>
              ) : null}
            </>
          ) : (
            <>
              <Text style={styles.usageHint}>
                Les statistiques avancees, le calendrier des prelevements, les rappels personnalises et l'experience sans pub sont disponibles.
              </Text>
              {premiumSubscription?.cancelAtPeriodEnd ? (
                <Text style={styles.usageHintStrong}>
                  Ton retour au gratuit est deja programme. Tu gardes Premium jusqu'au {premiumAccessEndsLabel}.
                </Text>
              ) : null}
              {userExperience.discountedPremiumActive ? (
                <Text style={styles.usageHintStrong}>
                  Ton tarif annuel a -50% reste conserve tant que ton Premium reste actif.
                </Text>
              ) : null}
            </>
          )}
        </View>

        {isPremium ? (
          <View style={styles.billingCard}>
            <Text style={styles.billingTitle}>Facturation Premium</Text>
            <Text style={styles.billingBody}>
              {premiumSubscription
                ? premiumSubscription.cancelAtPeriodEnd
                  ? "Ton retour au gratuit est programme. Tu conserves l'acces Premium jusqu'a la fin de la periode deja payee."
                  : "Retrouve ici la prochaine echeance de ton abonnement Premium."
                : "Les informations de facturation Premium se synchronisent avec ton abonnement Subly Premium."}
            </Text>

            {premiumSubscription ? (
              <>
                <View style={[styles.billingGrid, isCompact ? styles.billingGridCompact : null]}>
                  <View style={styles.billingMetric}>
                    <Text style={styles.billingMetricLabel}>Formule</Text>
                    <Text style={styles.billingMetricValue}>{premiumPlanLabel}</Text>
                  </View>
                  <View style={styles.billingMetric}>
                    <Text style={styles.billingMetricLabel}>
                      {premiumSubscription.cancelAtPeriodEnd
                        ? "Montant du cycle"
                        : "Prochain prelevement"}
                    </Text>
                    <Text style={styles.billingMetricValue}>{premiumPriceLabel}</Text>
                  </View>
                  <View style={styles.billingMetric}>
                    <Text style={styles.billingMetricLabel}>
                      {premiumSubscription.cancelAtPeriodEnd
                        ? "Acces jusqu'au"
                        : "Date du prelevement"}
                    </Text>
                    <Text style={styles.billingMetricValue}>
                      {premiumSubscription.cancelAtPeriodEnd
                        ? premiumAccessEndsLabel
                        : premiumNextBillingLabel}
                    </Text>
                  </View>
                </View>

                <Text style={styles.billingNote}>
                  {premiumSubscription.cancelAtPeriodEnd
                    ? "Aucun nouveau prelevement n'est programme. Le compte repassera automatiquement au plan gratuit a la fin de cette periode."
                    : `Prochaine echeance prevue le ${premiumNextBillingLabel} pour ${premiumPriceLabel}.`}
                </Text>

                {premiumSubscription.cancelAtPeriodEnd ? (
                  <View style={styles.billingScheduledBadge}>
                    <Text style={styles.billingScheduledBadgeLabel}>
                      Retour au gratuit programme
                    </Text>
                  </View>
                ) : (
                  <PrimaryButton
                    title={
                      isSchedulingPremiumDowngrade
                        ? "Programmation..."
                        : "Repasser au gratuit en fin de periode"
                    }
                    onPress={handleSchedulePremiumDowngrade}
                    variant="secondary"
                    disabled={isSchedulingPremiumDowngrade}
                  />
                )}
              </>
            ) : null}
          </View>
        ) : null}

        <View style={styles.premiumCard}>
          <Text style={styles.premiumTitle}>
            {isPremium ? "Ton espace Premium" : "Passe au niveau Premium"}
          </Text>
          <Text style={styles.premiumBody}>
            Debloque les statistiques avancees, le calendrier des prelevements, la detection des abonnements peu utiles et des doublons, les rappels personnalises et une experience sans pub. La synchronisation cloud, la sauvegarde automatique et le partage avec un proche sont deja prevus pour la suite.
          </Text>
          {hasDiscountedYearlyPrice ? (
            <Text style={styles.premiumOfferHint}>
              L'offre annuelle a -50% est disponible sur ton compte et reste ensuite conservee tant que ton Premium reste actif.
            </Text>
          ) : null}
          <PrimaryButton
            title={isPremium ? "Comparer les formules" : "Passer au Premium"}
            onPress={() => setPremiumModalVisible(true)}
          />
        </View>
      </Screen>

      <Modal
        visible={isPremiumModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPremiumModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setPremiumModalVisible(false)} />
          <View style={[styles.sheet, isCompact ? styles.sheetCompact : null]}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderText}>
                <Text style={styles.sheetEyebrow}>Passer a Premium</Text>
                <Text style={styles.sheetTitle}>{PREMIUM_MONTHLY_PRICE}</Text>
                <Text style={styles.sheetOr}>ou</Text>
                <Text style={styles.sheetTitleSecondary}>
                  {hasDiscountedYearlyPrice
                    ? PREMIUM_YEARLY_LIFETIME_OFFER_PRICE
                    : PREMIUM_YEARLY_PRICE}
                </Text>
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={() => setPremiumModalVisible(false)}
              >
                <Text style={styles.closeButtonLabel}>X</Text>
              </Pressable>
            </View>

            <Text style={styles.sheetSubtitle}>
              {hasDiscountedYearlyPrice
                ? "Ton compte dispose actuellement du tarif annuel a -50%. Une fois active avec cette offre, la remise reste liee a ton Premium tant qu'il reste actif."
                : "La facturation in-app sera branchee sur cet ecran dans une prochaine iteration. Les verrous produit sont deja poses dans l'app pour les stats avancees, les rappels personnalises et les cartes sponsorisees."}
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.offerList}
            >
              {offerPlans.map((offer) => (
                <View
                  key={offer.id}
                  style={[
                    styles.offerCard,
                    offer.tone === "orange" ? styles.offerCardOrange : null,
                    offer.tone === "purple" ? styles.offerCardPurple : null
                  ]}
                >
                  <View style={styles.offerHeader}>
                    <View style={styles.offerIdentity}>
                      <Text style={styles.offerTitle}>{offer.title}</Text>
                      <Text style={styles.offerPrice}>{offer.price}</Text>
                      <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
                    </View>
                    {offer.highlight ? (
                      <View
                        style={[
                          styles.offerBadge,
                          offer.tone === "purple" ? styles.offerBadgePurple : styles.offerBadgeOrange
                        ]}
                      >
                        <Text style={styles.offerBadgeLabel}>{offer.highlight}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.featureList}>
                    {offer.features.map((feature) => (
                      <View key={`${offer.id}_${feature.label}`} style={styles.featureRow}>
                        <View
                          style={[
                            styles.featureDot,
                            offer.tone === "orange" ? styles.featureDotOrange : null,
                            offer.tone === "purple" ? styles.featureDotPurple : null
                          ]}
                        />
                        <Text style={styles.featureText}>{feature.label}</Text>
                        {feature.state === "coming_soon" ? (
                          <View style={styles.featureStatusBadge}>
                            <Text style={styles.featureStatusLabel}>Bientot</Text>
                          </View>
                        ) : null}
                      </View>
                    ))}
                  </View>

                  <PrimaryButton
                    title={offer.cta}
                    onPress={() => void handleSelectOffer(offer)}
                    variant={offer.id === "free" ? "secondary" : "primary"}
                    disabled={offer.id !== "free" && isActivatingPremium}
                  />
                </View>
              ))}

              <View style={styles.comparisonSection}>
                <Text style={styles.comparisonTitle}>Comparatif des avantages</Text>
                <Text style={styles.comparisonBody}>
                  Ce tableau distingue ce qui est deja actif dans le produit de ce qui est annonce pour la suite Premium.
                </Text>

                <View style={styles.comparisonList}>
                  {PREMIUM_COMPARISON_ROWS.map((row) => (
                    <View key={row.id} style={styles.comparisonRow}>
                      <View style={styles.comparisonText}>
                        <Text style={styles.comparisonRowTitle}>{row.title}</Text>
                        <Text style={styles.comparisonRowDescription}>{row.description}</Text>
                      </View>
                      <View style={[styles.comparisonValues, isCompact ? styles.comparisonValuesCompact : null]}>
                        <View style={styles.planValue}>
                          <Text style={styles.planValueLabel}>Gratuit</Text>
                          <Text style={styles.planValueText}>{row.freeValue}</Text>
                        </View>
                        <View style={[styles.planValue, styles.planValuePremium]}>
                          <Text style={styles.planValueLabel}>Premium</Text>
                          <Text style={styles.planValueText}>{row.premiumValue}</Text>
                          {row.premiumState === "coming_soon" ? (
                            <View style={styles.planValueBadge}>
                              <Text style={styles.planValueBadgeLabel}>Bientot</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceContrast,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong
  },
  avatarLabel: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.primary
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  email: {
    fontSize: 15,
    color: theme.colors.textSecondary
  },
  meta: {
    fontSize: 14,
    color: theme.colors.textSecondary
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceContrast
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary
  },
  usageCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  usageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  usageBody: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.textSecondary
  },
  usageHint: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textSecondary
  },
  usageHintStrong: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  progressTrack: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceContrast,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: theme.colors.primary
  },
  premiumCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 184, 77, 0.34)"
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  premiumBody: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textSecondary
  },
  premiumOfferHint: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  billingCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  billingTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  billingBody: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.textSecondary
  },
  billingGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  billingGridCompact: {
    flexDirection: "column"
  },
  billingMetric: {
    flex: 1,
    gap: 6,
    borderRadius: radius.sm,
    padding: spacing.md,
    backgroundColor: theme.colors.surfaceContrast,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong
  },
  billingMetricLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: theme.colors.textTertiary
  },
  billingMetricValue: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  billingNote: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.textSecondary
  },
  billingScheduledBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceContrast,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong
  },
  billingScheduledBadgeLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: theme.colors.primary
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end"
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 3, 6, 0.78)"
  },
  sheet: {
    maxHeight: "90%",
    backgroundColor: theme.colors.backgroundElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    ...shadows.card
  },
  sheetCompact: {
    paddingHorizontal: spacing.md
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  sheetHeaderText: {
    flex: 1,
    gap: 2
  },
  sheetEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: theme.colors.primary
  },
  sheetTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  sheetOr: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textTertiary,
    textTransform: "uppercase"
  },
  sheetTitleSecondary: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.secondary
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  closeButtonLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.textSecondary
  },
  sheetSubtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary
  },
  offerList: {
    paddingTop: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.sm
  },
  offerCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  offerCardOrange: {
    borderColor: "rgba(255, 184, 77, 0.34)",
    backgroundColor: "rgba(255, 184, 77, 0.06)"
  },
  offerCardPurple: {
    borderColor: "rgba(140, 123, 255, 0.32)",
    backgroundColor: "rgba(140, 123, 255, 0.08)"
  },
  offerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  offerIdentity: {
    flex: 1,
    gap: 4
  },
  offerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  offerPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.primary
  },
  offerSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary
  },
  offerBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999
  },
  offerBadgeOrange: {
    backgroundColor: "rgba(255, 184, 77, 0.16)"
  },
  offerBadgePurple: {
    backgroundColor: "rgba(140, 123, 255, 0.18)"
  },
  offerBadgeLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: theme.colors.textPrimary
  },
  featureList: {
    gap: spacing.sm
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.textTertiary
  },
  featureDotOrange: {
    backgroundColor: theme.colors.primary
  },
  featureDotPurple: {
    backgroundColor: theme.colors.secondary
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary
  },
  featureStatusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceContrast
  },
  featureStatusLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.colors.textSecondary
  },
  comparisonSection: {
    gap: spacing.md,
    paddingTop: spacing.sm
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  comparisonBody: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.textSecondary
  },
  comparisonList: {
    gap: spacing.sm
  },
  comparisonRow: {
    gap: spacing.md,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  comparisonText: {
    gap: 4
  },
  comparisonRowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  comparisonRowDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textSecondary
  },
  comparisonValues: {
    flexDirection: "row",
    gap: spacing.sm
  },
  comparisonValuesCompact: {
    flexDirection: "column"
  },
  planValue: {
    flex: 1,
    gap: 4,
    borderRadius: radius.sm,
    padding: spacing.sm,
    backgroundColor: theme.colors.surfaceContrast,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong
  },
  planValuePremium: {
    borderColor: "rgba(255, 184, 77, 0.34)"
  },
  planValueLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: theme.colors.textTertiary
  },
  planValueText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  planValueBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255, 184, 77, 0.16)"
  },
  planValueBadgeLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.colors.primary
  }
});
