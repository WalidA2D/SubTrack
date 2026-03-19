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
  type PremiumComparisonRow,
  type PremiumFeatureState,
  isPremiumPlan
} from "../../constants/premium";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAppTranslation } from "../../i18n";
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

function getFreePlanFeatures(isFrench: boolean) {
  if (isFrench) {
    return [...FREE_PLAN_FEATURES];
  }

  return [
    "Up to 5 active subscriptions",
    "Up to 2 included services per subscription",
    "Yearly budget forecast",
    "Basic statistics",
    "Simple reminders",
    "Sponsored cards"
  ] as const;
}

function getPremiumPlanFeatures(isFrench: boolean) {
  if (isFrench) {
    return [...PREMIUM_PLAN_FEATURES];
  }

  return [
    "Unlimited subscriptions",
    "Unlimited included services",
    "Advanced statistics",
    "Billing calendar",
    "Low-utility and duplicate detection",
    "Subscription PDF export",
    "Custom reminders",
    "Ad-free experience"
  ] as const;
}

function getPremiumComparisonRows(isFrench: boolean): PremiumComparisonRow[] {
  if (isFrench) {
    return [...PREMIUM_COMPARISON_ROWS];
  }

  return [
    {
      id: "subscription_capacity",
      title: "Tracking capacity",
      description: "How many subscriptions you can manage at the same time.",
      freeValue: "5 subscriptions",
      premiumValue: "Unlimited"
    },
    {
      id: "included_services",
      title: "Included services",
      description: "Services linked to a main offer such as a bundle or bank plan.",
      freeValue: "2 per subscription",
      premiumValue: "Unlimited"
    },
    {
      id: "cloud_sync",
      title: "Cloud sync",
      description: "Automatically find your data on every device.",
      freeValue: "Not included",
      premiumValue: "Premium",
      premiumState: "coming_soon"
    },
    {
      id: "auto_backup",
      title: "Automatic backup",
      description: "Continuous protection of your data and quick restore.",
      freeValue: "Not included",
      premiumValue: "Premium",
      premiumState: "coming_soon"
    },
    {
      id: "advanced_statistics",
      title: "Advanced statistics",
      description: "Rankings, charts and detailed category insights.",
      freeValue: "Simple view",
      premiumValue: "Full"
    },
    {
      id: "billing_calendar",
      title: "Billing calendar",
      description: "Yearly, monthly, weekly and daily views of upcoming subscriptions.",
      freeValue: "Not included",
      premiumValue: "Interactive"
    },
    {
      id: "annual_forecast",
      title: "Yearly budget forecast",
      description: "Yearly projection and monthly/yearly toggle in your tracking.",
      freeValue: "Included",
      premiumValue: "Included"
    },
    {
      id: "low_usage_detection",
      title: "Low-utility / duplicates",
      description: "Detection of services to watch or potentially redundant services.",
      freeValue: "Locked",
      premiumValue: "Included"
    },
    {
      id: "custom_reminders",
      title: "Custom reminders",
      description: "Choose a reminder delay per subscription or for the whole account.",
      freeValue: "Simple reminders",
      premiumValue: "Custom"
    },
    {
      id: "pdf_export",
      title: "PDF export",
      description: "Generate a clean, shareable PDF report of filtered subscriptions.",
      freeValue: "Not included",
      premiumValue: "Full report"
    },
    {
      id: "ads",
      title: "Ads",
      description: "Sponsored cards visible on the free plan.",
      freeValue: "Yes",
      premiumValue: "None"
    }
  ];
}

