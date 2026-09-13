import "server-only";

import DodoPayments from "dodopayments";

import type { SubscriptionStatus } from "@/lib/types";

export type Plan = "monthly" | "annual";

export function isPlan(value: string): value is Plan {
  return value === "monthly" || value === "annual";
}

export function productIdFor(plan: Plan): string {
  const id =
    plan === "monthly"
      ? process.env.DODO_PRODUCT_ID_MONTHLY
      : process.env.DODO_PRODUCT_ID_ANNUAL;

  if (!id) {
    throw new Error(
      `Missing product id for the ${plan} plan. Set DODO_PRODUCT_ID_${plan === "monthly" ? "MONTHLY" : "ANNUAL"}.`,
    );
  }
  return id;
}

export function dodoClient() {
  const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
  if (!bearerToken) throw new Error("Missing DODO_PAYMENTS_API_KEY.");

  return new DodoPayments({
    bearerToken,
    // "live_mode" in production. Getting this wrong points checkout at the
    // wrong ledger entirely, so it is read explicitly rather than defaulted.
    environment:
      process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
  });
}

/**
 * Dodo has eight subscription states; this product stores five. The mapping is
 * deliberate rather than a pass-through:
 *
 * - `past_due` keeps write access. Dodo retries a failed card for days, and
 *   locking someone out the morning their card expired is a support ticket.
 * - `on_hold` and `paused` mean the grace period is over, so they must block.
 *   They collapse into `cancelled` because the schema has no distinct suspended
 *   state. That is a real loss of nuance: a paused subscriber is told
 *   "cancelled". Splitting them apart later is an additive enum migration.
 * - `pending` means checkout has not completed. It returns null so the webhook
 *   leaves the row alone rather than knocking a trialing user out of their
 *   trial mid-checkout.
 */
export function mapSubscriptionStatus(
  dodoStatus: string,
): SubscriptionStatus | null {
  switch (dodoStatus) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "expired":
      return "expired";
    case "cancelled":
    case "failed":
    case "on_hold":
    case "paused":
      return "cancelled";
    case "pending":
      return null;
    default:
      return null;
  }
}
