import { NextResponse, type NextRequest } from "next/server";
import { Webhook } from "standardwebhooks";

import { mapSubscriptionStatus } from "@/lib/billing/dodo";
import { createAdminClient } from "@/lib/supabase/admin";

type DodoEvent = {
  type: string;
  timestamp: string;
  data?: {
    subscription_id?: string;
    status?: string;
    metadata?: Record<string, string> | null;
    customer?: { customer_id?: string } | null;
  };
};

// Verification needs the bytes exactly as sent, so this route must stay on the
// Node runtime and must never parse the body before checking the signature.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!webhookKey) {
    console.error("[dodo] DODO_PAYMENTS_WEBHOOK_KEY is not set");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  // req.text(), not req.json(). Parsing and re-serialising changes the bytes
  // and the signature will never match.
  const rawBody = await request.text();

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let event: DodoEvent;
  try {
    // Dodo follows Standard Webhooks, NOT Stripe's scheme: three headers
    // (webhook-id / webhook-timestamp / webhook-signature) and an HMAC-SHA256
    // over `{id}.{timestamp}.{body}` -- the message id in the signed string is
    // what a Stripe-shaped port silently drops. The library does the
    // constant-time compare and the replay-window check on the timestamp, both
    // of which a hand-rolled `===` would miss.
    //
    // Verification needs only the webhook secret, deliberately not the API key:
    // a deployment must never be able to receive webhooks it cannot check.
    event = new Webhook(webhookKey).verify(rawBody, headers) as DodoEvent;
  } catch (cause) {
    console.error("[dodo] webhook signature rejected", cause);
    // 400, not 500: a bad signature is not a retryable condition.
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (!event.type?.startsWith("subscription.")) {
    // Acknowledge everything else so Dodo stops retrying it.
    return NextResponse.json({ received: true });
  }

  const data = event.data ?? {};
  const userId = data.metadata?.user_id;
  if (!userId) {
    // Nothing to attach this to. Acknowledge rather than making Dodo retry
    // forever over a subscription this app cannot own.
    console.warn(`[dodo] ${event.type} carried no metadata.user_id`);
    return NextResponse.json({ received: true });
  }

  const status = mapSubscriptionStatus(data.status ?? "");
  if (!status) {
    return NextResponse.json({ received: true });
  }

  const supabase = createAdminClient();

  // Deliveries are not ordered. Read what was last applied and drop anything
  // older, so a delayed past_due cannot overwrite a newer active.
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_synced_at")
    .eq("id", userId)
    .maybeSingle<{ subscription_synced_at: string | null }>();

  if (!profile) {
    console.warn(`[dodo] ${event.type} for unknown user ${userId}`);
    return NextResponse.json({ received: true });
  }

  const eventAt = new Date(event.timestamp);
  if (
    profile.subscription_synced_at &&
    eventAt < new Date(profile.subscription_synced_at)
  ) {
    console.warn(`[dodo] ignoring out-of-order ${event.type} for ${userId}`);
    return NextResponse.json({ received: true, ignored: "stale" });
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: status,
      subscription_synced_at: eventAt.toISOString(),
      ...(data.subscription_id ? { dodo_subscription_id: data.subscription_id } : {}),
      ...(data.customer?.customer_id ? { dodo_customer_id: data.customer.customer_id } : {}),
    })
    .eq("id", userId);

  if (error) {
    // 500 so Dodo retries: the event was genuine, the write was not applied.
    console.error("[dodo] failed to apply subscription update", error);
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
