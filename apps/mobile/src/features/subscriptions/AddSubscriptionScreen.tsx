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

const FREQUENCY_OPTIONS: Array<{ label: string; value: BillingFrequency }> = [
  { label: "Hebdo", value: "weekly" },
  { label: "Mensuel", value: "monthly" },
  { label: "Trimestriel", value: "quarterly" },
  { label: "Annuel", value: "yearly" },
];

const TRIAL_OPTIONS = [
  { label: "Non", value: "inactive" },
  { label: "Oui", value: "active" }
] as const;

const LOGO_MODE_OPTIONS: Array<{
  label: string;
  value: SubscriptionLogoMode;
  description: string;
}> = [
  {
    label: "Logo de l'offre",
    value: "option",
    description: "Affiche le visuel propre a la formule choisie."
  },
  {
    label: "Logo de base",
    value: "base",
    description: "Affiche le logo principal du service, peu importe la formule."
  }
];

const DEFAULT_REMINDER_DAYS = "3";
const SCROLL_TO_TOP_VISIBILITY_OFFSET = 260;
const COMPOSER_STEPS: Array<{ id: ComposerStep; label: string; eyebrow: string }> = [
  { id: "service", label: "Service", eyebrow: "1" },
  { id: "billing", label: "Facturation", eyebrow: "2" },
  { id: "options", label: "Options", eyebrow: "3" }
];

