import { NewProspectForm } from "@/components/prospects/NewProspectForm";
import { requireProfile } from "@/lib/actions/profile";
import { todayIn } from "@/lib/date";

export const metadata = { title: "Add prospect · Duelistt" };

export default async function NewProspectPage() {
  const { profile } = await requireProfile();

  return (
    <>
      <h1 className="pt-10 pb-5 text-[22px] font-semibold tracking-[-0.02em]">Add prospect</h1>
      <NewProspectForm
        today={todayIn(profile.timezone)}
        timezone={profile.timezone}
        defaultInterval={profile.default_follow_up_interval}
      />
    </>
  );
}
