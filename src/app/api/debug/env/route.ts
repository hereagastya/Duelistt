import { NextResponse, type NextRequest } from "next/server";

// TEMPORARY diagnostic. Reports whether env vars are visible to the running
// deployment -- names, presence and lengths only, never values. Gated behind
// CRON_SECRET so it is not a public inventory of the configuration.
// Delete once the Dodo configuration is confirmed.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEYS = [
  "DODO_PAYMENTS_API_KEY",
  "DODO_PAYMENTS_WEBHOOK_KEY",
  "DODO_PRODUCT_ID_MONTHLY",
  "DODO_PRODUCT_ID_ANNUAL",
  "DODO_PAYMENTS_ENVIRONMENT",
  "NEXT_PUBLIC_SITE_URL",
];

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const checked: Record<string, { present: boolean; length: number }> = {};
  for (const key of KEYS) {
    const value = process.env[key];
    checked[key] = { present: typeof value === "string" && value.length > 0, length: value?.length ?? 0 };
  }

  return NextResponse.json({
    checked,
    // Names only. Catches a typo, a rename, or a trailing space in the key.
    dodoKeysPresentInProcess: Object.keys(process.env).filter((k) =>
      k.toUpperCase().includes("DODO"),
    ),
    // Not a secret, and the value decides which Dodo ledger is used.
    dodoEnvironmentValue: process.env.DODO_PAYMENTS_ENVIRONMENT ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  });
}
