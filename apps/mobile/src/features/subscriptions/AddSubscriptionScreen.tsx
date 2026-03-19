import { useEffect, useMemo, useRef, useState, type Ref } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from "react-native";
import {
  BillingFrequency,
  FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION,
  PREMIUM_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION,
  findServicePlanPresetByPresetId,
  findServicePlanPresetByProvider,
  findServicePresetByProvider,
  normalizeCatalogKey,
  POPULAR_SERVICE_PRESETS,
  PREDEFINED_CATEGORY_PRESETS,
  SERVICE_CATEGORY_ORDER,
  ServicePreset,
  type SubscriptionLogoMode
} from "@subly/shared";

import { DateField } from "../../components/DateField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { PromoCard } from "../../components/PromoCard";
import { ServiceLogo } from "../../components/ServiceLogo";
import { isPremiumPlan } from "../../constants/premium";
import { useAppTranslation } from "../../i18n";
import { useAppNavigation, useCurrentOverlayRoute } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { AppTheme, radius, shadows, spacing, useAppTheme } from "../../theme";
import {
  buildCategoryId,
  formatCurrency,
  formatReminderDays,
  toDateInputValue,
  toIsoDate
} from "../../utils/format";

type ComposerStep = "service" | "billing" | "options";

const DEFAULT_REMINDER_DAYS = "3";
const SCROLL_TO_TOP_VISIBILITY_OFFSET = 260;

function buildFrequencyOptions(isFrench: boolean): Array<{ label: string; value: BillingFrequency }> {
  return [
    { label: isFrench ? "Hebdo" : "Weekly", value: "weekly" },
    { label: isFrench ? "Mensuel" : "Monthly", value: "monthly" },
    { label: isFrench ? "Trimestriel" : "Quarterly", value: "quarterly" },
    { label: isFrench ? "Annuel" : "Yearly", value: "yearly" }
  ];
}

function buildTrialOptions(isFrench: boolean) {
  return [
    { label: isFrench ? "Non" : "No", value: "inactive" },
    { label: isFrench ? "Oui" : "Yes", value: "active" }
  ] as const;
}

function buildLogoModeOptions(isFrench: boolean): Array<{
  label: string;
  value: SubscriptionLogoMode;
  description: string;
}> {
  return [
    {
      label: isFrench ? "Logo de l'offre" : "Plan logo",
      value: "option",
      description: isFrench
        ? "Affiche le visuel propre a la formule choisie."
        : "Shows the visual specific to the selected plan."
    },
    {
      label: isFrench ? "Logo de base" : "Base logo",
      value: "base",
      description: isFrench
        ? "Affiche le logo principal du service, peu importe la formule."
        : "Shows the main service logo regardless of the selected plan."
    }
  ];
}

function buildComposerSteps(isFrench: boolean): Array<{ id: ComposerStep; label: string; eyebrow: string }> {
  return [
    { id: "service", label: isFrench ? "Service" : "Service", eyebrow: "1" },
    { id: "billing", label: isFrench ? "Facturation" : "Billing", eyebrow: "2" },
    { id: "options", label: isFrench ? "Options" : "Options", eyebrow: "3" }
  ];
}

