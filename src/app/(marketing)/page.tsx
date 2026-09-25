import Link from "next/link";

import { Reveal } from "@/components/marketing/Reveal";
import {
  ClearedVisual,
  DigestVisual,
  LogVisual,
  Mark,
  QueueVisual,
} from "@/components/marketing/Visuals";

const SHELL = "mx-auto w-full max-w-[68rem] px-6 sm:px-8";

function StartTrial({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/signup"
      className={`inline-flex items-center justify-center rounded-xl bg-ember px-5 py-3 text-[15px] font-medium text-night shadow-[0_10px_30px_-12px_oklch(78%_0.145_68/0.7)] transition-colors duration-150 hover:bg-ember-deep ${className}`}
    >
      Start free trial
    </Link>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-[11px] font-medium tracking-[0.18em] text-ember uppercase">
      <span aria-hidden className="h-px w-6 bg-ember/50" />
      {children}
    </span>
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="mt-0.5 size-4 shrink-0 text-ember"
    >
      <path d="m4 10.5 4 4 8-9" />
    </svg>
  );
}

// The day a follow-up quietly dies. Illustrative, not a customer.
const SILENCE: { day: string; line: string | null }[] = [
  { day: "Tue 04", line: "Called Priya. Asked me to try again next week." },
  { day: "Wed 05", line: null },
  { day: "Thu 06", line: null },
  { day: "Fri 07", line: null },
  { day: "Mon 10", line: "Meant to call. Didn’t." },
  { day: "Tue 11", line: null },
  { day: "Wed 12", line: null },
];

const REFUSALS = [
  "Pipelines",
  "Deal stages",
  "Forecast dashboards",
  "Custom fields",
  "Lead scoring",
  "Kanban boards",
  "Activity graphs",
  "Seat licences",
];

const INCLUDED = [
  "Unlimited prospects and touches",
  "The daily digest, at the hour you pick, in your timezone",
  "Calls, email, DMs and LinkedIn in one queue",
  "Cancel whenever — your history stays readable",
];

