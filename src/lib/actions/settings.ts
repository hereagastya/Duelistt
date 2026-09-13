"use server";

import { revalidatePath } from "next/cache";

import { requireProfile } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/server";

export type SettingsState = { error: string | null; saved?: boolean };

export async function updateSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { userId } = await requireProfile();

  const interval = Number(formData.get("default_follow_up_interval"));
  const timezone = String(formData.get("timezone") ?? "").trim();
  const digestEnabled = formData.get("digest_enabled") === "on";

  if (!Number.isInteger(interval) || interval < 1 || interval > 365) {
    return { error: "Follow-up interval must be between 1 and 365 days." };
  }
  if (!timezone) {
    return { error: "Choose a timezone." };
  }

  const supabase = await createClient();

  // These three columns are the only ones `authenticated` holds an UPDATE grant
  // on. Billing columns are the webhook's to write, not the user's.
  const { error } = await supabase
    .from("profiles")
    .update({
      default_follow_up_interval: interval,
      timezone,
      digest_enabled: digestEnabled,
    })
    .eq("id", userId);

  if (error) {
    // The timezone trigger raises check_violation on an unknown IANA name.
    if (error.code === "23514") {
      return { error: `${timezone} is not a timezone this server recognises.` };
    }
    return { error: "Those settings could not be saved. Try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/today");

  return { error: null, saved: true };
}
