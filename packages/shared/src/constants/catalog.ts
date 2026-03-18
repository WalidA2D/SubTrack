import { BillingFrequency } from "../models/domain";

export type CategoryPreset = {
  slug: string;
  name: string;
  icon: string;
  color: string;
};

export type ServicePreset = {
  id: string;
  providerName: string;
  categorySlug: string;
  categoryName: string;
  billingFrequency: BillingFrequency;
  suggestedPrice: number;
  accentColor: string;
  searchKeywords?: string[];
};

export type DisneylandPassOption = {
  id: string;
  providerName: string;
  label: string;
  logoUri: string;
};

export type ParcAsterixPassOption = {
  id: string;
  providerName: string;
  label: string;
  logoUri: string;
};

export type RevolutPlanOption = {
  id: string;
  providerName: string;
  label: string;
  logoUri: string;
};

export type ClaudePlanOption = {
  id: string;
  providerName: string;
  label: string;
  group: "individual" | "team_enterprise";
  logoUri?: string;
};

export type ChatGPTPlanOption = {
  id: string;
  providerName: string;
  label: string;
  group: "individual" | "business";
  logoUri?: string;
};

export type ServicePlanGroup = {
  id: string;
  title: string | null;
  description?: string;
};

export type ServicePlanOption = {
  id: string;
  providerName: string;
  label: string;
  logoUri?: string;
  groupId?: string;
};

export type ServicePlanPreset = {
  presetId: string;
  baseProviderName: string;
  selectorLabel: string;
  preselectedTitle: string;
  preselectedDescription: string;
  groups?: ServicePlanGroup[];
  options: ServicePlanOption[];
};

const CURRENT_THEME_PARK_PASS_YEAR = new Date().getFullYear();

export const DISNEYLAND_PASS_OPTIONS: DisneylandPassOption[] = [
  {
    id: "bronze_one",
    providerName: "Disneyland Pass Bronze One",
    label: "Bronze One",
    logoUri:
      "https://media.disneylandparis.com/d4th/fr-fr/images/bronze-one-card-1-1_tcm808-291862.jpg"
  },
  {
    id: "bronze_max",
    providerName: "Disneyland Pass Bronze Max",
    label: "Bronze Max",
    logoUri:
      "https://media.disneylandparis.com/d4th/fr-fr/images/bronze-max-card-1-1_tcm808-291861.jpg"
  },
  {
    id: "bronze",
    providerName: "Disneyland Pass Bronze",
    label: "Bronze",
    logoUri:
      "https://media.disneylandparis.com/d4th/fr-fr/images/CARDS_bronze_1-1_tcm808-262188.jpg"
  },
  {
    id: "silver",
    providerName: "Disneyland Pass Silver",
    label: "Silver",
    logoUri:
      "https://media.disneylandparis.com/d4th/fr-fr/images/CARDS_silver-1-1_tcm808-262190.jpg"
  },
  {
    id: "gold",
    providerName: "Disneyland Pass Gold",
    label: "Gold",
    logoUri:
      "https://media.disneylandparis.com/d4th/fr-fr/images/CARDS_gold-1-1_tcm808-262189.jpg"
  }
] as const;

export const PARC_ASTERIX_PASS_OPTIONS: ParcAsterixPassOption[] = [
  {
    id: "decouverte",
    providerName: `Pass Saison Decouverte ${CURRENT_THEME_PARK_PASS_YEAR}`,
    label: `Decouverte ${CURRENT_THEME_PARK_PASS_YEAR}`,
    logoUri:
      "https://www.parcasterix.fr/themes/custom/tailwindcss/assets/img/season-pass/decouverte.webp"
  },
  {
    id: "gaulois",
    providerName: `Pass Saison Gaulois ${CURRENT_THEME_PARK_PASS_YEAR}`,
    label: `Gaulois ${CURRENT_THEME_PARK_PASS_YEAR}`,
    logoUri:
      "https://www.parcasterix.fr/themes/custom/tailwindcss/assets/img/season-pass/gaulois.webp"
  },
  {
    id: "premium",
    providerName: `Pass Saison Premium ${CURRENT_THEME_PARK_PASS_YEAR}`,
    label: `Premium ${CURRENT_THEME_PARK_PASS_YEAR}`,
    logoUri:
      "https://www.parcasterix.fr/themes/custom/tailwindcss/assets/img/season-pass/premium.webp"
  }
] as const;

export const REVOLUT_PLAN_OPTIONS: RevolutPlanOption[] = [
  {
    id: "plus",
    providerName: "Revolut Plus",
    label: "Plus",
    logoUri:
      "https://assets.revolut.com/published-assets-v3/5b13aec3-8868-455b-98a8-88432fcbb99b/53f326de-2a53-41f0-9d31-6c5f8a642aed.png"
  },
  {
    id: "premium",
    providerName: "Revolut Premium",
    label: "Premium",
    logoUri:
      "https://assets.revolut.com/published-assets-v3/ea9049a8-f4d9-460a-b22a-6ba7096e4233/75fc9eb5-13a6-4816-be51-73526f96b362.png"
  },
  {
    id: "metal",
    providerName: "Revolut Metal",
    label: "Metal",
    logoUri:
      "https://assets.revolut.com/published-assets-v3/4ec27be3-7bc1-4ede-b732-7d6071bbafa7/079695de-7389-430f-9932-397e36e1c8a9.png"
  },
  {
    id: "ultra",
    providerName: "Revolut Ultra",
    label: "Ultra",
    logoUri:
      "https://assets.revolut.com/published-assets-v3/96e80e6d-370f-446c-87dc-c9d257ec6259/ef03f40c-c078-42b4-9318-4bb5dde069c5.png"
  }
] as const;

