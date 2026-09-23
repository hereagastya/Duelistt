import Link from "next/link";

import { SettingsForm } from "@/components/settings/SettingsForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireProfile } from "@/lib/actions/profile";
import { checkAccess } from "@/lib/billing/gate";

export const metadata = { title: "Settings · Duelistt" };
export const dynamic = "force-dynamic";

/**
 * The timezone list is built here, on the server, and passed down.
 * Computing it inside the client component looked simpler but was wrong twice:
 * Node's ICU and the browser's ship different zone lists, which hydrated as a
 * mismatch on every load; and when the stored zone was absent from the client's
 * list (browsers report Asia/Kolkata as Asia/Calcutta on some runtimes) the
 * select silently fell back to its first option, so pressing Save without
 * touching the field would have moved the user's digest to Africa/Abidjan.
 */
function timezoneOptions(current: string): string[] {
  const zones =
    typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];

  if (zones.includes(current)) return zones;
  // The stored value must always be selectable, even if this runtime spells it
  // differently. Postgres validates the final choice either way.
  return [current, ...zones.filter((z) => z !== current)];
}

export default async function SettingsPage() {
  const { email, profile } = await requireProfile();
  const access = checkAccess(profile);

  const subscriptionLine = access.allowed
    ? access.reason === "trialing"
      ? `Trial — ${access.trialDaysLeft} ${access.trialDaysLeft === 1 ? "day" : "days"} left`
      : "Active"
    : access.reason === "trial_expired"
      ? "Trial ended"
      : "No subscription";

  return (
    <>
      <PageHeader title="Settings" />

      <SettingsForm profile={profile} zones={timezoneOptions(profile.timezone)} />

      <section className="mt-5 rounded-xl border border-rule bg-surface p-5 shadow-xs sm:p-6">
        <h2 className="text-[14px] font-medium text-ink">Account</h2>

        <dl className="mt-4 flex flex-wrap gap-x-12 gap-y-4">
          <div>
            <dt className="text-[12px] text-ink-faint">Signed in as</dt>
            <dd className="mt-1 text-[14px] text-ink">{email}</dd>
          </div>
          <div>
            <dt className="text-[12px] text-ink-faint">Subscription</dt>
            <dd className="mt-1 text-[14px] text-ink">{subscriptionLine}</dd>
          </div>
        </dl>

        <Link
          href="/billing"
          className="mt-5 inline-block text-[14px] font-medium text-accent-ink underline decoration-accent-line underline-offset-[3px] hover:decoration-accent-ink"
        >
          Manage subscription
        </Link>
      </section>
    </>
  );
}
