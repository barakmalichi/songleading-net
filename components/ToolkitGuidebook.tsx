"use client";

import Link from "next/link";
import type React from "react";
import { ArrowRight, BookOpenText, LibraryBig, Music4, Rows3, Sparkles } from "lucide-react";
import { toolkitKindLabels, toolkitKindPaths, type ToolkitKind } from "@/lib/toolkitContent";

export type ToolkitGuideActive = ToolkitKind | "overview" | "playlist" | "submit";

const guidebookLinks: Array<{
  key: ToolkitGuideActive;
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    key: "overview",
    href: "/toolkit",
    label: "Toolkit Overview",
    description: "Start with the full guide.",
    icon: <LibraryBig size={18} />
  },
  {
    key: "article",
    href: toolkitKindPaths.article,
    label: toolkitKindLabels.article,
    description: "Read practical guidance.",
    icon: <BookOpenText size={18} />
  },
  {
    key: "activity",
    href: toolkitKindPaths.activity,
    label: toolkitKindLabels.activity,
    description: "Run something with a group.",
    icon: <Sparkles size={18} />
  },
  {
    key: "song",
    href: toolkitKindPaths.song,
    label: toolkitKindLabels.song,
    description: "Pick songs to teach.",
    icon: <Music4 size={18} />
  },
  {
    key: "playlist",
    href: "/toolkit#playlist",
    label: "Curated Playlist",
    description: "Open the Spotify resource.",
    icon: <Rows3 size={18} />
  }
];

const relatedByKind: Record<ToolkitKind | "overview", Array<{ label: string; href: string; text: string }>> = {
  overview: [
    { label: "Browse activities", href: toolkitKindPaths.activity, text: "Find a program idea." },
    { label: "Browse songs", href: toolkitKindPaths.song, text: "Pick repertoire." },
    { label: "Open Lineup", href: "/lineup/index.html", text: "Build the setlist." }
  ],
  article: [
    { label: "Try an activity", href: toolkitKindPaths.activity, text: "Turn the idea into a room." },
    { label: "Pick a song", href: toolkitKindPaths.song, text: "Match it with repertoire." },
    { label: "Open Lineup", href: "/lineup/index.html", text: "Build the setlist." }
  ],
  activity: [
    { label: "Pick a song", href: toolkitKindPaths.song, text: "Pair the activity with music." },
    { label: "Submit an activity", href: "/toolkit/activities/submit", text: "Share another idea." },
    { label: "Open Lineup", href: "/lineup/index.html", text: "Add it to a setlist." }
  ],
  song: [
    { label: "Try an activity", href: toolkitKindPaths.activity, text: "Teach it with a group." },
    { label: "Curated playlist", href: "/toolkit#playlist", text: "Keep listening." },
    { label: "Open Lineup", href: "/lineup/index.html", text: "Use it in a setlist." }
  ]
};

export function ToolkitBreadcrumbs({ current, kind }: { current: string; kind?: ToolkitKind }) {
  return (
    <nav className="toolkit-breadcrumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      <span>/</span>
      <Link href="/toolkit">Toolkit</Link>
      {kind ? (
        <>
          <span>/</span>
          <Link href={toolkitKindPaths[kind]}>{toolkitKindLabels[kind]}</Link>
        </>
      ) : null}
      <span>/</span>
      <strong>{current}</strong>
    </nav>
  );
}

export function ToolkitGuidebookNav({ active = "overview" }: { active?: ToolkitGuideActive }) {
  return (
    <nav className="toolkit-guide-nav" aria-label="Toolkit guidebook">
      <p className="toolkit-guide-nav-label">Guidebook</p>
      {guidebookLinks.map((item) => (
        <Link key={item.href} href={item.href} className={`toolkit-guide-link ${active === item.key ? "is-active" : ""}`}>
          <span className="toolkit-guide-link-icon">{item.icon}</span>
          <span>
            <strong>{item.label}</strong>
            <small>{item.description}</small>
          </span>
        </Link>
      ))}
    </nav>
  );
}

export function ToolkitRelatedNextSteps({ active = "overview" }: { active?: ToolkitKind | "overview" }) {
  return (
    <section className="toolkit-related-steps" aria-label="Related Toolkit next steps">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Related next steps</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Keep the path simple.</h2>
      </div>
      <div className="toolkit-related-grid">
        {relatedByKind[active].map((item) => (
          <Link key={item.href} href={item.href} className="toolkit-related-card">
            <span>
              <strong>{item.label}</strong>
              <small>{item.text}</small>
            </span>
            <ArrowRight size={17} />
          </Link>
        ))}
      </div>
    </section>
  );
}
