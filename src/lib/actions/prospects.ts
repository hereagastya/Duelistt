"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireProfile } from "@/lib/actions/profile";
import { checkAccess } from "@/lib/billing/gate";
import { createClient } from "@/lib/supabase/server";
import { todayIn } from "@/lib/date";
import {
  CHANNELS,
  TOUCH_OUTCOMES,
  type Channel,
  type TouchOutcome,
} from "@/lib/types";

export type NewProspectState = { error: string | null };

/**
 * Creates the prospect and its first touch together. A prospect with no touch
 * history would be a contact, not an outreach record -- and `status` has no
 * `new` value precisely because this path always writes one.
 */
export async function createProspect(
  _prev: NewProspectState,
  formData: FormData,
): Promise<NewProspectState> {
  const { userId, profile } = await requireProfile();

  const access = checkAccess(profile);
  if (!access.allowed) {
    return { error: "Your trial has ended. Subscribe to add prospects." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const contactInfo = String(formData.get("contact_info") ?? "").trim();
  const channel = String(formData.get("channel") ?? "") as Channel;
  const outcome = String(formData.get("outcome") ?? "") as TouchOutcome;
  const note = String(formData.get("note") ?? "").trim();
  const followUpDate = String(formData.get("next_follow_up_date") ?? "");
  const touchDate = todayIn(profile.timezone);

  if (!name) return { error: "Enter a name." };
  if (!contactInfo) return { error: "Enter an email, phone number, or handle." };
  if (!CHANNELS.includes(channel)) return { error: "Choose a channel." };
  if (!TOUCH_OUTCOMES.includes(outcome)) return { error: "Choose what happened." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(followUpDate)) {
    return { error: "Pick a follow-up date." };
  }

  const supabase = await createClient();

  const { data: prospect, error: prospectError } = await supabase
    .from("prospects")
    .insert({
      user_id: userId,
      name,
      contact_info: contactInfo,
      channel,
      status: "contacted",
      next_follow_up_date: followUpDate,
    })
    .select("id")
    .single<{ id: string }>();

  if (prospectError || !prospect) {
    return { error: "That prospect could not be saved. Try again." };
  }

  const { error: touchError } = await supabase.from("touches").insert({
    prospect_id: prospect.id,
    user_id: userId,
    touch_date: touchDate,
    channel,
    outcome,
    note: note || null,
  });

  if (touchError) {
    // The prospect exists but has no history. Remove it rather than leaving a
    // half-made record that the Today view would show with no note.
    await supabase.from("prospects").delete().eq("id", prospect.id);
    return { error: "That prospect could not be saved. Try again." };
  }

  revalidatePath("/today");
  revalidatePath("/prospects");
  redirect("/today");
}
