import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  FileText,
  Music2,
  Rows3,
} from "lucide-react";
import { AuthButton } from "@/components/AuthButton";

const tools = [
  {
    title: "Lineup app",
    description: "Build shows, add notes, set capo and keys, then export a stage sheet.",
    href: "/lineup/index.html",
    icon: Rows3,
  },
  {
    title: "Slides library",
    description: "Open saved lyric slide songs and keep presentation work close to the lineup.",
    href: "/slides/library",
    icon: FileText,
  },
  {
    title: "Songs",
    description: "Keep song material, keys, tags, credits, and slide links in one place.",
    href: "/songs",
    icon: Music2,
  },
  {
    title: "Sessions",
    description: "Plan rehearsal or service sets without turning the home page into a dashboard.",
    href: "/sessions",
    icon: CalendarDays,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 sm:py-7">
        <header className="flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3" aria-label="Songleading home">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-blue-600 shadow-sm">
              <BookOpenText size={22} strokeWidth={2.4} />
            </span>
            <span className="text-lg font-black tracking-tight">Songleading</span>
          </a>

          <nav className="flex items-center gap-2 text-sm font-black">
            <a
              href="/lineup/index.html"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
            >
              App
            </a>
            <AuthButton />
          </nav>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 md:grid-cols-[0.85fr_1.15fr] lg:py-16">
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-blue-600">
              Songleading
            </p>
            <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl">
              Simple tools for preparing songs.
            </h1>
            <p className="mt-6 max-w-lg text-lg font-semibold leading-8 text-slate-600">
              A quiet home for lineups, lyric slides, song notes, and the small details that make a
              show easier to lead.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/lineup/index.html"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
              >
                Open lineup app
                <ArrowRight size={17} />
              </a>
              <a
                href="/slides/library"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
              >
                Slides library
              </a>
            </div>
          </div>

          <div className="grid gap-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <a
                  key={tool.title}
                  href={tool.href}
                  className="group grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={22} strokeWidth={2.4} />
                  </span>
                  <span>
                    <span className="block text-lg font-black text-slate-950">{tool.title}</span>
                    <span className="mt-1 block text-sm font-semibold leading-6 text-slate-500">
                      {tool.description}
                    </span>
                  </span>
                  <ArrowRight
                    size={20}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                  />
                </a>
              );
            })}
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Lineups stay one click away from the home page.</span>
          <span>Sign in quietly when you want the same work on another device.</span>
        </footer>
      </div>
    </main>
  );
}
