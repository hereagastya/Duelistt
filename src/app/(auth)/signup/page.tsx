import Link from "next/link";

import { SignUpForm } from "./SignUpForm";

export const metadata = { title: "Start a trial · Duelistt" };

export default function SignUpPage() {
  return (
    <>
      <SignUpForm />
      <p className="mt-8 border-t border-rule pt-5 text-[14px] text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
