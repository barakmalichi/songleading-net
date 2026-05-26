import { ToolkitRelatedNextSteps } from "@/components/ToolkitGuidebook";
import { MarketingHeader, ToolkitGrid, ToolkitGuidebookShell, ToolkitListPageHeader } from "@/components/ToolkitShared";
import { readToolkitItems } from "@/lib/toolkitServer";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const items = (await readToolkitItems()).filter((item) => item.kind === "article");
  return (
    <main className="min-h-screen bg-[#eef4f8] text-slate-950">
      <MarketingHeader />
      <ToolkitListPageHeader
        kind="article"
        title="Articles / Guides"
        text="Written guidance for songleading, facilitation, camp culture, music education, prayer moments, and practical leadership."
      />
      <ToolkitGuidebookShell active="article">
      <section>
        <ToolkitGrid items={items} emptyText="No articles are published yet." />
        <ToolkitRelatedNextSteps active="article" />
      </section>
      </ToolkitGuidebookShell>
    </main>
  );
}
