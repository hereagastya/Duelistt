import Link from "next/link";
import { Suspense } from "react";

import { ProspectFilters } from "@/components/prospects/ProspectFilters";
import { StatusTag } from "@/components/prospects/StatusTag";
import { buttonClasses } from "@/components/ui/Button";
import { ChannelIcon } from "@/components/ui/ChannelIcon";
import { PageHeader } from "@/components/ui/PageHeader";
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
      <PageHeader
        title="All prospects"
        action={
          <Link href="/prospects/new" className={buttonClasses("primary", "sm")}>
            Add prospect
          </Link>
        }
      />

      <Suspense fallback={<div className="h-[5.5rem]" />}>
        <ProspectFilters total={prospects.length} />
      </Suspense>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-late/25 bg-late/[0.06] px-4 py-3 text-[14px] text-late"
        >
          That list could not be loaded. Reload the page.
        </p>
      ) : prospects.length === 0 ? (
        <Empty filtered={Boolean(status || channel || q)} />
      ) : (
        <ul className="-mx-3">
          {prospects.map((p) => {
            const late = p.next_follow_up_date
              ? daysBetween(p.next_follow_up_date, today)
              : null;

            return (
              <li key={p.id} className="px-3">
                <Link
                  href={`/prospects/${p.id}`}
                  className="group -mx-3 flex items-center gap-3 rounded-lg px-3 py-3 transition-colors duration-150 hover:bg-paper-sunk"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-paper-sunk text-ink-faint transition-colors duration-150 group-hover:bg-surface group-hover:text-accent-ink">
                    <ChannelIcon channel={p.channel} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-ink">
                      {p.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-ink-soft">
                      {p.last_note ?? p.contact_info}
                    </span>
                  </span>

                  <span className="hidden shrink-0 sm:block">
                    <StatusTag status={p.status} />
                  </span>

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
    <div className="rounded-xl border border-rule bg-surface px-8 py-14 text-center shadow-xs">
      {filtered ? (
        <>
          <p className="text-[16px] font-medium text-ink">No prospects match those filters.</p>
          <p className="mt-1.5 text-[14px] text-ink-soft">Widen the search or clear them.</p>
        </>
      ) : (
        <>
          <p className="text-[16px] font-medium text-ink">No prospects yet.</p>
          <Link href="/prospects/new" className={`${buttonClasses()} mt-7`}>
            Add your first prospect
          </Link>
        </>
      )}
    </div>
  );
}
