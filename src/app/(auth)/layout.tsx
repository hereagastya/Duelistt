import Link from "next/link";

import { Logo } from "@/components/marketing/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="app-ground flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[24rem]">
        <div className="mb-7 text-center">
          <Link
            href="/"
            className="press inline-flex items-center gap-2.5 text-[20px] font-semibold tracking-[-0.03em] text-ink"
          >
            <Logo size={28} />
            Duelistt
          </Link>
          <p className="mt-1.5 text-[14px] text-ink-soft">
            Log who you contacted. Find out who needs a follow-up today.
          </p>
        </div>

        {children}
      </div>
    </main>
  );
}
