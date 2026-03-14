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
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(dateString));
}

export function formatLongDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(dateString));
}

export function formatMonthLabel(monthKey: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "2-digit",
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
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

export function toIsoDate(dateInput: string): string {
  const trimmedInput = dateInput.trim();
  let year: number;
  let month: number;
  let day: number;

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmedInput)) {
    const [dayValue, monthValue, yearValue] = trimmedInput.split("/");
    day = Number(dayValue);
    month = Number(monthValue);
    year = Number(yearValue);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedInput)) {
    const [yearValue, monthValue, dayValue] = trimmedInput.split("-");
    day = Number(dayValue);
    month = Number(monthValue);
    year = Number(yearValue);
  } else {
    throw new Error("La date doit etre au format JJ/MM/AAAA.");
  }

  const normalizedDate = new Date(Date.UTC(year, month - 1, day, 9, 0, 0));
  const isValidDate =
    normalizedDate.getUTCFullYear() === year &&
    normalizedDate.getUTCMonth() === month - 1 &&
    normalizedDate.getUTCDate() === day;

  if (!isValidDate) {
    throw new Error("La date saisie est invalide.");
  }

  return normalizedDate.toISOString();
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
