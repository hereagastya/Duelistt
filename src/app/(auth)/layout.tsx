import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";

import { Logo } from "@/components/marketing/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="app-ground flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[24rem]">
        <div className="mb-7 text-center">
          <Link
            href="/"
            className="press inline-flex items-center gap-2.5 text-[20px] font-semibold tracking-[-0.03em] text-ink"
          >
            <Logo size={28} />
            Duelistt
          </Link>
          <p className="mt-1.5 text-[14px] text-ink-soft">
            Log who you contacted. Find out who needs a follow-up today.
          </p>
        </div>

        {children}
      </div>

      {/*
        /login and /signup are the far end of the acquisition funnel, so they
        are measured alongside the landing page: a visit to /signup against a
        visit to / is the conversion rate.

        Still deliberately not in the root layout. Everything past this point
        is signed in, and that behaviour is already in the touches table.

        Pageviews only. Custom events (a CTA click, a completed signup) are a
        Pro feature, and this project is on Hobby -- so the conversion rate is
        read as /signup views against / views, not as a tracked funnel. Do not
        add track() calls here expecting them to record.
      */}
      <Analytics />
    </main>
  );
}
