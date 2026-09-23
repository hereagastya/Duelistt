import Link from "next/link";

import {
  DigestPreview,
  EmptyTodayMock,
  LogTouchMock,
  TodayMock,
} from "@/components/marketing/AppMockups";
import { Reveal } from "@/components/marketing/Reveal";

const SHELL = "mx-auto w-full max-w-[72rem] px-6 sm:px-10";

function StartTrial({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/signup"
      className={`inline-flex items-center rounded-md bg-ember px-5 py-3 text-[15px] font-medium text-night transition-colors duration-150 hover:bg-ember-deep ${className}`}
    >
      Start free trial
    </Link>
  );
}

// The day a follow-up quietly dies. Dates are illustrative, not a customer.
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
    <div className={`${SHELL} grid items-center gap-10 py-20 lg:grid-cols-2 lg:gap-16 lg:py-28`}>
      <Reveal className={flip ? "lg:order-2" : undefined}>
        <h3 className="text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.03em] sm:text-[2.25rem]">
          {title}
        </h3>
        <p className="mt-5 max-w-[32rem] text-[16px] leading-[1.65] text-chalk-soft">{body}</p>
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
      {/* The one intentional glass surface: a sticky nav, present throughout. */}
      <header className="sticky top-0 z-40 border-b border-night-rule/70 bg-night/70 backdrop-blur-xl">
        <div className={`${SHELL} flex items-center justify-between py-4`}>
          <Link href="/" className="text-[17px] font-semibold tracking-[-0.03em]">
            Duelistt
          </Link>
          <nav className="flex items-center gap-5 text-[14px]">
            <Link
              href="/login"
              className="text-chalk-soft transition-colors duration-150 hover:text-chalk"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-ember px-3.5 py-2 font-medium text-night transition-colors duration-150 hover:bg-ember-deep"
            >
              Start free trial
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero: the screenshot runs off the right edge rather than sitting in a
          neat card under a centred headline. The mock keeps an intrinsic width
          and is clipped by the section, so the crop is identical at every
          viewport instead of depending on a fixed negative margin. */}
      <section className="overflow-hidden border-b border-night-rule">
        <div
          className={`${SHELL} grid grid-cols-1 gap-12 pt-14 pb-20 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:gap-10 lg:pt-24 lg:pb-28`}
        >
          <div className="lg:pt-4">
            <h1 className="text-[2.6rem] leading-[1.03] font-semibold tracking-[-0.04em] text-pretty sm:text-[3.4rem] lg:text-[4.1rem]">
              You didn&rsquo;t lose the deal.
              <br />
              <span className="text-ember">You forgot to call back.</span>
            </h1>

            <p className="mt-7 max-w-[34rem] text-[16px] leading-[1.7] text-chalk-soft">
              Duelistt is a dead-simple follow-up tracker for anyone doing manual outreach &mdash;
              cold calls, cold emails, DMs, LinkedIn. Log who you talked to, what happened, and
              when to follow up. Duelistt tells you exactly who&rsquo;s due today, so nobody goes
              quiet on you by accident.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <StartTrial />
              <span className="text-[14px] text-chalk-faint">7 days free &middot; no card</span>
            </div>
          </div>

          <div className="lg:w-[46rem]">
            <TodayMock />
          </div>
        </div>
      </section>

      {/* The problem, told in the product's own vocabulary: ruled rows. */}
      <section className={`${SHELL} py-24 lg:py-32`}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            <h2 className="text-[2rem] leading-[1.08] font-semibold tracking-[-0.035em] sm:text-[2.6rem]">
              Nobody decides to go quiet.
            </h2>
            <p className="mt-5 max-w-[26rem] text-[16px] leading-[1.65] text-chalk-soft">
              It just happens. A good call, a vague &ldquo;next week&rdquo;, and then a week that
              looks like every other week.
            </p>
          </Reveal>

          <Reveal delay={90}>
            <ol className="border-t border-night-rule">
              {SILENCE.map((entry) => (
                <li
                  key={entry.day}
                  className="flex items-baseline gap-6 border-b border-night-rule py-3.5"
                >
                  <span className="tnum w-[4.5rem] shrink-0 text-[14px] text-chalk-faint">
                    {entry.day}
                  </span>
                  {entry.line ? (
                    <span className="text-[15px] text-chalk-soft">{entry.line}</span>
                  ) : (
                    <span className="text-[15px] text-night-rule" aria-label="nothing logged">
                      &mdash;
                    </span>
                  )}
                </li>
              ))}
            </ol>

            <p className="mt-10 max-w-[30rem] text-[1.5rem] leading-[1.25] font-medium tracking-[-0.025em] sm:text-[1.875rem]">
              Three weeks later, she signed with someone else.
            </p>
          </Reveal>
        </div>
      </section>

      {/* How it works: one idea per section, alternating sides. */}
      <div className="border-y border-night-rule bg-night-raised/60">
        <Step
          title="Log the touch."
          body="Ten seconds after the call. What happened, and when to try again. Pick a channel, pick an outcome, and you are done — there is no record to fill in afterwards, no fields anyone made you add."
          visual={<LogTouchMock />}
        />

        <div className="border-t border-night-rule" />

        <Step
          flip
          title="Get the nag."
          body="One email, at the hour you choose, in your timezone. Just the people who are due, oldest first, with the last thing you wrote about them. Nothing due that day means no email at all — so when one arrives, it means something."
          visual={<DigestPreview />}
        />

        <div className="border-t border-night-rule" />

        <Step
          title="Clear the list."
          body="Open it in the morning, work down it, close the tab. Three minutes. Duelistt is not a place you are supposed to spend your day, and it will never ask you to."
          visual={<EmptyTodayMock />}
        />
      </div>

      {/* The refusal. */}
      <section className={`${SHELL} py-24 lg:py-32`}>
        <Reveal>
          <h2 className="text-[2rem] leading-[1.08] font-semibold tracking-[-0.035em] sm:text-[2.6rem]">
            What it refuses to be.
          </h2>

          <ul className="mt-10 flex max-w-[52rem] flex-wrap gap-x-8 gap-y-3">
            {REFUSALS.map((item) => (
              <li
                key={item}
                className="text-[1.35rem] text-chalk-faint line-through decoration-night-rule decoration-2 sm:text-[1.6rem]"
              >
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={90}>
          <p className="mt-12 text-[2.25rem] font-semibold tracking-[-0.035em] text-ember sm:text-[3rem]">
            Who to call today.
          </p>

          <p className="mt-8 max-w-[38rem] text-[16px] leading-[1.7] text-chalk-soft">
            Not a CRM. No pipelines, no deal stages, no dashboard to babysit. Just the nag you
            actually need.
          </p>
        </Reveal>
      </section>

      {/* One price, stated once. */}
      <section className="border-y border-night-rule">
        <Reveal>
          <div
            className={`${SHELL} grid items-end gap-12 py-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:py-24`}
          >
            <div>
              <h2 className="text-[2rem] leading-[1.08] font-semibold tracking-[-0.035em] sm:text-[2.6rem]">
                One price. One product.
              </h2>
              <p className="mt-5 max-w-[34rem] text-[16px] leading-[1.7] text-chalk-soft">
                Everything Duelistt does, for everyone who uses it. No seats to count, no tier to
                outgrow, nothing held back to sell you later.
              </p>
            </div>

            <div className="lg:text-right">
              <p className="flex items-baseline gap-2 lg:justify-end">
                <span className="tnum text-[3.5rem] leading-none font-semibold tracking-[-0.045em] text-ember sm:text-[4.25rem]">
                  $6.99
                </span>
                <span className="text-[16px] text-chalk-soft">/month</span>
              </p>
              <div className="mt-7 lg:flex lg:justify-end">
                <StartTrial />
              </div>
              <p className="mt-4 text-[13px] text-chalk-faint">
                7 days free. No card until you decide.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className={`${SHELL} py-28 lg:py-36`}>
        <Reveal>
          <p className="max-w-[26rem] text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.035em] sm:text-[3rem]">
            Stop losing deals to silence.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <StartTrial />
            <Link
              href="/login"
              className="text-[15px] text-chalk-soft transition-colors duration-150 hover:text-chalk"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-16 max-w-[34rem] text-[15px] leading-[1.6] text-chalk-faint">
            Every lead&rsquo;s a duel. Don&rsquo;t lose it by going quiet first.
          </p>
        </Reveal>
      </section>

      <footer className="border-t border-night-rule">
        <div className={`${SHELL} flex flex-wrap items-center justify-between gap-4 py-8`}>
          <span className="text-[14px] font-semibold tracking-[-0.025em]">Duelistt</span>
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
