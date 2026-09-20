import Link from "next/link";

import { CheckoutButtons } from "@/components/billing/CheckoutButtons";
import { requireProfile } from "@/lib/actions/profile";
import { checkAccess } from "@/lib/billing/gate";

export const metadata = { title: "Subscription · FollowUp" };
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

  return (
    <>
      <h1 className="pt-10 pb-5 text-[22px] font-semibold tracking-[-0.02em]">Subscription</h1>

      <div className="border-y border-rule py-5">
        {access.allowed && access.reason === "trialing" ? (
          <p className="text-[15px] text-ink">
            You are on the free trial —{" "}
            <span className="tnum font-medium">
              {access.trialDaysLeft} {access.trialDaysLeft === 1 ? "day" : "days"}
            </span>{" "}
            left.
          </p>
        ) : access.allowed ? (
          <p className="text-[15px] text-ink">Your subscription is active.</p>
        ) : (
          <>
            <p className="text-[15px] text-ink">
              {access.reason === "trial_expired"
                ? "Your trial has ended."
                : "You do not have an active subscription."}
            </p>
            <p className="mt-1 text-[14px] text-ink-soft">
              Everything you have logged is still here. Subscribing lets you add
              prospects and log touches again.
            </p>
          </>
        )}
      </div>

      <div className="py-8">
        {configured ? (
          <CheckoutButtons
            current={access.allowed && access.reason === "active"}
            showAnnual={showAnnual}
          />
        ) : (
          <p className="text-[14px] text-ink-soft">
            Checkout is not configured on this deployment. Set{" "}
            <code className="text-[13px] text-ink">DODO_PAYMENTS_API_KEY</code> and{" "}
            <code className="text-[13px] text-ink">DODO_PRODUCT_ID_MONTHLY</code>.
          </p>
        )}
      </div>

      <p className="border-t border-rule pt-5 text-[14px] text-ink-soft">
        <Link href="/today" className="font-medium text-accent underline underline-offset-[3px]">
          Back to Today
        </Link>
      </p>
    </>
  );
}
