"use client";

import { useActionState } from "react";

import { startCheckout, type CheckoutState } from "@/lib/actions/billing";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";

const INITIAL: CheckoutState = { error: null };

export function CheckoutButtons({
  current,
  showAnnual,
}: {
  current: boolean;
  showAnnual: boolean;
}) {
  const [state, formAction, pending] = useActionState(startCheckout, INITIAL);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <Button type="submit" name="plan" value="monthly" pending={pending}>
          {current ? "Switch to monthly" : "Subscribe monthly"}
        </Button>
        {/* Rendered only when an annual product exists; without one the action
            would throw on click. */}
        {showAnnual && (
          <Button type="submit" name="plan" value="annual" variant="secondary" pending={pending}>
            {current ? "Switch to annual" : "Subscribe annually"}
          </Button>
        )}
      </form>

      {state.error && <FormError>{state.error}</FormError>}
    </div>
  );
}
