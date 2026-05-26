import { ToolkitBreadcrumbs } from "@/components/ToolkitGuidebook";
import { MarketingHeader, ToolkitGuidebookShell } from "@/components/ToolkitShared";
import { ToolkitSubmitForm } from "@/components/ToolkitSubmitForm";

export default function SubmitSongPage() {
  return (
    <main className="site-theme-page min-h-screen bg-[#eef4f8] text-slate-950">
      <MarketingHeader />
      <section className="toolkit-list-header mx-auto max-w-7xl px-5 pb-6 pt-28 md:px-8 md:pt-36">
        <ToolkitBreadcrumbs current="Suggest a Song" kind="song" />
        <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Songs to Teach</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-slate-950 md:text-6xl">Suggest a Song</h1>
      </section>
      <ToolkitGuidebookShell active="song">
        <div className="max-w-4xl">
          <ToolkitSubmitForm kind="song" />
        </div>
      </ToolkitGuidebookShell>
    </main>
  );
}
