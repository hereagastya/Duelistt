import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** The signed-in user and their profile. Redirects to /login if neither exists. */
export async function requireProfile(): Promise<{ userId: string; email: string; profile: Profile }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  // The on_auth_user_created trigger guarantees a row. A miss here means the
  // trigger was dropped or the migration never ran -- fail loudly rather than
  // inventing defaults that would quietly send digests at the wrong hour.
  if (!profile) {
    throw new Error(`No profile row for user ${user.id}. Is migration 0001 applied?`);
  }

  return { userId: user.id, email: user.email ?? "", profile };
}