export const CLAUDE_PLAN_OPTIONS: ClaudePlanOption[] = [
  {
    id: "free",
    providerName: "Claude Free",
    label: "Free",
    group: "individual"
  },
  {
    id: "pro",
    providerName: "Claude Pro",
    label: "Pro",
    group: "individual"
  },
  {
    id: "max",
    providerName: "Claude Max",
    label: "Max",
    group: "individual"
  },
  {
    id: "team",
    providerName: "Claude Team",
    label: "Team",
    group: "team_enterprise"
  },
  {
    id: "enterprise",
    providerName: "Claude Enterprise",
    label: "Enterprise",
    group: "team_enterprise"
  }
] as const;

export const CHATGPT_PLAN_OPTIONS: ChatGPTPlanOption[] = [
  {
    id: "plus",
    providerName: "ChatGPT Plus",
    label: "Plus",
    group: "individual"
  },
  {
    id: "pro",
    providerName: "ChatGPT Pro",
    label: "Pro",
    group: "individual"
  },
  {
    id: "business",
    providerName: "ChatGPT Business",
    label: "Business",
    group: "business"
  }
] as const;

export const SERVICE_PLAN_PRESETS: ServicePlanPreset[] = [
  {
    presetId: "disneyland_pass",
    baseProviderName: "Disneyland Pass",
    selectorLabel: "Formule Disney",
    preselectedTitle: "Pass Disney preselectionne",
    preselectedDescription:
      "Choisis la formule du pass Disney ci-dessous. Le logo et le nom de l'abonnement s'adaptent automatiquement a la formule selectionnee.",
    options: DISNEYLAND_PASS_OPTIONS
  },
  {
    presetId: "parc_asterix_pass",
    baseProviderName: "Pass Parc Asterix",
    selectorLabel: "Formule Parc Asterix",
    preselectedTitle: "Pass Parc Asterix preselectionne",
    preselectedDescription:
      "Choisis la formule du pass Parc Asterix ci-dessous. Le logo et le nom de l'abonnement s'adaptent automatiquement a la formule selectionnee.",
    options: PARC_ASTERIX_PASS_OPTIONS
  },
  {
    presetId: "revolut",
    baseProviderName: "Revolut",
    selectorLabel: "Formule Revolut",
    preselectedTitle: "Formule Revolut preselectionnee",
    preselectedDescription:
      "Choisis la formule Revolut ci-dessous. Le logo et le nom de l'abonnement s'adaptent automatiquement a la formule selectionnee.",
    options: REVOLUT_PLAN_OPTIONS
  },
  {
    presetId: "claude",
    baseProviderName: "Claude",
    selectorLabel: "Formule Claude",
    preselectedTitle: "Formule Claude preselectionnee",
    preselectedDescription:
      "Choisis la formule Claude ci-dessous. Les offres Individuel et Team & Entreprise sont bien separees, et le nom du service s'adapte automatiquement.",
    groups: [
      {
        id: "individual",
        title: "Individuel",
        description: "Formule Claude pour un usage personnel."
      },
      {
        id: "team_enterprise",
        title: "Team & Entreprise",
        description: "Formule Claude pour equipe ou entreprise."
      }
    ],
    options: CLAUDE_PLAN_OPTIONS.map((option) => ({
      id: option.id,
      providerName: option.providerName,
      label: option.label,
      logoUri: option.logoUri,
      groupId: option.group
    }))
  },
  {
    presetId: "chatgpt",
    baseProviderName: "ChatGPT",
    selectorLabel: "Formule ChatGPT",
    preselectedTitle: "Formule ChatGPT preselectionnee",
    preselectedDescription:
      "Choisis la formule ChatGPT ci-dessous. Les offres perso et Business sont bien separees, et le nom du service s'adapte automatiquement.",
    groups: [
      {
        id: "individual",
        title: "Individuel",
        description: "Formule ChatGPT pour un usage individuel."
      },
      {
        id: "business",
        title: "Business",
        description: "Formule ChatGPT pour un usage business."
      }
    ],
    options: CHATGPT_PLAN_OPTIONS.map((option) => ({
      id: option.id,
      providerName: option.providerName,
      label: option.label,
      logoUri: option.logoUri,
      groupId: option.group
    }))
  }
] as const;

export const PREDEFINED_CATEGORY_PRESETS: CategoryPreset[] = [
  { slug: "ai", name: "AI", icon: "sparkles", color: "#8C7BFF" },
  { slug: "streaming", name: "Streaming", icon: "play", color: "#FF667A" },
  { slug: "musique", name: "Musique", icon: "music", color: "#45D48B" },
  { slug: "jeux", name: "Jeux", icon: "gamepad", color: "#5BC8FF" },
  { slug: "productivite", name: "Productivite", icon: "briefcase", color: "#F7D154" },
  { slug: "reseaux_sociaux", name: "Reseaux sociaux", icon: "message-circle", color: "#7C93FF" },
  { slug: "sante", name: "Sante", icon: "heart", color: "#FF8A5B" },
  { slug: "sport", name: "Sport", icon: "dumbbell", color: "#45D48B" },
  { slug: "finances", name: "Finances", icon: "wallet", color: "#5FD3B3" },
  { slug: "education", name: "Education", icon: "book", color: "#7AA9FF" },
  { slug: "securite", name: "Securite", icon: "shield", color: "#A5B4FC" },
  { slug: "divertissement", name: "Divertissement", icon: "star", color: "#FFB84D" },
  { slug: "voyage", name: "Voyage", icon: "plane", color: "#5BC8FF" },
  { slug: "rencontres", name: "Rencontres", icon: "heart", color: "#FF667A" },
  { slug: "nourriture", name: "Nourriture", icon: "utensils", color: "#45D48B" },
  { slug: "telephone", name: "Telephone", icon: "phone", color: "#F7D154" }
];