function Step({
  title,
  body,
  visual,
  flip = false,
}: {
  title: string;
  body: string;
  visual: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-20 lg:py-16">
      <Reveal className={flip ? "lg:order-2" : undefined}>
        <h3 className="text-[1.75rem] leading-[1.08] font-semibold tracking-[-0.035em] sm:text-[2.25rem]">
          {title}
        </h3>
        <p className="mt-5 max-w-[34rem] text-[16px] leading-[1.7] text-chalk-soft">
          {body}
        </p>
      </Reveal>
      <Reveal delay={90} className={flip ? "lg:order-1" : undefined}>
        {visual}
      </Reveal>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* The one intentional glass surface: a pill that floats over the page. */}
      <div className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <header className="glass-nav mx-auto flex w-full max-w-[64rem] items-center justify-between rounded-full py-2.5 pr-2.5 pl-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark />
            <span className="text-[15px] font-semibold tracking-[-0.03em]">
              Duelistt
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/login"
              className="rounded-full px-3.5 py-2 text-[14px] text-chalk-soft transition-colors duration-150 hover:bg-white/[0.06] hover:text-chalk"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-ember px-4 py-2 text-[14px] font-medium text-night transition-colors duration-150 hover:bg-ember-deep"
            >
              Start free trial
            </Link>
          </nav>
        </header>
      </div>

      {/* Hero */}
      <section className="spotlight dotgrid relative overflow-hidden">
        <div
          className={`${SHELL} relative z-10 pt-20 pb-16 text-center sm:pt-28`}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] text-chalk-soft">
            <span aria-hidden className="size-1.5 rounded-full bg-ember" />
            For cold calls, emails, DMs and LinkedIn
          </span>

          <h1 className="mx-auto mt-7 max-w-[17ch] text-[2.9rem] leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-[4rem] lg:text-[4.6rem]">
            You didn&rsquo;t lose the deal.{" "}
            <span className="text-ember">You forgot to call back.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-[46rem] text-[16px] leading-[1.7] text-chalk-soft sm:text-[17px]">
            Duelistt is a dead-simple follow-up tracker for anyone doing manual
            outreach &mdash; cold calls, cold emails, DMs, LinkedIn. Log who you
            talked to, what happened, and when to follow up. Duelistt tells you
            exactly who&rsquo;s due today, so nobody goes quiet on you by
            accident.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <StartTrial />
            <Link
              href="#how"
              className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.03] px-5 py-3 text-[15px] font-medium text-chalk transition-colors duration-150 hover:border-white/25 hover:bg-white/[0.06]"
            >
              See how it works
            </Link>
          </div>

          <p className="mt-5 text-[13px] text-chalk-faint">
            7 days free &middot; no card &middot; $6.99/month after
          </p>
        </div>

        <div className={`${SHELL} relative z-10 pb-20 lg:pb-24`}>
          <div className="mx-auto max-w-[34rem]">
            <QueueVisual />
          </div>
        </div>
      </section>

      <div className={SHELL}>
        <div className="hairline" />
      </div>

      {/* The problem */}
      <section className={`${SHELL} py-20 lg:py-28`}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            <SectionLabel>The problem</SectionLabel>
            <h2 className="mt-5 text-[2rem] leading-[1.06] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Nobody decides to go quiet.
            </h2>
            <p className="mt-5 max-w-[26rem] text-[16px] leading-[1.7] text-chalk-soft">
              It just happens. A good call, a vague &ldquo;next week&rdquo;, and
              then a week that looks like every other week.
            </p>

            <p className="mt-10 max-w-[22rem] text-[1.5rem] leading-[1.25] font-medium tracking-[-0.03em] text-balance sm:text-[1.75rem]">
              Three weeks later, she signed with someone else.
            </p>
          </Reveal>

          <Reveal delay={90}>
            <div className="panel rounded-2xl px-5 py-3 sm:px-7 sm:py-5">
              <ol>
                {SILENCE.map((entry, i) => (
                  <li
                    key={entry.day}
                    className={`flex items-baseline gap-6 py-3.5 ${
                      i !== SILENCE.length - 1
                        ? "border-b border-white/[0.06]"
                        : ""
                    }`}
                  >
                    <span className="tnum w-[4.5rem] shrink-0 text-[13px] text-chalk-faint">
                      {entry.day}
                    </span>
                    {entry.line ? (
                      <span className="text-[15px] text-chalk-soft">
                        {entry.line}
                      </span>
                    ) : (
                      <span
                        aria-label="nothing logged"
                        className="text-[15px] text-white/[0.14]"
                      >
                        &mdash;
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how"
        className="scroll-mt-24 border-y border-white/[0.06] bg-white/[0.012]"
      >
        <div className={`${SHELL} pt-20 lg:pt-24`}>
          <Reveal>
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-5 max-w-[20ch] text-[2rem] leading-[1.06] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
              Three minutes a day. That is the entire product.
            </h2>
          </Reveal>
        </div>

        <div className={SHELL}>
          <Step
            title="Log the touch."
            body="Ten seconds after the call. What happened, and when to try again. Pick a channel, pick an outcome, and you are done — there is no record to fill in afterwards, and no fields anyone made you add."
            visual={<LogVisual />}
          />

          <Step
            flip
            title="Get the nag."
            body="One email, at the hour you choose, in your timezone. Just the people who are due, oldest first, with the last thing you wrote about them. Nothing due that day means no email at all — so when one arrives, it means something."
            visual={<DigestVisual />}
          />

          <Step
            title="Clear the list."
            body="Open it in the morning, work down it, close the tab. Duelistt is not a place you are supposed to spend your day, and it will never ask you to."
            visual={<ClearedVisual />}
          />
        </div>
      </section>

      {/* The refusal */}
      <section className={`${SHELL} py-20 lg:py-28`}>
        <Reveal>
          <SectionLabel>What it isn&rsquo;t</SectionLabel>
          <h2 className="mt-5 text-[2rem] leading-[1.06] font-semibold tracking-[-0.04em] sm:text-[2.6rem]">
            What it refuses to be.
          </h2>

          <ul className="mt-9 flex max-w-[50rem] flex-wrap gap-x-7 gap-y-3">
            {REFUSALS.map((item) => (
              <li
                key={item}
                className="text-[1.3rem] text-chalk-faint/70 line-through decoration-white/20 decoration-2 sm:text-[1.55rem]"
              >
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={90}>
          <p className="mt-12 text-[2.25rem] font-semibold tracking-[-0.04em] text-ember sm:text-[3rem]">
            Who to call today.
          </p>
          <p className="mt-7 max-w-[38rem] text-[16px] leading-[1.7] text-chalk-soft">
            Not a CRM. No pipelines, no deal stages, no dashboard to babysit.
            Just the nag you actually need.
          </p>
        </Reveal>
      </section>

      {/* Pricing, as its own section */}
      <section className="relative border-y border-white/[0.06] bg-white/[0.012] py-20 lg:py-28">
        <div className={`${SHELL} relative z-10`}>
          <Reveal className="text-center">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="mx-auto mt-5 max-w-[18ch] text-[2rem] leading-[1.06] font-semibold tracking-[-0.04em] text-balance sm:text-[2.6rem]">
              One price. One product. No tier to outgrow.
            </h2>
            <p className="mx-auto mt-5 max-w-[34rem] text-[16px] leading-[1.7] text-chalk-soft">
              Everything Duelistt does, for everyone who uses it. No seats to
              count, nothing held back to sell you later.
            </p>
          </Reveal>

          <Reveal delay={90} className="mt-12">
            <div className="relative mx-auto max-w-[27rem]">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-ember/[0.12] blur-[60px]"
              />
              <div className="panel relative rounded-2xl p-8 text-center sm:p-9">
                <p className="text-[11px] font-medium tracking-[0.18em] text-chalk-faint uppercase">
                  Everything, one price
                </p>

                <p className="mt-5 flex items-baseline justify-center gap-2">
                  <span className="tnum text-[3.75rem] leading-none font-semibold tracking-[-0.05em] text-chalk">
                    $6.99
                  </span>
                  <span className="text-[16px] text-chalk-soft">/month</span>
                </p>

                <ul className="mt-8 space-y-3.5 text-left">
                  {INCLUDED.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-[14px] leading-[1.55] text-chalk-soft"
                    >
                      <Check />
                      {item}
                    </li>
                  ))}
                </ul>

                <StartTrial className="mt-9 w-full" />
                <p className="mt-3.5 text-[13px] text-chalk-faint">
                  7 days free. No card until you decide.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Close */}
      <section className="spotlight-center relative overflow-hidden">
        <div className={`${SHELL} relative z-10 py-24 text-center lg:py-28`}>
          <Reveal>
            <h2 className="mx-auto max-w-[16ch] text-[2.4rem] leading-[1.05] font-semibold tracking-[-0.045em] text-balance sm:text-[3.4rem]">
              Stop losing deals to silence.
            </h2>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <StartTrial />
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-[15px] text-chalk-soft transition-colors duration-150 hover:text-chalk"
              >
                Sign in
              </Link>
            </div>

            <p className="mx-auto mt-12 max-w-[34rem] text-[15px] leading-[1.6] text-chalk-faint">
              Every lead&rsquo;s a duel. Don&rsquo;t lose it by going quiet
              first.
            </p>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/[0.06]">
        <div
          className={`${SHELL} flex flex-wrap items-center justify-between gap-4 py-8`}
        >
          <span className="flex items-center gap-2.5">
            <Mark />
            <span className="text-[14px] font-semibold tracking-[-0.03em]">
              Duelistt
            </span>
          </span>
          <Link
            href="/login"
            className="text-[14px] text-chalk-faint transition-colors duration-150 hover:text-chalk"
          >
            Sign in
          </Link>
        </div>
      </footer>
    </>
  );
}
