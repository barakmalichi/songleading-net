import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  ChevronRight,
  CirclePlay,
  GraduationCap,
  Music2,
  Rows3,
  Sparkles,
  Users,
  Wrench
} from "lucide-react";
import { AuthButton } from "@/components/AuthButton";

const focusAreas = [
  {
    icon: Music2,
    title: "Lead the music",
    text: "Song choices, transitions, Hebrew and English moments, and the small decisions that make a room sing."
  },
  {
    icon: GraduationCap,
    title: "Teach the craft",
    text: "Workshops and practical training for songleaders, staff, teachers, and camp teams."
  },
  {
    icon: Wrench,
    title: "Use better tools",
    text: "Plan lineups, prepare stage-readable exports, connect lyric slides, and keep reusable song libraries."
  }
];

const resourceCards = [
  "Setlist planning",
  "Song ideas",
  "Opening moments",
  "Hebrew + English flow",
  "Service structure",
  "Games and energy"
];

const trainingCards = ["Camps", "Youth groups", "Schools", "Services", "Retreats", "Staff training"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f2e7] text-slate-950">
      <section className="relative min-h-[92vh] overflow-hidden bg-slate-950 text-white">
        <img
          src="/media/generated/hero-songleader.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-72"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/35 to-slate-950/88" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.20),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.25),transparent_30%)]" />

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-8">
          <a href="/" className="flex items-center gap-3 font-black tracking-tight">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-white/10 backdrop-blur">
              <Music2 size={22} />
            </span>
            <span className="text-lg">Songleading</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-black text-white/78 lg:flex">
            <a className="transition hover:text-white" href="#training">
              Training
            </a>
            <a className="transition hover:text-white" href="#resources">
              Resources
            </a>
            <a className="transition hover:text-white" href="#tools">
              Tools
            </a>
            <a className="transition hover:text-white" href="#community">
              Community
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="/lineup/index.html"
              className="hidden rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur transition hover:bg-white/20 sm:inline-flex"
            >
              Open tools
            </a>
            <div className="[&_button]:border-white/20 [&_button]:bg-white/10 [&_button]:text-white [&_button]:backdrop-blur [&_button:hover]:border-white/40 [&_button:hover]:text-white">
              <AuthButton />
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[74vh] w-full max-w-7xl content-center gap-10 px-5 pb-16 pt-8 md:px-8 lg:grid-cols-[1.1fr_0.8fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.26em] text-blue-200">The modern home of songleading</p>
            <h1 className="mt-5 max-w-4xl text-6xl font-black leading-[0.9] tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
              SONGLEADING
            </h1>
            <p className="mt-6 max-w-2xl text-2xl font-black text-white sm:text-3xl">Music. Energy. Community.</p>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/78">
              A simple place for songleaders to plan, teach, gather ideas, and walk into the room more prepared.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/lineup/index.html"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Open lineup app
                <ArrowRight size={18} />
              </a>
              <a
                href="#resources"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/18"
              >
                Browse ideas
                <ChevronRight size={18} />
              </a>
            </div>
          </div>

          <aside className="self-end rounded-2xl border border-white/20 bg-white/12 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-md">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">Field Notes</p>
            <div className="mt-4 grid gap-3">
              {["Read the room", "Build momentum", "Create belonging"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-xl border border-white/14 bg-slate-950/24 px-4 py-3">
                  <span className="font-black">{item}</span>
                  <Sparkles size={18} className="text-blue-200" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-12 md:px-8 lg:grid-cols-3">
        {focusAreas.map((area) => {
          const Icon = area.icon;
          return (
            <article key={area.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white">
                <Icon size={21} />
              </div>
              <h2 className="mt-5 text-2xl font-black">{area.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{area.text}</p>
            </article>
          );
        })}
      </section>

      <section id="training" className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <img src="/media/generated/training-workshop.png" alt="" className="h-full min-h-[420px] w-full object-cover" />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Training</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Songleading is a craft.</h2>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-600">
            The work is musical, social, spiritual, and practical. This space is built for the real-life parts of leading:
            choosing the right song, teaching it clearly, and knowing what the room needs next.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {trainingCards.map((item) => (
              <span key={item} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="resources" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Resources</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Useful ideas, without the clutter.</h2>
            </div>
            <p className="max-w-lg text-base font-semibold leading-7 text-slate-600">
              A place for practical songleading material: not a giant feed, just things you can actually use.
            </p>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resourceCards.map((item) => (
              <article key={item} className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-blue-50">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-black">{item}</h3>
                  <BookOpenText size={20} className="text-blue-600 transition group-hover:translate-x-0.5" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tools" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Tools</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Plan the moment before you lead it.</h2>
          <p className="mt-5 text-lg font-semibold leading-8 text-slate-600">
            The lineup app lives here as a working tool: song bank, show order, notes, capo, keys, exports, and connected lyric slides.
          </p>
          <a
            href="/lineup/index.html"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Open Lineup + Slides
            <Rows3 size={18} />
          </a>
        </div>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-xl">
          <img src="/media/generated/ai-tools-dashboard.png" alt="" className="w-full object-cover opacity-95" />
        </div>
      </section>

      <section id="community" className="bg-[#111827] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img src="/media/generated/community-circle.png" alt="" className="h-full min-h-[380px] w-full object-cover opacity-90" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-300">Community</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">A room is never just a room.</h2>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/75">
              Songleading is about helping people hear themselves together. The site should feel the same: warm, useful,
              and built around real gatherings.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Belonging", "Ritual", "Joy"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/12 bg-white/8 p-5">
                  <Users size={20} className="text-blue-300" />
                  <p className="mt-4 text-lg font-black">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Start here</p>
            <h2 className="mt-2 text-3xl font-black md:text-5xl">Build your next lineup.</h2>
            <p className="mt-3 max-w-2xl font-semibold leading-7 text-slate-600">
              Open the app, plan the flow, and keep the slides connected to the songs you actually lead.
            </p>
          </div>
          <a
            href="/lineup/index.html"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 md:mt-0"
          >
            Open the app
            <CirclePlay size={18} />
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-5 py-8 text-sm font-bold text-slate-500 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>Songleading</span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={16} />
            Tools and resources for the next gathering.
          </span>
        </div>
      </footer>
    </main>
  );
}
