"use client";

import { useActionState } from "react";

import { updateSettings, type SettingsState } from "@/lib/actions/settings";
import { Button } from "@/components/ui/Button";
import { FormError, Input, Label, Select } from "@/components/ui/Field";
import type { Profile } from "@/lib/types";

const INITIAL: SettingsState = { error: null };

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-rule bg-surface p-5 shadow-xs sm:p-6">
      <h2 className="text-[14px] font-medium text-ink">{title}</h2>
      {hint && <p className="mt-0.5 text-[13px] text-ink-faint">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function SettingsForm({ profile, zones }: { profile: Profile; zones: string[] }) {
  const [state, formAction, pending] = useActionState(updateSettings, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Section
        title="Default follow-up interval"
        hint="Preselects the quick option when you add a prospect or log a touch."
      >
        <div className="max-w-[10rem]">
          <Label htmlFor="default_follow_up_interval" hint="days">
            Days
          </Label>
          <Input
            id="default_follow_up_interval"
            name="default_follow_up_interval"
            type="number"
            min={1}
            max={365}
            required
            defaultValue={profile.default_follow_up_interval}
            className="tnum"
          />
        </div>
      </Section>

      <Section title="The daily digest" hint="Only sent on days you actually have follow-ups due.">
        <label htmlFor="digest_enabled" className="flex items-start gap-2.5">
          <input
            id="digest_enabled"
            name="digest_enabled"
            type="checkbox"
            defaultChecked={profile.digest_enabled}
            className="mt-[3px] size-4 shrink-0 rounded accent-accent-ink"
          />
          <span className="text-[14px] text-ink">Send me the digest</span>
        </label>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="digest_hour">Send at</Label>
            <Select
              id="digest_hour"
              name="digest_hour"
              defaultValue={String(profile.digest_hour)}
              className="tnum"
            >
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {String(hour).padStart(2, "0")}:00
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select id="timezone" name="timezone" defaultValue={profile.timezone}>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <p className="mt-3 text-[13px] text-ink-faint">
          Your local time. The timezone also decides when your day rolls over.
        </p>
      </Section>

      {state.error && <FormError>{state.error}</FormError>}

      <div className="flex items-center gap-3">
        <Button type="submit" pending={pending}>
          {pending ? "Saving" : "Save settings"}
        </Button>
        {state.saved && !pending && (
          <span aria-live="polite" className="text-[13px] text-settled">
            Saved.
          </span>
        )}
      </div>
    </form>
  );
}
