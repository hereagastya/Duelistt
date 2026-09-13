import Link from "next/link";

import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in · FollowUp" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <>
      <LoginForm next={next ?? "/today"} />
      <p className="mt-8 border-t border-rule pt-5 text-[14px] text-ink-soft">
        No account yet?{" "}
        <Link href="/signup" className="font-medium text-accent underline">
          Start a 7-day trial
        </Link>
        <span className="text-ink-faint"> — no card needed.</span>
      </p>
    </>
  );
}
