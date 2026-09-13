import "server-only";

import type { Profile } from "@/lib/types";

export type Access =
  | { allowed: true; reason: "active" | "trialing"; trialDaysLeft?: number }
  | { allowed: false; reason: "trial_expired" | "no_subscription" };

/**
 * The paywall. A 7-day trial with no card, then an active subscription is
 * required to CREATE prospects or touches. Reading existing data is never
 * gated -- locking someone out of their own history is how you lose the
 * renewal and the goodwill at once.
 */
export function checkAccess(profile: Pick<Profile, "subscription_status" | "trial_ends_at">): Access {
  if (profile.subscription_status === "active" || profile.subscription_status === "past_due") {
    // past_due still writes: Dodo retries for days, and locking someone out
    // over a card that expired this morning is a support ticket, not a save.
    return { allowed: true, reason: "active" };
  }

  if (profile.subscription_status === "trialing") {
    const msLeft = Date.parse(profile.trial_ends_at) - Date.now();
    if (msLeft > 0) {
      return {
        allowed: true,
        reason: "trialing",
        trialDaysLeft: Math.ceil(msLeft / 86_400_000),
      };
    }
    return { allowed: false, reason: "trial_expired" };
  }

  return { allowed: false, reason: "no_subscription" };
}
