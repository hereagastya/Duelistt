import { requireProfile } from "@/lib/actions/profile";
import { checkAccess } from "@/lib/billing/gate";
import { Nav } from "@/components/ui/Nav";
import { TrialNotice } from "@/components/ui/TrialNotice";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { email, profile } = await requireProfile();
  const access = checkAccess(profile);

  return (
    <div className="min-h-dvh bg-paper">
      <Nav email={email} />
      <TrialNotice access={access} />
      <main className="mx-auto w-full max-w-[48rem] px-6 pb-28">{children}</main>
    </div>
  );
}
