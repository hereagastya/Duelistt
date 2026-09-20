import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** The signed-in user and their profile. Redirects to /login if neither exists. */
export async function requireProfile(): Promise<{ userId: string; email: string; profile: Profile }> {
  const supabase = await createClient();

  // getClaims() verifies the token signature locally rather than asking the
  // Auth server, so this does not add a second network round trip on top of the
  // one the proxy already paid. The identity is still cryptographically
  // established -- see the note in lib/supabase/middleware.ts.
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims as { sub?: string; email?: string } | undefined;
  const userId = claims?.sub;

  if (!userId) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single<Profile>();

  // The on_auth_user_created trigger guarantees a row. A miss here means the
  // trigger was dropped or the migration never ran -- fail loudly rather than
  // inventing defaults that would quietly send digests at the wrong hour.
  if (!profile) {
    throw new Error(`No profile row for user ${userId}. Is migration 0001 applied?`);
  }

  return { userId, email: claims?.email ?? "", profile };
}
