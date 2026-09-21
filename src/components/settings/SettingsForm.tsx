"use client";

import { useActionState } from "react";

import { updateSettings, type SettingsState } from "@/lib/actions/settings";
import { Button } from "@/components/ui/Button";
import { FormError, Input, Label, Select } from "@/components/ui/Field";
import type { Profile } from "@/lib/types";

const INITIAL: SettingsState = { error: null };

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

export function SettingsForm({ profile, zones }: { profile: Profile; zones: string[] }) {
  const [state, formAction, pending] = useActionState(updateSettings, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-6 border-t border-rule pt-6">
      <div className="max-w-[18rem]">
        <Label htmlFor="default_follow_up_interval" hint="days">
          Default follow-up interval
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
        <p className="mt-1.5 text-[13px] text-ink-faint">
          Preselects the quick option when you add a prospect or log a touch.
        </p>
      </div>

      <div className="max-w-[18rem] border-t border-rule pt-6">
        <Label htmlFor="timezone">Timezone</Label>
        <Select id="timezone" name="timezone" defaultValue={profile.timezone}>
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </Select>
        <p className="mt-1.5 text-[13px] text-ink-faint">
          Decides when your day starts and when the digest is sent.
        </p>
      </div>

      <div className="border-t border-rule pt-6">
        <label htmlFor="digest_enabled" className="flex items-start gap-2.5">
          <input
            id="digest_enabled"
            name="digest_enabled"
            type="checkbox"
            defaultChecked={profile.digest_enabled}
            className="mt-[3px] size-4 shrink-0 accent-accent"
          />
          <span>
            <span className="block text-[14px] text-ink">Send me the daily digest</span>
            <span className="mt-0.5 block text-[13px] text-ink-faint">
              Only on days you actually have follow-ups due.
            </span>
          </span>
        </label>

        <div className="mt-5 max-w-[12rem]">
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
          <p className="mt-1.5 text-[13px] text-ink-faint">
            Your local time, in the timezone above.
          </p>
        </div>
      </div>

      {state.error && <FormError>{state.error}</FormError>}

      <div className="flex items-center gap-3 border-t border-rule pt-6">
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