function buildOfferPlans(
  hasDiscountedYearlyPrice: boolean,
  hasLifetimeOfferLocked: boolean,
  isFrench: boolean
): OfferPlan[] {
  const freePlanFeatures = getFreePlanFeatures(isFrench);
  const premiumPlanFeatures = getPremiumPlanFeatures(isFrench);
  const monthlyPriceLabel = isFrench ? PREMIUM_MONTHLY_PRICE : "EUR 2.99 / month";
  const yearlyPriceLabel = isFrench ? PREMIUM_YEARLY_PRICE : "EUR 19.99 / year";
  const yearlyDiscountedPriceLabel = isFrench
    ? PREMIUM_YEARLY_LIFETIME_OFFER_PRICE
    : "EUR 9.99 / year";

  return [
    {
      id: "free",
      title: isFrench ? "Gratuit" : "Free",
      price: isFrench ? "0 EUR" : "EUR 0",
      subtitle: isFrench ? "Pour demarrer sans engagement" : "To get started without commitment",
      features: freePlanFeatures.map((label) => ({ label })),
      tone: "neutral",
      cta: isFrench ? "Rester gratuit" : "Stay free"
    },
    {
      id: "premium_monthly",
      title: "Premium",
      price: monthlyPriceLabel,
      subtitle: isFrench ? "Flexible et sans engagement annuel" : "Flexible with no yearly commitment",
      features: [
        ...premiumPlanFeatures.map((label) => ({ label })),
        { label: isFrench ? "Synchronisation cloud" : "Cloud sync", state: "coming_soon" },
        { label: isFrench ? "Sauvegarde automatique" : "Automatic backup", state: "coming_soon" }
      ],
      highlight: isFrench ? "Le plus souple" : "Most flexible",
      tone: "orange",
      cta: isFrench ? "Choisir le mensuel" : "Choose monthly"
    },
    {
      id: "premium_yearly",
      title: isFrench ? "Premium annuel" : "Premium yearly",
      price: hasDiscountedYearlyPrice
        ? yearlyDiscountedPriceLabel
        : yearlyPriceLabel,
      subtitle: hasLifetimeOfferLocked
        ? isFrench
          ? "Ton -50% est verrouille tant que ton Premium reste actif"
          : "Your -50% price stays locked while Premium remains active"
        : hasDiscountedYearlyPrice
          ? isFrench
            ? "Offre annuelle reservee pendant une heure"
            : "Yearly offer reserved for one hour"
          : isFrench
            ? "La formule la plus rentable"
            : "The best value plan",
      features: [
        { label: isFrench ? "Tout Premium" : "Everything in Premium" },
        {
          label: hasDiscountedYearlyPrice
            ? isFrench
              ? "Tarif annuel a -50% tant que Premium actif"
              : "Yearly price at -50% while Premium stays active"
            : isFrench
              ? "33% moins cher"
              : "33% cheaper"
        },
        { label: isFrench ? "Synchronisation cloud" : "Cloud sync", state: "coming_soon" },
        { label: isFrench ? "Sauvegarde automatique" : "Automatic backup", state: "coming_soon" },
        { label: isFrench ? "Export PDF des abonnements" : "Subscription PDF export" }
      ],
      highlight: hasLifetimeOfferLocked
        ? isFrench
          ? "Tarif verrouille"
          : "Locked price"
        : hasDiscountedYearlyPrice
          ? isFrench
            ? "Offre -50%"
            : "-50% offer"
          : isFrench
            ? "Meilleure offre"
            : "Best offer",
      tone: "purple",
      cta: isFrench ? "Choisir l'annuel" : "Choose yearly"
    }
  ];
}

function countsTowardPlanUsage(status: Subscription["status"]) {
  return status === "active" || status === "trial";
}

function getPremiumPlanLabel(subscription: Subscription | null, isFrench: boolean) {
  if (!subscription) {
    return "Premium";
  }

  if (subscription.billingFrequency === "yearly") {
    return Math.abs(subscription.price - PREMIUM_YEARLY_LIFETIME_OFFER_AMOUNT) < 0.001
      ? isFrench
        ? "Premium annuel -50%"
        : "Premium yearly -50%"
      : isFrench
        ? "Premium annuel"
        : "Premium yearly";
  }

  return isFrench ? "Premium mensuel" : "Premium monthly";
}

function getActiveOfferId(subscription: Subscription | null, isPremium: boolean): OfferPlan["id"] | null {
  if (subscription) {
    return subscription.billingFrequency === "yearly" ? "premium_yearly" : "premium_monthly";
  }

  return isPremium ? null : "free";
}

