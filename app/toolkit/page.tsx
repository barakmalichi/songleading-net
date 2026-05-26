import { ArrowRight, BookOpenText, LibraryBig, Music4, Rows3, Sparkles } from "lucide-react";
import Link from "next/link";
import { MarketingHeader } from "@/components/ToolkitShared";
import { spotifyPlaylistUrl, toolkitKindPaths, toolkitSubtitle, toolkitTitle } from "@/lib/toolkitContent";

export const dynamic = "force-dynamic";

const toolkitCards = [
  {
    title: "Articles / Guides",
    text: "Short reads for stronger songleading choices.",
    href: toolkitKindPaths.article,
    icon: BookOpenText,
    accent: "bg-blue-50 text-blue-700"
  },
  {
    title: "Activity Library",
    text: "Ready-to-run programs with goals, steps, and links.",
    href: toolkitKindPaths.activity,
    icon: Sparkles,
    accent: "bg-emerald-50 text-emerald-700"
  },
  {
    title: "Songs to Teach",
    text: "Repertoire ideas with context and teaching notes.",
    href: toolkitKindPaths.song,
    icon: Music4,
    accent: "bg-indigo-50 text-indigo-700"
  },
  {
    title: "Curated Playlist",
    text: "A quick listening path for camps and communities.",
    href: spotifyPlaylistUrl,
    icon: Rows3,
    accent: "bg-slate-100 text-slate-800",
    external: true
  }
];

export default function ToolkitPage() {
  return (
    <main className="site-theme-page min-h-screen bg-[#eef4f8] text-slate-950 lg:h-screen lg:overflow-hidden">
      <MarketingHeader />
      <section className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-24 md:px-8 md:py-28 lg:h-full">
        <div className="absolute inset-x-0 top-0 h-44 bg-slate-950" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-blue-950/10 md:p-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
          <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(59,130,246,0.12),transparent_38%),radial-gradient(circle_at_86%_18%,rgba(20,184,166,0.16),transparent_30%)]" />
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-slate-950 p-6 text-white md:p-7">
            <img src="/media/generated/toolkit-background.png" alt="" className="absolute inset-0 h-full w-full object-cover object-[58%_center] opacity-70" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.96),rgba(15,23,42,0.82)_48%,rgba(15,23,42,0.54))]" />
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-200">
                <LibraryBig size={17} />
                Songleader Toolkit
              </p>
              <h1 className="mt-5 max-w-xl text-5xl font-black leading-[0.92] tracking-tight md:text-6xl">{toolkitTitle}</h1>
              <p className="mt-5 max-w-lg text-base font-semibold leading-7 text-white/72">{toolkitSubtitle}</p>
            </div>
            <Link href="/lineup/index.html" className="relative z-10 mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-blue-50">
              Open Lineup
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="relative grid gap-3 sm:grid-cols-2">
            {toolkitCards.map((item) => {
              const Icon = item.icon;
              const card = (
                <article id={item.title === "Curated Playlist" ? "playlist" : undefined} className="group flex min-h-[12rem] flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-950/10">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl ${item.accent}`}>
                    <Icon size={22} />
                  </span>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{item.title}</h2>
                    <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{item.text}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-blue-700">
                      Open
                      <ArrowRight size={17} />
                    </span>
                  </div>
                </article>
              );
              return item.external ? (
                <a key={item.title} href={item.href} target="_blank" rel="noreferrer" className="block text-inherit no-underline">
                  {card}
                </a>
              ) : (
                <Link key={item.title} href={item.href} className="block text-inherit no-underline">
                  {card}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