export function AddSubscriptionScreen(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const isTablet = width >= 768;
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { locale } = useAppTranslation();
  const isFrench = locale === "fr";
  const navigation = useAppNavigation();
  const route = useCurrentOverlayRoute();
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const profile = useWorkspaceStore((state) => state.profile);
  const saveSubscription = useWorkspaceStore((state) => state.saveSubscription);
  const isSaving = useWorkspaceStore((state) => state.isSavingSubscription);
  const subscriptionId =
    route?.name === "AddSubscription" ? route.params?.subscriptionId : undefined;
  const existingSubscription = useMemo(
    () => subscriptions.find((item) => item.id === subscriptionId),
    [subscriptionId, subscriptions]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isComposerVisible, setComposerVisible] = useState(false);
  const [composerStep, setComposerStep] = useState<ComposerStep>("service");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [providerName, setProviderName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Streaming");
  const [frequency, setFrequency] = useState<BillingFrequency>("monthly");
  const [nextBillingDate, setNextBillingDate] = useState(getSuggestedDate("monthly"));
  const [reminderDaysBefore, setReminderDaysBefore] = useState(DEFAULT_REMINDER_DAYS);
  const [hasFreeTrial, setHasFreeTrial] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState("");
  const [includedProviderNames, setIncludedProviderNames] = useState<string[]>([]);
  const [includedServiceQuery, setIncludedServiceQuery] = useState("");
  const [logoMode, setLogoMode] = useState<SubscriptionLogoMode>("option");
  const [notes, setNotes] = useState("");
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const catalogScrollRef = useRef<ScrollView | null>(null);
  const priceInputRef = useRef<TextInput | null>(null);

  const isEditing =
    route?.name === "AddSubscription" && Boolean(route.params?.subscriptionId);
  const accountDefaultReminderDays = String(
    profile?.notificationPreferences?.defaultReminderDaysBefore ?? Number(DEFAULT_REMINDER_DAYS)
  );
  const isPremium = isPremiumPlan(profile);
  const frequencyOptions = useMemo(() => buildFrequencyOptions(isFrench), [isFrench]);
  const trialOptions = useMemo(() => buildTrialOptions(isFrench), [isFrench]);
  const logoModeOptions = useMemo(() => buildLogoModeOptions(isFrench), [isFrench]);
  const composerSteps = useMemo(() => buildComposerSteps(isFrench), [isFrench]);
  const copy = useMemo(
    () => ({
      all: isFrench ? "Tous" : "All",
      limitReachedTitle: isFrench ? "Limite atteinte" : "Limit reached",
      limitReachedBody: (limit: number) =>
        isFrench
          ? `Le plan gratuit permet jusqu'a ${limit} services inclus par abonnement. Passe au Premium pour en ajouter autant que tu veux.`
          : `The free plan allows up to ${limit} included services per subscription. Upgrade to Premium to add as many as you want.`,
      missingInfoTitle: isFrench ? "Informations manquantes" : "Missing information",
      missingInfoBody: isFrench
        ? "Choisis d'abord le service et la categorie a suivre."
        : "Choose the service and category to track first.",
      invalidPriceTitle: isFrench ? "Prix invalide" : "Invalid price",
      invalidPriceBody: isFrench
        ? "Entre un montant superieur a zero."
        : "Enter an amount greater than zero.",
      missingDateTitle: isFrench ? "Date manquante" : "Missing date",
      missingDateBody: isFrench
        ? "Ajoute la prochaine date de facturation."
        : "Add the next billing date.",
      invalidDateTitle: isFrench ? "Date invalide" : "Invalid date",
      invalidDateBody: isFrench
        ? "Utilise le format europeen JJ/MM/AAAA."
        : "Use the European DD/MM/YYYY format.",
      invalidReminderTitle: isFrench ? "Rappel invalide" : "Invalid reminder",
      invalidReminderBody: isFrench
        ? "Le nombre de jours doit etre positif."
        : "The number of days must be positive.",
      incompleteTrialTitle: isFrench ? "Essai gratuit incomplet" : "Incomplete free trial",
      incompleteTrialBody: isFrench
        ? "Indique la date de fin de l'essai gratuit."
        : "Enter the free trial end date.",
      invalidTrialDateTitle: isFrench ? "Date d'essai invalide" : "Invalid trial date",
      incompleteFieldsTitle: isFrench ? "Champs incomplets" : "Incomplete fields",
      incompleteFieldsBody: isFrench
        ? "Renseigne le service, la categorie et la date."
        : "Fill in the service, category and date.",
      tooManyIncludedTitle: isFrench ? "Trop de services inclus" : "Too many included services",
      tooManyIncludedBody: (limit: number) =>
        isFrench
          ? `Le plan gratuit permet jusqu'a ${limit} services inclus par abonnement. Passe au Premium pour supprimer cette limite.`
          : `The free plan allows up to ${limit} included services per subscription. Upgrade to Premium to remove this limit.`,
      inconsistentDatesTitle: isFrench ? "Dates incoherentes" : "Inconsistent dates",
      inconsistentDatesBody: isFrench
        ? "Le premier paiement doit etre le meme jour ou apres la fin de l'essai gratuit."
        : "The first payment must happen on or after the free trial ends.",
      verifyDatesBody: isFrench ? "Verifie les dates saisies." : "Check the entered dates.",
      updatedTitle: isFrench ? "Abonnement mis a jour" : "Subscription updated",
      addedTitle: isFrench ? "Abonnement ajoute" : "Subscription added",
      updatedBody: isFrench
        ? "Les modifications ont bien ete enregistrees."
        : "Your changes have been saved.",
      addedBody: isFrench
        ? "Le nouvel abonnement a ete ajoute a ton espace Subly."
        : "The new subscription was added to your Subly space.",
      saveFailedTitle: isFrench ? "Enregistrement impossible" : "Unable to save",
      saveFailedBody: isFrench ? "Merci de reessayer." : "Please try again.",
      editTitle: isFrench ? "Modifier un abonnement" : "Edit a subscription",
      addTitle: isFrench ? "Ajouter un abonnement" : "Add a subscription",
      searchPlaceholder: isFrench
        ? "Streaming, musique, jeux et plus encore..."
        : "Streaming, music, gaming and more...",
      helperTitle: isFrench ? "Catalogue Subly" : "Subly catalog",
      helperBody: (reminderLabel: string) =>
        isFrench
          ? `Choisis un service pour ouvrir une creation guidee en trois etapes. Le rappel par defaut de ton compte est actuellement regle sur ${reminderLabel.toLowerCase()}.`
          : `Choose a service to open a guided three-step setup. Your account default reminder is currently set to ${reminderLabel.toLowerCase()}.`,
      emptyTitle: isFrench ? "Aucun service trouve" : "No service found",
      emptyBody: isFrench
        ? "Essaie une autre recherche ou cree directement un abonnement personnalise."
        : "Try another search or create a custom subscription directly.",
      customCardTitle: isFrench ? "Abonnement personnalise" : "Custom subscription",
      customCardBody: isFrench
        ? "Tu ne trouves pas ton service ? Cree une fiche libre avec le nom et la categorie de ton choix."
        : "Can't find your service? Create a custom record with the name and category you want.",
      customSheetTitle: isFrench ? "Abonnement personnalise" : "Custom subscription",
      freeService: isFrench ? "Service libre" : "Free-form service",
      selectedServiceHint: isFrench ? "Service preselectionne" : "Preselected service",
      selectedServiceBody: (suggestedPrice: number) =>
        isFrench
          ? `Prix laisse vide volontairement. Tarif indicatif : ${formatCurrency(suggestedPrice, profile?.currency ?? "EUR")}.`
          : `Price intentionally left empty. Suggested price: ${formatCurrency(suggestedPrice, profile?.currency ?? "EUR")}.`,
      customModeTitle: isFrench ? "Mode personnalise" : "Custom mode",
      customModeBody: isFrench
        ? "Tu peux creer un abonnement qui n'est pas dans le catalogue."
        : "You can create a subscription that is not in the catalog.",
      stepDone: isFrench ? "OK" : "Done",
      step1Title: isFrench ? "Etape 1" : "Step 1",
      step1Body: isFrench
        ? "Choisis le service suivi, la formule si besoin, puis la categorie qui alimentera les listes et les statistiques."
        : "Choose the tracked service, the plan if needed, then the category used in lists and statistics.",
      step2Title: isFrench ? "Etape 2" : "Step 2",
      step2Body: isFrench
        ? "Definis le prix, la frequence, la date cle et le rappel de paiement."
        : "Set the price, frequency, key date and payment reminder.",
      step3Title: isFrench ? "Etape 3" : "Step 3",
      step3Body: isFrench
        ? "Termine avec les services inclus et les notes qui aideront pour le suivi."
        : "Finish with included services and notes to help with tracking.",
      serviceName: isFrench ? "Nom du service" : "Service name",
      displayedLogo: isFrench ? "Logo affiche" : "Displayed logo",
      displayedLogoHint: (baseProviderName: string) =>
        isFrench
          ? `Choisis si tu veux garder le visuel de la formule selectionnee ou revenir au logo principal de ${baseProviderName}.`
          : `Choose whether to keep the selected plan visual or go back to the main logo for ${baseProviderName}.`,
      selected: isFrench ? "Selectionne" : "Selected",
      choose: isFrench ? "Choisir" : "Choose",
      quickCategories: isFrench ? "Categories rapides" : "Quick categories",
      chosenCategory: isFrench ? "Categorie choisie" : "Selected category",
      serviceLabel: isFrench ? "Service" : "Service",
      suggestedReminder: isFrench ? "Rappel conseille" : "Suggested reminder",
      price: isFrench ? "Prix" : "Price",
      category: isFrench ? "Categorie" : "Category",
      chosenOnPreviousStep: isFrench ? "Choisie a l'etape precedente" : "Chosen in the previous step",
      frequency: isFrench ? "Frequence" : "Frequency",
      freeTrial: isFrench ? "Essai gratuit" : "Free trial",
      freeTrialHint: isFrench
        ? "Active cette option si l'abonnement commence par une periode d'essai sans paiement."
        : "Enable this if the subscription starts with a free trial period.",
      trialEndsAt: isFrench ? "Fin de l'essai gratuit" : "Free trial ends",
      firstPaymentAfterTrial: isFrench ? "Premier paiement apres essai" : "First payment after trial",
      nextBillingDate: isFrench ? "Prochaine facturation" : "Next billing date",
      reminderDays: isFrench ? "Rappel (jours avant)" : "Reminder (days before)",
      sameDay: isFrench ? "Jour J" : "Same day",
      simpleReminder: isFrench ? "Rappel simple" : "Simple reminder",
      simpleReminderHint: isFrench
        ? "Le rappel personnalise par abonnement est reserve au Premium."
        : "Custom reminder timing per subscription is reserved for Premium.",
      premiumEyebrow: "Premium",
      premiumReminderTitle: isFrench ? "Rappels personnalises" : "Custom reminders",
      premiumReminderBody: isFrench
        ? "Choisis un delai de rappel pour chaque abonnement au lieu d'utiliser le rappel simple du compte."
        : "Choose a reminder delay for each subscription instead of using the account simple reminder.",
      premiumCta: isFrench ? "Voir le Premium" : "View Premium",
      amount: isFrench ? "Montant" : "Amount",
      toDefine: isFrench ? "A definir" : "To define",
      includedServices: isFrench ? "Services inclus" : "Included services",
      includedServicesHintUnlimited: isFrench
        ? "Associe ici autant de services que tu veux. Exemple : NordVPN ou Uber Eats inclus dans Revolut."
        : "Link as many services as you want here. Example: NordVPN or Uber Eats included in Revolut.",
      includedServicesHintFree: (limit: number) =>
        isFrench
          ? `Associe jusqu'a ${limit} services inclus sur le plan gratuit. Exemple : NordVPN ou Uber Eats inclus dans Revolut.`
          : `Link up to ${limit} included services on the free plan. Example: NordVPN or Uber Eats included in Revolut.`,
      includedServicesCountUnlimited: (count: number) =>
        isFrench
          ? `${count} service(s) inclus selectionne(s) - illimite avec Premium.`
          : `${count} included service(s) selected - unlimited with Premium.`,
      includedServicesCountFree: (count: number, limit: number) =>
        isFrench
          ? `${count}/${limit} service(s) inclus selectionne(s) sur ton plan gratuit.`
          : `${count}/${limit} included service(s) selected on your free plan.`,
      searchIncludedService: isFrench ? "Rechercher un service inclus" : "Search an included service",
      noIncludedService: isFrench
        ? "Aucun service inclus associe pour le moment."
        : "No included service linked yet.",
      add: isFrench ? "Ajouter" : "Add",
      noIncludedMatch: isFrench
        ? "Aucun service du catalogue ne correspond a cette recherche."
        : "No catalog service matches this search.",
      notes: isFrench ? "Notes" : "Notes",
      notesPlaceholder: isFrench
        ? "Ex: formule duo, usage perso, engagement annuel"
        : "Ex: duo plan, personal use, yearly commitment",
      servicePlaceholder: isFrench
        ? "Ex: Prime Video, Revolut, Apple One"
        : "Ex: Prime Video, Revolut, Apple One",
      datePlaceholder: "25/03/2026",
      includedSearchPlaceholder: isFrench ? "Rechercher un service inclus" : "Search an included service",
      back: isFrench ? "Retour" : "Back",
      continue: isFrench ? "Continuer" : "Continue",
      saving: isFrench ? "Enregistrement..." : "Saving...",
      saveSubscription: isFrench ? "Enregistrer l'abonnement" : "Save subscription"
    }),
    [isFrench, profile?.currency]
  );

  const selectedPreset = useMemo(() => {
    if (selectedPresetId) {
      return POPULAR_SERVICE_PRESETS.find((item) => item.id === selectedPresetId) ?? null;
    }

    if (!providerName.trim()) {
      return null;
    }

    return findServicePresetByProvider(providerName) ?? null;
  }, [providerName, selectedPresetId]);

  const selectedServicePlanPreset = useMemo(() => {
    if (selectedPreset?.id) {
      return (
        findServicePlanPresetByPresetId(selectedPreset.id) ??
        findServicePlanPresetByProvider(providerName) ??
        null
      );
    }

    if (!providerName.trim()) {
      return null;
    }

    return findServicePlanPresetByProvider(providerName) ?? null;
  }, [providerName, selectedPreset]);

  const specialPresetSections = useMemo(() => {
    if (!selectedServicePlanPreset) {
      return [];
    }

    if (!selectedServicePlanPreset.groups?.length) {
      return [
        {
          id: "default",
          title: null,
          description: undefined,
          options: selectedServicePlanPreset.options
        }
      ];
    }

    return selectedServicePlanPreset.groups
      .map((group) => ({
        id: group.id,
        title: group.title,
        description: group.description,
        options: selectedServicePlanPreset.options.filter(
          (option) => option.groupId === group.id
        )
      }))
      .filter((section) => section.options.length > 0);
  }, [selectedServicePlanPreset]);
  const resolvedLogoMode = selectedServicePlanPreset ? logoMode : "option";

  const filterOptions = useMemo(() => {
    const availableSlugs = new Set(POPULAR_SERVICE_PRESETS.map((preset) => preset.categorySlug));

    return [
      { id: "all", label: copy.all },
      ...PREDEFINED_CATEGORY_PRESETS.filter((preset) => availableSlugs.has(preset.slug)).map(
        (preset) => ({
          id: preset.slug,
          label: preset.name
        })
      )
    ];
  }, [copy.all]);

  const includedServiceDirectory = useMemo(() => {
    const seen = new Set<string>();
    const providerNames = [
      ...subscriptions.map((subscription) => subscription.providerName),
      ...POPULAR_SERVICE_PRESETS.map((preset) => preset.providerName)
    ];

    return providerNames
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .filter((value) => {
        const normalized = normalizeCatalogKey(value);

        if (!normalized || seen.has(normalized)) {
          return false;
        }

        seen.add(normalized);
        return true;
      })
      .sort((left, right) => left.localeCompare(right, "fr", { sensitivity: "base" }));
  }, [subscriptions]);

  const includedServiceSuggestions = useMemo(() => {
    const selectedKeys = new Set(includedProviderNames.map((value) => normalizeCatalogKey(value)));
    const currentProviderKey = normalizeCatalogKey(providerName);
    const normalizedQuery = normalizeCatalogKey(includedServiceQuery);

    const candidates = includedServiceDirectory.filter((candidate) => {
      const normalizedCandidate = normalizeCatalogKey(candidate);

      if (!normalizedCandidate || normalizedCandidate === currentProviderKey) {
        return false;
      }

      if (selectedKeys.has(normalizedCandidate)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return normalizedCandidate.includes(normalizedQuery);
    });

    return candidates.slice(0, normalizedQuery ? 8 : 6);
  }, [includedProviderNames, includedServiceDirectory, includedServiceQuery, providerName]);

  const includedServiceLimit =
    isPremium
      ? PREMIUM_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION
      : FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION;
  const hasUnlimitedIncludedServices = !Number.isFinite(includedServiceLimit);

  const filteredSections = useMemo(() => {
    const normalizedQuery = normalizeCatalogKey(searchQuery);
    const matchingPresets = POPULAR_SERVICE_PRESETS.filter((preset) => {
      const matchesFilter =
        selectedFilter === "all" || preset.categorySlug === selectedFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystacks = [
        preset.providerName,
        preset.categoryName,
        ...(preset.searchKeywords ?? [])
      ];

      return haystacks.some((value) =>
        normalizeCatalogKey(value).includes(normalizedQuery)
      );
    });

    return SERVICE_CATEGORY_ORDER.map((slug) => {
      const categoryPreset = PREDEFINED_CATEGORY_PRESETS.find((item) => item.slug === slug);
      return {
        slug,
        title: categoryPreset?.name ?? slug,
        items: matchingPresets.filter((preset) => preset.categorySlug === slug)
      };
    }).filter((section) => section.items.length > 0);
  }, [searchQuery, selectedFilter]);

  useEffect(() => {
    if (!existingSubscription) {
      return;
    }

    setComposerStep("service");
    const preset = findServicePresetByProvider(existingSubscription.providerName);
    setSelectedPresetId(preset?.id ?? null);
    setProviderName(existingSubscription.providerName);
    setPrice(String(existingSubscription.price).replace(".", ","));
    setCategory(existingSubscription.categoryName);
    setFrequency(existingSubscription.billingFrequency);
    setNextBillingDate(toDateInputValue(existingSubscription.nextBillingDate));
    setReminderDaysBefore(String(existingSubscription.reminderDaysBefore));
    setHasFreeTrial(Boolean(existingSubscription.trialEndsAt));
    setTrialEndsAt(
      existingSubscription.trialEndsAt
        ? toDateInputValue(existingSubscription.trialEndsAt)
        : ""
    );
    setIncludedProviderNames(existingSubscription.includedProviderNames ?? []);
    setIncludedServiceQuery("");
    setLogoMode(existingSubscription.logoMode ?? "option");
    setNotes(existingSubscription.notes ?? "");
    setSelectedFilter(preset?.categorySlug ?? "all");
    setComposerVisible(true);
  }, [existingSubscription]);

  useEffect(() => {
    const currentProviderKey = normalizeCatalogKey(providerName);

    setIncludedProviderNames((current) =>
      current.filter((value) => normalizeCatalogKey(value) !== currentProviderKey)
    );
  }, [providerName]);

  useEffect(() => {
    if (!isComposerVisible || composerStep !== "billing") {
      return;
    }

    const focusTimeout = setTimeout(() => {
      priceInputRef.current?.focus();
    }, 180);

    return () => clearTimeout(focusTimeout);
  }, [composerStep, isComposerVisible]);

  const handleCatalogScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const shouldShowButton =
      event.nativeEvent.contentOffset.y > SCROLL_TO_TOP_VISIBILITY_OFFSET;

    setShowScrollTopButton((current) =>
      current === shouldShowButton ? current : shouldShowButton
    );
  };

  const scrollCatalogToTop = () => {
    catalogScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const openPresetComposer = (preset: ServicePreset) => {
    const servicePlanPreset = findServicePlanPresetByPresetId(preset.id);

    setComposerStep("service");
    setSelectedPresetId(preset.id);
    setProviderName(servicePlanPreset?.options[0]?.providerName ?? preset.providerName);
    setPrice("");
    setCategory(preset.categoryName);
    setFrequency(preset.billingFrequency);
    setNextBillingDate(getSuggestedDate(preset.billingFrequency));
    setReminderDaysBefore(accountDefaultReminderDays);
    setHasFreeTrial(false);
    setTrialEndsAt("");
    setIncludedProviderNames([]);
    setIncludedServiceQuery("");
    setLogoMode("option");
    setNotes("");
    setComposerVisible(true);
  };

  const openCustomComposer = () => {
    const activeCategory =
      PREDEFINED_CATEGORY_PRESETS.find((preset) => preset.slug === selectedFilter)?.name ??
      "Streaming";

    setComposerStep("service");
    setSelectedPresetId(null);
    setProviderName("");
    setPrice("");
    setCategory(activeCategory);
    setFrequency("monthly");
    setNextBillingDate(getSuggestedDate("monthly"));
    setReminderDaysBefore(accountDefaultReminderDays);
    setHasFreeTrial(false);
    setTrialEndsAt("");
    setIncludedProviderNames([]);
    setIncludedServiceQuery("");
    setLogoMode("option");
    setNotes("");
    setComposerVisible(true);
  };

  const dismissComposer = () => {
    if (isEditing) {
      navigation.goBack();
      return;
    }

    setComposerStep("service");
    setComposerVisible(false);
  };

  const addIncludedProvider = (nextProviderName: string) => {
    const normalizedNext = normalizeCatalogKey(nextProviderName);

    if (!normalizedNext || normalizedNext === normalizeCatalogKey(providerName)) {
      return;
    }

    if (includedProviderNames.length >= includedServiceLimit) {
      Alert.alert(
        copy.limitReachedTitle,
        copy.limitReachedBody(FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION)
      );
      return;
    }

    setIncludedProviderNames((current) => {
      if (current.some((value) => normalizeCatalogKey(value) === normalizedNext)) {
        return current;
      }

      return [...current, nextProviderName];
    });
    setIncludedServiceQuery("");
  };

  const removeIncludedProvider = (providerNameToRemove: string) => {
    const normalizedTarget = normalizeCatalogKey(providerNameToRemove);

    setIncludedProviderNames((current) =>
      current.filter((value) => normalizeCatalogKey(value) !== normalizedTarget)
    );
  };

  const validateServiceStep = () => {
    if (!providerName.trim() || !category.trim()) {
      Alert.alert(copy.missingInfoTitle, copy.missingInfoBody);
      return false;
    }

    return true;
  };

  const validateBillingStep = () => {
    const parsedPrice = Number(price.replace(",", "."));
    const parsedReminderDays = isPremium
      ? Number(reminderDaysBefore)
      : Number(accountDefaultReminderDays);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert(copy.invalidPriceTitle, copy.invalidPriceBody);
      return false;
    }

    if (!nextBillingDate.trim()) {
      Alert.alert(copy.missingDateTitle, copy.missingDateBody);
      return false;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(nextBillingDate.trim())) {
      Alert.alert(copy.invalidDateTitle, copy.invalidDateBody);
      return false;
    }

    if (!Number.isFinite(parsedReminderDays) || parsedReminderDays < 0) {
      Alert.alert(copy.invalidReminderTitle, copy.invalidReminderBody);
      return false;
    }

    if (hasFreeTrial && !trialEndsAt.trim()) {
      Alert.alert(copy.incompleteTrialTitle, copy.incompleteTrialBody);
      return false;
    }

    if (hasFreeTrial && !/^\d{2}\/\d{2}\/\d{4}$/.test(trialEndsAt.trim())) {
      Alert.alert(copy.invalidTrialDateTitle, copy.invalidDateBody);
      return false;
    }

    return true;
  };

  const goToComposerStep = (nextStep: ComposerStep) => {
    if (nextStep === composerStep) {
      return;
    }

    const currentIndex = composerSteps.findIndex((step) => step.id === composerStep);
    const nextIndex = composerSteps.findIndex((step) => step.id === nextStep);

    if (nextIndex < currentIndex) {
      setComposerStep(nextStep);
      return;
    }

    if (currentIndex === 0 && !validateServiceStep()) {
      return;
    }

    if (nextIndex >= 2 && !validateBillingStep()) {
      return;
    }

    setComposerStep(nextStep);
  };

  const handleNextComposerStep = () => {
    if (composerStep === "service") {
      if (!validateServiceStep()) {
        return;
      }

      setComposerStep("billing");
      return;
    }

    if (composerStep === "billing") {
      if (!validateBillingStep()) {
        return;
      }

      setComposerStep("options");
    }
  };

  const handleSave = async () => {
    const parsedPrice = Number(price.replace(",", "."));
    const parsedReminderDays = isPremium
      ? Number(reminderDaysBefore)
      : Number(accountDefaultReminderDays);
    const trimmedTrialEndDate = trialEndsAt.trim();
    let nextBillingIso: string;
    let trialEndIso: string | null = null;

    if (!providerName.trim() || !category.trim() || !nextBillingDate.trim()) {
      Alert.alert(copy.incompleteFieldsTitle, copy.incompleteFieldsBody);
      return;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(nextBillingDate.trim())) {
      Alert.alert(copy.invalidDateTitle, copy.invalidDateBody);
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert(copy.invalidPriceTitle, copy.invalidPriceBody);
      return;
    }

    if (!Number.isFinite(parsedReminderDays) || parsedReminderDays < 0) {
      Alert.alert(copy.invalidReminderTitle, copy.invalidReminderBody);
      return;
    }

    if (hasFreeTrial && !trimmedTrialEndDate) {
      Alert.alert(copy.incompleteTrialTitle, copy.incompleteTrialBody);
      return;
    }

    if (hasFreeTrial && !/^\d{2}\/\d{2}\/\d{4}$/.test(trimmedTrialEndDate)) {
      Alert.alert(copy.invalidTrialDateTitle, copy.invalidDateBody);
      return;
    }

    if (includedProviderNames.length > includedServiceLimit) {
      Alert.alert(copy.tooManyIncludedTitle, copy.tooManyIncludedBody(FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION));
      return;
    }

    try {
      nextBillingIso = toIsoDate(nextBillingDate);

      if (hasFreeTrial) {
        trialEndIso = toIsoDate(trimmedTrialEndDate);

        if (new Date(nextBillingIso).getTime() < new Date(trialEndIso).getTime()) {
          Alert.alert(copy.inconsistentDatesTitle, copy.inconsistentDatesBody);
          return;
        }
      }
    } catch (error) {
      Alert.alert(
        copy.invalidDateTitle,
        error instanceof Error ? error.message : copy.verifyDatesBody
      );
      return;
    }

    try {
      const nextStatus = hasFreeTrial
        ? "trial"
        : existingSubscription?.status === "trial"
          ? "active"
          : existingSubscription?.status ?? "active";

      await saveSubscription(
        {
          providerName: providerName.trim(),
          includedProviderNames,
          logoMode: resolvedLogoMode,
          categoryId: buildCategoryId(category, profile?.id ?? "mock-user-id"),
          categoryName: category.trim(),
          price: parsedPrice,
          currency: profile?.currency ?? "EUR",
          billingFrequency: frequency,
          nextBillingDate: nextBillingIso,
          reminderDaysBefore: parsedReminderDays,
          notes: notes.trim() || undefined,
          lastUsedAt: existingSubscription?.lastUsedAt ?? null,
          trialEndsAt: trialEndIso,
          status: nextStatus
        },
        existingSubscription?.id
      );

      Alert.alert(
        isEditing ? copy.updatedTitle : copy.addedTitle,
        isEditing ? copy.updatedBody : copy.addedBody
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        copy.saveFailedTitle,
        error instanceof Error ? error.message : copy.saveFailedBody
      );
    }
  };

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={[styles.glow, styles.glowOrange]} />
        <View style={[styles.glow, styles.glowPurple]} />
      </View>
      <ScrollView
        ref={catalogScrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleCatalogScroll}
        scrollEventThrottle={16}
      >
        <View style={[styles.header, isCompact ? styles.headerCompact : null]}>
          <Pressable onPress={navigation.goBack} style={styles.circleButton}>
            <Text style={styles.circleButtonLabel}>{"<"}</Text>
          </Pressable>
          <Text style={[styles.title, isCompact ? styles.titleCompact : null]}>
            {isEditing ? copy.editTitle : copy.addTitle}
          </Text>
          <Pressable
            onPress={openCustomComposer}
            style={[styles.circleButton, styles.circleButtonPrimary]}
          >
            <Text style={styles.circleButtonPrimaryLabel}>+</Text>
          </Pressable>
        </View>

        <View style={styles.searchBar}>
          <View style={styles.searchGlyph}>
            <View style={styles.searchGlyphCircle} />
            <View style={styles.searchGlyphHandle} />
          </View>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={copy.searchPlaceholder}
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filterOptions.map((option) => {
            const isActive = selectedFilter === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setSelectedFilter(option.id)}
                style={[styles.filterChip, isActive ? styles.filterChipActive : null]}
              >
                <Text
                  style={[
                    styles.filterChipLabel,
                    isActive ? styles.filterChipLabelActive : null
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.helperCard}>
          <Text style={styles.helperTitle}>{copy.helperTitle}</Text>
          <Text style={styles.helperBody}>
            {copy.helperBody(formatReminderDays(Number(accountDefaultReminderDays)))}
          </Text>
        </View>

        <View style={styles.sectionStack}>
          {filteredSections.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
              <Text style={styles.emptyBody}>{copy.emptyBody}</Text>
            </View>
          ) : null}

          {filteredSections.map((section) => (
            <View key={section.slug} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionRows}>
                {section.items.map((preset) => (
                  <Pressable
                    key={preset.id}
                    onPress={() => openPresetComposer(preset)}
                    style={styles.serviceRow}
                  >
                    <View style={styles.serviceIdentity}>
                      <ServiceLogo providerName={preset.providerName} size={42} />
                      <Text style={styles.serviceLabel}>{preset.providerName}</Text>
                    </View>
                    <Text style={styles.serviceChevron}>{">"}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>

        <Pressable onPress={openCustomComposer} style={styles.customCard}>
          <View style={styles.customCardBadge}>
            <Text style={styles.customCardBadgeLabel}>+</Text>
          </View>
          <View style={styles.customCardText}>
            <Text style={styles.customCardTitle}>{copy.customCardTitle}</Text>
            <Text style={styles.customCardBody}>{copy.customCardBody}</Text>
          </View>
        </Pressable>
      </ScrollView>

      {showScrollTopButton ? (
        <Pressable style={styles.scrollTopButton} onPress={scrollCatalogToTop}>
          <Text style={styles.scrollTopButtonLabel}>↑</Text>
        </Pressable>
      ) : null}

      <Modal
        animationType="slide"
        transparent
        visible={isComposerVisible}
        onRequestClose={dismissComposer}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={dismissComposer} />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.sheetWrap}
          >
            <View style={[styles.sheet, isTablet ? styles.sheetTablet : null]}>
              <View style={styles.sheetGrabber} />
              <View style={styles.sheetHeader}>
                <View style={styles.sheetIdentity}>
                  <ServiceLogo
                    providerName={providerName || "Subly"}
                    logoMode={resolvedLogoMode}
                    size={52}
                  />
                  <View style={styles.sheetIdentityText}>
                    <Text style={styles.sheetTitle}>
                      {providerName || copy.customSheetTitle}
                    </Text>
                    <Text style={styles.sheetSubtitle}>
                      {selectedPreset ? selectedPreset.categoryName : copy.freeService}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={dismissComposer} style={styles.sheetCloseButton}>
                  <Text style={styles.sheetCloseLabel}>X</Text>
                </Pressable>
              </View>

              {selectedPreset ? (
                <View style={styles.presetHintCard}>
                  <Text style={styles.presetHintTitle}>
                    {selectedServicePlanPreset?.preselectedTitle ?? copy.selectedServiceHint}
                  </Text>
                  <Text style={styles.presetHintBody}>
                    {selectedServicePlanPreset?.preselectedDescription ??
                      copy.selectedServiceBody(selectedPreset.suggestedPrice)}
                  </Text>
                </View>
              ) : (
                <View style={styles.presetHintCard}>
                  <Text style={styles.presetHintTitle}>{copy.customModeTitle}</Text>
                  <Text style={styles.presetHintBody}>{copy.customModeBody}</Text>
                </View>
              )}

              <View style={styles.stepperRow}>
                {composerSteps.map((step) => {
                  const isActive = composerStep === step.id;
                  const isCompleted =
                    (step.id === "service" && composerStep !== "service") ||
                    (step.id === "billing" && composerStep === "options");

                  return (
                    <Pressable
                      key={step.id}
                      onPress={() => goToComposerStep(step.id)}
                      style={[
                        styles.stepperChip,
                        isActive ? styles.stepperChipActive : null,
                        isCompleted ? styles.stepperChipCompleted : null
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepperEyebrow,
                          isActive ? styles.stepperEyebrowActive : null
                        ]}
                      >
                        {isCompleted ? copy.stepDone : step.eyebrow}
                      </Text>
                      <Text
                        style={[
                          styles.stepperLabel,
                          isActive ? styles.stepperLabelActive : null
                        ]}
                      >
                        {step.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.sheetContent}
              >
                {composerStep === "service" ? (
                  <>
                    <View style={styles.stepInfoCard}>
                      <Text style={styles.stepInfoTitle}>{copy.step1Title}</Text>
                      <Text style={styles.stepInfoBody}>{copy.step1Body}</Text>
                    </View>

                    {selectedServicePlanPreset ? (
                      <>
                        <View style={styles.field}>
                          <Text style={styles.label}>{copy.serviceName}</Text>
                          <View style={styles.lockedInput}>
                            <Text style={styles.lockedInputValue}>
                              {selectedServicePlanPreset.baseProviderName}
                            </Text>
                            <Text style={styles.lockedInputHint}>{providerName}</Text>
                          </View>
                        </View>

                        <View style={styles.field}>
                          <Text style={styles.label}>{selectedServicePlanPreset.selectorLabel}</Text>
                          <View style={styles.specialOptionSectionStack}>
                            {specialPresetSections.map((section) => (
                              <View key={section.id} style={styles.specialOptionSection}>
                                {section.title ? (
                                  <Text style={styles.specialOptionSectionTitle}>{section.title}</Text>
                                ) : null}
                                <View style={styles.passOptionStack}>
                                  {section.options.map((option) => {
                                    const isActive = option.providerName === providerName;

                                    return (
                                      <Pressable
                                        key={option.id}
                                        onPress={() => setProviderName(option.providerName)}
                                        style={[
                                          styles.passOptionCard,
                                          isActive ? styles.passOptionCardActive : null
                                        ]}
                                      >
                                        <View style={styles.passOptionIdentity}>
                                          <ServiceLogo providerName={option.providerName} size={48} />
                                          <View style={styles.passOptionText}>
                                            <Text style={styles.passOptionTitle}>
                                              {option.providerName}
                                            </Text>
                                            <Text style={styles.passOptionBody}>
                                              {section.description ??
                                                (isFrench
                                                  ? "Visuel officiel adapte a cette formule."
                                                  : "Official visual adapted to this plan.")}
                                            </Text>
                                          </View>
                                        </View>
                                        <Text
                                          style={[
                                            styles.passOptionStatus,
                                            isActive ? styles.passOptionStatusActive : null
                                          ]}
                                        >
                                          {isActive ? copy.selected : copy.choose}
                                        </Text>
                                      </Pressable>
                                    );
                                  })}
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>

                        <View style={styles.field}>
                          <Text style={styles.label}>{copy.displayedLogo}</Text>
                          <Text style={styles.fieldHint}>
                            {copy.displayedLogoHint(selectedServicePlanPreset.baseProviderName)}
                          </Text>
                          <View style={styles.logoModeStack}>
                            {logoModeOptions.map((option) => {
                              const isActive = option.value === logoMode;

                              return (
                                <Pressable
                                  key={option.value}
                                  onPress={() => setLogoMode(option.value)}
                                  style={[
                                    styles.logoModeCard,
                                    isActive ? styles.logoModeCardActive : null
                                  ]}
                                >
                                  <View style={styles.logoModeText}>
                                    <Text style={styles.logoModeTitle}>{option.label}</Text>
                                    <Text style={styles.logoModeBody}>{option.description}</Text>
                                  </View>
                                  <Text
                                    style={[
                                      styles.passOptionStatus,
                                      isActive ? styles.passOptionStatusActive : null
                                    ]}
                                  >
                                    {isActive ? copy.selected : copy.choose}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                      </>
                    ) : (
                      <Field
                        label={copy.serviceName}
                        value={providerName}
                        onChangeText={(value) => {
                          setSelectedPresetId(null);
                          setProviderName(value);
                        }}
                        placeholder={copy.servicePlaceholder}
                      />
                    )}
                  </>
                ) : null}
                {composerStep === "service" ? (
                  <>
                    <View style={styles.field}>
                      <Text style={styles.label}>{copy.quickCategories}</Text>
                      <View style={styles.categoryWrap}>
                        {PREDEFINED_CATEGORY_PRESETS.map((preset) => {
                          const isActive = preset.name === category;
                          return (
                            <Pressable
                              key={preset.slug}
                              onPress={() => setCategory(preset.name)}
                              style={[
                                styles.categoryChip,
                                isActive ? styles.categoryChipActive : null
                              ]}
                            >
                              <Text
                                style={[
                                  styles.categoryChipLabel,
                                  isActive ? styles.categoryChipLabelActive : null
                                ]}
                              >
                                {preset.name}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.stepSummaryCard}>
                      <Text style={styles.stepSummaryLabel}>{copy.chosenCategory}</Text>
                      <Text style={styles.stepSummaryValue}>{category}</Text>
                    </View>
                  </>
                ) : null}

                {composerStep === "billing" ? (
                  <>
                    <View style={styles.stepInfoCard}>
                      <Text style={styles.stepInfoTitle}>{copy.step2Title}</Text>
                      <Text style={styles.stepInfoBody}>{copy.step2Body}</Text>
                    </View>

                    <View style={styles.stepSummaryGrid}>
                      <View style={styles.stepSummaryGridCard}>
                        <Text style={styles.stepSummaryLabel}>{copy.serviceLabel}</Text>
                        <Text style={styles.stepSummaryValue}>{providerName || copy.toDefine}</Text>
                      </View>
                      <View style={styles.stepSummaryGridCard}>
                        <Text style={styles.stepSummaryLabel}>{copy.suggestedReminder}</Text>
                        <Text style={styles.stepSummaryValue}>
                          {formatReminderDays(Number(accountDefaultReminderDays))}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.duoRow, isCompact ? styles.duoRowCompact : null]}>
                      <Field
                        label={copy.price}
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="decimal-pad"
                        placeholder="8,99"
                        inputRef={priceInputRef}
                      />
                      <View style={styles.field}>
                        <Text style={styles.label}>{copy.category}</Text>
                        <View style={styles.lockedInput}>
                          <Text style={styles.lockedInputValue}>{category}</Text>
                          <Text style={styles.lockedInputHint}>{copy.chosenOnPreviousStep}</Text>
                        </View>
                      </View>
                    </View>
                  </>
                ) : null}

                {composerStep === "billing" ? (
                  <>
                    <View style={styles.field}>
                      <Text style={styles.label}>{copy.frequency}</Text>
                      <View style={[styles.frequencyRow, isCompact ? styles.frequencyRowCompact : null]}>
                        {frequencyOptions.map((option) => (
                          <Pressable
                            key={option.value}
                            onPress={() => {
                              setFrequency(option.value);
                              if (!isEditing) {
                                setNextBillingDate(getSuggestedDate(option.value));
                              }
                            }}
                            style={[
                              styles.frequencyChip,
                              isCompact ? styles.frequencyChipCompact : null,
                              frequency === option.value ? styles.frequencyChipActive : null
                            ]}
                          >
                            <Text
                              style={[
                                styles.frequencyLabel,
                                frequency === option.value ? styles.frequencyLabelActive : null
                              ]}
                            >
                              {option.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>

                    <View style={styles.field}>
                      <Text style={styles.label}>{copy.freeTrial}</Text>
                      <View style={[styles.frequencyRow, isCompact ? styles.frequencyRowCompact : null]}>
                        {trialOptions.map((option) => {
                          const isActive =
                            (hasFreeTrial && option.value === "active") ||
                            (!hasFreeTrial && option.value === "inactive");

                          return (
                            <Pressable
                              key={option.value}
                              onPress={() => {
                                const nextHasFreeTrial = option.value === "active";
                                setHasFreeTrial(nextHasFreeTrial);

                                if (nextHasFreeTrial && !trialEndsAt.trim()) {
                                  setTrialEndsAt(nextBillingDate);
                                }

                                if (!nextHasFreeTrial) {
                                  setTrialEndsAt("");
                                }
                              }}
                              style={[
                                styles.frequencyChip,
                                isCompact ? styles.frequencyChipCompact : null,
                                isActive ? styles.frequencyChipActive : null
                              ]}
                            >
                              <Text
                                style={[
                                  styles.frequencyLabel,
                                  isActive ? styles.frequencyLabelActive : null
                                ]}
                              >
                                {option.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      <Text style={styles.fieldHint}>{copy.freeTrialHint}</Text>
                    </View>

                    {hasFreeTrial ? (
                      <DateField
                        label={copy.trialEndsAt}
                        value={trialEndsAt}
                        onChangeText={setTrialEndsAt}
                        placeholder={copy.datePlaceholder}
                      />
                    ) : null}

                    <DateField
                      label={hasFreeTrial ? copy.firstPaymentAfterTrial : copy.nextBillingDate}
                      value={nextBillingDate}
                      onChangeText={setNextBillingDate}
                      placeholder={copy.datePlaceholder}
                    />
                    {isPremium ? (
                      <>
                        <Field
                          label={copy.reminderDays}
                          value={reminderDaysBefore}
                          onChangeText={setReminderDaysBefore}
                          keyboardType="decimal-pad"
                          placeholder={accountDefaultReminderDays}
                        />

                        <View style={styles.inlineOptionRow}>
                          {[0, 1, 3, 7, 14].map((value) => {
                            const isActive = Number(reminderDaysBefore) === value;

                            return (
                              <Pressable
                                key={value}
                                onPress={() => setReminderDaysBefore(String(value))}
                                style={[
                                  styles.inlineOptionChip,
                                  isActive ? styles.inlineOptionChipActive : null
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.inlineOptionLabel,
                                    isActive ? styles.inlineOptionLabelActive : null
                                  ]}
                                  >
                                  {value === 0 ? copy.sameDay : `${value}j`}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.field}>
                          <Text style={styles.label}>{copy.simpleReminder}</Text>
                          <View style={styles.lockedInput}>
                            <Text style={styles.lockedInputValue}>
                              {formatReminderDays(Number(accountDefaultReminderDays))}
                            </Text>
                            <Text style={styles.lockedInputHint}>{copy.simpleReminderHint}</Text>
                          </View>
                        </View>
                        <PromoCard
                          eyebrow={copy.premiumEyebrow}
                          title={copy.premiumReminderTitle}
                          body={copy.premiumReminderBody}
                          ctaLabel={copy.premiumCta}
                          onPress={() => navigation.navigate("Profile")}
                          tone="purple"
                        />
                      </>
                    )}
                  </>
                ) : null}
                {composerStep === "options" ? (
                  <>
                    <View style={styles.stepInfoCard}>
                      <Text style={styles.stepInfoTitle}>{copy.step3Title}</Text>
                      <Text style={styles.stepInfoBody}>{copy.step3Body}</Text>
                    </View>

                    <View style={styles.stepSummaryGrid}>
                      <View style={styles.stepSummaryGridCard}>
                        <Text style={styles.stepSummaryLabel}>{copy.amount}</Text>
                        <Text style={styles.stepSummaryValue}>
                          {price.trim() ? `${price} ${profile?.currency ?? "EUR"}` : copy.toDefine}
                        </Text>
                      </View>
                      <View style={styles.stepSummaryGridCard}>
                        <Text style={styles.stepSummaryLabel}>{copy.frequency}</Text>
                        <Text style={styles.stepSummaryValue}>
                          {frequencyOptions.find((option) => option.value === frequency)?.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.field}>
                      <Text style={styles.label}>{copy.includedServices}</Text>
                      <Text style={styles.fieldHint}>
                        {hasUnlimitedIncludedServices
                          ? copy.includedServicesHintUnlimited
                          : copy.includedServicesHintFree(FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION)}
                      </Text>
                      <Text style={styles.fieldHint}>
                        {hasUnlimitedIncludedServices
                          ? copy.includedServicesCountUnlimited(includedProviderNames.length)
                          : copy.includedServicesCountFree(
                              includedProviderNames.length,
                              FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION
                            )}
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={includedServiceQuery}
                        onChangeText={setIncludedServiceQuery}
                        placeholder={copy.includedSearchPlaceholder}
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                      {includedProviderNames.length > 0 ? (
                        <View style={styles.includedChipWrap}>
                          {includedProviderNames.map((includedProviderName) => (
                            <Pressable
                              key={includedProviderName}
                              onPress={() => removeIncludedProvider(includedProviderName)}
                              style={styles.includedChip}
                            >
                              <ServiceLogo providerName={includedProviderName} size={28} />
                              <Text style={styles.includedChipLabel}>{includedProviderName}</Text>
                              <Text style={styles.includedChipRemove}>X</Text>
                            </Pressable>
                          ))}
                        </View>
                      ) : (
                        <View style={styles.emptyIncludedState}>
                          <Text style={styles.emptyIncludedStateText}>{copy.noIncludedService}</Text>
                        </View>
                      )}
                      {includedServiceSuggestions.length > 0 ? (
                        <View style={styles.includedSuggestionStack}>
                          {includedServiceSuggestions.map((suggestion) => (
                            <Pressable
                              key={suggestion}
                              onPress={() => addIncludedProvider(suggestion)}
                              style={styles.includedSuggestionCard}
                            >
                              <View style={styles.includedSuggestionIdentity}>
                                <ServiceLogo providerName={suggestion} size={36} />
                                <Text style={styles.includedSuggestionLabel}>{suggestion}</Text>
                              </View>
                              <Text style={styles.includedSuggestionAction}>{copy.add}</Text>
                            </Pressable>
                          ))}
                        </View>
                      ) : includedServiceQuery.trim() ? (
                        <Text style={styles.fieldHint}>{copy.noIncludedMatch}</Text>
                      ) : null}
                    </View>

                    <Field
                      label={copy.notes}
                      value={notes}
                      onChangeText={setNotes}
                      placeholder={copy.notesPlaceholder}
                      multiline
                    />
                  </>
                ) : null}

                <View style={[styles.stepActions, isCompact ? styles.stepActionsCompact : null]}>
                  {composerStep !== "service" ? (
                    <View style={styles.stepActionButton}>
                      <PrimaryButton
                        title={copy.back}
                        onPress={() =>
                          setComposerStep((current) =>
                            current === "options" ? "billing" : "service"
                          )
                        }
                        variant="secondary"
                      />
                    </View>
                  ) : null}
                  <View style={styles.stepActionButton}>
                    <PrimaryButton
                      title={
                        composerStep === "options"
                          ? isSaving
                            ? copy.saving
                            : copy.saveSubscription
                          : copy.continue
                      }
                      onPress={() =>
                        composerStep === "options"
                          ? void handleSave()
                          : handleNextComposerStep()
                      }
                      disabled={isSaving}
                    />
                  </View>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "decimal-pad";
  placeholder?: string;
  multiline?: boolean;
  inputRef?: Ref<TextInput>;
};

function Field({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  placeholder,
  multiline = false,
  inputRef
}: FieldProps): JSX.Element {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={inputRef}
        style={[styles.input, multiline ? styles.inputMultiline : null]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

function getSuggestedDate(frequency: BillingFrequency) {
  const date = new Date();

  if (frequency === "weekly") {
    date.setDate(date.getDate() + 7);
  } else if (frequency === "quarterly") {
    date.setMonth(date.getMonth() + 3);
  } else if (frequency === "yearly") {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }

  return toDateInputValue(date.toISOString());
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
    width: 260,
    height: 260,
    borderRadius: 999
  },
  glowOrange: {
    top: -80,
    right: -80,
    backgroundColor: theme.colors.glowOrange
  },
  glowPurple: {
    top: 220,
    left: -130,
    backgroundColor: theme.colors.glowPurple
  },
  content: {
    paddingTop: spacing.xxxl + spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl + 90,
    gap: spacing.lg
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  headerCompact: {
    gap: spacing.sm
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textAlign: "center"
  },
  titleCompact: {
    fontSize: 20
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  circleButtonPrimary: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.white
  },
  circleButtonLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.textPrimary
  },
  circleButtonPrimaryLabel: {
    fontSize: 24,
    fontWeight: "700",
    color: "#121212"
  },
  searchBar: {
    minHeight: 56,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  searchGlyph: {
    width: 18,
    height: 18,
    position: "relative"
  },
  searchGlyphCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.textSecondary
  },
  searchGlyphHandle: {
    position: "absolute",
    right: 0,
    bottom: 1,
    width: 8,
    height: 2,
    borderRadius: 2,
    backgroundColor: theme.colors.textSecondary,
    transform: [{ rotate: "45deg" }]
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary
  },
  filterRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    minHeight: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  filterChipActive: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.white
  },
  filterChipLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textSecondary
  },
  filterChipLabelActive: {
    color: "#111111"
  },
  helperCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6
  },
  helperTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  helperBody: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textSecondary
  },
  sectionStack: {
    gap: spacing.md
  },
  sectionCard: {
    backgroundColor: "#1A1A1D",
    borderRadius: 20,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)"
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: spacing.xs
  },
  sectionRows: {
    gap: 2
  },
  serviceRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderRadius: 16,
    paddingRight: 2
  },
  serviceIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  serviceLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.textPrimary
  },
  serviceChevron: {
    fontSize: 22,
    lineHeight: 22,
    color: theme.colors.textSecondary
  },
  emptyCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: spacing.xs
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary
  },
  customCard: {
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  customCardBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  customCardBadgeLabel: {
    fontSize: 24,
    fontWeight: "700",
    color: "#17120A"
  },
  customCardText: {
    flex: 1,
    gap: 4
  },
  customCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  customCardBody: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textSecondary
  },
  scrollTopButton: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.xl,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceContrast,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    ...shadows.card
  },
  scrollTopButtonLabel: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.textPrimary
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end"
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 2, 5, 0.72)"
  },
  sheetWrap: {
    flex: 1,
    justifyContent: "flex-end"
  },
  sheet: {
    maxHeight: "94%",
    backgroundColor: "#0F1016",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    ...shadows.card
  },
  sheetTablet: {
    width: "100%",
    maxWidth: 620,
    alignSelf: "center"
  },
  sheetGrabber: {
    alignSelf: "center",
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: theme.colors.borderStrong,
    marginBottom: spacing.md
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  sheetIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  sheetIdentityText: {
    flex: 1,
    gap: 4
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  sheetSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary
  },
  sheetCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  sheetCloseLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textSecondary
  },
  presetHintCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6
  },
  presetHintTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
    textTransform: "uppercase"
  },
  presetHintBody: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textSecondary
  },
  stepperRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm
  },
  stepperChip: {
    flex: 1,
    minHeight: 58,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 2,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  stepperChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceContrast
  },
  stepperChipCompleted: {
    borderColor: "rgba(69, 212, 139, 0.35)"
  },
  stepperEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: theme.colors.textTertiary
  },
  stepperEyebrowActive: {
    color: theme.colors.primary
  },
  stepperLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textSecondary
  },
  stepperLabelActive: {
    color: theme.colors.textPrimary
  },
  sheetContent: {
    paddingTop: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl
  },
  stepInfoCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  stepInfoTitle: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: theme.colors.primary
  },
  stepInfoBody: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textSecondary
  },
  stepSummaryCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: theme.colors.surfaceContrast,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    gap: 4
  },
  stepSummaryGrid: {
    flexDirection: "row",
    gap: spacing.md
  },
  stepSummaryGridCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  stepSummaryLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: theme.colors.textTertiary
  },
  stepSummaryValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  field: {
    flex: 1,
    gap: spacing.xs
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary
  },
  fieldHint: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.textSecondary
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfaceRaised
  },
  inputMultiline: {
    minHeight: 110,
    paddingTop: spacing.md
  },
  lockedInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: theme.colors.surfaceRaised,
    justifyContent: "center",
    gap: 2
  },
  lockedInputValue: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary
  },
  lockedInputHint: {
    fontSize: 12,
    color: theme.colors.textTertiary
  },
  duoRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  duoRowCompact: {
    flexDirection: "column"
  },
  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  categoryChipActive: {
    backgroundColor: theme.colors.surfaceContrast,
    borderColor: theme.colors.primary
  },
  categoryChipLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary
  },
  categoryChipLabelActive: {
    color: theme.colors.primary
  },
  includedChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  includedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.sm,
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceContrast,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong
  },
  includedChipLabel: {
    maxWidth: 180,
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary
  },
  includedChipRemove: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.textTertiary
  },
  emptyIncludedState: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  emptyIncludedStateText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: "center"
  },
  includedSuggestionStack: {
    gap: spacing.sm
  },
  includedSuggestionCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceRaised,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  includedSuggestionIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  includedSuggestionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary
  },
  includedSuggestionAction: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
    textTransform: "uppercase"
  },
  passOptionStack: {
    gap: spacing.sm
  },
  specialOptionSectionStack: {
    gap: spacing.md
  },
  specialOptionSection: {
    gap: spacing.sm
  },
  specialOptionSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  passOptionCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceRaised,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  passOptionCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceContrast
  },
  passOptionIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  passOptionText: {
    flex: 1,
    gap: 4
  },
  passOptionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  passOptionBody: {
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textSecondary
  },
  passOptionStatus: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textTertiary,
    textTransform: "uppercase"
  },
  passOptionStatusActive: {
    color: theme.colors.primary
  },
  logoModeStack: {
    gap: spacing.sm
  },
  logoModeCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceRaised,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  logoModeCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceContrast
  },
  logoModeText: {
    flex: 1,
    gap: 4
  },
  logoModeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary
  },
  logoModeBody: {
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textSecondary
  },
  frequencyRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  frequencyRowCompact: {
    flexWrap: "wrap"
  },
  inlineOptionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  inlineOptionChip: {
    minWidth: 68,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  inlineOptionChipActive: {
    backgroundColor: theme.colors.surfaceContrast,
    borderColor: theme.colors.primary
  },
  inlineOptionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textSecondary
  },
  inlineOptionLabelActive: {
    color: theme.colors.primary
  },
  frequencyChip: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: radius.md,
    backgroundColor: theme.colors.surfaceRaised
  },
  frequencyChipCompact: {
    flexBasis: "48%"
  },
  frequencyChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceContrast
  },
  frequencyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary
  },
  frequencyLabelActive: {
    color: theme.colors.primary
  },
  stepActions: {
    flexDirection: "row",
    gap: spacing.md,
    paddingTop: spacing.sm
  },
  stepActionsCompact: {
    flexDirection: "column"
  },
  stepActionButton: {
    flex: 1
  }
});
