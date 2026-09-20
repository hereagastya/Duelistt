// Exercises the Dodo webhook route's signature verification.
// Uses a non-subscription event type so a verified request returns immediately
// without needing the Supabase service-role key.

import { readFileSync } from "node:fs";
import { Webhook } from "standardwebhooks";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

// Usage: node scripts/verify-webhook.mjs [url] [secret]
// Defaults to localhost and the secret in .env.local; pass the deployed URL and
// the real webhook secret to check production.
const URL = process.argv[2] || "http://localhost:3000/api/dodo/webhook";
const SECRET = process.argv[3] || env.DODO_PAYMENTS_WEBHOOK_KEY;

if (!SECRET) {
  console.error("No webhook secret: pass one as argv[3] or set DODO_PAYMENTS_WEBHOOK_KEY.");
  process.exit(1);
}
console.log(`target: ${URL}\n`);

const payload = JSON.stringify({
  business_id: "biz_test",
  type: "payment.succeeded",
  timestamp: new Date().toISOString(),
  data: { payment_id: "pay_test" },
});

const wh = new Webhook(SECRET.replace(/^whsec_/, ""));
const msgId = "msg_test_1";
const now = new Date();

function headersFor(id, date, body, signer = wh) {
  return {
    "webhook-id": id,
    "webhook-timestamp": Math.floor(date.getTime() / 1000).toString(),
    "webhook-signature": signer.sign(id, date, body),
    "content-type": "application/json",
  };
}

async function post(label, body, headers, expected) {
  const res = await fetch(URL, { method: "POST", headers, body });
  const text = await res.text();
  const ok = res.status === expected;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label.padEnd(38)} -> ${res.status} (expected ${expected})  ${text.slice(0, 60)}`,
  );
  return ok;
}

const results = [];

// 1. Correctly signed request must be accepted.
results.push(await post("valid signature", payload, headersFor(msgId, now, payload), 200));

// 2. Body tampered after signing.
{
  const h = headersFor(msgId, now, payload);
  const tampered = payload.replace("pay_test", "pay_ATTACK");
  results.push(await post("tampered body", tampered, h, 400));
}

// 3. Signed with a different secret.
{
  const other = new Webhook(Buffer.from("a-completely-different-secret-value").toString("base64"));
  results.push(await post("wrong secret", payload, headersFor(msgId, now, payload, other), 400));
}

// 4. The message id is part of the signed string -- swapping it must fail.
//    This is exactly what a Stripe-shaped implementation drops.
{
  const h = headersFor(msgId, now, payload);
  h["webhook-id"] = "msg_test_SWAPPED";
  results.push(await post("swapped webhook-id", payload, h, 400));
}

// 5. Replay outside the tolerance window.
{
  const old = new Date(Date.now() - 60 * 60 * 1000);
  results.push(await post("replayed (1h old timestamp)", payload, headersFor(msgId, old, payload), 400));
}

// 6. No signature headers at all.
results.push(
  await post("no signature headers", payload, { "content-type": "application/json" }, 400),
);

console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
