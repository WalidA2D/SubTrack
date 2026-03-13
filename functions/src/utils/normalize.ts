export function normalizeProviderName(providerName: string): string {
  return providerName
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}
