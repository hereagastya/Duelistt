import Link from "next/link";

import { SignUpForm } from "./SignUpForm";

export const metadata = { title: "Start a trial · Duelistt" };

export default function SignUpPage() {
  return (
    <>
      <div className="rounded-xl border border-rule bg-surface p-6 shadow-sm">
        <h1 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          Start your free trial
        </h1>
        <div className="mt-5">
          <SignUpForm />
        </div>
      </div>

      <p className="mt-5 text-center text-[14px] text-ink-soft">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-accent-ink underline decoration-accent-line underline-offset-[3px] hover:decoration-accent-ink"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
