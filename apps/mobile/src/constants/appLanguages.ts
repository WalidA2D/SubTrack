import { DEFAULT_LANGUAGE } from "@subly/shared";

export type SupportedAppLocale = "fr" | "en" | "de" | "ar" | "ru" | "tr" | "zh" | "ja";

export type AppLanguageOption = {
  value: string;
  label: string;
  textLocale: SupportedAppLocale;
  formatLocale: string;
  aliases: string[];
};

export const APP_LANGUAGE_OPTIONS: AppLanguageOption[] = [
  {
    value: "francais",
    label: "Francais",
    textLocale: "fr",
    formatLocale: "fr-FR",
    aliases: ["fr", "french", "francais", "francais"]
  },
  {
    value: "anglais",
    label: "English",
    textLocale: "en",
    formatLocale: "en-US",
    aliases: ["en", "english", "anglais"]
  },
  {
    value: "allemand",
    label: "Deutsch",
    textLocale: "de",
    formatLocale: "de-DE",
    aliases: ["de", "german", "allemand", "deutsch"]
  },
  {
    value: "arabe",
    label: "Arabic",
    textLocale: "ar",
    formatLocale: "ar",
    aliases: ["ar", "arabic", "arabe"]
  },
  {
    value: "russe",
    label: "Russian",
    textLocale: "ru",
    formatLocale: "ru-RU",
    aliases: ["ru", "russian", "russe"]
  },
  {
    value: "turc",
    label: "Turkish",
    textLocale: "tr",
    formatLocale: "tr-TR",
    aliases: ["tr", "turkish", "turc"]
  },
  {
    value: "chinois",
    label: "Chinese",
    textLocale: "zh",
    formatLocale: "zh-CN",
    aliases: ["zh", "chinese", "chinois"]
  },
  {
    value: "japonais",
    label: "Japanese",
    textLocale: "ja",
    formatLocale: "ja-JP",
    aliases: ["ja", "japanese", "japonais"]
  }
];

const defaultAppLanguage =
  APP_LANGUAGE_OPTIONS.find((option) => option.value === DEFAULT_LANGUAGE) ??
  APP_LANGUAGE_OPTIONS[0];

const appLanguageIndex = APP_LANGUAGE_OPTIONS.reduce<Map<string, AppLanguageOption>>(
  (index, option) => {
    index.set(normalizeAppLanguageSearch(option.value), option);
    index.set(normalizeAppLanguageSearch(option.label), option);
    option.aliases.forEach((alias) => {
      index.set(normalizeAppLanguageSearch(alias), option);
    });
    return index;
  },
  new Map()
);

export function getAppLanguageOption(language?: string | null): AppLanguageOption {
  const normalizedLanguage = normalizeAppLanguageSearch(language ?? "");

  if (!normalizedLanguage) {
    return defaultAppLanguage;
  }

  return appLanguageIndex.get(normalizedLanguage) ?? defaultAppLanguage;
}

export function getAppLanguageLabel(language?: string | null): string {
  return getAppLanguageOption(language).label;
}

export function getAppLanguageValue(language?: string | null): string {
  return getAppLanguageOption(language).value;
}

export function normalizeAppLanguageSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
