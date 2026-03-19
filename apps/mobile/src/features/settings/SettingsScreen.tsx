import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from "react-native";
import { ACCOUNT_DELETION_RETENTION_DAYS } from "@subly/shared";

import {
  ALL_CURRENCY_OPTIONS,
} from "../../constants/currencies";
import {
  APP_LANGUAGE_OPTIONS,
  getAppLanguageLabel,
  getAppLanguageValue,
  normalizeAppLanguageSearch
} from "../../constants/appLanguages";
import {
  getLegalDocument,
  LEGAL_DOCUMENT_ORDER,
  type LegalDocumentId
} from "../../constants/legalDocuments";
import { PrimaryButton } from "../../components/PrimaryButton";
import { PromoCard } from "../../components/PromoCard";
import { Screen } from "../../components/Screen";
import { isPremiumPlan } from "../../constants/premium";
import { useAppTranslation } from "../../i18n";
import { authService } from "../../services/authService";
import { sublyApi } from "../../services/sublyApi";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { AppTheme, radius, spacing, useAppTheme } from "../../theme";
import { formatReminderDays } from "../../utils/format";

type LegalLink = {
  id: LegalDocumentId;
  title: string;
  description: string;
};

export function SettingsScreen(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const navigation = useAppNavigation();
  const theme = useAppTheme();
  const { locale, t } = useAppTranslation();
  const styles = createStyles(theme);
  const isFrench = locale === "fr";
  const profile = useWorkspaceStore((state) => state.profile);
  const isUpdatingSettings = useWorkspaceStore((state) => state.isUpdatingSettings);
  const updateSettings = useWorkspaceStore((state) => state.updateSettings);
  const resetWorkspace = useWorkspaceStore((state) => state.reset);
  const preferences = profile?.notificationPreferences;
  const defaultReminderDaysBefore = preferences?.defaultReminderDaysBefore ?? 3;
  const isPremium = isPremiumPlan(profile);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currencyQuery, setCurrencyQuery] = useState("");
  const [languageQuery, setLanguageQuery] = useState("");
  const [isCurrencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const currentCurrency = profile?.currency ?? "EUR";
  const notificationsEnabled = preferences?.notificationsEnabled ?? true;
  const currentLanguage = getAppLanguageValue(profile?.language);
  const activeCurrencyOption =
    ALL_CURRENCY_OPTIONS.find((option) => option.code === currentCurrency) ?? null;
  const activeLanguageLabel = getAppLanguageLabel(profile?.language);
  const copy = {
    premiumTitle: isFrench ? "Disponible avec Premium" : "Available with Premium",
    later: isFrench ? "Plus tard" : "Later",
    viewPremium: isFrench ? "Voir Premium" : "See Premium",
    preferencesTitle: isFrench ? "Preferences" : "Preferences",
    preferencesBody: isFrench
      ? "Reglages utiles au fonctionnement quotidien de l'application."
      : "Useful settings for the app's day-to-day behavior.",
    defaultReminder: isFrench ? "Rappel par defaut" : "Default reminder",
    premiumReminderBody: isFrench
      ? "Ce delai est pre-rempli quand tu ajoutes un nouvel abonnement, puis reste modifiable fiche par fiche."
      : "This delay is prefilled when you add a new subscription, then stays editable per subscription.",
    freeReminderBody: isFrench
      ? "Le plan gratuit utilise des rappels simples. Passe au Premium pour personnaliser le delai au niveau du compte et de chaque abonnement."
      : "The free plan uses simple reminders. Upgrade to Premium to customize the delay at account and subscription level.",
    dayD: isFrench ? "Jour J" : "Same day",
    premiumEyebrow: "Premium",
    premiumReminderTitle: isFrench ? "Rappels personnalises" : "Custom reminders",
    premiumReminderPromoBody: isFrench
      ? "Choisis un delai de rappel par defaut pour tout le compte et ajuste ensuite chaque abonnement selon ton rythme."
      : "Choose a default reminder delay for the whole account and then adjust each subscription to your pace.",
    currencyChoose: isFrench ? "Choisir une devise" : "Choose a currency",
    securityTitle: isFrench ? "Securite du compte" : "Account security",
    securityBody: isFrench
      ? "Protige l'acces a ton compte, gere ton mot de passe et ferme le compte si besoin."
      : "Protect account access, manage your password and close the account if needed.",
    currentPassword: isFrench ? "Mot de passe actuel" : "Current password",
    newPassword: isFrench ? "Nouveau mot de passe" : "New password",
    confirmPassword: isFrench
      ? "Confirmer le nouveau mot de passe"
      : "Confirm new password",
    updating: isFrench ? "Mise a jour..." : "Updating...",
    changePassword: isFrench ? "Changer le mot de passe" : "Change password",
    incompleteTitle: isFrench ? "Champs incomplets" : "Incomplete fields",
    incompleteBody: isFrench
      ? "Renseigne ton mot de passe actuel, le nouveau et la confirmation."
      : "Enter your current password, the new one and the confirmation.",
    shortPasswordTitle: isFrench ? "Mot de passe trop court" : "Password too short",
    shortPasswordBody: isFrench
      ? "Le nouveau mot de passe doit contenir au moins 8 caracteres."
      : "The new password must contain at least 8 characters.",
    mismatchTitle: isFrench ? "Confirmation differente" : "Different confirmation",
    mismatchBody: isFrench
      ? "Le nouveau mot de passe et sa confirmation ne correspondent pas."
      : "The new password and its confirmation do not match.",
    passwordUpdatedTitle: isFrench ? "Mot de passe mis a jour" : "Password updated",
    passwordUpdatedBody: isFrench
      ? "Ton mot de passe a bien ete change."
      : "Your password has been updated.",
    passwordUpdateFailed: isFrench ? "Modification impossible" : "Unable to update",
    deletingTitle: isFrench ? "Suppression du compte" : "Delete account",
    deletingBody: isFrench
      ? `Le compte est desactive immediatement, archive pendant ${ACCOUNT_DELETION_RETENTION_DAYS} jours pour des raisons de securite, puis supprime definitivement avec les donnees reliees.`
      : `The account is disabled immediately, archived for ${ACCOUNT_DELETION_RETENTION_DAYS} days for security reasons, then permanently deleted with related data.`,
    deletingProgress: isFrench ? "Suppression..." : "Deleting...",
    deletingAction: isFrench ? "Supprimer mon compte" : "Delete my account",
    deletionScheduledTitle: isFrench ? "Suppression programmee" : "Deletion scheduled",
    deletionScheduledBody: (date: string) =>
      isFrench
        ? `Ton compte et toutes les donnees liees sont archives jusqu'au ${date} pour des raisons de securite, puis seront supprimes definitivement.`
        : `Your account and all related data are archived until ${date} for security reasons, then will be permanently deleted.`,
    deletionFailedTitle: isFrench ? "Suppression impossible" : "Unable to delete account",
    confirmDeletionTitle: isFrench ? "Supprimer ton compte ?" : "Delete your account?",
    confirmDeletionBody: isFrench
      ? `Ton compte sera desactive tout de suite. Toutes les donnees reliees seront archivees pendant ${ACCOUNT_DELETION_RETENTION_DAYS} jours pour des raisons de securite, puis supprimees definitivement.`
      : `Your account will be disabled right away. All related data will be archived for ${ACCOUNT_DELETION_RETENTION_DAYS} days for security reasons, then permanently deleted.`,
    cancel: isFrench ? "Annuler" : "Cancel",
    legalTitle: isFrench ? "Cadre legal et RGPD" : "Legal and privacy",
    legalBody: isFrench
      ? "Ces rubriques regroupent la FAQ, les informations necessaires sur l'editeur, la confidentialite, les droits des personnes, la conservation, la securite et les permissions de l'application."
      : "These sections gather the FAQ, publisher information, privacy details, data rights, retention, security and app permissions.",
    accountCurrency: isFrench ? "Devise du compte" : "Account currency",
    currencySubtitle: isFrench
      ? "Choisis la devise de reference du compte parmi les devises utilisees dans le monde."
      : "Choose the account reference currency from currencies used worldwide.",
    currencySearch: isFrench ? "Rechercher par code ou nom" : "Search by code or name"
  };

  const handleOpenPremium = (feature: string) => {
    Alert.alert(copy.premiumTitle, `${feature} ${isFrench ? "fait partie des avantages Premium." : "is part of Premium benefits."}`, [
      {
        text: copy.later,
        style: "cancel"
      },
      {
        text: copy.viewPremium,
        onPress: () => navigation.navigate("Profile")
      }
    ]);
  };

  const legalLinks = useMemo<LegalLink[]>(
    () =>
      LEGAL_DOCUMENT_ORDER.map((documentId) => {
        const document = getLegalDocument(documentId);

        return {
          id: document.id,
          title: document.title,
          description: document.subtitle
        };
      }),
    []
  );
  const filteredCurrencies = useMemo(() => {
    const normalizedQuery = normalizeSearch(currencyQuery);

    return ALL_CURRENCY_OPTIONS.filter((option) => {
      if (!normalizedQuery) {
        return true;
      }

      const haystack = normalizeSearch(`${option.code} ${option.name}`);
      return haystack.includes(normalizedQuery);
    });
  }, [currencyQuery]);
  const filteredLanguages = useMemo(() => {
    const normalizedQuery = normalizeAppLanguageSearch(languageQuery);

    return APP_LANGUAGE_OPTIONS.filter((option) => {
      if (!normalizedQuery) {
        return true;
      }

      const haystack = normalizeAppLanguageSearch(`${option.label} ${option.value}`);
      return haystack.includes(normalizedQuery);
    });
  }, [languageQuery]);

  const handleToggle = async (
    field:
      | "notificationsEnabled"
      | "paymentReminders"
      | "trialReminders"
      | "insightNotifications",
    value: boolean
  ) => {
    try {
      await updateSettings({
        notificationPreferences: {
          [field]: value
        }
      });
    } catch (error) {
      Alert.alert(
        t("settings.updateErrorTitle"),
        error instanceof Error ? error.message : t("common.retry")
      );
    }
  };

  const handleColorBlindToggle = async (value: boolean) => {
    try {
      await updateSettings({ colorBlindMode: value });
    } catch (error) {
      Alert.alert(
        t("settings.updateErrorTitle"),
        error instanceof Error ? error.message : t("common.retry")
      );
    }
  };

  const handleDefaultReminderChange = async (value: number) => {
    if (!isPremium) {
      handleOpenPremium(isFrench ? "Les rappels personnalises" : "Custom reminders");
      return;
    }

    if (value === defaultReminderDaysBefore) {
      return;
    }

    try {
      await updateSettings({
        notificationPreferences: {
          defaultReminderDaysBefore: value
        }
      });
    } catch (error) {
      Alert.alert(
        t("settings.updateErrorTitle"),
        error instanceof Error ? error.message : t("common.retry")
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      resetWorkspace();
    } catch (error) {
      Alert.alert(
        t("settings.disconnectErrorTitle"),
        error instanceof Error ? error.message : t("common.retry")
      );
    }
  };

  const handleCurrencyChange = async (currencyCode: string) => {
    if (currencyCode === currentCurrency) {
      setCurrencyModalVisible(false);
      return;
    }

    try {
      await updateSettings({ currency: currencyCode });
      setCurrencyQuery("");
      setCurrencyModalVisible(false);
    } catch (error) {
      Alert.alert(
        t("settings.updateErrorTitle"),
        error instanceof Error ? error.message : t("common.retry")
      );
    }
  };

  const handleLanguageChange = async (languageValue: string) => {
    if (languageValue === currentLanguage) {
      setLanguageModalVisible(false);
      return;
    }

    try {
      await updateSettings({ language: languageValue });
      setLanguageQuery("");
      setLanguageModalVisible(false);
    } catch (error) {
      Alert.alert(
        t("settings.updateErrorTitle"),
        error instanceof Error ? error.message : t("common.retry")
      );
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !nextPassword.trim() || !confirmPassword.trim()) {
      Alert.alert(copy.incompleteTitle, copy.incompleteBody);
      return;
    }

    if (nextPassword.length < 8) {
      Alert.alert(copy.shortPasswordTitle, copy.shortPasswordBody);
      return;
    }

    if (nextPassword !== confirmPassword) {
      Alert.alert(copy.mismatchTitle, copy.mismatchBody);
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword(currentPassword, nextPassword);
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      Alert.alert(copy.passwordUpdatedTitle, copy.passwordUpdatedBody);
    } catch (error) {
      Alert.alert(
        copy.passwordUpdateFailed,
        error instanceof Error ? error.message : t("common.retry")
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const runAccountDeletion = async () => {
    try {
      setIsDeletingAccount(true);
      const deletion = await sublyApi.requestAccountDeletion();
      const scheduledDate = new Date(deletion.deletionScheduledFor).toLocaleDateString(
        isFrench ? "fr-FR" : "en-US"
      );

      await authService.signOut();
      resetWorkspace();

      Alert.alert(
        copy.deletionScheduledTitle,
        copy.deletionScheduledBody(scheduledDate)
      );
    } catch (error) {
      Alert.alert(
        copy.deletionFailedTitle,
        error instanceof Error ? error.message : t("common.retry")
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleRequestAccountDeletion = () => {
    Alert.alert(
      copy.confirmDeletionTitle,
      copy.confirmDeletionBody,
      [
        {
          text: copy.cancel,
          style: "cancel"
        },
        {
          text: copy.deletingAction,
          style: "destructive",
          onPress: () => {
            void runAccountDeletion();
          }
        }
      ]
    );
  };

  return (
    <Screen
      title={t("settings.title")}
      subtitle={t("settings.subtitle")}
      action={<PrimaryButton title={t("common.back")} onPress={navigation.goBack} variant="secondary" />}
    >
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{copy.preferencesTitle}</Text>
        <Text style={styles.helper}>{copy.preferencesBody}</Text>
        <LegalLinkRow
          title={t("settings.notificationCenter")}
          description={t("settings.notificationCenterBody")}
          onPress={() => navigation.navigate("NotificationCenter")}
          styles={styles}
        />
        <SettingsRow
          label={t("settings.notificationsEnabled")}
          value={notificationsEnabled}
          onValueChange={(value) => void handleToggle("notificationsEnabled", value)}
          disabled={isUpdatingSettings || isDeletingAccount}
          styles={styles}
          theme={theme}
        />
        <SettingsRow
          label={t("settings.paymentReminders")}
          value={notificationsEnabled ? preferences?.paymentReminders ?? true : false}
          onValueChange={(value) => void handleToggle("paymentReminders", value)}
          disabled={isUpdatingSettings || isDeletingAccount || !notificationsEnabled}
          styles={styles}
          theme={theme}
        />
        <SettingsRow
          label={t("settings.trialReminders")}
          value={notificationsEnabled ? preferences?.trialReminders ?? true : false}
          onValueChange={(value) => void handleToggle("trialReminders", value)}
          disabled={isUpdatingSettings || isDeletingAccount || !notificationsEnabled}
          styles={styles}
          theme={theme}
        />
        <SettingsRow
          label={t("settings.smartNotifications")}
          value={notificationsEnabled ? preferences?.insightNotifications ?? true : false}
          onValueChange={(value) => void handleToggle("insightNotifications", value)}
          disabled={isUpdatingSettings || isDeletingAccount || !notificationsEnabled}
          styles={styles}
          theme={theme}
        />
        <SettingsRow
          label={t("settings.colorBlindMode")}
          value={profile?.colorBlindMode ?? false}
          onValueChange={(value) => void handleColorBlindToggle(value)}
          disabled={isUpdatingSettings || isDeletingAccount}
          styles={styles}
          theme={theme}
        />

        <View style={styles.reminderCard}>
          <Text style={styles.infoLabel}>{copy.defaultReminder}</Text>
          <Text style={styles.infoValue}>{formatReminderDays(defaultReminderDaysBefore)}</Text>
          <Text style={styles.helper}>
            {isPremium
              ? copy.premiumReminderBody
              : copy.freeReminderBody}
          </Text>
          <View style={styles.reminderChipRow}>
            {[0, 1, 3, 5, 7, 14].map((value) => {
              const isActive = defaultReminderDaysBefore === value;

              return (
                <Pressable
                  key={value}
                  onPress={() => void handleDefaultReminderChange(value)}
                  disabled={isUpdatingSettings || isDeletingAccount}
                  style={[
                    styles.reminderChip,
                    isActive ? styles.reminderChipActive : null
                  ]}
                >
                  <Text
                    style={[
                      styles.reminderChipLabel,
                      isActive ? styles.reminderChipLabelActive : null
                    ]}
                  >
                    {value === 0 ? copy.dayD : `${value} j`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {!isPremium ? (
          <PromoCard
            eyebrow={copy.premiumEyebrow}
            title={copy.premiumReminderTitle}
            body={copy.premiumReminderPromoBody}
            ctaLabel={copy.viewPremium}
            onPress={() => navigation.navigate("Profile")}
            tone="purple"
          />
        ) : null}

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>{t("settings.appLanguage")}</Text>
          <Pressable
            onPress={() => setLanguageModalVisible(true)}
            disabled={isUpdatingSettings || isDeletingAccount}
            style={styles.currencySelector}
          >
            <View style={styles.currencySelectorText}>
              <Text style={styles.infoValue}>{activeLanguageLabel}</Text>
              <Text style={styles.currencyHelper}>{t("settings.chooseLanguage")}</Text>
            </View>
            <Text style={styles.linkChevron}>{">"}</Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>{t("settings.activeCurrency")}</Text>
          <Pressable
            onPress={() => setCurrencyModalVisible(true)}
            disabled={isUpdatingSettings || isDeletingAccount}
            style={styles.currencySelector}
          >
            <View style={styles.currencySelectorText}>
              <Text style={styles.infoValue}>{currentCurrency}</Text>
              <Text style={styles.currencyHelper}>
                {activeCurrencyOption?.name ?? copy.currencyChoose}
              </Text>
            </View>
            <Text style={styles.linkChevron}>{">"}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{copy.securityTitle}</Text>
        <Text style={styles.helper}>{copy.securityBody}</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder={copy.currentPassword}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={nextPassword}
          onChangeText={setNextPassword}
          placeholder={copy.newPassword}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={copy.confirmPassword}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry
          autoCapitalize="none"
        />
        <PrimaryButton
          title={isChangingPassword ? copy.updating : copy.changePassword}
          onPress={() => void handleChangePassword()}
          disabled={isChangingPassword || isDeletingAccount}
          variant="secondary"
        />

        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>{copy.deletingTitle}</Text>
          <Text style={styles.dangerText}>{copy.deletingBody}</Text>
          <PrimaryButton
            title={isDeletingAccount ? copy.deletingProgress : copy.deletingAction}
            onPress={handleRequestAccountDeletion}
            disabled={isDeletingAccount || isChangingPassword}
            variant="secondary"
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{copy.legalTitle}</Text>
        <Text style={styles.helper}>{copy.legalBody}</Text>
        <View style={styles.linkStack}>
          {legalLinks.map((link) => (
            <LegalLinkRow
              key={link.id}
              title={link.title}
              description={link.description}
              onPress={() =>
                navigation.navigate("LegalDocument", {
                  documentId: link.id
                })
              }
              styles={styles}
            />
          ))}
        </View>
      </View>

      <PrimaryButton
        title={t("settings.logout")}
        onPress={() => void handleSignOut()}
        variant="secondary"
        disabled={isDeletingAccount}
      />

      <Modal
        visible={isLanguageModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setLanguageModalVisible(false)} />
          <View style={[styles.sheet, isCompact ? styles.sheetCompact : null]}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderText}>
                <Text style={styles.sheetEyebrow}>{t("settings.languageEyebrow")}</Text>
                <Text style={styles.sheetTitle}>{activeLanguageLabel}</Text>
                <Text style={styles.sheetSubtitle}>{t("settings.languageSubtitle")}</Text>
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={() => setLanguageModalVisible(false)}
              >
                <Text style={styles.closeButtonLabel}>X</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              value={languageQuery}
              onChangeText={setLanguageQuery}
              placeholder={t("settings.searchLanguage")}
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.currencyList}
            >
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((option) => {
                  const isActive = option.value === currentLanguage;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => void handleLanguageChange(option.value)}
                      disabled={isUpdatingSettings}
                      style={[
                        styles.currencyOptionRow,
                        isActive ? styles.currencyOptionRowActive : null
                      ]}
                    >
                      <View style={styles.currencyOptionText}>
                        <Text style={styles.currencyOptionCode}>{option.label}</Text>
                        <Text style={styles.currencyOptionName}>
                          {option.textLocale.toUpperCase()}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.currencyOptionStatus,
                          isActive ? styles.currencyOptionStatusActive : null
                        ]}
                      >
                        {isActive ? t("settings.current") : t("settings.select")}
                      </Text>
                    </Pressable>
                  );
                })
              ) : (
                <View style={styles.emptySheetState}>
                  <Text style={styles.emptySheetTitle}>{t("settings.noLanguageFoundTitle")}</Text>
                  <Text style={styles.emptySheetBody}>{t("settings.noLanguageFoundBody")}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isCurrencyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setCurrencyModalVisible(false)} />
          <View style={[styles.sheet, isCompact ? styles.sheetCompact : null]}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderText}>
                <Text style={styles.sheetEyebrow}>{copy.accountCurrency}</Text>
                <Text style={styles.sheetTitle}>{currentCurrency}</Text>
                <Text style={styles.sheetSubtitle}>{copy.currencySubtitle}</Text>
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={() => setCurrencyModalVisible(false)}
              >
                <Text style={styles.closeButtonLabel}>X</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              value={currencyQuery}
              onChangeText={setCurrencyQuery}
              placeholder={copy.currencySearch}
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="characters"
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.currencyList}
            >
              {filteredCurrencies.map((option) => {
                const isActive = option.code === currentCurrency;

                return (
                  <Pressable
                    key={option.code}
                    onPress={() => void handleCurrencyChange(option.code)}
                    disabled={isUpdatingSettings}
                    style={[
                      styles.currencyOptionRow,
                      isActive ? styles.currencyOptionRowActive : null
                    ]}
                  >
                    <View style={styles.currencyOptionText}>
                      <Text style={styles.currencyOptionCode}>{option.code}</Text>
                      <Text style={styles.currencyOptionName}>{option.name}</Text>
                    </View>
                    <Text
                      style={[
                        styles.currencyOptionStatus,
                        isActive ? styles.currencyOptionStatusActive : null
                      ]}
                    >
                      {isActive ? t("settings.current") : t("settings.select")}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function SettingsRow({
  label,
  value,
  onValueChange,
  disabled = false,
  styles,
  theme
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  styles: ReturnType<typeof createStyles>;
  theme: AppTheme;
}): JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ true: theme.colors.secondary, false: theme.colors.surfaceContrast }}
        thumbColor={value ? theme.colors.primary : theme.colors.white}
      />
    </View>
  );
}

function LegalLinkRow({
  title,
  description,
  onPress,
  styles
}: {
  title: string;
  description: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}): JSX.Element {
  return (
    <Pressable onPress={onPress} style={styles.linkRow}>
      <View style={styles.linkText}>
        <Text style={styles.linkTitle}>{title}</Text>
        <Text style={styles.linkDescription}>{description}</Text>
      </View>
      <Text style={styles.linkChevron}>{">"}</Text>
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: radius.md,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md
    },
    label: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.textPrimary
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    helper: {
      fontSize: 13,
      lineHeight: 19,
      color: theme.colors.textSecondary
    },
    reminderCard: {
      marginTop: spacing.xs,
      padding: spacing.md,
      gap: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    reminderChipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    reminderChip: {
      minHeight: 38,
      paddingHorizontal: spacing.md,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    reminderChipActive: {
      backgroundColor: theme.colors.surfaceContrast,
      borderColor: theme.colors.primary
    },
    reminderChipLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textSecondary
    },
    reminderChipLabelActive: {
      color: theme.colors.primary
    },
    infoCard: {
      marginTop: spacing.xs,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: spacing.xs
    },
    infoLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary
    },
    currencySelector: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md
    },
    currencySelectorText: {
      flex: 1,
      gap: 4
    },
    infoValue: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    currencyHelper: {
      fontSize: 13,
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
      backgroundColor: theme.colors.surface
    },
    dangerCard: {
      marginTop: spacing.sm,
      padding: spacing.md,
      gap: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.danger,
      backgroundColor: "rgba(255, 102, 122, 0.08)"
    },
    dangerTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    dangerText: {
      fontSize: 14,
      lineHeight: 21,
      color: theme.colors.textPrimary
    },
    linkStack: {
      gap: spacing.sm
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.md
    },
    linkText: {
      flex: 1,
      gap: 4
    },
    linkTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    linkDescription: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.colors.textSecondary
    },
    linkChevron: {
      fontSize: 20,
      lineHeight: 20,
      color: theme.colors.textSecondary
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
      maxHeight: "86%",
      backgroundColor: theme.colors.backgroundElevated,
      borderTopLeftRadius: radius.md,
      borderTopRightRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong
    },
    sheetCompact: {
      paddingHorizontal: spacing.md
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.md,
      marginBottom: spacing.md
    },
    sheetHeaderText: {
      flex: 1,
      gap: 4
    },
    sheetEyebrow: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.6
    },
    sheetTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.colors.textPrimary
    },
    sheetSubtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textSecondary
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
    currencyList: {
      paddingTop: spacing.md,
      gap: spacing.sm,
      paddingBottom: spacing.sm
    },
    emptySheetState: {
      minHeight: 180,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.lg
    },
    emptySheetTitle: {
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
      color: theme.colors.textPrimary
    },
    emptySheetBody: {
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
      color: theme.colors.textSecondary
    },
    currencyOptionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm
    },
    currencyOptionRowActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceContrast
    },
    currencyOptionText: {
      flex: 1,
      gap: 4
    },
    currencyOptionCode: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    currencyOptionName: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.textSecondary
    },
    currencyOptionStatus: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textTertiary,
      textTransform: "uppercase"
    },
    currencyOptionStatusActive: {
      color: theme.colors.primary
    }
  });

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
