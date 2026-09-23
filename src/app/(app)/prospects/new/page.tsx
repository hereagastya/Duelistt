import { NewProspectForm } from "@/components/prospects/NewProspectForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireProfile } from "@/lib/actions/profile";
import { todayIn } from "@/lib/date";

export const metadata = { title: "Add prospect · Duelistt" };

export default async function NewProspectPage() {
  const { profile } = await requireProfile();

  return (
    <>
      <PageHeader
        title="Add prospect"
        description="Someone you have already contacted, and want to chase."
      />
      <NewProspectForm
        today={todayIn(profile.timezone)}
        timezone={profile.timezone}
        defaultInterval={profile.default_follow_up_interval}
      />
    </>
  );
}
