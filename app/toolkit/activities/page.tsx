import { ToolkitRelatedNextSteps } from "@/components/ToolkitGuidebook";
import { MarketingHeader, ToolkitGrid, ToolkitGuidebookShell, ToolkitListPageHeader } from "@/components/ToolkitShared";
import { readToolkitItems } from "@/lib/toolkitServer";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const items = (await readToolkitItems()).filter((item) => item.kind === "activity");
  return (
    <main className="min-h-screen bg-[#eef4f8] text-slate-950">
      <MarketingHeader />
      <ToolkitListPageHeader
        kind="activity"
        title="Activity Library"
        text="Practical camp and community activities with goals, materials, steps, group size, and useful links."
        actionHref="/toolkit/activities/submit"
        actionLabel="Share an activity"
      />
      <ToolkitGuidebookShell active="activity">
      <section>
        <ToolkitGrid items={items} emptyText="No activities are published yet." />
        <ToolkitRelatedNextSteps active="activity" />
      </section>
      </ToolkitGuidebookShell>
    </main>
  );
}
