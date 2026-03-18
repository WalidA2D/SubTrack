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
  getLegalDocument,
  LEGAL_DOCUMENT_ORDER,
  type LegalDocumentId
} from "../../constants/legalDocuments";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAppTranslation } from "../../i18n";
import { authService } from "../../services/authService";
import { sublyApi } from "../../services/sublyApi";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { AppTheme, radius, spacing, useAppTheme } from "../../theme";

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
  const { t } = useAppTranslation();
  const styles = createStyles(theme);
  const profile = useWorkspaceStore((state) => state.profile);
  const isUpdatingSettings = useWorkspaceStore((state) => state.isLoading);
  const updateSettings = useWorkspaceStore((state) => state.updateSettings);
  const resetWorkspace = useWorkspaceStore((state) => state.reset);
  const preferences = profile?.notificationPreferences;
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currencyQuery, setCurrencyQuery] = useState("");
  const [isCurrencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const currentCurrency = profile?.currency ?? "EUR";
  const activeCurrencyOption =
    ALL_CURRENCY_OPTIONS.find((option) => option.code === currentCurrency) ?? null;

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

  const handleToggle = async (
    field: "paymentReminders" | "trialReminders" | "insightNotifications",
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

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !nextPassword.trim() || !confirmPassword.trim()) {
      Alert.alert(
        "Champs incomplets",
        "Renseigne ton mot de passe actuel, le nouveau et la confirmation."
      );
      return;
    }

    if (nextPassword.length < 8) {
      Alert.alert(
        "Mot de passe trop court",
        "Le nouveau mot de passe doit contenir au moins 8 caracteres."
      );
      return;
    }

    if (nextPassword !== confirmPassword) {
      Alert.alert(
        "Confirmation differente",
        "Le nouveau mot de passe et sa confirmation ne correspondent pas."
      );
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword(currentPassword, nextPassword);
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      Alert.alert(
        "Mot de passe mis a jour",
        "Ton mot de passe a bien ete change."
      );
    } catch (error) {
      Alert.alert(
        "Modification impossible",
        error instanceof Error ? error.message : "Merci de reessayer."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const runAccountDeletion = async () => {
    try {
      setIsDeletingAccount(true);
      const deletion = await sublyApi.requestAccountDeletion();
      const scheduledDate = new Date(deletion.deletionScheduledFor).toLocaleDateString("fr-FR");

      await authService.signOut();
      resetWorkspace();

      Alert.alert(
        "Suppression programmee",
        `Ton compte et toutes les donnees liees sont archives jusqu'au ${scheduledDate} pour des raisons de securite, puis seront supprimes definitivement.`
      );
    } catch (error) {
      Alert.alert(
        "Suppression impossible",
        error instanceof Error ? error.message : "Merci de reessayer."
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleRequestAccountDeletion = () => {
    Alert.alert(
      "Supprimer ton compte ?",
      `Ton compte sera desactive tout de suite. Toutes les donnees reliees seront archivees pendant ${ACCOUNT_DELETION_RETENTION_DAYS} jours pour des raisons de securite, puis supprimees definitivement.`,
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer mon compte",
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
      subtitle="Centralise ici les preferences, la securite du compte et toutes les informations legales utiles a la conformite RGPD."
      action={<PrimaryButton title={t("common.back")} onPress={navigation.goBack} variant="secondary" />}
    >
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Text style={styles.helper}>
          Reglages utiles au fonctionnement quotidien de l'application.
        </Text>
        <SettingsRow
          label={t("settings.paymentReminders")}
          value={preferences?.paymentReminders ?? true}
          onValueChange={(value) => void handleToggle("paymentReminders", value)}
          disabled={isUpdatingSettings || isDeletingAccount}
          styles={styles}
          theme={theme}
        />
        <SettingsRow
          label={t("settings.trialReminders")}
          value={preferences?.trialReminders ?? true}
          onValueChange={(value) => void handleToggle("trialReminders", value)}
          disabled={isUpdatingSettings || isDeletingAccount}
          styles={styles}
          theme={theme}
        />
        <SettingsRow
          label={t("settings.smartNotifications")}
          value={preferences?.insightNotifications ?? true}
          onValueChange={(value) => void handleToggle("insightNotifications", value)}
          disabled={isUpdatingSettings || isDeletingAccount}
          styles={styles}
          theme={theme}
        />

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
                {activeCurrencyOption?.name ?? "Choisir une devise"}
              </Text>
            </View>
            <Text style={styles.linkChevron}>{">"}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Securite du compte</Text>
        <Text style={styles.helper}>
          Protige l'acces a ton compte, gere ton mot de passe et ferme le compte si besoin.
        </Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Mot de passe actuel"
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={nextPassword}
          onChangeText={setNextPassword}
          placeholder="Nouveau mot de passe"
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirmer le nouveau mot de passe"
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry
          autoCapitalize="none"
        />
        <PrimaryButton
          title={isChangingPassword ? "Mise a jour..." : "Changer le mot de passe"}
          onPress={() => void handleChangePassword()}
          disabled={isChangingPassword || isDeletingAccount}
          variant="secondary"
        />

        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>Suppression du compte</Text>
          <Text style={styles.dangerText}>
            Le compte est desactive immediatement, archive pendant {ACCOUNT_DELETION_RETENTION_DAYS} jours
            pour des raisons de securite, puis supprime definitivement avec les donnees reliees.
          </Text>
          <PrimaryButton
            title={isDeletingAccount ? "Suppression..." : "Supprimer mon compte"}
            onPress={handleRequestAccountDeletion}
            disabled={isDeletingAccount || isChangingPassword}
            variant="secondary"
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cadre legal et RGPD</Text>
        <Text style={styles.helper}>
          Ces rubriques regroupent la FAQ, les informations necessaires sur l'editeur, la confidentialite, les droits des personnes, la conservation, la securite et les permissions de l'application.
        </Text>
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
                <Text style={styles.sheetEyebrow}>Devise du compte</Text>
                <Text style={styles.sheetTitle}>{currentCurrency}</Text>
                <Text style={styles.sheetSubtitle}>
                  Choisis la devise de reference du compte parmi les devises utilisees dans le monde.
                </Text>
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
              placeholder="Rechercher par code ou nom"
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
                      {isActive ? "Actuelle" : "Choisir"}
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
