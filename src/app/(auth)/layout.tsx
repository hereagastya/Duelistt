import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-[24rem]">
        <div className="mb-7 text-center">
          <Link href="/" className="text-[20px] font-semibold tracking-[-0.03em] text-ink">
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
