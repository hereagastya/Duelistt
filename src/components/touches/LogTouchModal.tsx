"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";

import { logTouch, type LogTouchState } from "@/lib/actions/touches";
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

const INITIAL: LogTouchState = { error: null };

type Props = {
  open: boolean;
  onClose: () => void;
  prospect: { id: string; name: string; channel: Channel };
  today: string;
  timezone: string;
  defaultInterval: number;
};

export function LogTouchModal({
  open,
  onClose,
  prospect,
  today,
  timezone,
  defaultInterval,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(logTouch, INITIAL);
  const [channel, setChannel] = useState<Channel>(prospect.channel);
  const [disposition, setDisposition] = useState("schedule");
  const [followUpDate, setFollowUpDate] = useState(today);

  const presets = followUpPresets(timezone, defaultInterval);

  // Native <dialog> gives focus trapping, Esc-to-close, and an inert
  // background for free. Reimplementing those in React gets them wrong.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Reset on each open so a previous prospect never bleeds into the next one.
  useEffect(() => {
    if (!open) return;
    setChannel(prospect.channel);
    setDisposition("schedule");
    const fresh = followUpPresets(timezone, defaultInterval);
    const preferred = fresh.find((p) => p.days === defaultInterval) ?? fresh[0];
    setFollowUpDate(preferred ? preferred.date : today);
  }, [open, prospect.channel, timezone, defaultInterval, today]);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (state.ok) close();
  }, [state.ok, close]);

  // Put the outcomes this channel actually produces first; keep the rest reachable.
  const preferredOutcomes = OUTCOMES_BY_CHANNEL[channel];
  const outcomes = [
    ...preferredOutcomes,
    ...TOUCH_OUTCOMES.filter((o) => !preferredOutcomes.includes(o)),
  ];

  return (
    <dialog
      ref={dialogRef}
      onClose={close}
      onClick={(e) => {
        if (e.target === dialogRef.current) close();
      }}
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-md border border-rule-strong bg-paper p-0 text-ink shadow-[0_16px_40px_-12px_rgba(60,42,32,0.24)] backdrop:bg-black/25"
    >
      <form action={formAction} className="flex flex-col">
        <input type="hidden" name="prospect_id" value={prospect.id} />
        <input type="hidden" name="disposition" value={disposition} />
        {disposition === "schedule" && (
          <input type="hidden" name="next_follow_up_date" value={followUpDate} />
        )}

        <div className="border-b border-rule px-5 py-4">
          <h2 className="text-[16px] font-semibold tracking-[-0.01em]">Log a touch</h2>
          <p className="mt-0.5 text-[14px] text-ink-soft">{prospect.name}</p>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="touch_date">Date</Label>
              <Input
                id="touch_date"
                name="touch_date"
                type="date"
                defaultValue={today}
                max={today}
                required
                className="tnum"
              />
            </div>
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
          </div>

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
              placeholder="Asked me to try again after the 20th"
            />
          </div>

          <fieldset className="border-t border-rule pt-4">
            <legend className="mb-2.5 text-[13px] font-medium text-ink-soft">Then</legend>

            <div className="flex flex-wrap gap-1.5">
              {DISPOSITIONS.map((d) => (
                <Chip
                  key={d.value}
                  label={d.label}
                  active={disposition === d.value}
                  onSelect={() => setDisposition(d.value)}
                  solid
                />
              ))}
            </div>

            {disposition === "schedule" ? (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {presets.map((p) => (
                  <Chip
                    key={p.days}
                    label={p.label}
                    active={followUpDate === p.date}
                    onSelect={() => setFollowUpDate(p.date)}
                  />
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
            ) : (
              <p className="mt-3 text-[13px] text-ink-faint">
                Clears the follow-up. They drop off your Today list.
              </p>
            )}
          </fieldset>

          {state.error && <FormError>{state.error}</FormError>}
        </div>

        <div className="flex justify-end gap-2 border-t border-rule bg-paper-sunk px-5 py-3.5">
          <Button type="button" variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" pending={pending}>
            {pending ? "Saving" : "Save touch"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}

const DISPOSITIONS = [
  { value: "schedule", label: "Follow up" },
  { value: "replied", label: "Replied" },
  { value: "cold", label: "Cold" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
] as const;

function Chip({
  label,
  active,
  onSelect,
  solid = false,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
  solid?: boolean;
}) {
  const activeStyle = solid
    ? "border-accent bg-accent text-paper"
    : "border-accent bg-accent-wash text-ink";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`rounded-sm border px-2.5 py-1 text-[13px] transition-colors duration-150 ${
        active ? activeStyle : "border-rule text-ink-soft hover:border-ink-faint hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
