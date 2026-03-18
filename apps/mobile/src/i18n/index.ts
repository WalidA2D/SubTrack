import { useMemo } from "react";

type TextLocale = "fr" | "en" | "de" | "ar" | "ru" | "tr" | "zh" | "ja";

type TranslationKey =
  | "common.back"
  | "common.retry"
  | "common.loading"
  | "nav.dashboard"
  | "nav.statistics"
  | "nav.openingSpace"
  | "nav.checkingSession"
  | "auth.loginTitle"
  | "auth.registerTitle"
  | "auth.subtitle"
  | "auth.displayNamePlaceholder"
  | "auth.emailPlaceholder"
  | "auth.passwordPlaceholder"
  | "auth.createAccount"
  | "auth.signIn"
  | "auth.forgotPassword"
  | "auth.loginErrorTitle"
  | "auth.resetSentTitle"
  | "auth.resetSentBody"
  | "auth.resetErrorTitle"
  | "auth.haveAccount"
  | "auth.noAccount"
  | "auth.signInInstead"
  | "auth.createOne"
  | "onboarding.title"
  | "onboarding.subtitle"
  | "onboarding.thisMonth"
  | "onboarding.eyebrow"
  | "onboarding.hero"
  | "onboarding.feature1"
  | "onboarding.feature2"
  | "onboarding.feature3"
  | "onboarding.start"
  | "dashboard.summaryYearly"
  | "dashboard.summaryMonthly"
  | "dashboard.tapToToggle"
  | "dashboard.active"
  | "dashboard.bubbles"
  | "dashboard.tapToOpen"
  | "dashboard.allSubscriptions"
  | "dashboard.seeAll"
  | "dashboard.noSubscriptions"
  | "dashboard.addFirstService"
  | "dashboard.upcomingPayments"
  | "dashboard.toWatch"
  | "dashboard.nothingImmediate"
  | "dashboard.nextPaymentsBody"
  | "dashboard.chargedOn"
  | "dashboard.quickAlerts"
  | "dashboard.everythingUnderControl"
  | "dashboard.alertsBody"
  | "statistics.title"
  | "statistics.subtitle"
  | "statistics.active"
  | "statistics.lowUsage"
  | "statistics.averagePerMonth"
  | "statistics.topCategory"
  | "statistics.none"
  | "statistics.pie"
  | "statistics.spendByCategory"
  | "statistics.monthly"
  | "statistics.bars"
  | "statistics.compareByCategory"
  | "statistics.leader"
  | "statistics.curve"
  | "statistics.evolutionByMonth"
  | "statistics.lastMonth"
  | "statistics.highlight"
  | "statistics.biggestSubscription"
  | "statistics.noActiveSubscription"
  | "statistics.dominant"
  | "statistics.noCategory"
  | "statistics.underWatch"
  | "statistics.lightlyUsed"
  | "statistics.totalMonthly"
  | "statistics.emptyPie"
  | "statistics.emptyBar"
  | "statistics.emptyTrend"
  | "subscriptions.title"
  | "subscriptions.subtitle"
  | "subscriptions.active"
  | "subscriptions.monthly"
  | "subscriptions.searchPlaceholder"
  | "subscriptions.all"
  | "subscriptions.add"
  | "subscriptions.archive"
  | "subscriptions.archiving"
  | "subscriptions.loading"
  | "subscriptions.empty"
  | "subscriptions.tryOther"
  | "settings.title"
  | "settings.subtitle"
  | "settings.paymentReminders"
  | "settings.trialReminders"
  | "settings.smartNotifications"
  | "settings.appLanguage"
  | "settings.choose"
  | "settings.activeCurrency"
  | "settings.colorBlindMode"
  | "settings.logout"
  | "settings.updateErrorTitle"
  | "settings.disconnectErrorTitle"
  | "settings.languageEyebrow"
  | "settings.chooseLanguage"
  | "settings.languageSubtitle"
  | "settings.searchLanguage"
  | "settings.current"
  | "settings.select"
  | "settings.noLanguageFoundTitle"
  | "settings.noLanguageFoundBody"
  | "format.billing.weekly"
  | "format.billing.monthly"
  | "format.billing.quarterly"
  | "format.billing.yearly"
  | "format.status.trial"
  | "format.status.paused"
  | "format.status.cancelled"
  | "format.status.active"
  | "format.usage.active"
  | "format.usage.unused"
  | "format.usage.uncertain"
  | "format.reminder.sameDay"
  | "format.reminder.oneDay"
  | "format.reminder.daysBefore"
  | "format.insight.unused"
  | "format.insight.duplicate"
  | "format.insight.paymentDue"
  | "format.insight.default";

