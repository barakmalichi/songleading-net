import { ToolkitBreadcrumbs } from "@/components/ToolkitGuidebook";
import { MarketingHeader, ToolkitGuidebookShell } from "@/components/ToolkitShared";
import { ToolkitSubmitForm } from "@/components/ToolkitSubmitForm";

export default function SubmitActivityPage() {
  return (
    <main className="site-theme-page min-h-screen bg-[#eef4f8] text-slate-950">
      <MarketingHeader />
      <section className="toolkit-list-header mx-auto max-w-7xl px-5 pb-6 pt-28 md:px-8 md:pt-36">
        <ToolkitBreadcrumbs current="Submit an Activity" kind="activity" />
        <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Activity Library</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-slate-950 md:text-6xl">Submit an Activity</h1>
      </section>
      <ToolkitGuidebookShell active="activity">
        <div className="max-w-4xl">
          <ToolkitSubmitForm kind="activity" />
        </div>
      </ToolkitGuidebookShell>
    </main>
  );
}
