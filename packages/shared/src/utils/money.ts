import { BillingFrequency } from "../models/domain";

export function toMonthlyAmount(price: number, frequency: BillingFrequency): number {
  if (frequency === "weekly") {
    return roundToTwo(price * 52 / 12);
  }

  if (frequency === "quarterly") {
    return roundToTwo(price / 3);
  }

  if (frequency === "yearly") {
    return roundToTwo(price / 12);
  }

  return roundToTwo(price);
}

export function toYearlyAmount(price: number, frequency: BillingFrequency): number {
  if (frequency === "weekly") {
    return roundToTwo(price * 52);
  }

  if (frequency === "quarterly") {
    return roundToTwo(price * 4);
  }

  if (frequency === "monthly") {
    return roundToTwo(price * 12);
  }

  return roundToTwo(price);
}

export function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
