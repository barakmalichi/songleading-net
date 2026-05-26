import { ArrowRight, BookOpenText, Music4, Rows3, Sparkles } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ToolkitBreadcrumbs, ToolkitGuidebookNav, type ToolkitGuideActive } from "@/components/ToolkitGuidebook";
import {
  spotifyPlaylistUrl,
  toolkitKindLabels,
  toolkitKindPaths,
  toolkitSubtitle,
  toolkitTitle,
  type ToolkitItem,
  type ToolkitKind
} from "@/lib/toolkitContent";

const spotifyQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(spotifyPlaylistUrl)}`;

export function MarketingHeader() {
  return <SiteHeader />;
}

export function ToolkitHero() {
  return (
    <section className="toolkit-hero toolkit-build relative overflow-hidden bg-[#f6fafb] px-5 pb-12 pt-28 text-slate-950 md:px-8 md:pb-16 md:pt-36">
      <div className="absolute inset-x-0 top-0 h-44 bg-slate-950" />
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-blue-950/10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.12),transparent_36%),radial-gradient(circle_at_82%_16%,rgba(20,184,166,0.18),transparent_28%)]" />
        <div className="relative grid gap-8 p-7 md:p-10 lg:grid-cols-[1fr_0.78fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Songleading.net</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.94] tracking-tight md:text-7xl">{toolkitTitle}</h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-600">{toolkitSubtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/toolkit/articles" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700">
                Browse Guides
                <ArrowRight size={18} />
              </Link>
              <Link href="/toolkit/activities" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:border-blue-400">
                Activity Library
                <Rows3 size={18} />
              </Link>
            </div>
          </div>
          <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
            {[
              ["Guides", "Short reads for stronger songleading choices"],
              ["Activities", "Reusable programs with steps and links"],
              ["Songs", "Teach-ready repertoire ideas"]
            ].map(([label, text]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">{label}</span>
                <p className="mt-1 text-sm font-bold leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ToolkitModuleNav({ active }: { active?: ToolkitKind }) {
  const items: Array<{ kind: ToolkitKind; icon: React.ReactNode; text: string }> = [
    { kind: "article", icon: <BookOpenText size={19} />, text: "Articles / Guides" },
    { kind: "activity", icon: <Sparkles size={19} />, text: "Activity Library" },
    { kind: "song", icon: <Music4 size={19} />, text: "Songs to Teach" }
  ];
  return (
    <nav className="mx-auto grid max-w-7xl gap-3 px-5 py-5 md:grid-cols-3 md:px-8" aria-label="Toolkit modules">
      {items.map((item) => (
        <Link
          key={item.kind}
          href={toolkitKindPaths[item.kind]}
          className={`rounded-2xl border p-4 font-black transition hover:-translate-y-0.5 ${active === item.kind ? "border-blue-400 bg-blue-600 text-white shadow-xl shadow-blue-900/15" : "border-slate-200 bg-white text-slate-950 hover:border-blue-300"}`}
        >
          <span className="inline-flex items-center gap-2">{item.icon}{item.text}</span>
        </Link>
      ))}
    </nav>
  );
}

export function ToolkitGuidebookShell({ active = "overview", children }: {
  active?: ToolkitGuideActive;
  children: React.ReactNode;
}) {
  return (
    <section className="toolkit-guide-shell mx-auto grid max-w-7xl gap-6 px-5 pb-16 md:px-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="toolkit-guide-sidebar">
        <ToolkitGuidebookNav active={active} />
      </aside>
      <div className="min-w-0">
        {children}
      </div>
    </section>
  );
}

export function ToolkitCard({ item }: { item: ToolkitItem }) {
  const path = `${toolkitKindPaths[item.kind]}/${item.slug}`;
  return (
    <Link href={path} className="toolkit-card group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-950/10">
      {item.heroImage ? (
        <div className="relative h-40 overflow-hidden bg-slate-950">
          <img src={item.heroImage} alt="" className="h-full w-full object-cover opacity-88 transition duration-500 group-hover:scale-105" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">{toolkitKindLabels[item.kind]}</p>
        <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight text-slate-950">{item.title}</h2>
        <p className="mt-3 flex-1 text-sm font-semibold leading-6 text-slate-600">{item.excerpt}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[...item.categories, ...item.tags].slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{tag}</span>
          ))}
        </div>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-700">
          Read more
          <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}

export function ToolkitGrid({ items, emptyText = "Nothing published here yet." }: { items: ToolkitItem[]; emptyText?: string }) {
  if (!items.length) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-black text-slate-500">{emptyText}</p>;
  }
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => <ToolkitCard key={item.id} item={item} />)}
    </div>
  );
}

export function ToolkitListPageHeader({ kind, title, text, actionHref, actionLabel }: {
  kind: ToolkitKind;
  title: string;
  text: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <section className="toolkit-list-header mx-auto max-w-7xl px-5 pb-6 pt-28 md:px-8 md:pt-36">
      <ToolkitBreadcrumbs current={title} />
      <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">{toolkitKindLabels[kind]}</p>
      <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-slate-950 md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-slate-600">{text}</p>
        </div>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">
            {actionLabel}
            <ArrowRight size={18} />
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export function SpotifyPlaylistFeature() {
  return (
    <section id="playlist" className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-[#101820] text-white shadow-2xl shadow-blue-950/12 lg:grid-cols-[1fr_320px]">
        <div className="relative p-7 md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,197,94,0.24),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.18),transparent_34%)]" />
          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">Curated playlist</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight tracking-tight md:text-5xl">Songs worth keeping close.</h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/74">
              A practical and inspiring music resource for camps and songleaders: upbeat modern songs, pop and communal singing material, Jewish prayer music, and repertoire that can fit different camp and community atmospheres.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={spotifyPlaylistUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-300">
                Open Spotify Playlist
                <ArrowRight size={18} />
              </a>
              <Link href="/toolkit/songs" className="inline-flex items-center gap-2 rounded-xl border border-white/18 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/16">
                Browse Songs to Teach
                <Music4 size={18} />
              </Link>
            </div>
          </div>
        </div>
        <div className="grid place-items-center bg-white p-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
            <img src={spotifyQrUrl} alt="Scannable Spotify playlist code" className="h-56 w-56 rounded-2xl" />
            <p className="mt-3 text-center text-xs font-black uppercase tracking-[0.18em] text-slate-500">Scan for playlist</p>
          </div>
        </div>
      </div>
    </section>
  );
}
