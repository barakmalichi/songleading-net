import { ToolkitRelatedNextSteps } from "@/components/ToolkitGuidebook";
import { MarketingHeader, ToolkitGrid, ToolkitGuidebookShell, ToolkitListPageHeader } from "@/components/ToolkitShared";
import { readToolkitItems } from "@/lib/toolkitServer";

export const dynamic = "force-dynamic";

export default async function SongsPage() {
  const items = (await readToolkitItems()).filter((item) => item.kind === "song");
  return (
    <main className="min-h-screen bg-[#eef4f8] text-slate-950">
      <MarketingHeader />
      <ToolkitListPageHeader
        kind="song"
        title="Songs to Teach"
        text="Teach-ready song suggestions with YouTube references, context, age level, setting, teaching notes, and rights-aware lyrics/chords."
        actionHref="/toolkit/songs/submit"
        actionLabel="Submit Song"
      />
      <ToolkitGuidebookShell active="song">
      <section>
        <ToolkitGrid items={items} emptyText="No songs are published yet." />
        <ToolkitRelatedNextSteps active="song" />
      </section>
      </ToolkitGuidebookShell>
    </main>
  );
}
