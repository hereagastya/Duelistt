/*
  Creates (or refreshes) a pre-confirmed QA account and gives it a small,
  recognisable set of prospects, so the app's screens can be looked at with
  real rows in them rather than empty states.

  Local development only. It writes the credentials to scripts/.qa.local (which
  is gitignored) instead of printing them, and it is idempotent: run it twice
  and you get the same account with the same data.

  Usage:  node scripts/qa-seed.mjs
*/

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

// .env.local is not loaded for a bare node script, so parse it here.
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line.includes("=") && !line.trimStart().startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = "qa.visual@duelistt.test";
const PASSWORD = `Qa-${randomBytes(9).toString("base64url")}`;

// A queue with one badly overdue, one mildly overdue, one due today, and one
// scheduled ahead -- enough to see every state the list can show.
const OFFSETS = [
  { name: "Priya Raman", channel: "email", contact: "priya@northwind.io", days: -9 },
  { name: "Daniel Okafor", channel: "call", contact: "+44 7700 900021", days: -4 },
  { name: "Mei Sanderson", channel: "linkedin", contact: "in/meisanderson", days: 0 },
  { name: "Tomás Herrera", channel: "dm", contact: "@tomasjh", days: 6 },
];

function dayOffset(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
const existing = list?.users.find((u) => u.email === EMAIL);

let userId;
if (existing) {
  userId = existing.id;
  await admin.auth.admin.updateUserById(userId, { password: PASSWORD, email_confirm: true });
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  userId = data.user.id;
}

// The signup trigger creates the profile; give it a moment on a fresh account.
await new Promise((r) => setTimeout(r, 600));

await admin.from("prospects").delete().eq("user_id", userId);

for (const p of OFFSETS) {
  const { data: row, error } = await admin
    .from("prospects")
    .insert({
      user_id: userId,
      name: p.name,
      contact_info: p.contact,
      channel: p.channel,
      status: "contacted",
      next_follow_up_date: dayOffset(p.days),
    })
    .select("id")
    .single();
  if (error) throw error;

  await admin.from("touches").insert({
    prospect_id: row.id,
    user_id: userId,
    touch_date: dayOffset(p.days - 7),
    channel: p.channel,
    outcome: "answered_interested",
    note: "Asked me to try again next week.",
  });
}

writeFileSync(
  new URL("../scripts/.qa.local", import.meta.url),
  `QA_EMAIL=${EMAIL}\nQA_PASSWORD=${PASSWORD}\n`,
);

console.log("QA account ready; credentials written to scripts/.qa.local");
