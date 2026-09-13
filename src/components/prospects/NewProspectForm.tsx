"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { createProspect, type NewProspectState } from "@/lib/actions/prospects";
import { followUpPresets } from "@/lib/followups";
import { Button } from "@/components/ui/Button";
import { FormError, Input, Label, Select, Textarea } from "@/components/ui/Field";
import {
  CHANNEL_LABELS,
  CHANNELS,
  OUTCOME_LABELS,
  OUTCOMES_BY_CHANNEL,
  TOUCH_OUTCOMES,
  type Channel,
} from "@/lib/types";

const INITIAL: NewProspectState = { error: null };

// What each channel actually holds, so the field stops being a mystery box.
const CONTACT_PLACEHOLDER: Record<Channel, string> = {
  email: "priya@northwind.com",
  call: "+44 7700 900112",
  dm: "@priyaraman",
  linkedin: "linkedin.com/in/priyaraman",
  other: "However you reach them",
};

export function NewProspectForm({
  today,
  timezone,
  defaultInterval,
}: {
  today: string;
  timezone: string;
  defaultInterval: number;
}) {
  const [state, formAction, pending] = useActionState(createProspect, INITIAL);
  const [channel, setChannel] = useState<Channel>("email");

  const presets = followUpPresets(timezone, defaultInterval);
  const defaultDate = presets.find((p) => p.days === defaultInterval) ?? presets[0]!;
  const [followUpDate, setFollowUpDate] = useState(defaultDate.date);

  const preferredOutcomes = OUTCOMES_BY_CHANNEL[channel];
  const outcomes = [
    ...preferredOutcomes,
    ...TOUCH_OUTCOMES.filter((o) => !preferredOutcomes.includes(o)),
  ];

  return (
    <form action={formAction} className="flex flex-col gap-5 border-t border-rule pt-6">
      <input type="hidden" name="next_follow_up_date" value={followUpDate} />

      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required autoFocus placeholder="Priya Raman" />
      </div>

      <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
        <div>
          <Label htmlFor="channel">Channel</Label>
          <Select
            id="channel"
            name="channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel)}
          >
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {CHANNEL_LABELS[c]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="contact_info">Where to reach them</Label>
          <Input
            id="contact_info"
            name="contact_info"
            required
            placeholder={CONTACT_PLACEHOLDER[channel]}
          />
        </div>
      </div>

      <div className="border-t border-rule pt-5">
        <p className="mb-4 text-[13px] font-medium text-ink-soft">
          The first touch
          <span className="ml-2 font-normal text-ink-faint">
            You have already contacted them — this records it.
          </span>
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="outcome">What happened</Label>
            <Select key={channel} id="outcome" name="outcome" defaultValue={outcomes[0]} required>
              {outcomes.map((o) => (
                <option key={o} value={o}>
                  {OUTCOME_LABELS[o]}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="note" hint="Optional">
              Note
            </Label>
            <Textarea
              id="note"
              name="note"
              rows={2}
              placeholder="Sent the pricing one-pager after the webinar"
            />
          </div>
        </div>
      </div>

      <fieldset className="border-t border-rule pt-5">
        <legend className="mb-2.5 text-[13px] font-medium text-ink-soft">Follow up</legend>

        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => setFollowUpDate(p.date)}
              aria-pressed={followUpDate === p.date}
              className={`rounded-sm border px-2.5 py-1 text-[13px] transition-colors duration-150 ${
                followUpDate === p.date
                  ? "border-accent bg-accent-wash text-ink"
                  : "border-rule text-ink-soft hover:border-ink-faint hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          ))}
          <input
            type="date"
            aria-label="Custom follow-up date"
            value={followUpDate}
            min={today}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="tnum rounded-sm border border-rule bg-paper px-2 py-1 text-[13px] text-ink-soft transition-colors duration-150 hover:border-ink-faint focus:border-accent focus:outline-none"
          />
        </div>
      </fieldset>

      {state.error && <FormError>{state.error}</FormError>}

      <div className="flex items-center gap-3 border-t border-rule pt-5">
        <Button type="submit" pending={pending}>
          {pending ? "Saving" : "Add prospect"}
        </Button>
        <Link href="/today" className="text-[14px] text-ink-soft hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
