import { DEFAULT_LANGUAGE } from "@subly/shared";

export type LanguageOption = {
  id: string;
  label: string;
};

const collator = new Intl.Collator("fr", {
  sensitivity: "base"
});

const rawLanguages = [
  "abenaki",
  "afrikaans",
  "albanais",
  "allemand",
  "alsacien",
  "amharique",
  "anglais",
  "arabe",
  "araméen",
  "araméen occidental moderne ou néo-araméen occidental",
  "arménien",
  "assamais",
  "azéri",
  "bachkir",
  "basque",
  "bengali",
  "berbère",
  "bichelamar",
  "biélorusse",
  "birman",
  "bosniaque",
  "brahui",
  "breton",
  "bulgare",
  "cambodge",
  "carélien",
  "catalan",
  "cherokee",
  "ciluba",
  "comorien",
  "coréen",
  "cornique",
  "créole",
  "croate",
  "dalmate",
  "danois",
  "dari",
  "drehu",
  "écossais",
  "edo",
  "espagnol",
  "espéranto",
  "estonien",
  "farsi",
  "finnois",
  "français",
  "frioulan",
  "frison",
  "galicien",
  "gallo",
  "gallois",
  "géorgien",
  "gotique",
  "grec ancien",
  "grec moderne",
  "guarani",
  "gujarati",
  "haoussa",
  "hébreu",
  "hindi",
  "hittite",
  "hongrois",
  "ilokano",
  "indonésien",
  "interlingua",
  "inuit",
  "inuktitut",
  "irlandais",
  "islandais",
  "italien",
  "japonais",
  "javanais",
  "jersiais",
  "judéo-espagnol",
  "kannada",
  "kashmiri",
  "kazakh",
  "khanty",
  "khmer",
  "kikai",
  "kim",
  "kirghiz",
  "kunigami",
  "kurde",
  "ladin",
  "laotien",
  "lapon",
  "latin",
  "letton",
  "lingala",
  "lituanien",
  "live",
  "luxembourgeois",
  "macédonien",
  "malais",
  "malayalam",
  "malgache",
  "mandé",
  "mannois",
  "mansi",
  "marathi",
  "mari",
  "masana ou masa",
  "maya",
  "meitei",
  "miyako",
  "mongol",
  "nahuatl",
  "nauruan",
  "néerlandais",
  "népalais",
  "néware",
  "niçois",
  "normand",
  "norvégien",
  "nushu",
  "occitan",
  "okinawais",
  "oriya",
  "ossète",
  "ouïgour",
  "ourdou",
  "ouzbek",
  "pâli",
  "pashto",
  "penjabi",
  "persan",
  "peul",
  "picard",
  "pijin",
  "polonais",
  "portugais",
  "prâkrit",
  "provençal",
  "qiang",
  "quechua",
  "rDzong-kha",
  "romanche",
  "roumain",
  "rromani",
  "russe",
  "same",
  "sanskrit",
  "sarde",
  "scots",
  "serbe",
  "serbo-croate",
  "sicilien",
  "slovaque",
  "slovène",
  "sorabe",
  "suédois",
  "swahili",
  "tadjik",
  "tagalog",
  "tahitien",
  "tamoul",
  "tangoute",
  "Taraon-Digaru",
  "tatar",
  "tchèque",
  "tchérémisse",
  "tchétchène",
  "tchiluba",
  "télougou",
  "thaï",
  "tibétain",
  "tigrinya",
  "tok pisin",
  "tokharien",
  "toungouse",
  "toupouri",
  "turc",
  "turkmène",
  "ukrainien",
  "vepse",
  "vietnamien",
  "volapük",
  "vote",
  "wallon",
  "wolof",
  "xhosa",
  "yiddish",
  "yonaguni",
  "yoruba",
  "zoulou"
] as const;

export const LANGUAGE_OPTIONS: LanguageOption[] = [...new Set(rawLanguages)]
  .sort((left, right) => collator.compare(left, right))
  .map((label) => ({
    id: toLanguageId(label),
    label
  }));

const languageIndex = LANGUAGE_OPTIONS.reduce<Map<string, LanguageOption>>((index, option) => {
  index.set(option.id, option);
  index.set(normalizeLanguageSearch(option.label), option);
  return index;
}, new Map());

const defaultLanguageOption =
  languageIndex.get(toLanguageId(DEFAULT_LANGUAGE)) ??
  languageIndex.get(normalizeLanguageSearch(DEFAULT_LANGUAGE)) ??
  LANGUAGE_OPTIONS.find((option) => option.id === "francais") ??
  LANGUAGE_OPTIONS[0];

export function getLanguageOption(language?: string | null): LanguageOption | undefined {
  const normalizedLanguage = normalizeLanguageSearch(language?.trim() ?? "");

  if (!normalizedLanguage) {
    return defaultLanguageOption;
  }

  return languageIndex.get(normalizedLanguage) ?? defaultLanguageOption;
}

export function getLanguageLabel(language?: string | null): string {
  return getLanguageOption(language)?.label ?? defaultLanguageOption?.label ?? DEFAULT_LANGUAGE;
}

export function getLanguageValue(language?: string | null): string {
  return getLanguageOption(language)?.id ?? defaultLanguageOption?.id ?? toLanguageId(DEFAULT_LANGUAGE);
}

export function normalizeLanguageSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function toLanguageId(label: string): string {
  return normalizeLanguageSearch(label).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