export function AddSubscriptionScreen(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const isTablet = width >= 768;
  const theme = useAppTheme();
  const styles = createStyles(theme);
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
      { id: "all", label: "Tous" },
      ...PREDEFINED_CATEGORY_PRESETS.filter((preset) => availableSlugs.has(preset.slug)).map(
        (preset) => ({
          id: preset.slug,
          label: preset.name
        })
      )
    ];
  }, []);

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
        "Limite atteinte",
        `Le plan gratuit permet jusqu'a ${FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION} services inclus par abonnement. Passe au Premium pour en ajouter autant que tu veux.`
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
      Alert.alert(
        "Informations manquantes",
        "Choisis d'abord le service et la categorie a suivre."
      );
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
      Alert.alert("Prix invalide", "Entre un montant superieur a zero.");
      return false;
    }

    if (!nextBillingDate.trim()) {
      Alert.alert("Date manquante", "Ajoute la prochaine date de facturation.");
      return false;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(nextBillingDate.trim())) {
      Alert.alert("Date invalide", "Utilise le format europeen JJ/MM/AAAA.");
      return false;
    }

    if (!Number.isFinite(parsedReminderDays) || parsedReminderDays < 0) {
      Alert.alert("Rappel invalide", "Le nombre de jours doit etre positif.");
      return false;
    }

    if (hasFreeTrial && !trialEndsAt.trim()) {
      Alert.alert("Essai gratuit incomplet", "Indique la date de fin de l'essai gratuit.");
      return false;
    }

    if (hasFreeTrial && !/^\d{2}\/\d{2}\/\d{4}$/.test(trialEndsAt.trim())) {
      Alert.alert("Date d'essai invalide", "Utilise le format europeen JJ/MM/AAAA.");
      return false;
    }

    return true;
  };

  const goToComposerStep = (nextStep: ComposerStep) => {
    if (nextStep === composerStep) {
      return;
    }

    const currentIndex = COMPOSER_STEPS.findIndex((step) => step.id === composerStep);
    const nextIndex = COMPOSER_STEPS.findIndex((step) => step.id === nextStep);

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
      Alert.alert("Champs incomplets", "Renseigne le service, la categorie et la date.");
      return;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(nextBillingDate.trim())) {
      Alert.alert("Date invalide", "Utilise le format europeen JJ/MM/AAAA.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert("Prix invalide", "Entre un montant superieur a zero.");
      return;
    }

    if (!Number.isFinite(parsedReminderDays) || parsedReminderDays < 0) {
      Alert.alert("Rappel invalide", "Le nombre de jours doit etre positif.");
      return;
    }

    if (hasFreeTrial && !trimmedTrialEndDate) {
      Alert.alert("Essai gratuit incomplet", "Indique la date de fin de l'essai gratuit.");
      return;
    }

    if (hasFreeTrial && !/^\d{2}\/\d{2}\/\d{4}$/.test(trimmedTrialEndDate)) {
      Alert.alert("Date d'essai invalide", "Utilise le format europeen JJ/MM/AAAA.");
      return;
    }

    if (includedProviderNames.length > includedServiceLimit) {
      Alert.alert(
        "Trop de services inclus",
        `Le plan gratuit permet jusqu'a ${FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION} services inclus par abonnement. Passe au Premium pour supprimer cette limite.`
      );
      return;
    }

    try {
      nextBillingIso = toIsoDate(nextBillingDate);

      if (hasFreeTrial) {
        trialEndIso = toIsoDate(trimmedTrialEndDate);

        if (new Date(nextBillingIso).getTime() < new Date(trialEndIso).getTime()) {
          Alert.alert(
            "Dates incoherentes",
            "Le premier paiement doit etre le meme jour ou apres la fin de l'essai gratuit."
          );
          return;
        }
      }
    } catch (error) {
      Alert.alert(
        "Date invalide",
        error instanceof Error ? error.message : "Verifie les dates saisies."
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
        isEditing ? "Abonnement mis a jour" : "Abonnement ajoute",
        isEditing
          ? "Les modifications ont bien ete enregistrees."
          : "Le nouvel abonnement a ete ajoute a ton espace Subly."
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Enregistrement impossible",
        error instanceof Error ? error.message : "Merci de reessayer."
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
            {isEditing ? "Modifier un abonnement" : "Ajouter un abonnement"}
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
            placeholder="Streaming, musique, jeux et plus encore..."
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
          <Text style={styles.helperTitle}>Catalogue Subly</Text>
          <Text style={styles.helperBody}>
            Choisis un service pour ouvrir une creation guidee en trois etapes. Le rappel
            par defaut de ton compte est actuellement regle sur{" "}
            {formatReminderDays(Number(accountDefaultReminderDays)).toLowerCase()}.
          </Text>
        </View>

        <View style={styles.sectionStack}>
          {filteredSections.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Aucun service trouve</Text>
              <Text style={styles.emptyBody}>
                Essaie une autre recherche ou cree directement un abonnement
                personnalise.
              </Text>
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
            <Text style={styles.customCardTitle}>Abonnement personnalise</Text>
            <Text style={styles.customCardBody}>
              Tu ne trouves pas ton service ? Cree une fiche libre avec le nom et la
              categorie de ton choix.
            </Text>
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
                      {providerName || "Abonnement personnalise"}
                    </Text>
                    <Text style={styles.sheetSubtitle}>
                      {selectedPreset ? selectedPreset.categoryName : "Service libre"}
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
                    {selectedServicePlanPreset?.preselectedTitle ?? "Service preselectionne"}
                  </Text>
                  <Text style={styles.presetHintBody}>
                    {selectedServicePlanPreset?.preselectedDescription ??
                      `Prix laisse vide volontairement. Tarif indicatif : ${formatCurrency(
                          selectedPreset.suggestedPrice,
                          profile?.currency ?? "EUR"
                        )}.`}
                  </Text>
                </View>
              ) : (
                <View style={styles.presetHintCard}>
                  <Text style={styles.presetHintTitle}>Mode personnalise</Text>
                  <Text style={styles.presetHintBody}>
                    Tu peux creer un abonnement qui n'est pas dans le catalogue.
                  </Text>
                </View>
              )}

              <View style={styles.stepperRow}>
                {COMPOSER_STEPS.map((step) => {
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
                        {isCompleted ? "OK" : step.eyebrow}
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
                      <Text style={styles.stepInfoTitle}>Etape 1</Text>
                      <Text style={styles.stepInfoBody}>
                        Choisis le service suivi, la formule si besoin, puis la categorie qui
                        alimentera les listes et les statistiques.
                      </Text>
                    </View>

                    {selectedServicePlanPreset ? (
                      <>
                        <View style={styles.field}>
                          <Text style={styles.label}>Nom du service</Text>
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
                                                "Visuel officiel adapte a cette formule."}
                                            </Text>
                                          </View>
                                        </View>
                                        <Text
                                          style={[
                                            styles.passOptionStatus,
                                            isActive ? styles.passOptionStatusActive : null
                                          ]}
                                        >
                                          {isActive ? "Selectionne" : "Choisir"}
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
                          <Text style={styles.label}>Logo affiche</Text>
                          <Text style={styles.fieldHint}>
                            Choisis si tu veux garder le visuel de la formule selectionnee ou
                            revenir au logo principal de {selectedServicePlanPreset.baseProviderName}.
                          </Text>
                          <View style={styles.logoModeStack}>
                            {LOGO_MODE_OPTIONS.map((option) => {
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
                                    {isActive ? "Selectionne" : "Choisir"}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                      </>
                    ) : (
                      <Field
                        label="Nom du service"
                        value={providerName}
                        onChangeText={(value) => {
                          setSelectedPresetId(null);
                          setProviderName(value);
                        }}
                        placeholder="Ex: Prime Video, Revolut, Apple One"
                      />
                    )}
                  </>
                ) : null}
                {composerStep === "service" ? (
                  <>
                    <View style={styles.field}>
                      <Text style={styles.label}>Categories rapides</Text>
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
                      <Text style={styles.stepSummaryLabel}>Categorie choisie</Text>
                      <Text style={styles.stepSummaryValue}>{category}</Text>
                    </View>
                  </>
                ) : null}

                {composerStep === "billing" ? (
                  <>
                    <View style={styles.stepInfoCard}>
                      <Text style={styles.stepInfoTitle}>Etape 2</Text>
                      <Text style={styles.stepInfoBody}>
                        Definis le prix, la frequence, la date cle et le rappel de paiement.
                      </Text>
                    </View>

                    <View style={styles.stepSummaryGrid}>
                      <View style={styles.stepSummaryGridCard}>
                        <Text style={styles.stepSummaryLabel}>Service</Text>
                        <Text style={styles.stepSummaryValue}>{providerName || "A definir"}</Text>
                      </View>
                      <View style={styles.stepSummaryGridCard}>
                        <Text style={styles.stepSummaryLabel}>Rappel conseille</Text>
                        <Text style={styles.stepSummaryValue}>
                          {formatReminderDays(Number(accountDefaultReminderDays))}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.duoRow, isCompact ? styles.duoRowCompact : null]}>
                      <Field
                        label="Prix"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="decimal-pad"
                        placeholder="8,99"
                        inputRef={priceInputRef}
                      />
                      <View style={styles.field}>
                        <Text style={styles.label}>Categorie</Text>
                        <View style={styles.lockedInput}>
                          <Text style={styles.lockedInputValue}>{category}</Text>
                          <Text style={styles.lockedInputHint}>Choisie a l'etape precedente</Text>
                        </View>
                      </View>
                    </View>
                  </>
                ) : null}

                {composerStep === "billing" ? (
                  <>
                    <View style={styles.field}>
                      <Text style={styles.label}>Frequence</Text>
                      <View style={[styles.frequencyRow, isCompact ? styles.frequencyRowCompact : null]}>
                        {FREQUENCY_OPTIONS.map((option) => (
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
                      <Text style={styles.label}>Essai gratuit</Text>
                      <View style={[styles.frequencyRow, isCompact ? styles.frequencyRowCompact : null]}>
                        {TRIAL_OPTIONS.map((option) => {
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
                      <Text style={styles.fieldHint}>
                        Active cette option si l'abonnement commence par une periode d'essai sans
                        paiement.
                      </Text>
                    </View>

                    {hasFreeTrial ? (
                      <DateField
                        label="Fin de l'essai gratuit"
                        value={trialEndsAt}
                        onChangeText={setTrialEndsAt}
                        placeholder="25/03/2026"
                      />
                    ) : null}

                    <DateField
                      label={hasFreeTrial ? "Premier paiement apres essai" : "Prochaine facturation"}
                      value={nextBillingDate}
                      onChangeText={setNextBillingDate}
                      placeholder="25/03/2026"
                    />
                    {isPremium ? (
                      <>
                        <Field
                          label="Rappel (jours avant)"
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
                                  {value === 0 ? "Jour J" : `${value}j`}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.field}>
                          <Text style={styles.label}>Rappel simple</Text>
                          <View style={styles.lockedInput}>
                            <Text style={styles.lockedInputValue}>
                              {formatReminderDays(Number(accountDefaultReminderDays))}
                            </Text>
                            <Text style={styles.lockedInputHint}>
                              Le rappel personnalise par abonnement est reserve au Premium.
                            </Text>
                          </View>
                        </View>
                        <PromoCard
                          eyebrow="Premium"
                          title="Rappels personnalises"
                          body="Choisis un delai de rappel pour chaque abonnement au lieu d'utiliser le rappel simple du compte."
                          ctaLabel="Voir le Premium"
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
                      <Text style={styles.stepInfoTitle}>Etape 3</Text>
                      <Text style={styles.stepInfoBody}>
                        Termine avec les services inclus et les notes qui aideront pour le suivi.
                      </Text>
                    </View>

                    <View style={styles.stepSummaryGrid}>
                      <View style={styles.stepSummaryGridCard}>
                        <Text style={styles.stepSummaryLabel}>Montant</Text>
                        <Text style={styles.stepSummaryValue}>
                          {price.trim() ? `${price} ${profile?.currency ?? "EUR"}` : "A definir"}
                        </Text>
                      </View>
                      <View style={styles.stepSummaryGridCard}>
                        <Text style={styles.stepSummaryLabel}>Frequence</Text>
                        <Text style={styles.stepSummaryValue}>
                          {FREQUENCY_OPTIONS.find((option) => option.value === frequency)?.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.field}>
                      <Text style={styles.label}>Services inclus</Text>
                      <Text style={styles.fieldHint}>
                        {hasUnlimitedIncludedServices
                          ? "Associe ici autant de services que tu veux. Exemple : NordVPN ou Uber Eats inclus dans Revolut."
                          : `Associe jusqu'a ${FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION} services inclus sur le plan gratuit. Exemple : NordVPN ou Uber Eats inclus dans Revolut.`}
                      </Text>
                      <Text style={styles.fieldHint}>
                        {hasUnlimitedIncludedServices
                          ? `${includedProviderNames.length} service(s) inclus selectionne(s) - illimite avec Premium.`
                          : `${includedProviderNames.length}/${FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION} service(s) inclus selectionne(s) sur ton plan gratuit.`}
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={includedServiceQuery}
                        onChangeText={setIncludedServiceQuery}
                        placeholder="Rechercher un service inclus"
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
                          <Text style={styles.emptyIncludedStateText}>
                            Aucun service inclus associe pour le moment.
                          </Text>
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
                              <Text style={styles.includedSuggestionAction}>Ajouter</Text>
                            </Pressable>
                          ))}
                        </View>
                      ) : includedServiceQuery.trim() ? (
                        <Text style={styles.fieldHint}>
                          Aucun service du catalogue ne correspond a cette recherche.
                        </Text>
                      ) : null}
                    </View>

                    <Field
                      label="Notes"
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="Ex: formule duo, usage perso, engagement annuel"
                      multiline
                    />
                  </>
                ) : null}

                <View style={[styles.stepActions, isCompact ? styles.stepActionsCompact : null]}>
                  {composerStep !== "service" ? (
                    <View style={styles.stepActionButton}>
                      <PrimaryButton
                        title="Retour"
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
                            ? "Enregistrement..."
                            : "Enregistrer l'abonnement"
                          : "Continuer"
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
