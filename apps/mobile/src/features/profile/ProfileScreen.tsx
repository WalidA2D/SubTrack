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
import { FREE_PLAN_MAX_SUBSCRIPTIONS } from "@subly/shared";

import { PrimaryButton } from "../../components/PrimaryButton";
import { Screen } from "../../components/Screen";
import { useAuthStore } from "../../store/authStore";
import { useAppNavigation } from "../../store/navigationStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { colors, radius, shadows, spacing } from "../../theme";

type OfferPlan = {
  id: "free" | "premium_monthly" | "premium_yearly";
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  highlight?: string;
  tone: "neutral" | "orange" | "purple";
  cta: string;
};

const OFFER_PLANS: OfferPlan[] = [
  {
    id: "free",
    title: "Gratuit",
    price: "0 €",
    subtitle: "Pour demarrer sans engagement",
    features: [
      `${FREE_PLAN_MAX_SUBSCRIPTIONS} abonnements`,
      "Statistiques basiques",
      "Rappels simples",
      "Pub"
    ],
    tone: "neutral",
    cta: "Rester gratuit"
  },
  {
    id: "premium_monthly",
    title: "Premium",
    price: "2,99 €/mois",
    subtitle: "Flexible et sans engagement annuel",
    features: [
      "Abonnements illimites",
      "Rappels avances",
      "Export PDF",
      "Pas de pub"
    ],
    highlight: "Le plus souple",
    tone: "orange",
    cta: "Choisir le mensuel"
  },
  {
    id: "premium_yearly",
    title: "Premium annuel",
    price: "19,99 €/an",
    subtitle: "La formule la plus rentable",
    features: [
      "Tout Premium",
      "33% moins cher",
      "Abonnements illimites",
      "Pas de pub"
    ],
    highlight: "Meilleure offre",
    tone: "purple",
    cta: "Choisir l'annuel"
  }
];

export function ProfileScreen(): JSX.Element {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const navigation = useAppNavigation();
  const session = useAuthStore((state) => state.session);
  const profile = useWorkspaceStore((state) => state.profile);
  const subscriptions = useWorkspaceStore((state) => state.subscriptions);
  const displayName = profile?.displayName ?? session?.displayName ?? "Sarah Martin";
  const [isPremiumModalVisible, setPremiumModalVisible] = useState(false);

  const handleSelectOffer = (offer: OfferPlan) => {
    if (offer.id === "free") {
      setPremiumModalVisible(false);
      return;
    }

    Alert.alert(
      "Paiement bientot disponible",
      `L'offre ${offer.title} sera bientot connectee au vrai paiement in-app.`
    );
  };

  return (
    <>
      <Screen
        title="Profil"
        subtitle="Retrouve ici ton identite, ton plan actuel et les futurs controles de facturation."
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
              {profile?.planTier === "premium" ? "Plan Premium" : "Plan Gratuit"}
            </Text>
          </View>
          <Text style={styles.meta}>Devise : {profile?.currency ?? "EUR"}</Text>
          <Text style={styles.meta}>Abonnements actifs : {subscriptions.length}</Text>
        </View>

        <View style={styles.premiumCard}>
          <Text style={styles.premiumTitle}>Passe au niveau Premium</Text>
          <Text style={styles.premiumBody}>
            Debloque les abonnements illimites, des rappels personnalises, l'export PDF et
            une experience sans pub.
          </Text>
          <PrimaryButton
            title="Passer au Premium"
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
                <Text style={styles.sheetTitle}>2,99 € / mois</Text>
                <Text style={styles.sheetOr}>ou</Text>
                <Text style={styles.sheetTitleSecondary}>19,99 € / an</Text>
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={() => setPremiumModalVisible(false)}
              >
                <Text style={styles.closeButtonLabel}>X</Text>
              </Pressable>
            </View>

            <Text style={styles.sheetSubtitle}>
              Compare rapidement les formules avant l'integration du paiement in-app.
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.offerList}
            >
              {OFFER_PLANS.map((offer) => (
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
                      <View key={`${offer.id}_${feature}`} style={styles.featureRow}>
                        <View
                          style={[
                            styles.featureDot,
                            offer.tone === "orange" ? styles.featureDotOrange : null,
                            offer.tone === "purple" ? styles.featureDotPurple : null
                          ]}
                        />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <PrimaryButton
                    title={offer.cta}
                    onPress={() => handleSelectOffer(offer)}
                    variant={offer.id === "free" ? "secondary" : "primary"}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContrast,
    borderWidth: 1,
    borderColor: colors.borderStrong
  },
  avatarLabel: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary
  },
  email: {
    fontSize: 15,
    color: colors.textSecondary
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surfaceContrast
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary
  },
  premiumCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 184, 77, 0.34)"
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary
  },
  premiumBody: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary
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
    maxHeight: "88%",
    backgroundColor: colors.backgroundElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
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
    color: colors.primary
  },
  sheetTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.textPrimary
  },
  sheetOr: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textTertiary,
    textTransform: "uppercase"
  },
  sheetTitleSecondary: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.secondary
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border
  },
  closeButtonLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textSecondary
  },
  sheetSubtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary
  },
  offerList: {
    paddingTop: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.sm
  },
  offerCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
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
    color: colors.textPrimary
  },
  offerPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary
  },
  offerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary
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
    color: colors.textPrimary
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
    backgroundColor: colors.textTertiary
  },
  featureDotOrange: {
    backgroundColor: colors.primary
  },
  featureDotPurple: {
    backgroundColor: colors.secondary
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary
  }
});
