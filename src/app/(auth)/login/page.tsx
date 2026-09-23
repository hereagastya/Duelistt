import Link from "next/link";

import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in · Duelistt" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <>
      <div className="rounded-xl border border-rule bg-surface p-6 shadow-sm">
        <h1 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Sign in</h1>
        <div className="mt-5">
          <LoginForm next={next ?? "/today"} />
        </div>
      </div>

      <p className="mt-5 text-center text-[14px] text-ink-soft">
        No account yet?{" "}
        <Link
          href="/signup"
          className="font-medium text-accent-ink underline decoration-accent-line underline-offset-[3px] hover:decoration-accent-ink"
        >
          Start a 7-day trial
        </Link>
        <span className="text-ink-faint"> — no card needed.</span>
      </p>
    </>
  );
}