type TranslationMap = Record<TranslationKey, string>;

const frenchTranslations: TranslationMap = {
  "common.back": "Retour",
  "common.retry": "Merci de reessayer.",
  "common.loading": "Chargement...",
  "nav.dashboard": "Accueil",
  "nav.statistics": "Statistiques",
  "nav.openingSpace": "Ouverture de ton espace",
  "nav.checkingSession": "Nous verifions ta session en cours.",
  "auth.loginTitle": "Heureux de te revoir",
  "auth.registerTitle": "Creer ton espace premium",
  "auth.subtitle": "Connexion securisee pour retrouver tous tes abonnements et tes rappels.",
  "auth.displayNamePlaceholder": "Nom d'affichage",
  "auth.emailPlaceholder": "Adresse email",
  "auth.passwordPlaceholder": "Mot de passe",
  "auth.createAccount": "Creer mon compte",
  "auth.signIn": "Se connecter",
  "auth.forgotPassword": "Mot de passe oublie",
  "auth.loginErrorTitle": "Connexion impossible",
  "auth.resetSentTitle": "Email envoye",
  "auth.resetSentBody": "Verifie ta boite mail pour reinitialiser ton mot de passe.",
  "auth.resetErrorTitle": "Impossible d'envoyer l'email",
  "auth.haveAccount": "Tu as deja un compte ?",
  "auth.noAccount": "Pas encore de compte ?",
  "auth.signInInstead": "Se connecter a la place",
  "auth.createOne": "En creer un",
  "onboarding.title": "Pilote chaque abonnement comme un actif.",
  "onboarding.subtitle": "Subly transforme tes paiements recurrents en tableau de bord premium, avec rappels utiles et vue instantanee sur les services qui comptent.",
  "onboarding.thisMonth": "Ce mois-ci",
  "onboarding.eyebrow": "Dark premium dashboard",
  "onboarding.hero": "Un seul cockpit pour Netflix, tes SaaS, la salle de sport et les renouvellements que tu oublies trop souvent.",
  "onboarding.feature1": "Vue mensuelle et annuelle immediate",
  "onboarding.feature2": "Rappels avant paiement et fin d'essai",
  "onboarding.feature3": "Detection des doublons et usages faibles",
  "onboarding.start": "Commencer",
  "dashboard.summaryYearly": "Total annuel",
  "dashboard.summaryMonthly": "Total mensuel",
  "dashboard.tapToToggle": "Touchez pour basculer",
  "dashboard.active": "Actif",
  "dashboard.bubbles": "Bulles interactives",
  "dashboard.tapToOpen": "Touchez pour ouvrir",
  "dashboard.allSubscriptions": "Tous les abonnements",
  "dashboard.seeAll": "Tout voir",
  "dashboard.noSubscriptions": "Aucun abonnement pour le moment.",
  "dashboard.addFirstService": "Ajoute ton premier service pour lancer le tableau de bord.",
  "dashboard.upcomingPayments": "Paiements a venir",
  "dashboard.toWatch": "{count} a surveiller",
  "dashboard.nothingImmediate": "Rien d'immediat a surveiller.",
  "dashboard.nextPaymentsBody": "Les prochains prelevements s'afficheront ici avec leur montant et leur date.",
  "dashboard.chargedOn": "Prelevement le {date}",
  "dashboard.quickAlerts": "Alertes rapides",
  "dashboard.everythingUnderControl": "Tout semble sous controle.",
  "dashboard.alertsBody": "Subly affichera ici les doublons, les services peu utilises et les paiements sensibles.",
  "statistics.title": "Statistiques",
  "statistics.subtitle": "Barres, evolution mensuelle et comparaison des categories dans une seule vue.",
  "statistics.active": "Actifs",
  "statistics.lowUsage": "Peu utiles",
  "statistics.averagePerMonth": "Moyenne / mois",
  "statistics.topCategory": "Top categorie",
  "statistics.none": "Aucune",
  "statistics.pie": "Camembert",
  "statistics.spendByCategory": "Depenses par categorie",
  "statistics.monthly": "Mensuel",
  "statistics.bars": "Barres",
  "statistics.compareByCategory": "Comparatif par categorie",
  "statistics.leader": "Leader",
  "statistics.curve": "Courbe",
  "statistics.evolutionByMonth": "Evolution par mois",
  "statistics.lastMonth": "Dernier mois",
  "statistics.highlight": "Temps fort",
  "statistics.biggestSubscription": "Plus gros abonnement",
  "statistics.noActiveSubscription": "Aucun abonnement actif",
  "statistics.dominant": "Dominante",
  "statistics.noCategory": "Aucune categorie",
  "statistics.underWatch": "Sous surveillance",
  "statistics.lightlyUsed": "{count} abonnement(s) peu utile(s)",
  "statistics.totalMonthly": "Total mensuel",
  "statistics.emptyPie": "Ajoute quelques abonnements pour voir le camembert par categorie.",
  "statistics.emptyBar": "Ajoute quelques abonnements pour activer le graphique en barres.",
  "statistics.emptyTrend": "L'evolution mensuelle apparaitra ici des que tu auras de l'historique.",
  "subscriptions.title": "Abonnements",
  "subscriptions.subtitle": "Retrouve, recherche et pilote tous tes paiements recurrents dans une interface compacte et premium.",
  "subscriptions.active": "Actifs",
  "subscriptions.monthly": "Mensuel",
  "subscriptions.searchPlaceholder": "Rechercher Netflix, Spotify, Figma...",
  "subscriptions.all": "Tous les abonnements",
  "subscriptions.add": "Ajouter",
  "subscriptions.archive": "Archiver",
  "subscriptions.archiving": "Archivage",
  "subscriptions.loading": "Chargement des abonnements...",
  "subscriptions.empty": "Aucun abonnement trouve.",
  "subscriptions.tryOther": "Essaie un autre mot-cle ou ajoute un nouveau service.",
  "settings.title": "Reglages",
  "settings.subtitle": "Controle les rappels, la devise et les preferences de ton compte dans une interface plus calme et plus lisible.",
  "settings.paymentReminders": "Rappels de paiement",
  "settings.trialReminders": "Rappels de fin d'essai",
  "settings.smartNotifications": "Notifications intelligentes",
  "settings.appLanguage": "Langue de l'application",
  "settings.choose": "Choisir",
  "settings.activeCurrency": "Devise active",
  "settings.colorBlindMode": "Mode daltonien",
  "settings.logout": "Deconnexion",
  "settings.updateErrorTitle": "Mise a jour impossible",
  "settings.disconnectErrorTitle": "Deconnexion impossible",
  "settings.languageEyebrow": "Langue de l'application",
  "settings.chooseLanguage": "Choisir une langue",
  "settings.languageSubtitle": "La liste est triee par ordre alphabetique et la recherche filtre en direct.",
  "settings.searchLanguage": "Rechercher une langue",
  "settings.current": "Actuelle",
  "settings.select": "Selectionner",
  "settings.noLanguageFoundTitle": "Aucune langue trouvee",
  "settings.noLanguageFoundBody": "Essaie un autre mot-cle pour retrouver la langue que tu cherches.",
  "format.billing.weekly": "Hebdomadaire",
  "format.billing.monthly": "Mensuel",
  "format.billing.quarterly": "Trimestriel",
  "format.billing.yearly": "Annuel",
  "format.status.trial": "Essai",
  "format.status.paused": "En pause",
  "format.status.cancelled": "Annule",
  "format.status.active": "Actif",
  "format.usage.active": "Utilise",
  "format.usage.unused": "Peu utilise",
  "format.usage.uncertain": "A verifier",
  "format.reminder.sameDay": "Le jour meme",
  "format.reminder.oneDay": "1 jour avant",
  "format.reminder.daysBefore": "{count} jours avant",
  "format.insight.unused": "Abonnement a surveiller",
  "format.insight.duplicate": "Doublon detecte",
  "format.insight.paymentDue": "Paiement a venir",
  "format.insight.default": "Alerte Subly"
};

