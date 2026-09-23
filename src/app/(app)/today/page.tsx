import Link from "next/link";

import { TodayList } from "@/components/prospects/TodayList";
import { buttonClasses } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireProfile } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/server";
import { todayIn } from "@/lib/date";
import type { DueProspect } from "@/lib/types";

export const metadata = { title: "Today · Duelistt" };

// The queue changes the moment a touch is logged; never serve it from cache.
export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const { profile } = await requireProfile();
  const today = todayIn(profile.timezone);

  const supabase = await createClient();

  // Oldest first: the person you have kept waiting longest is the one to call.
  const { data, error } = await supabase
    .from("prospect_list")
    .select("*")
    .lte("next_follow_up_date", today)
    .order("next_follow_up_date", { ascending: true })
    .returns<DueProspect[]>();

  const prospects = data ?? [];

  const addProspect = (
    <Link href="/prospects/new" className={buttonClasses("primary", "sm")}>
      Add prospect
    </Link>
  );

  if (error) {
    return (
      <>
        <PageHeader title="Today" action={addProspect} />
        <p
          role="alert"
          className="rounded-lg border border-late/25 bg-late/[0.06] px-4 py-3 text-[14px] text-late"
        >
          Your follow-ups could not be loaded. Reload the page — if it keeps failing, the
          database is unreachable.
        </p>
      </>
    );
  }

  if (prospects.length === 0) {
    return (
      <>
        <PageHeader title="Today" action={addProspect} />
        <EmptyToday />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Today"
        count={prospects.length}
        description="Oldest first. Click anyone to log what happened."
        action={addProspect}
      />
      <TodayList
        prospects={prospects}
        today={today}
        timezone={profile.timezone}
        defaultInterval={profile.default_follow_up_interval}
      />
    </>
  );
}

async function EmptyToday() {
  const supabase = await createClient();
  const { count } = await supabase.from("prospects").select("id", { count: "exact", head: true });

  const hasAnyProspects = (count ?? 0) > 0;

  return (
    <div className="rounded-xl border border-rule bg-surface px-8 py-14 text-center shadow-xs">
      {hasAnyProspects ? (
        <>
          <p className="text-[16px] font-medium text-ink">Nothing due today.</p>
          <p className="mx-auto mt-1.5 max-w-[34ch] text-[14px] text-ink-soft">
            Everyone you are tracking is scheduled for later. Close the tab.
          </p>
          <Link
            href="/prospects"
            className="mt-6 inline-block text-[14px] font-medium text-accent-ink underline decoration-accent-line underline-offset-[3px] hover:decoration-accent-ink"
          >
            See all prospects
          </Link>
        </>
      ) : (
        <>
          <p className="text-[16px] font-medium text-ink">No prospects yet.</p>
          <p className="mx-auto mt-1.5 max-w-[42ch] text-[14px] text-ink-soft">
            Add the first person you have reached out to. Once a follow-up date arrives, they
            show up here — and in your daily digest.
          </p>
          <Link href="/prospects/new" className={`${buttonClasses()} mt-7`}>
            Add your first prospect
          </Link>
        </>
      )}
    </div>
  );
}
