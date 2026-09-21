import Link from "next/link";
import { notFound } from "next/navigation";

import { LogTouchButton } from "@/components/prospects/LogTouchButton";
import { StatusTag } from "@/components/prospects/StatusTag";
import { ChannelIcon } from "@/components/ui/ChannelIcon";
import { requireProfile } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/server";
import { daysBetween, formatDate, overdueLabel, todayIn } from "@/lib/date";
import {
  CHANNEL_LABELS,
  OUTCOME_LABELS,
  type Prospect,
  type Touch,
} from "@/lib/types";

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
      <div className="pt-10 pb-6">
        <Link
          href="/prospects"
          className="text-[13px] text-ink-faint transition-colors duration-150 hover:text-ink"
        >
          &larr; All prospects
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em]">{prospect.name}</h1>
            <p className="mt-1 flex items-center gap-2 text-[14px] text-ink-soft">
              <ChannelIcon channel={prospect.channel} className="text-ink-faint" />
              {CHANNEL_LABELS[prospect.channel]}
              <span className="text-rule-strong">/</span>
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

      <dl className="flex flex-wrap gap-x-10 gap-y-3 border-y border-rule py-4">
        <div>
          <dt className="text-[13px] text-ink-faint">Status</dt>
          <dd className="mt-0.5">
            <StatusTag status={prospect.status} />
          </dd>
        </div>
        <div>
          <dt className="text-[13px] text-ink-faint">Next follow-up</dt>
          <dd className="tnum mt-0.5 text-[13px]">
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
        <div>
          <dt className="text-[13px] text-ink-faint">Touches</dt>
          <dd className="tnum mt-0.5 text-[13px] text-ink">{touches?.length ?? 0}</dd>
        </div>
      </dl>

      <h2 className="pt-8 pb-3 text-[15px] font-medium text-ink-soft">History</h2>

      {!touches || touches.length === 0 ? (
        <p className="border-t border-rule py-6 text-[14px] text-ink-soft">
          No touches recorded yet.
        </p>
      ) : (
        <ol className="border-t border-rule">
          {touches.map((t) => (
            <li key={t.id} className="flex gap-4 border-b border-rule py-3.5">
              <span className="tnum w-[4.5rem] shrink-0 pt-px text-[13px] text-ink-faint">
                {formatDate(t.touch_date, profile.timezone)}
              </span>

              <ChannelIcon channel={t.channel} className="mt-[3px] shrink-0 text-ink-faint" />

              <div className="min-w-0 flex-1">
                <p className="text-[14px] text-ink">{OUTCOME_LABELS[t.outcome]}</p>
                {t.note && (
                  <p className="mt-0.5 text-[14px] text-ink-soft">{t.note}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