const englishTranslations: TranslationMap = {
  "common.back": "Back",
  "common.retry": "Please try again.",
  "common.loading": "Loading...",
  "nav.dashboard": "Home",
  "nav.statistics": "Statistics",
  "nav.openingSpace": "Opening your space",
  "nav.checkingSession": "We are checking your current session.",
  "auth.loginTitle": "Good to see you again",
  "auth.registerTitle": "Create your premium space",
  "auth.subtitle": "Secure sign in to get back all your subscriptions and reminders.",
  "auth.displayNamePlaceholder": "Display name",
  "auth.emailPlaceholder": "Email address",
  "auth.passwordPlaceholder": "Password",
  "auth.createAccount": "Create my account",
  "auth.signIn": "Sign in",
  "auth.forgotPassword": "Forgot password",
  "auth.loginErrorTitle": "Unable to sign in",
  "auth.resetSentTitle": "Email sent",
  "auth.resetSentBody": "Check your inbox to reset your password.",
  "auth.resetErrorTitle": "Unable to send email",
  "auth.haveAccount": "Already have an account?",
  "auth.noAccount": "No account yet?",
  "auth.signInInstead": "Sign in instead",
  "auth.createOne": "Create one",
  "onboarding.title": "Manage every subscription like an asset.",
  "onboarding.subtitle": "Subly turns recurring payments into a premium dashboard with useful reminders and an instant view of the services that matter.",
  "onboarding.thisMonth": "This month",
  "onboarding.eyebrow": "Dark premium dashboard",
  "onboarding.hero": "One cockpit for Netflix, your SaaS, the gym and all the renewals you forget too often.",
  "onboarding.feature1": "Instant monthly and yearly view",
  "onboarding.feature2": "Reminders before payments and trial end",
  "onboarding.feature3": "Duplicate and low-usage detection",
  "onboarding.start": "Get started",
  "dashboard.summaryYearly": "Yearly total",
  "dashboard.summaryMonthly": "Monthly total",
  "dashboard.tapToToggle": "Tap to switch",
  "dashboard.active": "Active",
  "dashboard.bubbles": "Interactive bubbles",
  "dashboard.tapToOpen": "Tap to open",
  "dashboard.allSubscriptions": "All subscriptions",
  "dashboard.seeAll": "See all",
  "dashboard.noSubscriptions": "No subscriptions yet.",
  "dashboard.addFirstService": "Add your first service to start the dashboard.",
  "dashboard.upcomingPayments": "Upcoming payments",
  "dashboard.toWatch": "{count} to watch",
  "dashboard.nothingImmediate": "Nothing urgent to watch.",
  "dashboard.nextPaymentsBody": "Upcoming charges will appear here with their amount and date.",
  "dashboard.chargedOn": "Charge on {date}",
  "dashboard.quickAlerts": "Quick alerts",
  "dashboard.everythingUnderControl": "Everything looks under control.",
  "dashboard.alertsBody": "Subly will show duplicates, low-usage services and sensitive payments here.",
  "statistics.title": "Statistics",
  "statistics.subtitle": "Bars, monthly trend and category comparison in one view.",
  "statistics.active": "Active",
  "statistics.lowUsage": "Low utility",
  "statistics.averagePerMonth": "Average / month",
  "statistics.topCategory": "Top category",
  "statistics.none": "None",
  "statistics.pie": "Donut",
  "statistics.spendByCategory": "Spend by category",
  "statistics.monthly": "Monthly",
  "statistics.bars": "Bars",
  "statistics.compareByCategory": "Category comparison",
  "statistics.leader": "Leader",
  "statistics.curve": "Trend",
  "statistics.evolutionByMonth": "Monthly evolution",
  "statistics.lastMonth": "Last month",
  "statistics.highlight": "Highlight",
  "statistics.biggestSubscription": "Biggest subscription",
  "statistics.noActiveSubscription": "No active subscription",
  "statistics.dominant": "Dominant",
  "statistics.noCategory": "No category",
  "statistics.underWatch": "Under watch",
  "statistics.lightlyUsed": "{count} low-utility subscription(s)",
  "statistics.totalMonthly": "Monthly total",
  "statistics.emptyPie": "Add a few subscriptions to see the category donut chart.",
  "statistics.emptyBar": "Add a few subscriptions to enable the bar chart.",
  "statistics.emptyTrend": "The monthly trend will appear here once you have some history.",
  "subscriptions.title": "Subscriptions",
  "subscriptions.subtitle": "Browse, search and manage all your recurring payments in a compact premium interface.",
  "subscriptions.active": "Active",
  "subscriptions.monthly": "Monthly",
  "subscriptions.searchPlaceholder": "Search Netflix, Spotify, Figma...",
  "subscriptions.all": "All subscriptions",
  "subscriptions.add": "Add",
  "subscriptions.archive": "Archive",
  "subscriptions.archiving": "Archiving",
  "subscriptions.loading": "Loading subscriptions...",
  "subscriptions.empty": "No subscription found.",
  "subscriptions.tryOther": "Try another keyword or add a new service.",
  "settings.title": "Settings",
  "settings.subtitle": "Control reminders, currency and account preferences in a calmer and clearer interface.",
  "settings.paymentReminders": "Payment reminders",
  "settings.trialReminders": "Trial ending reminders",
  "settings.smartNotifications": "Smart notifications",
  "settings.appLanguage": "App language",
  "settings.choose": "Choose",
  "settings.activeCurrency": "Active currency",
  "settings.colorBlindMode": "Color blind mode",
  "settings.logout": "Sign out",
  "settings.updateErrorTitle": "Update failed",
  "settings.disconnectErrorTitle": "Unable to sign out",
  "settings.languageEyebrow": "App language",
  "settings.chooseLanguage": "Choose a language",
  "settings.languageSubtitle": "The list is alphabetical and search filters it live.",
  "settings.searchLanguage": "Search a language",
  "settings.current": "Current",
  "settings.select": "Select",
  "settings.noLanguageFoundTitle": "No language found",
  "settings.noLanguageFoundBody": "Try another keyword to find the language you want.",
  "format.billing.weekly": "Weekly",
  "format.billing.monthly": "Monthly",
  "format.billing.quarterly": "Quarterly",
  "format.billing.yearly": "Yearly",
  "format.status.trial": "Trial",
  "format.status.paused": "Paused",
  "format.status.cancelled": "Cancelled",
  "format.status.active": "Active",
  "format.usage.active": "Used",
  "format.usage.unused": "Low usage",
  "format.usage.uncertain": "To review",
  "format.reminder.sameDay": "Same day",
  "format.reminder.oneDay": "1 day before",
  "format.reminder.daysBefore": "{count} days before",
  "format.insight.unused": "Subscription to watch",
  "format.insight.duplicate": "Duplicate detected",
  "format.insight.paymentDue": "Payment due soon",
  "format.insight.default": "Subly alert"
};

