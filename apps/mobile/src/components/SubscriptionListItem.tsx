import { useRef } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { Subscription } from "@subly/shared";

import { ServiceLogo } from "./ServiceLogo";
import { AppTheme, radius, shadows, spacing, useAppTheme } from "../theme";
import { formatBillingFrequency, formatCurrency, formatShortDate } from "../utils/format";

type SubscriptionListItemProps = {
  subscription: Subscription;
  onPress?: () => void;
  onArchive?: () => Promise<void> | void;
  archiveLabel?: string;
  archiveLoadingLabel?: string;
  isArchiving?: boolean;
  isDueSoon?: boolean;
  isIncludedLink?: boolean;
  linkedParentProviderNames?: string[];
  linkedParentSubscriptions?: Array<Pick<Subscription, "id" | "providerName" | "logoMode">>;
};

export function SubscriptionListItem({
  subscription,
  onPress,
  onArchive,
  archiveLabel = "Archiver",
  archiveLoadingLabel = "Archivage",
  isArchiving = false,
  isDueSoon = false,
  isIncludedLink = false,
  linkedParentProviderNames,
  linkedParentSubscriptions
}: SubscriptionListItemProps): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const lastLongPressAtRef = useRef(0);
  const canArchive = Boolean(onArchive) && !isArchiving && !isIncludedLink;
  const cardStyles = [
    styles.card,
    isIncludedLink ? styles.cardIncludedLink : null,
    isDueSoon ? styles.cardDueSoon : null,
    isArchiving ? styles.cardDisabled : null
  ];
  const providerStyles = [styles.provider, isDueSoon ? styles.providerDueSoon : null];
  const sublineStyles = [styles.subline, isDueSoon ? styles.sublineDueSoon : null];
  const priceStyles = [
    styles.price,
    isIncludedLink ? styles.priceIncludedLink : null,
    isDueSoon ? styles.priceDueSoon : null
  ];
  const metaStyles = [
    styles.meta,
    isIncludedLink ? styles.metaIncludedLink : null,
    isDueSoon ? styles.metaDueSoon : null
  ];
  const primaryLinkedParent = linkedParentSubscriptions?.[0] ?? null;
  const linkedParentText = linkedParentProviderNames?.join(", ") ?? "";
  const sublineText = isIncludedLink
    ? `Inclus via ${linkedParentText || "un autre abonnement"}`
    : `${subscription.categoryName} - ${formatShortDate(subscription.nextBillingDate)}`;
  const linkedLabelText =
    !isIncludedLink && linkedParentText ? `Lie a ${linkedParentText}` : null;
  const trailingPriceText = isIncludedLink
    ? "Inclus"
    : formatCurrency(subscription.price, subscription.currency);
  const trailingMetaText = isIncludedLink
    ? "Service lie"
    : formatBillingFrequency(subscription.billingFrequency);

  const handleCardPress = () => {
    if (Date.now() - lastLongPressAtRef.current < 900) {
      return;
    }

    onPress?.();
  };

  const handleCardLongPress = () => {
    if (!canArchive || !onArchive) {
      return;
    }

    lastLongPressAtRef.current = Date.now();
    Alert.alert(
      "Archiver l'abonnement ?",
      `Veux-tu archiver ${subscription.providerName} ?`,
      [
        {
          text: "Non",
          style: "cancel"
        },
        {
          text: archiveLabel,
          style: "destructive",
          onPress: () => {
            void onArchive();
          }
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <Pressable
        style={cardStyles}
      onPress={handleCardPress}
      onLongPress={handleCardLongPress}
      delayLongPress={340}
      disabled={isArchiving && !onPress}
    >
      <View style={[styles.row, isCompact ? styles.rowCompact : null]}>
        <View style={styles.identityRow}>
          <View style={styles.logoWrap}>
            <ServiceLogo
              providerName={subscription.providerName}
              logoMode={subscription.logoMode}
              size={52}
            />
            {primaryLinkedParent ? (
              <View style={styles.parentLogoBadge}>
                <ServiceLogo
                  providerName={primaryLinkedParent.providerName}
                  logoMode={primaryLinkedParent.logoMode}
                  size={22}
                />
              </View>
            ) : null}
          </View>
          <View style={styles.identity}>
            <Text style={providerStyles}>{subscription.providerName}</Text>
            <Text style={sublineStyles}>{sublineText}</Text>
            {linkedLabelText ? (
              <Text style={styles.linkedLabel}>{linkedLabelText}</Text>
            ) : null}
            {isArchiving ? (
              <Text style={styles.archivingLabel}>{archiveLoadingLabel}</Text>
            ) : null}
          </View>
        </View>
        <View style={[styles.trailing, isCompact ? styles.trailingCompact : null]}>
          <Text style={priceStyles}>{trailingPriceText}</Text>
          <Text style={metaStyles}>{trailingMetaText}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...shadows.card
    },
    cardDueSoon: {
      backgroundColor: withAlpha(theme.colors.warning, theme.colorBlindMode ? 0.16 : 0.12),
      borderColor: withAlpha(theme.colors.warning, 0.78)
    },
    cardIncludedLink: {
      backgroundColor: theme.colors.surfaceRaised,
      borderStyle: "dashed"
    },
    cardDisabled: {
      opacity: 0.78
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md
    },
    rowCompact: {
      flexDirection: "column",
      alignItems: "flex-start"
    },
    identityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      flex: 1
    },
    logoWrap: {
      width: 58,
      height: 58,
      justifyContent: "center",
      alignItems: "center"
    },
    parentLogoBadge: {
      position: "absolute",
      right: -2,
      bottom: -2,
      padding: 2,
      borderRadius: 999,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong
    },
    identity: {
      flex: 1,
      gap: 5
    },
    provider: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.textPrimary
    },
    providerDueSoon: {
      color: theme.colors.white
    },
    subline: {
      fontSize: 13,
      color: theme.colors.textSecondary
    },
    sublineDueSoon: {
      color: withAlpha(theme.colors.white, 0.86)
    },
    linkedLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.secondary
    },
    archivingLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.primary
    },
    trailing: {
      alignItems: "flex-end",
      gap: 5
    },
    trailingCompact: {
      minWidth: 88,
      alignItems: "flex-start"
    },
    price: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.primary
    },
    priceIncludedLink: {
      color: theme.colors.secondary
    },
    priceDueSoon: {
      color: theme.colors.white
    },
    meta: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textTransform: "capitalize"
    },
    metaIncludedLink: {
      color: theme.colors.textTertiary
    },
    metaDueSoon: {
      color: withAlpha(theme.colors.white, 0.86)
    }
  });

function withAlpha(color: string, alpha: number): string {
  const normalized = color.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return color;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
