"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { requireProfile } from "@/lib/actions/profile";
import { dodoClient, isPlan, productIdFor } from "@/lib/billing/dodo";

export type CheckoutState = { error: string | null };

/**
 * Sends the user to Dodo's hosted checkout. The user id travels in `metadata`,
 * because that is what comes back on the webhook -- matching on email instead
 * would break the moment someone pays with a different address than they
 * signed up with.
 */
export async function startCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const plan = String(formData.get("plan") ?? "");
  if (!isPlan(plan)) return { error: "Choose a plan." };

  const { userId, email, profile } = await requireProfile();

  // Defence in depth, not just a hidden button: a stale page or a hand-posted
  // form must not be able to open a second checkout for someone who is already
  // subscribed. Dodo would create a second subscription and charge again, and
  // the webhook would overwrite dodo_subscription_id, leaving the first one
  // billing with nothing in this database pointing at it.
  if (profile.subscription_status === "active") {
    return { error: "You already have an active subscription. Manage it from the billing portal." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return { error: "Checkout is not configured yet." };

  let checkoutUrl: string;

  try {
    const session = await dodoClient().checkoutSessions.create({
      product_cart: [{ product_id: productIdFor(plan), quantity: 1 }],
      customer: profile.dodo_customer_id
        ? { customer_id: profile.dodo_customer_id }
        : { email, name: email },
      metadata: { user_id: userId, plan },
      return_url: `${siteUrl}/billing?checkout=complete`,
    });

    if (!session.checkout_url) {
      return { error: "Dodo did not return a checkout link. Try again." };
    }
    checkoutUrl = session.checkout_url;
  } catch (cause) {
    // Never surface the provider's raw error: it can carry account details,
    // and it means nothing to the person reading it.
    console.error("[billing] checkout session failed", cause);
    return { error: "Checkout could not be started. Try again in a moment." };
  }

  // Outside the try: redirect() signals by throwing, and catching it here would
  // turn a successful checkout into an error message.
  // The cast is for typedRoutes, which types redirect() against this app's own
  // routes; this one deliberately leaves the app for Dodo's hosted checkout.
  redirect(checkoutUrl as Route);
}

export type PortalState = { error: string | null };

/**
 * Sends an existing subscriber to Dodo's customer portal, where cancelling and
 * changing a payment method belong. This is what an active subscriber gets
 * instead of a checkout button.
 */
export async function openCustomerPortal(
  _prev: PortalState,
  _formData: FormData,
): Promise<PortalState> {
  const { profile } = await requireProfile();

  if (!profile.dodo_customer_id) {
    return { error: "There is no billing account for this user yet." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  let link: string;

  try {
    const session = await dodoClient().customers.customerPortal.create(
      profile.dodo_customer_id,
      siteUrl ? { return_url: `${siteUrl}/billing` } : undefined,
    );
    link = session.link;
  } catch (cause) {
    console.error("[billing] customer portal session failed", cause);
    return { error: "Could not open the billing portal. Try again in a moment." };
  }

  redirect(link as Route);
}
