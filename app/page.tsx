import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  ChevronRight,
  CirclePlay,
  GraduationCap,
  Music2,
  Rows3,
  Users,
  Wrench
} from "lucide-react";
import { AuthButton } from "@/components/AuthButton";
import { ContactDialog } from "@/components/ContactDialog";

const focusAreas = [
  {
    icon: Music2,
    title: "Music",
    text: "Song choices, transitions, Hebrew and English moments, and the small decisions that make a room sing."
  },
  {
    icon: GraduationCap,
    title: "Training",
    text: "Workshops and practical training for songleaders, staff, teachers, and camp teams."
  },
  {
    icon: Wrench,
    title: "Tools",
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
      <section className="hero-section relative min-h-[92vh] overflow-hidden bg-slate-950 text-white">
        <img
          src="/media/generated/hero-songleader.png"
          alt=""
          className="hero-art absolute inset-0 h-full w-full object-cover opacity-72"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/35 to-slate-950/88" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.20),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.25),transparent_30%)]" />

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-8">
          <a href="/" className="flex items-center gap-3 font-black tracking-tight">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-white/10 backdrop-blur">
              <Music2 size={22} />
            </span>
            <span className="leading-tight">
              <span className="block text-lg">Songleading.net</span>
              <span className="block text-[11px] font-black uppercase tracking-[0.16em] text-white/62">by Barak Malichi</span>
            </span>
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
            <AuthButton />
          </div>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[74vh] w-full max-w-7xl items-center px-5 pb-16 pt-8 md:px-8">
          <div className="hero-copy">
            <h1 className="hero-heading max-w-5xl text-5xl font-black leading-[0.94] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              The home of modern <span>songleading</span>
            </h1>
            <p className="mt-6 max-w-2xl text-2xl font-black text-white sm:text-3xl">Music. Energy. Community.</p>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/78">
              Plan, teach, gather ideas, and go on stage more prepared.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/lineup/index.html"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Start Planning
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
        </div>
      </section>

      <section className="scroll-reveal mx-auto grid max-w-7xl gap-4 px-5 py-12 md:px-8 lg:grid-cols-3">
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

      <section id="training" className="scroll-reveal mx-auto grid max-w-7xl gap-10 px-5 py-12 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <img src="/media/generated/training-workshop.png" alt="" className="h-full min-h-[420px] w-full object-cover" />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Training</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Master Songleading</h2>
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

      <section id="resources" className="scroll-reveal bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Resources</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Useful ideas.</h2>
            </div>
            <p className="max-w-lg text-base font-semibold leading-7 text-slate-600">Things you can actually use.</p>
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

      <section id="tools" className="scroll-reveal mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Tools</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Plan the moment before you lead it.</h2>
          <p className="mt-5 text-lg font-semibold leading-8 text-slate-600">
            The Lineup app lives here as a working tool: song bank, show order, notes, capo, keys, exports, and connected lyric slides.
          </p>
          <a
            href="/lineup/index.html"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Start Planning
            <Rows3 size={18} />
          </a>
        </div>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-4 shadow-xl">
          <div className="rounded-2xl border border-white/10 bg-[#07111f] p-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">Lineup</p>
                <h3 className="mt-1 text-3xl font-black">Friday Night Set</h3>
              </div>
              <div className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-black">Export</div>
            </div>
            <div className="mt-6 grid gap-3">
              {[
                ["1", "Opening Song", "Capo 2", "C"],
                ["2", "Welcome moment", "", ""],
                ["3", "Hashkiveinu", "Capo 4", "E"]
              ].map(([number, title, capo, key]) => (
                <div key={title} className="grid grid-cols-[34px_1fr_auto_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/8 px-4 py-3">
                  <span className="font-black text-blue-300">{number}</span>
                  <span className="font-black">{title}</span>
                  <span className="text-sm font-bold text-white/65">{capo}</span>
                  <span className="text-xl font-black">{key}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-blue-400/25 bg-blue-400/10 p-4">
              <p className="text-sm font-black text-blue-200">Slides preview</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {["Lyrics", "Design", "Present"].map((item) => (
                  <div key={item} className="rounded-lg bg-white px-3 py-5 text-center text-sm font-black text-slate-950">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="community" className="scroll-reveal bg-[#111827] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img src="/media/generated/community-circle.png" alt="" className="h-full min-h-[380px] w-full object-cover opacity-90" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-300">Community</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Every voice can become part of something bigger.</h2>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/75">
              Songleading is about helping people hear themselves together. This space should feel the same: warm, useful,
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

      <section className="scroll-reveal mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Start here</p>
            <h2 className="mt-2 text-3xl font-black md:text-5xl">Build your next lineup.</h2>
            <p className="mt-3 max-w-2xl font-semibold leading-7 text-slate-600">
              Open the app, plan the flow, and keep the slides connected to the songs you lead.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 md:mt-0">
            <a
              href="/lineup/index.html"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
            >
              Start Planning
              <CirclePlay size={18} />
            </a>
            <ContactDialog />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-5 py-8 text-sm font-bold text-slate-500 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>Songleading.net · by Barak Malichi</span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={16} />
            Tools and resources for the next gathering.
          </span>
        </div>
      </footer>
    </main>
  );
}
