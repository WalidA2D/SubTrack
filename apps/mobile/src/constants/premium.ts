import {
  FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION,
  FREE_PLAN_MAX_SUBSCRIPTIONS,
  UserProfile
} from "@subly/shared";

export type PremiumFeatureState = "available" | "coming_soon";

export type PremiumComparisonRow = {
  id:
    | "subscription_capacity"
    | "included_services"
    | "cloud_sync"
    | "auto_backup"
    | "advanced_statistics"
    | "billing_calendar"
    | "annual_forecast"
    | "low_usage_detection"
    | "custom_reminders"
    | "pdf_export"
    | "ads";
  title: string;
  description: string;
  freeValue: string;
  premiumValue: string;
  premiumState?: PremiumFeatureState;
};

export const PREMIUM_MONTHLY_PRICE = "2,99 EUR/mois";
export const PREMIUM_YEARLY_PRICE = "19,99 EUR/an";
export const PREMIUM_YEARLY_LIFETIME_OFFER_PRICE = "9,99 EUR/an";
export const PREMIUM_MONTHLY_AMOUNT = 2.99;
export const PREMIUM_YEARLY_AMOUNT = 19.99;
export const PREMIUM_YEARLY_LIFETIME_OFFER_AMOUNT = 9.99;
export const PREMIUM_MEMBERSHIP_PROVIDER_NAME = "Subly Premium";

export const FREE_PLAN_FEATURES = [
  `${FREE_PLAN_MAX_SUBSCRIPTIONS} abonnements actifs`,
  `${FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION} services inclus max par abonnement`,
  "Prevision budget annuel",
  "Statistiques de base",
  "Rappels simples",
  "Cartes sponsorisees"
] as const;

export const PREMIUM_PLAN_FEATURES = [
  "Abonnements illimites",
  "Services inclus illimites",
  "Statistiques avancees",
  "Calendrier des prelevements",
  "Detection des abonnements peu utiles et des doublons",
  "Export PDF des abonnements",
  "Rappels personnalises",
  "Sans pub"
] as const;

export const PREMIUM_COMPARISON_ROWS: PremiumComparisonRow[] = [
  {
    id: "subscription_capacity",
    title: "Capacite de suivi",
    description: "Combien d'abonnements tu peux piloter en meme temps.",
    freeValue: `${FREE_PLAN_MAX_SUBSCRIPTIONS} abonnements`,
    premiumValue: "Illimite"
  },
  {
    id: "included_services",
    title: "Services inclus",
    description: "Les services rattaches a une offre principale comme un pack ou une banque.",
    freeValue: `${FREE_PLAN_MAX_INCLUDED_SERVICES_PER_SUBSCRIPTION} par abonnement`,
    premiumValue: "Illimite"
  },
  {
    id: "cloud_sync",
    title: "Synchronisation cloud",
    description: "Retrouver tes donnees automatiquement d'un appareil a l'autre.",
    freeValue: "Non incluse",
    premiumValue: "Premium",
    premiumState: "coming_soon"
  },
  {
    id: "auto_backup",
    title: "Sauvegarde automatique",
    description: "Protection continue de tes donnees et restauration rapide.",
    freeValue: "Non incluse",
    premiumValue: "Premium",
    premiumState: "coming_soon"
  },
  {
    id: "advanced_statistics",
    title: "Statistiques avancees",
    description: "Classements, graphiques et lecture detaillee de tes categories.",
    freeValue: "Vue simple",
    premiumValue: "Complete"
  },
  {
    id: "billing_calendar",
    title: "Calendrier des prelevements",
    description: "Vue annuelle, mensuelle, hebdomadaire et journaliere de tes abonnements a venir.",
    freeValue: "Non inclus",
    premiumValue: "Interactif"
  },
  {
    id: "annual_forecast",
    title: "Prevision budget annuel",
    description: "Projection annuelle et bascule mensuel / annuel dans le pilotage.",
    freeValue: "Incluse",
    premiumValue: "Incluse"
  },
  {
    id: "low_usage_detection",
    title: "Peu utile / doublons",
    description: "Detection des services a surveiller ou potentiellement redondants.",
    freeValue: "Verrouillee",
    premiumValue: "Incluse"
  },
  {
    id: "custom_reminders",
    title: "Rappels personnalises",
    description: "Choisir un delai de rappel par abonnement ou pour tout le compte.",
    freeValue: "Rappels simples",
    premiumValue: "Personnalises"
  },
  {
    id: "pdf_export",
    title: "Export PDF",
    description: "Generer un rapport PDF propre et partageable de tes abonnements filtres.",
    freeValue: "Non inclus",
    premiumValue: "Rapport complet"
  },
  {
    id: "ads",
    title: "Pubs",
    description: "Cartes sponsorisees visibles sur le plan gratuit.",
    freeValue: "Oui",
    premiumValue: "Aucune"
  }
];

export function isPremiumPlan(profile: Pick<UserProfile, "planTier"> | null | undefined) {
  return profile?.planTier === "premium";
}
