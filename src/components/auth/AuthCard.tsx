import type { ReactNode } from "react";

import { GoogleButton } from "./GoogleButton";

/*
  One shell for sign in and sign up, so the two screens cannot drift apart.

  Google goes above the fold and above the form, because for most people it is
  the whole interaction: a password field offered first is a password field most
  people will fill in needlessly. The email form stays below a labelled rule,
  not hidden behind a toggle, since the people who want it want it immediately.
*/
export function AuthCard({
  title,
  subtitle,
  googleLabel,
  googleNext,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  googleLabel: string;
  googleNext: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <>
      <div className="frost relative overflow-hidden rounded-2xl border border-rule p-6 shadow-md sm:p-7">
        <h1 className="text-[20px] font-semibold tracking-[-0.03em] text-ink">
          {title}
        </h1>
        <p className="mt-1.5 text-[14px] leading-[1.55] text-ink-soft">
          {subtitle}
        </p>

        <div className="mt-6">
          <GoogleButton next={googleNext} label={googleLabel} />
        </div>

        <div className="my-6 flex items-center gap-3">
          <span aria-hidden className="h-px flex-1 bg-rule" />
          <span className="text-[11px] font-medium tracking-[0.16em] text-ink-faint uppercase">
            or with email
          </span>
          <span aria-hidden className="h-px flex-1 bg-rule" />
        </div>

        {children}
      </div>

      <p className="mt-5 text-center text-[14px] text-ink-soft">{footer}</p>
    </>
  );
}
