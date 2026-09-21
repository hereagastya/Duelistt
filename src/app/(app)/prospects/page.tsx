import Link from "next/link";
import { Suspense } from "react";

import { ProspectFilters } from "@/components/prospects/ProspectFilters";
import { StatusTag } from "@/components/prospects/StatusTag";
import { ChannelIcon } from "@/components/ui/ChannelIcon";
import { requireProfile } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/server";
import { daysBetween, formatDate, todayIn } from "@/lib/date";
import {
  CHANNELS,
  PROSPECT_STATUSES,
  type Channel,
  type DueProspect,
  type ProspectStatus,
} from "@/lib/types";

export const metadata = { title: "All prospects · Duelistt" };
export const dynamic = "force-dynamic";

type Search = { status?: string; channel?: string; q?: string };

export default async function ProspectsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { profile } = await requireProfile();
  const { status, channel, q } = await searchParams;
  const today = todayIn(profile.timezone);

  const supabase = await createClient();

  let request = supabase
    .from("prospect_list")
    .select("*")
    // Nulls last: someone with no follow-up scheduled is not more urgent than
    // someone who is overdue, and Postgres sorts NULL first by default on asc.
    .order("next_follow_up_date", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  // Validate against the enums rather than trusting the query string.
  if (status && PROSPECT_STATUSES.includes(status as ProspectStatus)) {
    request = request.eq("status", status);
  }
  if (channel && CHANNELS.includes(channel as Channel)) {
    request = request.eq("channel", channel);
  }
  if (q?.trim()) {
    // Escape the LIKE wildcards a name could legitimately contain.
    const term = q.trim().replace(/[%_\\]/g, (m) => `\\${m}`);
    request = request.ilike("name", `%${term}%`);
  }

  const { data, error } = await request.returns<DueProspect[]>();
  const prospects = data ?? [];

  return (
    <>
      <div className="flex items-baseline justify-between gap-4 pt-10 pb-5">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">All prospects</h1>
        <Link
          href="/prospects/new"
          className="text-[14px] font-medium text-accent underline underline-offset-[3px] hover:text-accent-hover"
        >
          Add prospect
        </Link>
      </div>

      <Suspense fallback={<div className="h-[5.5rem]" />}>
        <ProspectFilters total={prospects.length} />
      </Suspense>

      {error ? (
        <p role="alert" className="border-t border-rule py-6 text-[14px] text-late">
          That list could not be loaded. Reload the page.
        </p>
      ) : prospects.length === 0 ? (
        <Empty filtered={Boolean(status || channel || q)} />
      ) : (
        <ul className="border-t border-rule">
          {prospects.map((p) => {
            const late = p.next_follow_up_date
              ? daysBetween(p.next_follow_up_date, today)
              : null;

            return (
              <li key={p.id} className="border-b border-rule">
                <Link
                  href={`/prospects/${p.id}`}
                  className="group flex items-baseline gap-4 py-3.5"
                >
                  <ChannelIcon
                    channel={p.channel}
                    className="translate-y-[3px] text-ink-faint transition-colors duration-150 group-hover:text-accent"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-ink">
                      {p.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-ink-soft">
                      {p.last_note ?? p.contact_info}
                    </span>
                  </span>

                  <StatusTag status={p.status} />

                  <span className="tnum w-[6.5rem] shrink-0 text-right text-[13px] text-ink-faint">
                    {p.next_follow_up_date === null ? (
                      "—"
                    ) : late !== null && late > 0 ? (
                      <span className={late >= 7 ? "font-medium text-late" : "text-ink-soft"}>
                        {late}d late
                      </span>
                    ) : (
                      formatDate(p.next_follow_up_date, profile.timezone)
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function Empty({ filtered }: { filtered: boolean }) {
  return (
    <div className="border-t border-rule py-16">
      {filtered ? (
        <>
          <p className="text-[15px] text-ink">No prospects match those filters.</p>
          <p className="mt-1 text-[14px] text-ink-soft">Widen the search or clear them.</p>
        </>
      ) : (
        <>
          <p className="text-[15px] text-ink">No prospects yet.</p>
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
