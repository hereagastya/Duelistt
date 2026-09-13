"use server";

import { revalidatePath } from "next/cache";

import { requireProfile } from "@/lib/actions/profile";
import { checkAccess } from "@/lib/billing/gate";
import { createClient } from "@/lib/supabase/server";
import { addDays, todayIn } from "@/lib/date";
import {
  CHANNELS,
  TOUCH_OUTCOMES,
  type Channel,
  type ProspectStatus,
  type TouchOutcome,
} from "@/lib/types";

export type LogTouchState = { error: string | null; ok?: boolean };

/** What happens to the prospect after the touch is recorded. */
type Disposition =
  | { kind: "schedule"; date: string }
  | { kind: "status"; status: Exclude<ProspectStatus, "contacted"> };

function parseDisposition(formData: FormData): Disposition | { error: string } {
  const raw = String(formData.get("disposition") ?? "");

  if (raw === "schedule") {
    const date = String(formData.get("next_follow_up_date") ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { error: "Pick a follow-up date." };
    }
    return { kind: "schedule", date };
  }

  if (raw === "replied" || raw === "cold" || raw === "won" || raw === "lost") {
    return { kind: "status", status: raw };
  }

  return { error: "Choose what happens next." };
}

export async function logTouch(_prev: LogTouchState, formData: FormData): Promise<LogTouchState> {
  const { userId, profile } = await requireProfile();

  const access = checkAccess(profile);
  if (!access.allowed) {
    return { error: "Your trial has ended. Subscribe to log new touches." };
  }

  const prospectId = String(formData.get("prospect_id") ?? "");
  const channel = String(formData.get("channel") ?? "") as Channel;
  const outcome = String(formData.get("outcome") ?? "") as TouchOutcome;
  const touchDate = String(formData.get("touch_date") ?? "") || todayIn(profile.timezone);
  const note = String(formData.get("note") ?? "").trim();

  if (!prospectId) return { error: "Missing prospect." };
  if (!CHANNELS.includes(channel)) return { error: "Choose a channel." };
  if (!TOUCH_OUTCOMES.includes(outcome)) return { error: "Choose an outcome." };

  const disposition = parseDisposition(formData);
  if ("error" in disposition) return { error: disposition.error };

  const supabase = await createClient();

  // RLS enforces ownership on both statements; the WITH CHECK on touches also
  // verifies the parent prospect belongs to this user.
  const { error: touchError } = await supabase.from("touches").insert({
    prospect_id: prospectId,
    user_id: userId,
    touch_date: touchDate,
    channel,
    outcome,
    note: note || null,
  });

  if (touchError) {
    return { error: "That touch could not be saved. Try again." };
  }

  const patch =
    disposition.kind === "schedule"
      ? { status: "contacted" as const, next_follow_up_date: disposition.date }
      : { status: disposition.status, next_follow_up_date: null };

  const { error: prospectError } = await supabase
    .from("prospects")
    .update(patch)
    .eq("id", prospectId);

  if (prospectError) {
    // The touch is already recorded. Say so plainly rather than implying the
    // whole action failed and inviting a duplicate log.
    return { error: "Touch saved, but the follow-up date did not update. Reload and set it again." };
  }

  revalidatePath("/today");
  revalidatePath("/prospects");
  revalidatePath(`/prospects/${prospectId}`);

  return { error: null, ok: true };
}

