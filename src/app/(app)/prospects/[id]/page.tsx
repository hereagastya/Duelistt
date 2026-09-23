import Link from "next/link";
import { notFound } from "next/navigation";

import { LogTouchButton } from "@/components/prospects/LogTouchButton";
import { StatusTag } from "@/components/prospects/StatusTag";
import { ChannelIcon } from "@/components/ui/ChannelIcon";
import { requireProfile } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/server";
import { daysBetween, formatDate, overdueLabel, todayIn } from "@/lib/date";
import { CHANNEL_LABELS, OUTCOME_LABELS, type Prospect, type Touch } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("prospects")
    .select("name")
    .eq("id", id)
    .maybeSingle<{ name: string }>();

  return { title: data ? `${data.name} · Duelistt` : "Prospect · Duelistt" };
}

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireProfile();
  const today = todayIn(profile.timezone);

  const supabase = await createClient();

  // RLS scopes both reads to this user, so a prospect belonging to someone else
  // is indistinguishable from one that does not exist. That is the right answer.
  const [{ data: prospect }, { data: touches }] = await Promise.all([
    supabase.from("prospects").select("*").eq("id", id).maybeSingle<Prospect>(),
    supabase
      .from("touches")
      .select("*")
      .eq("prospect_id", id)
      .order("touch_date", { ascending: false })
      .order("created_at", { ascending: false })
      .returns<Touch[]>(),
  ]);

  if (!prospect) notFound();

  const late = prospect.next_follow_up_date
    ? daysBetween(prospect.next_follow_up_date, today)
    : null;

  return (
    <>
      <div className="pt-8 pb-6">
        <Link
          href="/prospects"
          className="text-[13px] text-ink-faint transition-colors duration-150 hover:text-ink"
        >
          &larr; All prospects
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.03em] text-ink">
              {prospect.name}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-[14px] text-ink-soft">
              <span className="flex size-6 items-center justify-center rounded-md bg-paper-sunk text-ink-faint">
                <ChannelIcon channel={prospect.channel} className="size-3.5" />
              </span>
              {CHANNEL_LABELS[prospect.channel]}
              <span className="text-rule-strong">·</span>
              <span className="text-ink">{prospect.contact_info}</span>
            </p>
          </div>

          <LogTouchButton
            prospect={{ id: prospect.id, name: prospect.name, channel: prospect.channel }}
            today={today}
            timezone={profile.timezone}
            defaultInterval={profile.default_follow_up_interval}
          />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule shadow-xs sm:grid-cols-3">
        <div className="bg-surface px-4 py-3.5">
          <dt className="text-[12px] tracking-[0.01em] text-ink-faint">Status</dt>
          <dd className="mt-1">
            <StatusTag status={prospect.status} />
          </dd>
        </div>
        <div className="bg-surface px-4 py-3.5">
          <dt className="text-[12px] tracking-[0.01em] text-ink-faint">Next follow-up</dt>
          <dd className="tnum mt-1 text-[13px]">
            {prospect.next_follow_up_date === null ? (
              <span className="text-ink-faint">None scheduled</span>
            ) : (
              <span className={late !== null && late >= 7 ? "font-medium text-late" : "text-ink"}>
                {formatDate(prospect.next_follow_up_date, profile.timezone)}
                {late !== null && late >= 0 && (
                  <span className="ml-2 text-ink-soft">{overdueLabel(late)}</span>
                )}
              </span>
            )}
          </dd>
        </div>
        <div className="bg-surface px-4 py-3.5">
          <dt className="text-[12px] tracking-[0.01em] text-ink-faint">Touches</dt>
          <dd className="tnum mt-1 text-[13px] text-ink">{touches?.length ?? 0}</dd>
        </div>
      </dl>

      <h2 className="pt-9 pb-2 text-[15px] font-medium text-ink">History</h2>

      {!touches || touches.length === 0 ? (
        <p className="rounded-xl border border-rule bg-surface px-6 py-10 text-center text-[14px] text-ink-soft shadow-xs">
          No touches recorded yet.
        </p>
      ) : (
        <ol className="relative">
          {touches.map((t, i) => (
            <li key={t.id} className="relative flex gap-4 py-3.5">
              {/* A thread down the history, rather than a box around each entry. */}
              {i !== touches.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-10 bottom-0 left-[5.75rem] w-px bg-rule"
                />
              )}

              <span className="tnum w-[4.5rem] shrink-0 pt-px text-[13px] text-ink-faint">
                {formatDate(t.touch_date, profile.timezone)}
              </span>

              <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-md bg-paper-sunk text-ink-faint ring-4 ring-paper">
                <ChannelIcon channel={t.channel} className="size-3.5" />
              </span>

              <div className="min-w-0 flex-1 pb-1">
                <p className="text-[14px] font-medium text-ink">{OUTCOME_LABELS[t.outcome]}</p>
                {t.note && <p className="mt-1 text-[14px] text-ink-soft">{t.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
