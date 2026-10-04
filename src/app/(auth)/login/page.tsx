import Link from "next/link";

import { AuthCard } from "@/components/auth/AuthCard";

import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const destination = next ?? "/today";

  return (
    <AuthCard
      title="Sign in"
      subtitle="Your list is waiting. Pick up where you left off."
      googleLabel="Continue with Google"
      googleNext={destination}
      footer={
        <>
          No account yet?{" "}
          <Link
            href="/signup"
            className="font-medium text-accent-ink underline decoration-accent-line underline-offset-[3px] hover:decoration-accent-ink"
          >
            Start a 7-day trial
          </Link>
          <span className="text-ink-faint">. No card needed.</span>
        </>
      }
    >
      <LoginForm next={destination} />
    </AuthCard>
  );
}
