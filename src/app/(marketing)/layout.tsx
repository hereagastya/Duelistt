import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Duelistt — the follow-up tracker for manual outreach",
  description:
    "A dead-simple follow-up tracker for cold calls, emails, DMs and LinkedIn. Log who you talked to, what happened, and when to follow up. Duelistt tells you exactly who is due today.",
  openGraph: {
    title: "Duelistt — you didn't lose the deal, you forgot to call back",
    description:
      "A dead-simple follow-up tracker for manual outreach. Not a CRM: no pipelines, no deal stages, no dashboard to babysit.",
    url: "https://www.duelistt.com",
    siteName: "Duelistt",
    type: "website",
  },
};

/**
 * The landing page runs on its own palette. `night` scopes the dark tokens and
 * the browser surfaces (selection, focus ring, scrollbars) so the authed app
 * keeps its paper-and-ink theme untouched.
 *
 * `night-ground` is a single warm lift from the top and `grain` a fine noise
 * layer -- both sit behind the content (which is raised to z-10) so nothing
 * renders through the text.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="night night-ground grain min-h-dvh text-chalk">
      <div className="relative z-10">{children}</div>
    </div>
  );
}