export function ProfileScreen(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const navigation = useAppNavigation();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { locale } = useAppTranslation();
  const isFrench = locale === "fr";
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
  const offerPlans = buildOfferPlans(hasDiscountedYearlyPrice, hasLifetimeOfferLocked, isFrench);
  const comparisonRows = getPremiumComparisonRows(isFrench);
  const premiumPlanLabel = getPremiumPlanLabel(premiumSubscription, isFrench);
  const activeOfferId = getActiveOfferId(premiumSubscription, isPremium);
  const premiumPriceLabel = premiumSubscription
    ? formatCurrency(premiumSubscription.price, premiumSubscription.currency)
    : null;
  const premiumNextBillingLabel = premiumSubscription
    ? formatLongDate(premiumSubscription.nextBillingDate)
    : null;
  const premiumAccessEndsLabel = premiumSubscription
    ? formatLongDate(premiumSubscription.accessEndsAt ?? premiumSubscription.nextBillingDate)
    : null;
  const copy = {
    title: isFrench ? "Profil" : "Profile",
    subtitle: isFrench
      ? "Retrouve ici ton identite, ton plan actuel et la nouvelle grille d'avantages Premium."
      : "See your identity, current plan and the updated Premium benefits here.",
    back: isFrench ? "Retour" : "Back",
    premiumActiveTitle: isFrench ? "Premium active" : "Premium active",
    premiumYearlyBody: isFrench
      ? "Ton abonnement Subly Premium annuel a ete ajoute automatiquement dans tes abonnements avec le bon tarif."
      : "Your Subly Premium yearly subscription was automatically added to your subscriptions with the correct price.",
    premiumMonthlyBody: isFrench
      ? "Ton abonnement Subly Premium mensuel a ete ajoute automatiquement dans tes abonnements."
      : "Your Subly Premium monthly subscription was automatically added to your subscriptions.",
    activationFailed: isFrench ? "Activation impossible" : "Unable to activate",
    activateLater: isFrench
      ? "Impossible d'activer Premium pour le moment."
      : "Unable to activate Premium right now.",
    premiumMissingTitle: isFrench ? "Abonnement Premium introuvable" : "Premium subscription not found",
    premiumMissingBody: isFrench
      ? "Subly n'a pas retrouve la ligne de facturation Premium a programmer."
      : "Subly could not find the Premium billing line to schedule.",
    downgradeTitle: isFrench ? "Repasser au gratuit" : "Switch back to free",
    keepPremium: isFrench ? "Garder Premium" : "Keep Premium",
    confirm: isFrench ? "Confirmer" : "Confirm",
    downgradeScheduledTitle: isFrench
      ? "Retour au gratuit programme"
      : "Return to free scheduled",
    downgradeFailedTitle: isFrench ? "Programmation impossible" : "Unable to schedule",
    downgradeFailedBody: isFrench
      ? "Impossible de programmer le retour au gratuit."
      : "Unable to schedule the return to free.",
    premiumBadge: isFrench ? "Plan Premium" : "Premium plan",
    freeBadge: isFrench ? "Plan Gratuit" : "Free plan",
    currency: isFrench ? "Devise" : "Currency",
    activeSubscriptions: isFrench ? "Abonnements actifs" : "Active subscriptions",
    premiumSpace: isFrench ? "Ton espace Premium" : "Your Premium space",
    goPremium: isFrench ? "Passe au niveau Premium" : "Move up to Premium",
    comparePlans: isFrench ? "Comparer les formules" : "Compare plans",
    switchToPremium: isFrench ? "Passer au Premium" : "Go Premium",
    currentPlan: isFrench ? "Plan actuel" : "Current plan",
    alreadyActive: isFrench ? "Deja actif" : "Already active",
    capacityOpen: isFrench ? "Capacite ouverte" : "Open capacity",
    freeProgress: isFrench ? "Progression sur le plan gratuit" : "Free plan progress",
    premiumUsageBody: isFrench
      ? "Tu peux ajouter autant d'abonnements et de services inclus que necessaire, avec toutes les fonctions avancees deja ouvertes."
      : "You can add as many subscriptions and included services as needed, with every advanced feature already unlocked.",
    freeUsageBody: (count: number) =>
      isFrench
        ? `Tu utilises ${count}/${FREE_PLAN_MAX_SUBSCRIPTIONS} abonnements disponibles sur le plan gratuit.`
        : `You are using ${count}/${FREE_PLAN_MAX_SUBSCRIPTIONS} subscriptions available on the free plan.`,
    freeRemainingBody: (remaining: number) =>
      isFrench
        ? `Encore ${remaining} emplacement(s) avant de devoir passer au Premium.`
        : `${remaining} slot(s) left before you need to upgrade to Premium.`,
    freeLimitReachedBody: isFrench
      ? "La limite du plan gratuit est atteinte. Le Premium debloque l'ajout illimite."
      : "The free plan limit has been reached. Premium unlocks unlimited additions.",
    includedServicesLimitBody: isFrench
      ? `Les services inclus restent limites a ${FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION} par abonnement en version gratuite.`
      : `Included services remain limited to ${FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION} per subscription on the free version.`,
    premiumLockBody: isFrench
      ? "Les rappels personnalises, la detection des doublons et la suppression des pubs sont reserves au Premium."
      : "Custom reminders, duplicate detection and ad removal are reserved for Premium.",
    discountedOfferBody: isFrench
      ? "Ton offre annuelle a -50% est deja reservee. Une fois le Premium active avec elle, ce tarif reste valable tant que ton Premium reste actif."
      : "Your yearly -50% offer is already reserved. Once Premium is activated with it, that price stays valid as long as Premium remains active.",
    premiumBenefitsOpen: isFrench
      ? "Les statistiques avancees, le calendrier des prelevements, les rappels personnalises et l'experience sans pub sont disponibles."
      : "Advanced statistics, the billing calendar, custom reminders and the ad-free experience are available.",
    downgradeScheduledBody: (dateLabel: string | null) =>
      isFrench
        ? `Ton retour au gratuit est deja programme. Tu gardes Premium jusqu'au ${dateLabel}.`
        : `Your switch back to free is already scheduled. You keep Premium until ${dateLabel}.`,
    discountedPremiumBody: isFrench
      ? "Ton tarif annuel a -50% reste conserve tant que ton Premium reste actif."
      : "Your yearly -50% price stays preserved as long as Premium remains active.",
    premiumBillingTitle: isFrench ? "Facturation Premium" : "Premium billing",
    premiumBillingScheduledBody: isFrench
      ? "Ton retour au gratuit est programme. Tu conserves l'acces Premium jusqu'a la fin de la periode deja payee."
      : "Your switch back to free is scheduled. You keep Premium access until the end of the already paid period.",
    premiumBillingNextBody: isFrench
      ? "Retrouve ici la prochaine echeance de ton abonnement Premium."
      : "See the next due date of your Premium subscription here.",
    premiumBillingSyncBody: isFrench
      ? "Les informations de facturation Premium se synchronisent avec ton abonnement Subly Premium."
      : "Premium billing information syncs with your Subly Premium subscription.",
    planLabel: isFrench ? "Formule" : "Plan",
    cycleAmount: isFrench ? "Montant du cycle" : "Cycle amount",
    nextCharge: isFrench ? "Prochain prelevement" : "Next charge",
    accessUntil: isFrench ? "Acces jusqu'au" : "Access until",
    chargeDate: isFrench ? "Date du prelevement" : "Charge date",
    noFurtherChargeBody: isFrench
      ? "Aucun nouveau prelevement n'est programme. Le compte repassera automatiquement au plan gratuit a la fin de cette periode."
      : "No new charge is scheduled. The account will automatically return to the free plan at the end of this period.",
    nextChargeBody: (dateLabel: string | null, priceLabel: string | null) =>
      isFrench
        ? `Prochaine echeance prevue le ${dateLabel} pour ${priceLabel}.`
        : `Next due date is scheduled for ${dateLabel} for ${priceLabel}.`,
    downgradeScheduledBadge: isFrench
      ? "Retour au gratuit programme"
      : "Return to free scheduled",
    scheduling: isFrench ? "Programmation..." : "Scheduling...",
    downgradeAtPeriodEnd: isFrench
      ? "Repasser au gratuit en fin de periode"
      : "Return to free at period end",
    premiumPitch: isFrench
      ? "Debloque les statistiques avancees, le calendrier des prelevements, la detection des abonnements peu utiles et des doublons, les rappels personnalises, l'export PDF des abonnements et une experience sans pub. La synchronisation cloud et la sauvegarde automatique sont deja prevues pour la suite."
      : "Unlock advanced statistics, the billing calendar, low-utility and duplicate detection, custom reminders, subscription PDF export and an ad-free experience. Cloud sync and automatic backup are already planned next.",
    yearlyOfferHint: isFrench
      ? "L'offre annuelle a -50% est disponible sur ton compte et reste ensuite conservee tant que ton Premium reste actif."
      : "The yearly -50% offer is available on your account and then stays preserved as long as Premium remains active.",
    monthlyPriceLabel: isFrench ? PREMIUM_MONTHLY_PRICE : "EUR 2.99 / month",
    yearlyPriceLabel: isFrench ? PREMIUM_YEARLY_PRICE : "EUR 19.99 / year",
    yearlyDiscountedPriceLabel: isFrench
      ? PREMIUM_YEARLY_LIFETIME_OFFER_PRICE
      : "EUR 9.99 / year",
    upgradeEyebrow: isFrench ? "Passer a Premium" : "Upgrade to Premium",
    or: isFrench ? "ou" : "or",
    discountedSheetBody: isFrench
      ? "Ton compte dispose actuellement du tarif annuel a -50%. Une fois active avec cette offre, la remise reste liee a ton Premium tant qu'il reste actif."
      : "Your account currently has access to the yearly -50% price. Once activated with this offer, the discount stays tied to your Premium while it remains active.",
    upcomingInAppBillingBody: isFrench
      ? "La facturation in-app sera branchee sur cet ecran dans une prochaine iteration. Les verrous produit sont deja poses dans l'app pour les stats avancees, les rappels personnalises et les cartes sponsorisees."
      : "In-app billing will be connected on this screen in a future iteration. Product gates are already in place in the app for advanced stats, custom reminders and sponsored cards.",
    soonLabel: isFrench ? "Bientot" : "Soon",
    comparisonTitle: isFrench ? "Comparatif des avantages" : "Benefits comparison",
    comparisonBodyText: isFrench
      ? "Ce tableau distingue ce qui est deja actif dans le produit de ce qui est annonce pour la suite Premium."
      : "This table separates what is already active in the product from what is announced for the Premium roadmap.",
    freePlanLabel: isFrench ? "Gratuit" : "Free",
    premiumPlanLabel: "Premium"
  };

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
          copy.premiumActiveTitle,
          copy.premiumYearlyBody
        );
        return;
      }

      await activatePremiumMembership("monthly");
      setPremiumModalVisible(false);
      Alert.alert(copy.premiumActiveTitle, copy.premiumMonthlyBody);
    } catch (error) {
      Alert.alert(
        copy.activationFailed,
        error instanceof Error ? error.message : copy.activateLater
      );
    }
  };

  const handleSchedulePremiumDowngrade = () => {
    if (!premiumSubscription) {
      Alert.alert(copy.premiumMissingTitle, copy.premiumMissingBody);
      return;
    }

    Alert.alert(
      copy.downgradeTitle,
      isFrench
        ? `Ton Premium restera actif jusqu'au ${premiumAccessEndsLabel}. Aucun nouveau prelevement ne sera programme apres cette date.`
        : `Your Premium will stay active until ${premiumAccessEndsLabel}. No new charge will be scheduled after that date.`,
      [
        {
          text: copy.keepPremium,
          style: "cancel"
        },
        {
          text: copy.confirm,
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await schedulePremiumDowngrade();
                Alert.alert(
                  copy.downgradeScheduledTitle,
                  isFrench
                    ? `Ton compte restera Premium jusqu'au ${premiumAccessEndsLabel}, puis repassera automatiquement sur la formule gratuite.`
                    : `Your account will stay Premium until ${premiumAccessEndsLabel}, then automatically return to the free plan.`
                );
              } catch (error) {
                Alert.alert(
                  copy.downgradeFailedTitle,
                  error instanceof Error
                    ? error.message
                    : copy.downgradeFailedBody
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
        title={copy.title}
        subtitle={copy.subtitle}
        action={<PrimaryButton title={copy.back} onPress={navigation.goBack} variant="secondary" />}
      >
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>{displayName.slice(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{profile?.email ?? session?.email ?? "sarah@subly.app"}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {isPremium ? copy.premiumBadge : copy.freeBadge}
            </Text>
          </View>
          <Text style={styles.meta}>{copy.currency} : {profile?.currency ?? "EUR"}</Text>
          <Text style={styles.meta}>
            {copy.activeSubscriptions} : {activeSubscriptionCount}
          </Text>
        </View>

        <View style={styles.usageCard}>
          <Text style={styles.usageTitle}>
            {isPremium ? copy.capacityOpen : copy.freeProgress}
          </Text>
          <Text style={styles.usageBody}>
            {isPremium
              ? copy.premiumUsageBody
              : copy.freeUsageBody(activeSubscriptionCount)}
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
                  ? copy.freeRemainingBody(remainingFreeSlots)
                  : copy.freeLimitReachedBody}
              </Text>
              <Text style={styles.usageHint}>{copy.includedServicesLimitBody}</Text>
              <Text style={styles.usageHint}>{copy.premiumLockBody}</Text>
              {hasDiscountedYearlyPrice ? (
                <Text style={styles.usageHintStrong}>{copy.discountedOfferBody}</Text>
              ) : null}
            </>
          ) : (
            <>
              <Text style={styles.usageHint}>{copy.premiumBenefitsOpen}</Text>
              {premiumSubscription?.cancelAtPeriodEnd ? (
                <Text style={styles.usageHintStrong}>
                  {copy.downgradeScheduledBody(premiumAccessEndsLabel)}
                </Text>
              ) : null}
              {userExperience.discountedPremiumActive ? (
                <Text style={styles.usageHintStrong}>{copy.discountedPremiumBody}</Text>
              ) : null}
            </>
          )}
        </View>

        {isPremium ? (
          <View style={styles.billingCard}>
            <Text style={styles.billingTitle}>{copy.premiumBillingTitle}</Text>
            <Text style={styles.billingBody}>
              {premiumSubscription
                ? premiumSubscription.cancelAtPeriodEnd
                  ? copy.premiumBillingScheduledBody
                  : copy.premiumBillingNextBody
                : copy.premiumBillingSyncBody}
            </Text>

            {premiumSubscription ? (
              <>
                <View style={[styles.billingGrid, isCompact ? styles.billingGridCompact : null]}>
                  <View style={styles.billingMetric}>
                    <Text style={styles.billingMetricLabel}>{copy.planLabel}</Text>
                    <Text style={styles.billingMetricValue}>{premiumPlanLabel}</Text>
                  </View>
                  <View style={styles.billingMetric}>
                    <Text style={styles.billingMetricLabel}>
                      {premiumSubscription.cancelAtPeriodEnd
                        ? copy.cycleAmount
                        : copy.nextCharge}
                    </Text>
                    <Text style={styles.billingMetricValue}>{premiumPriceLabel}</Text>
                  </View>
                  <View style={styles.billingMetric}>
                    <Text style={styles.billingMetricLabel}>
                      {premiumSubscription.cancelAtPeriodEnd
                        ? copy.accessUntil
                        : copy.chargeDate}
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
                    ? copy.noFurtherChargeBody
                    : copy.nextChargeBody(premiumNextBillingLabel, premiumPriceLabel)}
                </Text>

                {premiumSubscription.cancelAtPeriodEnd ? (
                  <View style={styles.billingScheduledBadge}>
                    <Text style={styles.billingScheduledBadgeLabel}>
                      {copy.downgradeScheduledBadge}
                    </Text>
                  </View>
                ) : (
                  <PrimaryButton
                    title={
                      isSchedulingPremiumDowngrade
                        ? copy.scheduling
                        : copy.downgradeAtPeriodEnd
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
            {isPremium ? copy.premiumSpace : copy.goPremium}
          </Text>
          <Text style={styles.premiumBody}>{copy.premiumPitch}</Text>
          {hasDiscountedYearlyPrice ? (
            <Text style={styles.premiumOfferHint}>{copy.yearlyOfferHint}</Text>
          ) : null}
          <PrimaryButton
            title={isPremium ? copy.comparePlans : copy.switchToPremium}
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
                <Text style={styles.sheetEyebrow}>{copy.upgradeEyebrow}</Text>
                <Text style={styles.sheetTitle}>{copy.monthlyPriceLabel}</Text>
                <Text style={styles.sheetOr}>{copy.or}</Text>
                <Text style={styles.sheetTitleSecondary}>
                  {hasDiscountedYearlyPrice
                    ? copy.yearlyDiscountedPriceLabel
                    : copy.yearlyPriceLabel}
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
                ? copy.discountedSheetBody
                : copy.upcomingInAppBillingBody}
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.offerList}
            >
              {offerPlans.map((offer) => {
                const isCurrentOffer = activeOfferId === offer.id;

                return (
                  <View
                    key={offer.id}
                    style={[
                      styles.offerCard,
                      offer.tone === "orange" ? styles.offerCardOrange : null,
                      offer.tone === "purple" ? styles.offerCardPurple : null,
                      isCurrentOffer ? styles.offerCardCurrent : null
                    ]}
                  >
                    <View style={styles.offerHeader}>
                      <View style={styles.offerIdentity}>
                        <Text style={styles.offerTitle}>{offer.title}</Text>
                        <Text style={styles.offerPrice}>{offer.price}</Text>
                        <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
                      </View>
                      <View style={styles.offerHeaderAside}>
                        {isCurrentOffer ? (
                          <View style={styles.offerCurrentBadge}>
                            <Text style={styles.offerCurrentBadgeLabel}>{copy.currentPlan}</Text>
                          </View>
                        ) : null}
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
                    </View>

                    <View style={styles.featureList}>
                      {offer.features.map((feature, index) => (
                        <View key={`${offer.id}_${feature.label}_${index}`} style={styles.featureRow}>
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
                              <Text style={styles.featureStatusLabel}>{copy.soonLabel}</Text>
                            </View>
                          ) : null}
                        </View>
                      ))}
                    </View>

                    <PrimaryButton
                      title={isCurrentOffer ? copy.alreadyActive : offer.cta}
                      onPress={() => void handleSelectOffer(offer)}
                      variant={offer.id === "free" || isCurrentOffer ? "secondary" : "primary"}
                      disabled={isCurrentOffer || (offer.id !== "free" && isActivatingPremium)}
                    />
                  </View>
                );
              })}

              <View style={styles.comparisonSection}>
                <Text style={styles.comparisonTitle}>{copy.comparisonTitle}</Text>
                <Text style={styles.comparisonBody}>{copy.comparisonBodyText}</Text>

                <View style={styles.comparisonList}>
                  {comparisonRows.map((row) => (
                    <View key={row.id} style={styles.comparisonRow}>
                      <View style={styles.comparisonText}>
                        <Text style={styles.comparisonRowTitle}>{row.title}</Text>
                        <Text style={styles.comparisonRowDescription}>{row.description}</Text>
                      </View>
                      <View style={[styles.comparisonValues, isCompact ? styles.comparisonValuesCompact : null]}>
                        <View style={styles.planValue}>
                          <Text style={styles.planValueLabel}>{copy.freePlanLabel}</Text>
                          <Text style={styles.planValueText}>{row.freeValue}</Text>
                        </View>
                        <View style={[styles.planValue, styles.planValuePremium]}>
                          <Text style={styles.planValueLabel}>{copy.premiumPlanLabel}</Text>
                          <Text style={styles.planValueText}>{row.premiumValue}</Text>
                          {row.premiumState === "coming_soon" ? (
                            <View style={styles.planValueBadge}>
                              <Text style={styles.planValueBadgeLabel}>{copy.soonLabel}</Text>
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
  offerCardCurrent: {
    borderColor: theme.colors.primaryStrong,
    backgroundColor: theme.colors.surfaceContrast,
    ...shadows.glow
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
  offerHeaderAside: {
    alignItems: "flex-end",
    gap: spacing.xs
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
  offerCurrentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.primaryStrong
  },
  offerCurrentBadgeLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#241602"
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
