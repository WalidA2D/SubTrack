import { BillingFrequency, SubscriptionStatus, UsageCheckIn } from "@subly/shared";

import { getActiveFormatLocale, translate } from "../i18n";

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat(getActiveFormatLocale(), {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatShortDate(dateString: string): string {
  return new Intl.DateTimeFormat(getActiveFormatLocale(), {
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(dateString));
}

export function formatLongDate(dateString: string): string {
  return new Intl.DateTimeFormat(getActiveFormatLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(dateString));
}

export function formatMonthLabel(monthKey: string): string {
  return new Intl.DateTimeFormat(getActiveFormatLocale(), {
    month: "2-digit",
    year: "numeric"
  }).format(new Date(`${monthKey}-01T00:00:00.000Z`));
}

export function formatBillingFrequency(frequency: BillingFrequency): string {
  if (frequency === "weekly") {
    return translate("format.billing.weekly");
  }

  if (frequency === "quarterly") {
    return translate("format.billing.quarterly");
  }

  if (frequency === "yearly") {
    return translate("format.billing.yearly");
  }

  return translate("format.billing.monthly");
}

export function formatStatus(status: SubscriptionStatus): string {
  if (status === "trial") {
    return translate("format.status.trial");
  }

  if (status === "paused") {
    return translate("format.status.paused");
  }

  if (status === "cancelled") {
    return translate("format.status.cancelled");
  }

  return translate("format.status.active");
}

export function formatUsageCheckIn(usageCheckIn: UsageCheckIn): string {
  if (usageCheckIn === "unused") {
    return translate("format.usage.unused");
  }

  if (usageCheckIn === "uncertain") {
    return translate("format.usage.uncertain");
  }

  return translate("format.usage.active");
}

export function formatReminderDays(days: number): string {
  if (days <= 0) {
    return translate("format.reminder.sameDay");
  }

  if (days === 1) {
    return translate("format.reminder.oneDay");
  }

  return translate("format.reminder.daysBefore", { count: days });
}

export function formatInsightTitle(type: string): string {
  if (type === "unused_subscription") {
    return translate("format.insight.unused");
  }

  if (type === "duplicate_subscription") {
    return translate("format.insight.duplicate");
  }

  if (type === "payment_due") {
    return translate("format.insight.paymentDue");
  }

  return translate("format.insight.default");
}

export function formatInsightMessage(insight: {
  type: string;
  providerName?: string;
  count?: number;
  message?: string;
}): string {
  if (insight.type === "unused_subscription" && insight.providerName) {
    return translate("format.insightBody.unused", {
      providerName: insight.providerName
    });
  }

  if (
    insight.type === "duplicate_subscription" &&
    insight.providerName &&
    typeof insight.count === "number"
  ) {
    return translate("format.insightBody.duplicate", {
      count: insight.count,
      providerName: insight.providerName
    });
  }

  return insight.message || translate("format.insightBody.default");
}

export function toDateInputValue(dateString: string): string {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat(getActiveFormatLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

export function toIsoDate(dateInput: string): string {
  const trimmedInput = dateInput.trim();
  const isFrench = getActiveFormatLocale().startsWith("fr");
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
    throw new Error(
      isFrench
        ? "La date doit etre au format JJ/MM/AAAA."
        : "Date must use the DD/MM/YYYY format."
    );
  }

  const normalizedDate = new Date(Date.UTC(year, month - 1, day, 9, 0, 0));
  const isValidDate =
    normalizedDate.getUTCFullYear() === year &&
    normalizedDate.getUTCMonth() === month - 1 &&
    normalizedDate.getUTCDate() === day;

  if (!isValidDate) {
    throw new Error(isFrench ? "La date saisie est invalide." : "The entered date is invalid.");
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