export const SERVICE_CATEGORY_ORDER = PREDEFINED_CATEGORY_PRESETS.map((preset) => preset.slug);

export const POPULAR_SERVICE_PRESETS: ServicePreset[] = [
  {
    id: "chatgpt",
    providerName: "ChatGPT",
    categorySlug: "ai",
    categoryName: "AI",
    billingFrequency: "monthly",
    suggestedPrice: 20,
    accentColor: "#45D48B",
    searchKeywords: [
      "openai",
      ...CHATGPT_PLAN_OPTIONS.map((option) => option.providerName)
    ]
  },
  {
    id: "claude",
    providerName: "Claude",
    categorySlug: "ai",
    categoryName: "AI",
    billingFrequency: "monthly",
    suggestedPrice: 18,
    accentColor: "#FF8A5B",
    searchKeywords: [
      "anthropic",
      ...CLAUDE_PLAN_OPTIONS.map((option) => option.providerName)
    ]
  },
  {
    id: "google_gemini",
    providerName: "Google Gemini",
    categorySlug: "ai",
    categoryName: "AI",
    billingFrequency: "monthly",
    suggestedPrice: 21.99,
    accentColor: "#7AA9FF",
    searchKeywords: ["gemini advanced", "google ai"]
  },
  {
    id: "microsoft_copilot",
    providerName: "Microsoft Copilot",
    categorySlug: "ai",
    categoryName: "AI",
    billingFrequency: "monthly",
    suggestedPrice: 22,
    accentColor: "#5BC8FF",
    searchKeywords: ["copilot pro"]
  },
  {
    id: "perplexity_ai",
    providerName: "Perplexity AI",
    categorySlug: "ai",
    categoryName: "AI",
    billingFrequency: "monthly",
    suggestedPrice: 20,
    accentColor: "#A5B4FC",
    searchKeywords: ["perplexity pro"]
  },
  {
    id: "meta_ai",
    providerName: "Meta AI",
    categorySlug: "ai",
    categoryName: "AI",
    billingFrequency: "monthly",
    suggestedPrice: 14.99,
    accentColor: "#7AA9FF",
    searchKeywords: ["meta"]
  },
  {
    id: "netflix",
    providerName: "Netflix",
    categorySlug: "streaming",
    categoryName: "Streaming",
    billingFrequency: "monthly",
    suggestedPrice: 17.99,
    accentColor: "#FF667A"
  },
  {
    id: "youtube",
    providerName: "YouTube",
    categorySlug: "streaming",
    categoryName: "Streaming",
    billingFrequency: "monthly",
    suggestedPrice: 12.99,
    accentColor: "#FF667A",
    searchKeywords: ["youtube premium"]
  },
  {
    id: "amazon_prime",
    providerName: "Amazon Prime",
    categorySlug: "streaming",
    categoryName: "Streaming",
    billingFrequency: "monthly",
    suggestedPrice: 6.99,
    accentColor: "#7AA9FF",
    searchKeywords: ["prime video", "amazon"]
  },
  {
    id: "disney_plus",
    providerName: "Disney+",
    categorySlug: "streaming",
    categoryName: "Streaming",
    billingFrequency: "monthly",
    suggestedPrice: 8.99,
    accentColor: "#7AA9FF"
  },
  {
    id: "hulu",
    providerName: "Hulu",
    categorySlug: "streaming",
    categoryName: "Streaming",
    billingFrequency: "monthly",
    suggestedPrice: 7.99,
    accentColor: "#45D48B"
  },
  {
    id: "hbo_max",
    providerName: "HBO Max",
    categorySlug: "streaming",
    categoryName: "Streaming",
    billingFrequency: "monthly",
    suggestedPrice: 9.99,
    accentColor: "#8C7BFF",
    searchKeywords: ["max"]
  },
  {
    id: "apple_tv_plus",
    providerName: "Apple TV+",
    categorySlug: "streaming",
    categoryName: "Streaming",
    billingFrequency: "monthly",
    suggestedPrice: 9.99,
    accentColor: "#F1F5F9",
    searchKeywords: ["apple tv"]
  },
  {
    id: "paramount_plus",
    providerName: "Paramount+",
    categorySlug: "streaming",
    categoryName: "Streaming",
    billingFrequency: "monthly",
    suggestedPrice: 7.99,
    accentColor: "#5BC8FF"
  },
  {
    id: "peacock_tv",
    providerName: "Peacock TV",
    categorySlug: "streaming",
    categoryName: "Streaming",
    billingFrequency: "monthly",
    suggestedPrice: 5.99,
    accentColor: "#A5B4FC",
    searchKeywords: ["peacock"]
  },
  {
    id: "discovery",
    providerName: "Discovery",
    categorySlug: "streaming",
    categoryName: "Streaming",
    billingFrequency: "monthly",
    suggestedPrice: 4.99,
    accentColor: "#7AA9FF",
    searchKeywords: ["discovery plus"]
  },
  {
    id: "crunchyroll",
    providerName: "Crunchyroll",
    categorySlug: "streaming",
    categoryName: "Streaming",
    billingFrequency: "monthly",
    suggestedPrice: 6.99,
    accentColor: "#FF8A5B"
  },
  {
    id: "spotify",
    providerName: "Spotify",
    categorySlug: "musique",
    categoryName: "Musique",
    billingFrequency: "monthly",
    suggestedPrice: 12.99,
    accentColor: "#45D48B"
  },
  {
    id: "apple_music",
    providerName: "Apple Music",
    categorySlug: "musique",
    categoryName: "Musique",
    billingFrequency: "monthly",
    suggestedPrice: 10.99,
    accentColor: "#FF667A"
  },
  {
    id: "deezer",
    providerName: "Deezer",
    categorySlug: "musique",
    categoryName: "Musique",
    billingFrequency: "monthly",
    suggestedPrice: 10.99,
    accentColor: "#A5B4FC"
  },
  {
    id: "tidal",
    providerName: "Tidal",
    categorySlug: "musique",
    categoryName: "Musique",
    billingFrequency: "monthly",
    suggestedPrice: 10.99,
    accentColor: "#F1F5F9"
  },
  {
    id: "amazon_music",
    providerName: "Amazon Music",
    categorySlug: "musique",
    categoryName: "Musique",
    billingFrequency: "monthly",
    suggestedPrice: 9.99,
    accentColor: "#5BC8FF"
  },
  {
    id: "youtube_music",
    providerName: "YouTube Music",
    categorySlug: "musique",
    categoryName: "Musique",
    billingFrequency: "monthly",
    suggestedPrice: 10.99,
    accentColor: "#FF667A"
  },
  {
    id: "soundcloud_go",
    providerName: "SoundCloud Go+",
    categorySlug: "musique",
    categoryName: "Musique",
    billingFrequency: "monthly",
    suggestedPrice: 9.99,
    accentColor: "#FF8A5B",
    searchKeywords: ["soundcloud"]
  },
  {
    id: "xbox_game_pass",
    providerName: "Xbox Game Pass Ultimate",
    categorySlug: "jeux",
    categoryName: "Jeux",
    billingFrequency: "monthly",
    suggestedPrice: 14.99,
    accentColor: "#45D48B",
    searchKeywords: ["game pass", "xbox"]
  },
  {
    id: "playstation_plus",
    providerName: "PlayStation Plus",
    categorySlug: "jeux",
    categoryName: "Jeux",
    billingFrequency: "monthly",
    suggestedPrice: 8.99,
    accentColor: "#5BC8FF",
    searchKeywords: ["playstation"]
  },
  {
    id: "nintendo_switch_online",
    providerName: "Nintendo Switch Online",
    categorySlug: "jeux",
    categoryName: "Jeux",
    billingFrequency: "yearly",
    suggestedPrice: 19.99,
    accentColor: "#FF667A",
    searchKeywords: ["nintendo"]
  },
  {
    id: "ea_play",
    providerName: "EA Play",
    categorySlug: "jeux",
    categoryName: "Jeux",
    billingFrequency: "monthly",
    suggestedPrice: 5.99,
    accentColor: "#F7D154"
  },
  {
    id: "ubisoft_plus",
    providerName: "Ubisoft+",
    categorySlug: "jeux",
    categoryName: "Jeux",
    billingFrequency: "monthly",
    suggestedPrice: 17.99,
    accentColor: "#8C7BFF"
  },
  {
    id: "geforce_now",
    providerName: "GeForce NOW",
    categorySlug: "jeux",
    categoryName: "Jeux",
    billingFrequency: "monthly",
    suggestedPrice: 10.99,
    accentColor: "#45D48B",
    searchKeywords: ["nvidia"]
  },
  {
    id: "notion",
    providerName: "Notion",
    categorySlug: "productivite",
    categoryName: "Productivite",
    billingFrequency: "monthly",
    suggestedPrice: 8,
    accentColor: "#F1F5F9"
  },
  {
    id: "slack",
    providerName: "Slack",
    categorySlug: "productivite",
    categoryName: "Productivite",
    billingFrequency: "monthly",
    suggestedPrice: 7.25,
    accentColor: "#A5B4FC"
  },
  {
    id: "discord",
    providerName: "Discord",
    categorySlug: "productivite",
    categoryName: "Productivite",
    billingFrequency: "monthly",
    suggestedPrice: 9.99,
    accentColor: "#8C9EFF",
    searchKeywords: ["discord nitro", "discord nitro basic", "nitro"]
  },
  {
    id: "x",
    providerName: "X",
    categorySlug: "reseaux_sociaux",
    categoryName: "Reseaux sociaux",
    billingFrequency: "monthly",
    suggestedPrice: 10.99,
    accentColor: "#D7DCE6",
    searchKeywords: ["twitter", "x premium", "twitter premium"]
  },
  {
    id: "snapchat",
    providerName: "Snapchat",
    categorySlug: "reseaux_sociaux",
    categoryName: "Reseaux sociaux",
    billingFrequency: "monthly",
    suggestedPrice: 3.99,
    accentColor: "#FFE36A",
    searchKeywords: ["snap", "snapchat plus", "snap+"]
  },
  {
    id: "jira",
    providerName: "Jira",
    categorySlug: "productivite",
    categoryName: "Productivite",
    billingFrequency: "monthly",
    suggestedPrice: 8.15,
    accentColor: "#5BC8FF",
    searchKeywords: ["atlassian jira"]
  },
  {
    id: "trello",
    providerName: "Trello",
    categorySlug: "productivite",
    categoryName: "Productivite",
    billingFrequency: "monthly",
    suggestedPrice: 5,
    accentColor: "#7AA9FF",
    searchKeywords: ["atlassian trello"]
  },
  {
    id: "zoom_pro",
    providerName: "Zoom Pro",
    categorySlug: "productivite",
    categoryName: "Productivite",
    billingFrequency: "monthly",
    suggestedPrice: 13.99,
    accentColor: "#5BC8FF",
    searchKeywords: ["zoom"]
  },
  {
    id: "lastpass",
    providerName: "LastPass",
    categorySlug: "productivite",
    categoryName: "Productivite",
    billingFrequency: "monthly",
    suggestedPrice: 3,
    accentColor: "#FF667A"
  },
  {
    id: "one_password",
    providerName: "1Password",
    categorySlug: "productivite",
    categoryName: "Productivite",
    billingFrequency: "monthly",
    suggestedPrice: 2.99,
    accentColor: "#7AA9FF"
  },
  {
    id: "figma",
    providerName: "Figma",
    categorySlug: "productivite",
    categoryName: "Productivite",
    billingFrequency: "monthly",
    suggestedPrice: 16,
    accentColor: "#FFB84D"
  },
  {
    id: "adobe_creative_cloud",
    providerName: "Adobe Creative Cloud",
    categorySlug: "productivite",
    categoryName: "Productivite",
    billingFrequency: "monthly",
    suggestedPrice: 35.99,
    accentColor: "#FF667A",
    searchKeywords: ["adobe"]
  },
  {
    id: "peloton_digital",
    providerName: "Peloton Digital",
    categorySlug: "sport",
    categoryName: "Sport",
    billingFrequency: "monthly",
    suggestedPrice: 12.99,
    accentColor: "#F1F5F9",
    searchKeywords: ["peloton"]
  },
  {
    id: "classpass",
    providerName: "ClassPass",
    categorySlug: "sport",
    categoryName: "Sport",
    billingFrequency: "monthly",
    suggestedPrice: 34.99,
    accentColor: "#5BC8FF"
  },
  {
    id: "fitness_park",
    providerName: "Fitness Park",
    categorySlug: "sport",
    categoryName: "Sport",
    billingFrequency: "monthly",
    suggestedPrice: 39.95,
    accentColor: "#FF8A5B",
    searchKeywords: ["fitnesspark"]
  },
  {
    id: "on_air",
    providerName: "On Air",
    categorySlug: "sport",
    categoryName: "Sport",
    billingFrequency: "monthly",
    suggestedPrice: 34.99,
    accentColor: "#A5B4FC",
    searchKeywords: ["oneair", "on air fitness", "onair"]
  },
  {
    id: "basic_fit",
    providerName: "Basic-Fit",
    categorySlug: "sport",
    categoryName: "Sport",
    billingFrequency: "monthly",
    suggestedPrice: 29.99,
    accentColor: "#FFB84D",
    searchKeywords: ["basicfit", "basic fit"]
  },
  {
    id: "neoness",
    providerName: "Neoness",
    categorySlug: "sport",
    categoryName: "Sport",
    billingFrequency: "monthly",
    suggestedPrice: 29.9,
    accentColor: "#FF667A"
  },
  {
    id: "keep_cool",
    providerName: "Keep Cool",
    categorySlug: "sport",
    categoryName: "Sport",
    billingFrequency: "monthly",
    suggestedPrice: 34.99,
    accentColor: "#45D48B",
    searchKeywords: ["keepcool"]
  },
  {
    id: "orange_bleue",
    providerName: "L'Orange Bleue",
    categorySlug: "sport",
    categoryName: "Sport",
    billingFrequency: "monthly",
    suggestedPrice: 29.99,
    accentColor: "#5BC8FF",
    searchKeywords: ["orange bleue", "lorange bleue"]
  },
  {
    id: "cmg_sports_club",
    providerName: "CMG Sports Club",
    categorySlug: "sport",
    categoryName: "Sport",
    billingFrequency: "monthly",
    suggestedPrice: 79,
    accentColor: "#8C7BFF",
    searchKeywords: ["cmg"]
  },
  {
    id: "vita_liberte",
    providerName: "Vita Liberte",
    categorySlug: "sport",
    categoryName: "Sport",
    billingFrequency: "monthly",
    suggestedPrice: 19.95,
    accentColor: "#45D48B",
    searchKeywords: ["vitaliberte", "vita"]
  },
  {
    id: "gigafit",
    providerName: "Gigafit",
    categorySlug: "sport",
    categoryName: "Sport",
    billingFrequency: "monthly",
    suggestedPrice: 44.9,
    accentColor: "#F7D154"
  },
  {
    id: "magic_form",
    providerName: "Magic Form",
    categorySlug: "sport",
    categoryName: "Sport",
    billingFrequency: "monthly",
    suggestedPrice: 29.95,
    accentColor: "#FF667A",
    searchKeywords: ["magic form", "magicform"]
  },
  {
    id: "calm",
    providerName: "Calm",
    categorySlug: "sante",
    categoryName: "Sante",
    billingFrequency: "yearly",
    suggestedPrice: 69.99,
    accentColor: "#7AA9FF"
  },
  {
    id: "headspace",
    providerName: "Headspace",
    categorySlug: "sante",
    categoryName: "Sante",
    billingFrequency: "yearly",
    suggestedPrice: 57.99,
    accentColor: "#FF8A5B"
  },
  {
    id: "noom",
    providerName: "Noom",
    categorySlug: "sante",
    categoryName: "Sante",
    billingFrequency: "monthly",
    suggestedPrice: 17.99,
    accentColor: "#FF667A"
  },
  {
    id: "weight_watchers",
    providerName: "Weight Watchers",
    categorySlug: "sante",
    categoryName: "Sante",
    billingFrequency: "monthly",
    suggestedPrice: 22.99,
    accentColor: "#8C7BFF"
  },
  {
    id: "betterhelp",
    providerName: "BetterHelp",
    categorySlug: "sante",
    categoryName: "Sante",
    billingFrequency: "weekly",
    suggestedPrice: 15,
    accentColor: "#45D48B"
  },
  {
    id: "myfitnesspal",
    providerName: "MyFitnessPal",
    categorySlug: "sante",
    categoryName: "Sante",
    billingFrequency: "monthly",
    suggestedPrice: 9.99,
    accentColor: "#5BC8FF"
  },
  {
    id: "fitbit_premium",
    providerName: "Fitbit Premium",
    categorySlug: "sante",
    categoryName: "Sante",
    billingFrequency: "monthly",
    suggestedPrice: 8.99,
    accentColor: "#5BC8FF",
    searchKeywords: ["fitbit"]
  },
  {
    id: "whoop",
    providerName: "Whoop",
    categorySlug: "sante",
    categoryName: "Sante",
    billingFrequency: "monthly",
    suggestedPrice: 30,
    accentColor: "#FF8A5B"
  },
  {
    id: "turbotax",
    providerName: "TurboTax",
    categorySlug: "finances",
    categoryName: "Finances",
    billingFrequency: "yearly",
    suggestedPrice: 39.99,
    accentColor: "#FF667A"
  },
  {
    id: "quickbooks",
    providerName: "QuickBooks",
    categorySlug: "finances",
    categoryName: "Finances",
    billingFrequency: "monthly",
    suggestedPrice: 18,
    accentColor: "#45D48B"
  },
  {
    id: "robinhood_gold",
    providerName: "Robinhood Gold",
    categorySlug: "finances",
    categoryName: "Finances",
    billingFrequency: "monthly",
    suggestedPrice: 5,
    accentColor: "#B9FF34",
    searchKeywords: ["robinhood"]
  },
  {
    id: "monzo_plus",
    providerName: "Monzo Plus",
    categorySlug: "finances",
    categoryName: "Finances",
    billingFrequency: "monthly",
    suggestedPrice: 5,
    accentColor: "#5BC8FF",
    searchKeywords: ["monzo"]
  },
  {
    id: "revolut",
    providerName: "Revolut",
    categorySlug: "finances",
    categoryName: "Finances",
    billingFrequency: "monthly",
    suggestedPrice: 9.99,
    accentColor: "#F1F5F9",
    searchKeywords: [
      "banque revolut",
      "compte revolut",
      ...REVOLUT_PLAN_OPTIONS.map((option) => option.providerName)
    ]
  },
  {
    id: "codecademy",
    providerName: "Codecademy",
    categorySlug: "education",
    categoryName: "Education",
    billingFrequency: "monthly",
    suggestedPrice: 19.99,
    accentColor: "#7AA9FF"
  },
  {
    id: "babbel",
    providerName: "Babbel",
    categorySlug: "education",
    categoryName: "Education",
    billingFrequency: "monthly",
    suggestedPrice: 8.99,
    accentColor: "#FF8A5B"
  },
  {
    id: "rosetta_stone",
    providerName: "Rosetta Stone",
    categorySlug: "education",
    categoryName: "Education",
    billingFrequency: "monthly",
    suggestedPrice: 11.99,
    accentColor: "#F7D154"
  },
  {
    id: "busuu",
    providerName: "Busuu",
    categorySlug: "education",
    categoryName: "Education",
    billingFrequency: "monthly",
    suggestedPrice: 6.99,
    accentColor: "#5BC8FF"
  },
  {
    id: "memrise",
    providerName: "Memrise",
    categorySlug: "education",
    categoryName: "Education",
    billingFrequency: "monthly",
    suggestedPrice: 8.99,
    accentColor: "#F7D154"
  },
  {
    id: "coursera",
    providerName: "Coursera",
    categorySlug: "education",
    categoryName: "Education",
    billingFrequency: "monthly",
    suggestedPrice: 39,
    accentColor: "#5BC8FF"
  },
  {
    id: "skillshare",
    providerName: "Skillshare",
    categorySlug: "education",
    categoryName: "Education",
    billingFrequency: "monthly",
    suggestedPrice: 14.99,
    accentColor: "#45D48B"
  },
  {
    id: "masterclass",
    providerName: "MasterClass",
    categorySlug: "education",
    categoryName: "Education",
    billingFrequency: "yearly",
    suggestedPrice: 120,
    accentColor: "#FF667A"
  },
  {
    id: "duolingo",
    providerName: "Duolingo",
    categorySlug: "education",
    categoryName: "Education",
    billingFrequency: "monthly",
    suggestedPrice: 10.99,
    accentColor: "#45D48B"
  },
  {
    id: "udemy",
    providerName: "Udemy",
    categorySlug: "education",
    categoryName: "Education",
    billingFrequency: "monthly",
    suggestedPrice: 16.99,
    accentColor: "#F1F5F9"
  },
  {
    id: "linkedin_learning",
    providerName: "LinkedIn Learning",
    categorySlug: "education",
    categoryName: "Education",
    billingFrequency: "monthly",
    suggestedPrice: 29.99,
    accentColor: "#7AA9FF",
    searchKeywords: ["linkedin"]
  },
  {
    id: "blinkist",
    providerName: "Blinkist",
    categorySlug: "education",
    categoryName: "Education",
    billingFrequency: "monthly",
    suggestedPrice: 12.99,
    accentColor: "#45D48B"
  },
  {
    id: "surfshark",
    providerName: "Surfshark",
    categorySlug: "securite",
    categoryName: "Securite",
    billingFrequency: "monthly",
    suggestedPrice: 2.99,
    accentColor: "#5BC8FF"
  },
  {
    id: "nordvpn",
    providerName: "NordVPN",
    categorySlug: "securite",
    categoryName: "Securite",
    billingFrequency: "monthly",
    suggestedPrice: 4.99,
    accentColor: "#7AA9FF"
  },
  {
    id: "expressvpn",
    providerName: "ExpressVPN",
    categorySlug: "securite",
    categoryName: "Securite",
    billingFrequency: "monthly",
    suggestedPrice: 6.67,
    accentColor: "#FF667A"
  },
  {
    id: "audible",
    providerName: "Audible",
    categorySlug: "divertissement",
    categoryName: "Divertissement",
    billingFrequency: "monthly",
    suggestedPrice: 9.95,
    accentColor: "#FFB84D"
  },
  {
    id: "disneyland_pass",
    providerName: "Disneyland Pass",
    categorySlug: "divertissement",
    categoryName: "Divertissement",
    billingFrequency: "yearly",
    suggestedPrice: 289,
    accentColor: "#DAB063",
    searchKeywords: [
      "pass disney",
      "pass disneyland",
      "pass annuel disney",
      "annual pass disney",
      ...DISNEYLAND_PASS_OPTIONS.map((option) => option.providerName)
    ]
  },
  {
    id: "parc_asterix_pass",
    providerName: "Pass Parc Asterix",
    categorySlug: "divertissement",
    categoryName: "Divertissement",
    billingFrequency: "yearly",
    suggestedPrice: 174,
    accentColor: "#F2C14E",
    searchKeywords: [
      "pass parc asterix",
      "pass asterix",
      "pass saison asterix",
      "parc asterix",
      ...PARC_ASTERIX_PASS_OPTIONS.map((option) => option.providerName)
    ]
  },
  {
    id: "scribd",
    providerName: "Scribd",
    categorySlug: "divertissement",
    categoryName: "Divertissement",
    billingFrequency: "monthly",
    suggestedPrice: 11.99,
    accentColor: "#F7D154"
  },
  {
    id: "comcast_xfinity",
    providerName: "Comcast Xfinity",
    categorySlug: "divertissement",
    categoryName: "Divertissement",
    billingFrequency: "monthly",
    suggestedPrice: 14.99,
    accentColor: "#8C7BFF",
    searchKeywords: ["xfinity"]
  },
  {
    id: "patreon",
    providerName: "Patreon",
    categorySlug: "divertissement",
    categoryName: "Divertissement",
    billingFrequency: "monthly",
    suggestedPrice: 5,
    accentColor: "#FF8A5B"
  },
  {
    id: "twitch_turbo",
    providerName: "Twitch Turbo",
    categorySlug: "divertissement",
    categoryName: "Divertissement",
    billingFrequency: "monthly",
    suggestedPrice: 8.99,
    accentColor: "#8C7BFF",
    searchKeywords: ["twitch"]
  },
  {
    id: "airbnb",
    providerName: "Airbnb",
    categorySlug: "voyage",
    categoryName: "Voyage",
    billingFrequency: "monthly",
    suggestedPrice: 12,
    accentColor: "#FF667A"
  },
  {
    id: "uber",
    providerName: "Uber",
    categorySlug: "voyage",
    categoryName: "Voyage",
    billingFrequency: "monthly",
    suggestedPrice: 9.99,
    accentColor: "#F1F5F9"
  },
  {
    id: "grab",
    providerName: "Grab",
    categorySlug: "voyage",
    categoryName: "Voyage",
    billingFrequency: "monthly",
    suggestedPrice: 5.99,
    accentColor: "#45D48B"
  },
  {
    id: "citymapper",
    providerName: "Citymapper",
    categorySlug: "voyage",
    categoryName: "Voyage",
    billingFrequency: "monthly",
    suggestedPrice: 3.99,
    accentColor: "#45D48B"
  },
  {
    id: "tinder",
    providerName: "Tinder",
    categorySlug: "rencontres",
    categoryName: "Rencontres",
    billingFrequency: "monthly",
    suggestedPrice: 19.99,
    accentColor: "#FF667A"
  },
  {
    id: "bumble",
    providerName: "Bumble",
    categorySlug: "rencontres",
    categoryName: "Rencontres",
    billingFrequency: "monthly",
    suggestedPrice: 17.99,
    accentColor: "#F7D154"
  },
  {
    id: "hinge",
    providerName: "Hinge",
    categorySlug: "rencontres",
    categoryName: "Rencontres",
    billingFrequency: "monthly",
    suggestedPrice: 19.99,
    accentColor: "#F1F5F9"
  },
  {
    id: "okcupid",
    providerName: "OkCupid",
    categorySlug: "rencontres",
    categoryName: "Rencontres",
    billingFrequency: "monthly",
    suggestedPrice: 14.99,
    accentColor: "#8C7BFF"
  },
  {
    id: "eharmony",
    providerName: "eHarmony",
    categorySlug: "rencontres",
    categoryName: "Rencontres",
    billingFrequency: "monthly",
    suggestedPrice: 29.99,
    accentColor: "#5FD3B3"
  },
  {
    id: "doordash_dashpass",
    providerName: "DoorDash DashPass",
    categorySlug: "nourriture",
    categoryName: "Nourriture",
    billingFrequency: "monthly",
    suggestedPrice: 9.99,
    accentColor: "#FF8A5B",
    searchKeywords: ["doordash", "dashpass"]
  },
  {
    id: "ubereats",
    providerName: "UberEats",
    categorySlug: "nourriture",
    categoryName: "Nourriture",
    billingFrequency: "monthly",
    suggestedPrice: 5.99,
    accentColor: "#45D48B",
    searchKeywords: ["uber eats"]
  },
  {
    id: "postmates",
    providerName: "Postmates",
    categorySlug: "nourriture",
    categoryName: "Nourriture",
    billingFrequency: "monthly",
    suggestedPrice: 9.99,
    accentColor: "#F1F5F9"
  },
  {
    id: "instacart",
    providerName: "Instacart",
    categorySlug: "nourriture",
    categoryName: "Nourriture",
    billingFrequency: "monthly",
    suggestedPrice: 9.99,
    accentColor: "#45D48B"
  },
  {
    id: "hellofresh",
    providerName: "HelloFresh",
    categorySlug: "nourriture",
    categoryName: "Nourriture",
    billingFrequency: "monthly",
    suggestedPrice: 11.99,
    accentColor: "#B9FF34"
  },
  {
    id: "blue_apron",
    providerName: "Blue Apron",
    categorySlug: "nourriture",
    categoryName: "Nourriture",
    billingFrequency: "monthly",
    suggestedPrice: 10.99,
    accentColor: "#5BC8FF"
  },
  {
    id: "verizon_wireless",
    providerName: "Verizon Wireless",
    categorySlug: "telephone",
    categoryName: "Telephone",
    billingFrequency: "monthly",
    suggestedPrice: 49.99,
    accentColor: "#FF667A",
    searchKeywords: ["verizon"]
  },
  {
    id: "att_wireless",
    providerName: "AT&T Wireless",
    categorySlug: "telephone",
    categoryName: "Telephone",
    billingFrequency: "monthly",
    suggestedPrice: 45.99,
    accentColor: "#5BC8FF",
    searchKeywords: ["att", "at&t"]
  },
  {
    id: "google_fi",
    providerName: "Google Fi",
    categorySlug: "telephone",
    categoryName: "Telephone",
    billingFrequency: "monthly",
    suggestedPrice: 20,
    accentColor: "#7AA9FF"
  },
  {
    id: "mint_mobile",
    providerName: "Mint Mobile",
    categorySlug: "telephone",
    categoryName: "Telephone",
    billingFrequency: "monthly",
    suggestedPrice: 15,
    accentColor: "#5FD3B3",
    searchKeywords: ["mint"]
  }
];

