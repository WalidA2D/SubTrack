import { BillingFrequency } from "@subly/shared";

export function addBillingCycle(dateIso: string, frequency: BillingFrequency): string {
  const date = new Date(dateIso);

  if (frequency === "weekly") {
    date.setDate(date.getDate() + 7);
  }

  if (frequency === "monthly") {
    date.setMonth(date.getMonth() + 1);
  }

  if (frequency === "quarterly") {
    date.setMonth(date.getMonth() + 3);
  }

  if (frequency === "yearly") {
    date.setFullYear(date.getFullYear() + 1);
  }

  return date.toISOString();
}

export function subtractDays(dateIso: string, days: number): string {
  const date = new Date(dateIso);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export function isWithinCurrentHour(dateIso: string): boolean {
  const date = new Date(dateIso).getTime();
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const hourAhead = now + 60 * 60 * 1000;
  return date >= hourAgo && date <= hourAhead;
}
