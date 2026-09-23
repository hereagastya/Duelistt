import Link from "next/link";

import { CheckoutButtons } from "@/components/billing/CheckoutButtons";
import { ManageSubscription } from "@/components/billing/ManageSubscription";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireProfile } from "@/lib/actions/profile";
import { checkAccess } from "@/lib/billing/gate";

export const metadata = { title: "Subscription · Duelistt" };
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { profile } = await requireProfile();
  const access = checkAccess(profile);

  // Show a button only when it can actually reach a checkout. A Subscribe
  // button that throws on click is worse than an honest sentence. Monthly and
  // annual are gated separately: an annual product may not exist yet, and that
  // must not hide the monthly plan too.
  const configured = Boolean(
    process.env.DODO_PAYMENTS_API_KEY && process.env.DODO_PRODUCT_ID_MONTHLY,
  );
  const showAnnual = Boolean(process.env.DODO_PRODUCT_ID_ANNUAL);
  const subscribed = access.allowed && access.reason === "active";

  return (
    <>
      <PageHeader title="Subscription" />

      <section className="rounded-xl border border-rule bg-surface p-5 shadow-xs sm:p-6">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={`mt-1.5 size-2 shrink-0 rounded-full ${
              subscribed ? "bg-settled" : access.allowed ? "bg-accent" : "bg-late"
            }`}
          />
          <div className="min-w-0">
            {access.allowed && access.reason === "trialing" ? (
              <p className="text-[15px] text-ink">
                You are on the free trial —{" "}
                <span className="tnum font-medium">
                  {access.trialDaysLeft} {access.trialDaysLeft === 1 ? "day" : "days"}
                </span>{" "}
                left.
              </p>
            ) : subscribed ? (
              <p className="text-[15px] text-ink">Your subscription is active.</p>
            ) : (
              <>
                <p className="text-[15px] text-ink">
                  {access.reason === "trial_expired"
                    ? "Your trial has ended."
                    : "You do not have an active subscription."}
                </p>
                <p className="mt-1 text-[14px] text-ink-soft">
                  Everything you have logged is still here. Subscribing lets you add prospects
                  and log touches again.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-rule pt-6">
          {subscribed ? (
            // An active subscriber is never shown a checkout button: the only
            // product configured is the one they already pay for, so "switching"
            // to it would start a second subscription.
            <ManageSubscription plan={profile.plan} />
          ) : configured ? (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <p className="flex items-baseline gap-1.5">
                <span className="tnum text-[30px] leading-none font-semibold tracking-[-0.03em] text-ink">
                  $6.99
                </span>
                <span className="text-[14px] text-ink-soft">/month</span>
              </p>
              <CheckoutButtons showAnnual={showAnnual} />
            </div>
          ) : (
            <p className="text-[14px] text-ink-soft">
              Checkout is not configured on this deployment. Set{" "}
              <code className="rounded bg-paper-sunk px-1.5 py-0.5 text-[13px] text-ink">
                DODO_PAYMENTS_API_KEY
              </code>{" "}
              and{" "}
              <code className="rounded bg-paper-sunk px-1.5 py-0.5 text-[13px] text-ink">
                DODO_PRODUCT_ID_MONTHLY
              </code>
              .
            </p>
          )}
        </div>
      </section>

      <p className="mt-6 text-[14px] text-ink-soft">
        <Link
          href="/today"
          className="font-medium text-accent-ink underline decoration-accent-line underline-offset-[3px] hover:decoration-accent-ink"
        >
          Back to Today
        </Link>
      </p>
    </>
  );
}
