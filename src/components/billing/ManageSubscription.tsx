"use client";

import { useActionState } from "react";

import { openCustomerPortal, type PortalState } from "@/lib/actions/billing";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";

const INITIAL: PortalState = { error: null };

// Rows created before the webhook stored the plan carry the old default, so the
// plan line is omitted rather than guessed.
const PLAN_LABEL: Record<string, string> = {
  monthly: "the monthly plan",
  annual: "the annual plan",
};

export function ManageSubscription({ plan }: { plan: string }) {
  const [state, formAction, pending] = useActionState(openCustomerPortal, INITIAL);
  const planLabel = PLAN_LABEL[plan];

  return (
    <div className="flex flex-col gap-3">
      {planLabel && <p className="text-[14px] text-ink-soft">You are on {planLabel}.</p>}

      <form action={formAction}>
        <Button type="submit" pending={pending}>
          {pending ? "Opening portal" : "Manage subscription"}
        </Button>
      </form>

      <p className="text-[13px] text-ink-faint">
        Change your payment method or cancel in Dodo&rsquo;s billing portal.
      </p>

      {state.error && <FormError>{state.error}</FormError>}
    </div>
  );
}
