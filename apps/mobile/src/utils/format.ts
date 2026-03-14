import { BillingFrequency, SubscriptionStatus, UsageCheckIn } from "@subly/shared";

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatShortDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short"
  }).format(new Date(dateString));
}

export function formatLongDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(dateString));
}

export function formatMonthLabel(monthKey: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric"
  }).format(new Date(`${monthKey}-01T00:00:00.000Z`));
}

export function formatBillingFrequency(frequency: BillingFrequency): string {
  if (frequency === "weekly") {
    return "Hebdomadaire";
  }

  if (frequency === "yearly") {
    return "Annuel";
  }

  return "Mensuel";
}

export function formatStatus(status: SubscriptionStatus): string {
  if (status === "trial") {
    return "Essai";
  }

  if (status === "paused") {
    return "En pause";
  }

  if (status === "cancelled") {
    return "Annule";
  }

  return "Actif";
}

export function formatUsageCheckIn(usageCheckIn: UsageCheckIn): string {
  if (usageCheckIn === "unused") {
    return "Peu utilise";
  }

  if (usageCheckIn === "uncertain") {
    return "A verifier";
  }

  return "Utilise";
}

export function formatReminderDays(days: number): string {
  if (days <= 0) {
    return "Le jour meme";
  }

  if (days === 1) {
    return "1 jour avant";
  }

  return `${days} jours avant`;
}

export function formatInsightTitle(type: string): string {
  if (type === "unused_subscription") {
    return "Abonnement a surveiller";
  }

  if (type === "duplicate_subscription") {
    return "Doublon detecte";
  }

  if (type === "payment_due") {
    return "Paiement a venir";
  }

  return "Alerte Subly";
}

export function toDateInputValue(dateString: string): string {
  return dateString.slice(0, 10);
}

export function toIsoDate(dateInput: string): string {
  return new Date(`${dateInput}T09:00:00.000Z`).toISOString();
}

export function buildCategoryId(categoryName: string, userId?: string): string {
  const normalized = categoryName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const base = `cat_${normalized || "general"}`;

  return userId ? `${userId}_${base}` : base;
}
