import Link from "next/link";

import { AuthCard } from "@/components/auth/AuthCard";

import { SignUpForm } from "./SignUpForm";

export const metadata = { title: "Start a trial" };

export default function SignUpPage() {
  return (
    <AuthCard
      title="Start your free trial"
      subtitle="Seven days, no card. Log your first follow-up in under a minute."
      googleLabel="Sign up with Google"
      googleNext="/today"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-accent-ink underline decoration-accent-line underline-offset-[3px] hover:decoration-accent-ink"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
