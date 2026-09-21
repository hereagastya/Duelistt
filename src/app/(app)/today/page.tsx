import Link from "next/link";

import { TodayList } from "@/components/prospects/TodayList";
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

  if (error) {
    return (
      <Shell count={null}>
        <p role="alert" className="border-t border-rule py-6 text-[14px] text-late">
          Your follow-ups could not be loaded. Reload the page — if it keeps failing, the
          database is unreachable.
        </p>
      </Shell>
    );
  }

  const prospects = data ?? [];

  if (prospects.length === 0) {
    return (
      <Shell count={0}>
        <EmptyToday />
      </Shell>
    );
  }

  return (
    <Shell count={prospects.length}>
      <TodayList
        prospects={prospects}
        today={today}
        timezone={profile.timezone}
        defaultInterval={profile.default_follow_up_interval}
      />
    </Shell>
  );
}

function Shell({ count, children }: { count: number | null; children: React.ReactNode }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-4 pt-10 pb-5">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
          Today
          {count !== null && count > 0 && (
            <span className="tnum ml-2.5 text-[15px] font-normal text-ink-faint">{count}</span>
          )}
        </h1>
        <Link
          href="/prospects/new"
          className="text-[14px] font-medium text-accent underline underline-offset-[3px] hover:text-accent-hover"
        >
          Add prospect
        </Link>
      </div>
      {children}
    </>
  );
}

async function EmptyToday() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("prospects")
    .select("id", { count: "exact", head: true });

  const hasAnyProspects = (count ?? 0) > 0;

  return (
    <div className="border-t border-rule py-16">
      {hasAnyProspects ? (
        <>
          <p className="text-[15px] text-ink">Nothing due today.</p>
          <p className="mt-1 text-[14px] text-ink-soft">
            Everyone you are tracking is scheduled for later. Close the tab.
          </p>
          <Link
            href="/prospects"
            className="mt-5 inline-block text-[14px] font-medium text-accent underline underline-offset-[3px]"
          >
            See all prospects
          </Link>
        </>
      ) : (
        <>
          <p className="text-[15px] text-ink">No prospects yet.</p>
          <p className="mt-1 max-w-[46ch] text-[14px] text-ink-soft">
            Add the first person you have reached out to. Once a follow-up date arrives, they
            show up here — and in your daily digest.
          </p>
          <Link
            href="/prospects/new"
            className="mt-5 inline-block rounded-sm bg-accent px-3.5 py-2 text-[14px] font-medium text-paper transition-colors duration-150 hover:bg-accent-hover"
          >
            Add your first prospect
          </Link>
        </>
      )}
    </div>
  );
}
