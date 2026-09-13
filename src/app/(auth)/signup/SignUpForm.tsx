"use client";

import { useActionState } from "react";

import { signUp, type AuthState } from "../actions";
import { Button } from "@/components/ui/Button";
import { FormError, Input, Label } from "@/components/ui/Field";

const INITIAL: AuthState = { error: null };

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, INITIAL);

  // Captured once, at the only moment the browser will tell us for free.
  // It decides what "7am" means for this user's digest, and Settings can change it.
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (state.message) {
    return (
      <p className="border-l-[1px] border-accent bg-accent-wash px-4 py-3 text-[14px] text-ink">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="timezone" value={timezone} />

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          placeholder="you@company.com"
        />
      </div>

      <div>
        <Label htmlFor="password" hint="8 characters or more">
          Password
        </Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </div>

      {state.error && <FormError>{state.error}</FormError>}

      <Button type="submit" pending={pending} className="mt-1 w-full">
        {pending ? "Creating your account" : "Start free trial"}
      </Button>

      <p className="text-[13px] text-ink-faint">
        Seven days, no card. We&rsquo;ll ask for payment when the trial ends, not before.
      </p>
    </form>
  );
}
