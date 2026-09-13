import Link from "next/link";

import type { Access } from "@/lib/billing/gate";

export function TrialNotice({ access }: { access: Access }) {
  // Silent while the trial has room. A banner that shows on day one of seven
  // is noise by day three, and invisible by day seven when it matters.
  if (access.allowed && access.reason === "active") return null;
  if (access.allowed && (access.trialDaysLeft ?? 99) > 3) return null;

  const message = access.allowed
    ? `Trial ends in ${access.trialDaysLeft} ${access.trialDaysLeft === 1 ? "day" : "days"}.`
    : "Your trial has ended. Your history is safe — subscribe to log new touches.";

  return (
    <div className="border-b border-rule bg-accent-wash">
      <p className="mx-auto flex w-full max-w-[46rem] items-baseline gap-2 px-6 py-2.5 text-[13px] text-ink">
        {message}
        <Link href="/billing" className="font-medium text-accent underline">
          Subscribe
        </Link>
      </p>
    </div>
  );
}
