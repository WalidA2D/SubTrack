const palettes = [
  {
    solid: "#FFB84D",
    soft: "rgba(255, 184, 77, 0.18)",
    border: "rgba(255, 184, 77, 0.3)",
    text: "#1E1403"
  },
  {
    solid: "#8C7BFF",
    soft: "rgba(140, 123, 255, 0.18)",
    border: "rgba(140, 123, 255, 0.28)",
    text: "#F5F3FF"
  },
  {
    solid: "#45D48B",
    soft: "rgba(69, 212, 139, 0.18)",
    border: "rgba(69, 212, 139, 0.26)",
    text: "#04160D"
  },
  {
    solid: "#FF667A",
    soft: "rgba(255, 102, 122, 0.16)",
    border: "rgba(255, 102, 122, 0.26)",
    text: "#22060B"
  },
  {
    solid: "#8CB8FF",
    soft: "rgba(140, 184, 255, 0.18)",
    border: "rgba(140, 184, 255, 0.26)",
    text: "#081322"
  }
] as const;

export function getSubscriptionPalette(seedSource: string) {
  const seed = seedSource
    .split("")
    .reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

  return palettes[seed % palettes.length];
}

export function getSubscriptionInitials(providerName: string) {
  return providerName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