const translations: Record<TextLocale, Partial<TranslationMap>> = {
  fr: frenchTranslations,
  en: englishTranslations,
  de: {
    "common.back": "Zuruck",
    "nav.dashboard": "Start",
    "nav.statistics": "Statistiken",
    "auth.signIn": "Anmelden",
    "auth.createAccount": "Konto erstellen",
    "onboarding.start": "Starten",
    "dashboard.allSubscriptions": "Alle Abos",
    "dashboard.upcomingPayments": "Kommende Zahlungen",
    "statistics.title": "Statistiken",
    "subscriptions.title": "Abonnements",
    "settings.title": "Einstellungen",
    "settings.appLanguage": "App-Sprache",
    "settings.colorBlindMode": "Farbenblind-Modus",
    "settings.logout": "Abmelden"
  },
  ar: {
    "common.back": "رجوع",
    "nav.dashboard": "الرئيسية",
    "nav.statistics": "الإحصاءات",
    "auth.signIn": "تسجيل الدخول",
    "auth.createAccount": "إنشاء حساب",
    "onboarding.start": "ابدأ",
    "dashboard.allSubscriptions": "كل الاشتراكات",
    "dashboard.upcomingPayments": "المدفوعات القادمة",
    "statistics.title": "الإحصاءات",
    "subscriptions.title": "الاشتراكات",
    "settings.title": "الإعدادات",
    "settings.appLanguage": "لغة التطبيق",
    "settings.colorBlindMode": "وضع عمى الألوان",
    "settings.logout": "تسجيل الخروج"
  },
  ru: {
    "common.back": "Назад",
    "nav.dashboard": "Главная",
    "nav.statistics": "Статистика",
    "auth.signIn": "Войти",
    "auth.createAccount": "Создать аккаунт",
    "onboarding.start": "Начать",
    "dashboard.allSubscriptions": "Все подписки",
    "dashboard.upcomingPayments": "Предстоящие платежи",
    "statistics.title": "Статистика",
    "subscriptions.title": "Подписки",
    "settings.title": "Настройки",
    "settings.appLanguage": "Язык приложения",
    "settings.colorBlindMode": "Режим дальтонизма",
    "settings.logout": "Выйти"
  },
  tr: {
    "common.back": "Geri",
    "nav.dashboard": "Ana sayfa",
    "nav.statistics": "Istatistikler",
    "auth.signIn": "Giris yap",
    "auth.createAccount": "Hesap olustur",
    "onboarding.start": "Basla",
    "dashboard.allSubscriptions": "Tum abonelikler",
    "dashboard.upcomingPayments": "Yaklasan odemeler",
    "statistics.title": "Istatistikler",
    "subscriptions.title": "Abonelikler",
    "settings.title": "Ayarlar",
    "settings.appLanguage": "Uygulama dili",
    "settings.colorBlindMode": "Renk korlugu modu",
    "settings.logout": "Cikis yap"
  },
  zh: {
    "common.back": "返回",
    "nav.dashboard": "主页",
    "nav.statistics": "统计",
    "auth.signIn": "登录",
    "auth.createAccount": "创建账户",
    "onboarding.start": "开始",
    "dashboard.allSubscriptions": "全部订阅",
    "dashboard.upcomingPayments": "即将付款",
    "statistics.title": "统计",
    "subscriptions.title": "订阅",
    "settings.title": "设置",
    "settings.appLanguage": "应用语言",
    "settings.colorBlindMode": "色盲模式",
    "settings.logout": "退出登录"
  },
  ja: {
    "common.back": "戻る",
    "nav.dashboard": "ホーム",
    "nav.statistics": "統計",
    "auth.signIn": "ログイン",
    "auth.createAccount": "アカウント作成",
    "onboarding.start": "始める",
    "dashboard.allSubscriptions": "すべてのサブスク",
    "dashboard.upcomingPayments": "今後の支払い",
    "statistics.title": "統計",
    "subscriptions.title": "サブスクリプション",
    "settings.title": "設定",
    "settings.appLanguage": "アプリの言語",
    "settings.colorBlindMode": "色覚対応モード",
    "settings.logout": "ログアウト"
  }
};

let activeTextLocale: TextLocale = "fr";
let activeFormatLocale = "fr-FR";

export function setActiveLanguage() {
  activeTextLocale = "fr";
  activeFormatLocale = "fr-FR";
}

export function translate(key: TranslationKey, params?: Record<string, string | number>): string {
  const template =
    translations[activeTextLocale][key] ??
    translations.en[key] ??
    frenchTranslations[key];

  return interpolate(template, params);
}

export function getActiveFormatLocale(): string {
  return activeFormatLocale;
}

export function useAppTranslation() {
  return useMemo(() => {
    return {
      locale: "fr" as const,
      t: (key: TranslationKey, params?: Record<string, string | number>) =>
        interpolate(frenchTranslations[key], params)
    };
  }, []);
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce(
    (output, [key, value]) => output.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
    template
  );
}
