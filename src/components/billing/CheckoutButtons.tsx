"use client";

import { useActionState } from "react";

import { startCheckout, type CheckoutState } from "@/lib/actions/billing";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";

const INITIAL: CheckoutState = { error: null };

// Only ever rendered for someone without an active subscription, so the labels
// are plain "Subscribe". An active subscriber gets ManageSubscription instead:
// offering them "switch to" the plan they already hold just opened a second
// checkout for the same product.
export function CheckoutButtons({ showAnnual }: { showAnnual: boolean }) {
  const [state, formAction, pending] = useActionState(startCheckout, INITIAL);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <Button type="submit" name="plan" value="monthly" pending={pending}>
          Subscribe monthly
        </Button>
        {/* Rendered only when an annual product exists; without one the action
            would throw on click. */}
        {showAnnual && (
          <Button type="submit" name="plan" value="annual" variant="secondary" pending={pending}>
            Subscribe annually
          </Button>
        )}
      </form>

      {state.error && <FormError>{state.error}</FormError>}
    </div>
  );
}
