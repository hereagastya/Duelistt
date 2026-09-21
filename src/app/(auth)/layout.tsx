export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[26rem] flex-col justify-center px-6 py-16">
      <div className="mb-10">
        <p className="text-[19px] font-semibold tracking-[-0.02em] text-ink">Duelistt</p>
        <p className="mt-1 text-[14px] text-ink-soft">
          Log who you contacted. Find out who needs a follow-up today.
        </p>
      </div>
      {children}
    </main>
  );
}
