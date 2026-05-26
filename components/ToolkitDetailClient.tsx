"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Music4 } from "lucide-react";
import { getValidSession } from "@/lib/cloudClient";
import { ToolkitBreadcrumbs, ToolkitGuidebookNav, ToolkitRelatedNextSteps } from "@/components/ToolkitGuidebook";
import { ToolkitMarkdown } from "@/components/ToolkitMarkdown";
import { toolkitKindLabels, toolkitKindPaths, type ToolkitActivity, type ToolkitItem, type ToolkitKind, type ToolkitSong } from "@/lib/toolkitContent";

function DetailPair({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <dt className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-black text-slate-900">{value}</dd>
    </div>
  );
}

function ActivityDetails({ item }: { item: ToolkitActivity }) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <DetailPair label="Goals" value={item.goals} />
        <DetailPair label="Equipment" value={item.equipment} />
        <DetailPair label="Duration" value={item.duration} />
        <DetailPair label="Age group" value={item.ageGroup} />
        <DetailPair label="Group size" value={item.groupSize} />
      </div>
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-black">Step-by-step</h2>
        <ol className="mt-4 grid gap-3">
          {item.steps.map((step, index) => (
            <li key={`${step}-${index}`} className="grid grid-cols-[2.25rem_1fr] gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-700">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
      {item.relatedLinks.length || item.relatedSongs.length ? (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-black">Related links</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {item.relatedLinks.map((link) => (
              <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer" className="rounded-full bg-blue-50 px-3 py-2 text-sm font-black text-blue-700 hover:bg-blue-100">
                {link.label}
              </a>
            ))}
            {item.relatedSongs.map((song) => <span key={song} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-black text-slate-600">{song}</span>)}
          </div>
        </section>
      ) : null}
    </>
  );
}

function SongDetails({ item }: { item: ToolkitSong }) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <DetailPair label="Artist / composer" value={item.artist} />
        <DetailPair label="Age group" value={item.ageGroup} />
        <DetailPair label="Musical level" value={item.musicalLevel} />
        <DetailPair label="Energy" value={item.energyLevel} />
        <DetailPair label="Setting" value={item.setting} />
      </div>
      <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.78fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-black">Why teach it</h2>
          <p className="mt-3 text-base font-semibold leading-7 text-slate-600">{item.whyTeach || item.context}</p>
          {item.teachingNotes ? (
            <>
              <h3 className="mt-6 text-xl font-black">Teaching notes</h3>
              <p className="mt-2 whitespace-pre-wrap text-base font-semibold leading-7 text-slate-600">{item.teachingNotes}</p>
            </>
          ) : null}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white">
          <h2 className="text-2xl font-black">Listen / reference</h2>
          <div className="mt-4 grid gap-3">
            {item.youtubeUrl ? (
              <a href={item.youtubeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950">
                Open YouTube
                <Music4 size={17} />
              </a>
            ) : null}
            {item.externalLinks.map((link) => (
              <a key={link} href={link} target="_blank" rel="noreferrer" className="rounded-xl border border-white/14 bg-white/8 px-4 py-3 text-sm font-black text-white">
                {link}
              </a>
            ))}
          </div>
        </div>
      </section>
      {item.rightsConfirmed && item.lyricsChords ? (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-black">Lyrics and chords</h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 text-sm font-bold leading-7 text-white">{item.lyricsChords}</pre>
        </section>
      ) : (
        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-black text-amber-900">
          Lyrics and chords are shown only when rights are confirmed. Use the external links and teaching notes for this song.
        </p>
      )}
    </>
  );
}

export function ToolkitDetailClient({ kind, slug }: { kind: ToolkitKind; slug: string }) {
  const [item, setItem] = useState<ToolkitItem | null>(null);
  const [message, setMessage] = useState("Checking your account...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const session = await getValidSession();
        if (!session?.access_token) {
          setMessage("Sign in or create an account to read the full item.");
          setLoading(false);
          window.dispatchEvent(new CustomEvent("songleading-auth-open", { detail: { mode: "sign-in" } }));
          return;
        }
        const response = await fetch(`/api/toolkit/${toolkitKindPaths[kind].split("/").pop()}/${slug}`, {
          headers: { authorization: `Bearer ${session.access_token}` },
          cache: "no-store"
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Could not open this Toolkit item.");
        setItem(payload.item);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not open this Toolkit item.");
      } finally {
        setLoading(false);
      }
    }
    load();
    const onSignedIn = () => load();
    window.addEventListener("songleading-auth-signed-in", onSignedIn);
    return () => window.removeEventListener("songleading-auth-signed-in", onSignedIn);
  }, [kind, slug]);

  if (!item) {
    return (
      <main className="min-h-screen bg-[#eef4f8] px-5 py-28 text-slate-950 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="toolkit-guide-sidebar">
            <ToolkitGuidebookNav active={kind} />
          </aside>
          <section className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl">
            <Lock className="mx-auto text-blue-600" size={34} />
            <h1 className="mt-4 text-3xl font-black">{loading ? "Opening..." : "Sign in required"}</h1>
            <p className="mt-3 text-sm font-bold leading-6 text-slate-600">{message}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("songleading-auth-open", { detail: { mode: "sign-in" } }))} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white">Sign in</button>
              <Link href={toolkitKindPaths[kind]} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-900">Back to {toolkitKindLabels[kind]}</Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef4f8] px-5 pb-16 pt-28 text-slate-950 md:px-8 md:pt-36">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="toolkit-guide-sidebar">
          <ToolkitGuidebookNav active={item.kind} />
        </aside>
        <article className="min-w-0">
          <ToolkitBreadcrumbs current={item.title} kind={item.kind} />
          <Link href={toolkitKindPaths[item.kind]} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-700">
            <ArrowLeft size={17} />
            Back to {toolkitKindLabels[item.kind]}
          </Link>
          <header className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-blue-950/10">
            {item.heroImage ? <img src={item.heroImage} alt="" className="h-64 w-full object-cover" /> : null}
            <div className="p-7 md:p-10">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">{toolkitKindLabels[item.kind]}</p>
              <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight md:text-6xl">{item.title}</h1>
              <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-slate-600">{item.excerpt}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[...item.categories, ...item.tags].map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{tag}</span>)}
              </div>
            </div>
          </header>

          <section className="mt-8">
            {item.kind === "article" ? <ToolkitMarkdown text={item.body} /> : null}
            {item.kind === "activity" ? <ActivityDetails item={item} /> : null}
            {item.kind === "song" ? <SongDetails item={item} /> : null}
          </section>
          <ToolkitRelatedNextSteps active={item.kind} />
        </article>
      </div>
    </main>
  );
}