export function normalizeCatalogKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function findCategoryPresetByName(categoryName: string) {
  const normalized = normalizeCatalogKey(categoryName);
  return PREDEFINED_CATEGORY_PRESETS.find(
    (preset) => normalizeCatalogKey(preset.name) === normalized
  );
}

export function findServicePresetByProvider(providerName: string) {
  const normalized = normalizeCatalogKey(providerName);
  return POPULAR_SERVICE_PRESETS.find(
    (preset) =>
      normalizeCatalogKey(preset.providerName) === normalized ||
      preset.searchKeywords?.some((keyword) => normalizeCatalogKey(keyword) === normalized)
  );
}

export function findServicePlanPresetByPresetId(presetId: string) {
  const normalized = normalizeCatalogKey(presetId);
  return SERVICE_PLAN_PRESETS.find(
    (preset) => normalizeCatalogKey(preset.presetId) === normalized
  );
}

export function findServicePlanPresetByProvider(providerName: string) {
  const normalized = normalizeCatalogKey(providerName);
  const normalizedWithoutYear = stripYearMarker(providerName);

  return SERVICE_PLAN_PRESETS.find((preset) => {
    const normalizedPresetId = normalizeCatalogKey(preset.presetId);
    const normalizedBaseProvider = normalizeCatalogKey(preset.baseProviderName);

    if (
      normalizedPresetId === normalized ||
      normalizedBaseProvider === normalized ||
      normalizedPresetId === normalizedWithoutYear ||
      normalizedBaseProvider === normalizedWithoutYear
    ) {
      return true;
    }

    return preset.options.some((option) => {
      const normalizedOption = normalizeCatalogKey(option.providerName);

      return (
        normalizedOption === normalized ||
        stripYearMarker(option.providerName) === normalizedWithoutYear
      );
    });
  });
}

