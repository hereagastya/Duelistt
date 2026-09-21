import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  digestHtml,
  digestSubject,
  digestText,
  groupByUser,
  type DigestRow,
} from "@/lib/email/digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Resend accepts up to 100 messages per batch call.
const BATCH_SIZE = 100;

/**
 * Runs hourly -- scheduled by Supabase pg_cron (migration 0008), not
 * vercel.json, because Vercel Hobby rejects crons more frequent than daily.
 *
 * Every hour this asks the database "whose chosen hour is it right now, in
 * their own timezone?" -- the hour is a per-user setting (migration 0009), not
 * a constant here. One RPC returns every due row for the whole hour, so the
 * cost is one query plus one HTTP call per 100 recipients, not a query and a
 * send per user.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[digest] CRON_SECRET is not set");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  // Vercel Cron sends the secret as a bearer token. Without this the endpoint
  // is a public trigger for sending everyone's mail.
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.DIGEST_FROM_EMAIL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!apiKey || !from || !siteUrl) {
    console.error("[digest] missing RESEND_API_KEY, DIGEST_FROM_EMAIL or NEXT_PUBLIC_SITE_URL");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  // Omitted (the normal hourly run): each user is matched against their own
  // digest_hour in their own timezone.
  //
  // `?hour=N`: an override for testing and replay -- it sends to everyone whose
  // chosen hour is N, without waiting for that hour to come round. It sits
  // behind the same bearer secret as the rest of the route, so it grants
  // nothing an authorised caller does not already have.
  const hourParam = request.nextUrl.searchParams.get("hour");
  const targetHour = hourParam === null ? null : Number(hourParam);

  if (targetHour !== null && (!Number.isInteger(targetHour) || targetHour < 0 || targetHour > 23)) {
    return NextResponse.json({ error: "hour must be 0-23" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // claim_digest, not digest_queue. Scheduled runs can be delivered more than
  // once; claiming marks each recipient as sent for their local today in the
  // same atomic UPDATE that selects them, so a duplicate or overlapping
  // invocation finds nobody left to email.
  const { data, error } = await supabase.rpc("claim_digest", { target_hour: targetHour });

  if (error) {
    console.error("[digest] claim failed", error);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }

  // The untyped client cannot infer a set-returning function's row shape.
  const digests = groupByUser((data ?? []) as DigestRow[]);

  // Users with nothing due, or already sent today, never appear in the claim
  // result, so there is no empty-digest case to filter here. An empty
  // "0 follow-ups!" email trains people to ignore the one that matters.
  if (digests.length === 0) {
    return NextResponse.json({ sent: 0, recipients: 0, hour: targetHour });
  }

  const todayUrl = `${siteUrl}/today`;
  const resend = new Resend(apiKey);

  const messages = digests.map((d) => ({
    from,
    to: d.email,
    subject: digestSubject(d.items),
    html: digestHtml(d.items, todayUrl),
    text: digestText(d.items, todayUrl),
  }));

  let sent = 0;
  const failures: string[] = [];

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);
    const batchUserIds = digests.slice(i, i + BATCH_SIZE).map((d) => d.userId);

    try {
      const { error: sendError } = await resend.batch.send(batch);
      if (sendError) throw new Error(sendError.message);
      sent += batch.length;
    } catch (cause) {
      // One failed batch must not abandon the rest of the hour's mail.
      failures.push(String(cause));
      console.error("[digest] batch failed", cause);

      // These users were claimed but never emailed. Release them so a replay
      // (?hour=) can still reach them today, rather than silently skipping a day.
      const { error: releaseError } = await supabase.rpc("release_digest_claim", {
        user_ids: batchUserIds,
      });
      if (releaseError) console.error("[digest] could not release claim", releaseError);
    }
  }

  return NextResponse.json(
    { sent, recipients: digests.length, failed: failures.length, hour: targetHour },
    // A partial failure is reported as 500 so the platform surfaces it, but the
    // successful batches have already gone out and are not retried.
    { status: failures.length > 0 ? 500 : 200 },
  );
}
