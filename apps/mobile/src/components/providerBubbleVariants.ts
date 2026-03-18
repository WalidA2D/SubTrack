import {
  findDisneylandPassOption,
  findParcAsterixPassOption,
  findServicePresetByProvider,
  normalizeCatalogKey
} from "@subly/shared";

export function isDisneyMickeyProvider(providerName: string) {
  const normalizedProvider = normalizeCatalogKey(providerName);
  const preset = findServicePresetByProvider(providerName);

  if (normalizedProvider === "disney_plus" || normalizedProvider === "disneyland_pass") {
    return true;
  }

  if (preset?.id === "disney_plus" || preset?.id === "disneyland_pass") {
    return true;
  }

  return Boolean(findDisneylandPassOption(providerName));
}

export function isParcAsterixIdefixProvider(providerName: string) {
  const normalizedProvider = normalizeCatalogKey(providerName);
  const preset = findServicePresetByProvider(providerName);

  if (normalizedProvider === "pass_parc_asterix") {
    return true;
  }

  if (preset?.id === "parc_asterix_pass") {
    return true;
  }

  return Boolean(findParcAsterixPassOption(providerName));
}