export function findServicePlanOption(providerName: string) {
  const normalized = normalizeCatalogKey(providerName);
  const normalizedWithoutYear = stripYearMarker(providerName);

  for (const preset of SERVICE_PLAN_PRESETS) {
    const matchedOption = preset.options.find((option) => {
      const normalizedOption = normalizeCatalogKey(option.providerName);

      return (
        normalizedOption === normalized ||
        stripYearMarker(option.providerName) === normalizedWithoutYear
      );
    });

    if (matchedOption) {
      return matchedOption;
    }
  }

  return undefined;
}

export function findDisneylandPassOption(providerName: string) {
  const normalized = normalizeCatalogKey(providerName);
  return DISNEYLAND_PASS_OPTIONS.find(
    (option) => normalizeCatalogKey(option.providerName) === normalized
  );
}

function stripYearMarker(value: string) {
  return normalizeCatalogKey(value)
    .replace(/_20\d{2}(?=_|$)/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function findParcAsterixPassOption(providerName: string) {
  const normalized = normalizeCatalogKey(providerName);
  const normalizedWithoutYear = stripYearMarker(providerName);

  return PARC_ASTERIX_PASS_OPTIONS.find((option) => {
    const optionNormalized = normalizeCatalogKey(option.providerName);

    return (
      optionNormalized === normalized ||
      stripYearMarker(option.providerName) === normalizedWithoutYear
    );
  });
}

export function findRevolutPlanOption(providerName: string) {
  const normalized = normalizeCatalogKey(providerName);
  return REVOLUT_PLAN_OPTIONS.find(
    (option) => normalizeCatalogKey(option.providerName) === normalized
  );
}

export function findClaudePlanOption(providerName: string) {
  const normalized = normalizeCatalogKey(providerName);
  return CLAUDE_PLAN_OPTIONS.find(
    (option) => normalizeCatalogKey(option.providerName) === normalized
  );
}

export function findChatGPTPlanOption(providerName: string) {
  const normalized = normalizeCatalogKey(providerName);
  return CHATGPT_PLAN_OPTIONS.find(
    (option) => normalizeCatalogKey(option.providerName) === normalized
  );
}
