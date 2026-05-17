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
import type { CSSProperties } from "react";
import { AuthButton } from "@/components/AuthButton";
import { ContactDialog } from "@/components/ContactDialog";
import { HomeAboutSection } from "@/components/HomeAboutSection";
import { HomeScrollEffects } from "@/components/HomeScrollEffects";
import { HomeThemeToggle } from "@/components/HomeThemeToggle";
import type { AuthMode } from "@/components/AuthButton";

const focusAreas = [
  {
    icon: Music2,
    title: "Music",
    text: "Song choices, transitions, Hebrew and English moments, and the small decisions that make people sing."
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
  "Community building",
  "Hebrew + English flow",
  "Service structure",
  "Games and activities"
];

const trainingCards = ["Camps", "Youth groups", "Schools", "Services", "Retreats", "Staff training"];

function getInitialAuthMode(value?: string | string[]): AuthMode {
  const account = Array.isArray(value) ? value[0] : value;
  if (account === "sign-up" || account === "sign-in" || account === "recover" || account === "signed-in") return account;
  return "closed";
}

type HomePageProps = {
  searchParams?: Promise<{ account?: string | string[] }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const initialAuthMode = getInitialAuthMode(params?.account);

  return (
    <main className="modern-home min-h-screen bg-[#eef4f8] text-slate-950">
      <HomeScrollEffects />
      <section className="hero-section relative min-h-[92vh] overflow-hidden bg-slate-950 text-white">
        <img
          src="/media/generated/hero-songleader.png"
          alt=""
          className="hero-art absolute inset-0 h-full w-full object-cover opacity-72"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/35 to-slate-950/88" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.20),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.25),transparent_30%)]" />

        <header className="site-header relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-5" style={{ background: "rgba(15, 23, 42, 0.84)" }}>
          <a href="/" className="site-brand flex min-w-0 items-center gap-2.5 font-black tracking-tight" aria-label="Songleading.net home">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 backdrop-blur">
              <Music2 size={19} />
            </span>
            <span className="brand-text min-w-0 leading-tight">
              <span className="block truncate text-base">Songleading.net</span>
              <span className="block whitespace-nowrap text-[10px] font-black uppercase tracking-[0.14em] text-white/62">by Barak Malichi</span>
            </span>
          </a>
          <nav className="site-icon-nav hidden items-center gap-1.5 md:flex" aria-label="Homepage sections">
            <a className="top-nav-link" href="#resources" aria-label="Resources" title="Resources">
              <BookOpenText size={17} />
              <span>Resources</span>
            </a>
            <a className="top-nav-link" href="#training" aria-label="Training" title="Training">
              <GraduationCap size={17} />
              <span>Training</span>
            </a>
            <a className="top-nav-link" href="#tools" aria-label="Tools" title="Tools">
              <Wrench size={17} />
              <span>Tools</span>
            </a>
            <a className="top-nav-link" href="#community" aria-label="Community" title="Community">
              <Users size={17} />
              <span>Community</span>
            </a>
          </nav>
          <div className="site-actions flex shrink-0 items-center gap-1.5">
            <HomeThemeToggle />
            <a
              href="/lineup/index.html"
              className="top-symbol-button"
              aria-label="Start planning"
              title="Start planning"
            >
              <Rows3 size={18} />
            </a>
            <AuthButton initialMode={initialAuthMode} />
          </div>
        </header>

        <div className="hero-content relative z-10 mx-auto flex min-h-[74vh] w-full max-w-7xl items-center px-5 pb-16 pt-8 md:px-8">
          <div className="hero-copy hero-copy-modern">
            <h1 className="hero-heading max-w-5xl text-5xl font-black leading-[0.94] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              The home of modern <span className="songleading-shine" aria-label="SONGLEADING">
                {"SONGLEADING".split("").map((letter, index) => (
                  <span
                    key={`${letter}-${index}`}
                    aria-hidden="true"
                    className="songleading-letter"
                    data-letter={letter}
                    style={{ "--letter-index": index } as CSSProperties}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            </h1>
            <p className="mt-6 max-w-3xl text-2xl font-black text-white sm:text-3xl">Plan smarter. Lead better. Make them sing.</p>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/78">
              Plan, teach, gather ideas, and go on stage more prepared.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/lineup/index.html"
                className="hero-primary-action inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
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

      <section id="resources" data-build-section className="focus-resources-section build-section reveal-arc mx-auto max-w-7xl px-5 md:px-8">
        <div className="resources-layout grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
          <div className="resources-visual-card overflow-hidden rounded-3xl border border-white/45 bg-slate-950 shadow-2xl shadow-blue-950/12">
            <img src="/media/generated/songleader-practice-resources.png" alt="" className="dynamic-image h-full min-h-[360px] w-full object-cover object-[50%_54%] opacity-95" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/82 via-slate-950/12 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200">Ready moments</p>
              <h2 className="mt-2 max-w-sm text-4xl font-black leading-tight tracking-tight">A resource desk before you lead.</h2>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-black">
                {["Plan", "Build", "Sing"].map((item) => (
                  <span key={item} className="rounded-full border border-white/18 bg-white/12 px-3 py-2 backdrop-blur">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="resources-block">
            <div>
              <p className="motion-title text-sm font-black uppercase tracking-[0.24em] text-blue-600">Resources</p>
              <h2 className="motion-title mt-3 text-4xl font-black tracking-tight md:text-6xl">Useful ideas, ready to lead.</h2>
            </div>
            <p className="motion-copy mt-4 max-w-xl text-base font-semibold leading-7 text-slate-600">
              Fast prompts for planning, teaching, Opening, and keeping the energy clear.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {resourceCards.map((item, index) => (
                <article key={item} className="motion-copy resource-card group rounded-2xl border border-slate-200/80 bg-white/78 backdrop-blur p-5 transition hover:-translate-y-0.5 hover:bg-white" style={{ "--card-index": index } as CSSProperties}>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="motion-title text-xl font-black">{item}</h3>
                    <BookOpenText size={20} className="text-blue-600 transition group-hover:translate-x-0.5" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="focus-grid mt-6 grid gap-3 lg:grid-cols-3">
          {focusAreas.map((area, index) => {
            const Icon = area.icon;
            return (
              <article key={area.title} className="focus-card rounded-2xl border border-slate-200/80 bg-white/82 backdrop-blur p-5 shadow-sm" style={{ "--card-index": index } as CSSProperties}>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white">
                  <Icon size={20} />
                </div>
                <h2 className="motion-title mt-4 text-2xl font-black">{area.title}</h2>
                <p className="motion-copy mt-2 text-sm font-semibold leading-6 text-slate-600">{area.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="training" data-build-section className="story-section build-section reveal-split mx-auto grid max-w-7xl gap-10 px-5 py-12 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="story-image-frame overflow-hidden rounded-3xl border border-slate-200/80 bg-white/88 backdrop-blur shadow-sm">
            <img src="/media/generated/training-workshop.png" alt="" className="dynamic-image h-full min-h-[420px] w-full object-cover" />
        </div>
        <div className="story-copy">
          <p className="motion-title text-sm font-black uppercase tracking-[0.24em] text-blue-600">Training</p>
          <h2 className="motion-title mt-3 text-4xl font-black tracking-tight md:text-6xl">Master Songleading</h2>
          <p className="motion-copy mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-600">
            The work is musical, social, spiritual, and practical. This space is built for the real-life parts of leading:
            choosing the right song, teaching it clearly, and knowing what the room needs next.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {trainingCards.map((item) => (
              <span key={item} className="motion-copy training-pill rounded-full border border-slate-300/80 bg-white/82 backdrop-blur px-4 py-2 text-sm font-black text-slate-700">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="tools" data-build-section className="tools-section reveal-tools build-section mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="motion-title text-sm font-black uppercase tracking-[0.24em] text-blue-600">Tools</p>
          <h2 className="motion-title mt-3 text-4xl font-black tracking-tight md:text-6xl">Plan the moment before you lead it.</h2>
          <p className="motion-copy mt-5 text-lg font-semibold leading-8 text-slate-600">
            The Lineup app lives here as a working tool: song bank, show order, notes, capo, keys, exports, and connected lyric slides.
          </p>
          <a
            href="/lineup/index.html"
            className="motion-copy mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Start Planning
            <Rows3 size={18} />
          </a>
        </div>
        <div className="tools-preview overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-950 p-4 shadow-xl">
          <div className="tools-preview-inner rounded-2xl border border-white/10 bg-[#07111f] p-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="motion-title text-xs font-black uppercase tracking-[0.2em] text-blue-300">Lineup</p>
                <h3 className="motion-title mt-1 text-3xl font-black">Friday Night Set</h3>
              </div>
              <div className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-black">Export</div>
            </div>
            <div className="mt-6 grid gap-3">
              {[
                ["1", "Opening Song", "Capo 2", "C"],
                ["2", "Welcome moment", "", ""],
                ["3", "Hashkiveinu", "Capo 4", "E"]
              ].map(([number, title, capo, key]) => (
                <div key={title} className="motion-copy lineup-preview-row grid grid-cols-[34px_1fr_auto_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/8 px-4 py-3">
                  <span className="font-black text-blue-300">{number}</span>
                  <span className="motion-title font-black">{title}</span>
                  <span className="motion-copy text-sm font-bold text-white/65">{capo}</span>
                  <span className="motion-title text-xl font-black">{key}</span>
                </div>
              ))}
            </div>
            <div className="slide-preview-panel mt-5 rounded-2xl border border-blue-400/25 bg-blue-400/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="motion-title text-sm font-black text-blue-200">Slides preview</p>
                <span className="slide-preview-status rounded-full bg-emerald-300/16 px-3 py-1 text-xs font-black text-emerald-200">
                  3 ready
                </span>
              </div>
              <div className="slide-preview-stage mt-4 rounded-2xl border border-white/12 bg-[#020817] p-3 shadow-2xl shadow-blue-950/35">
                <div className="slide-preview-live slide-aspect rounded-xl border border-white/10 bg-[radial-gradient(circle_at_18%_20%,rgba(59,130,246,0.62),transparent_31%),radial-gradient(circle_at_82%_78%,rgba(20,184,166,0.34),transparent_34%),linear-gradient(135deg,#0b1020_0%,#172554_48%,#020617_100%)] p-5">
                  <div className="flex h-full flex-col justify-between">
                    <div className="slide-preview-kicker h-1.5 w-20 rounded-full bg-blue-200/80" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-100/80">Hashkiveinu</p>
                      <p className="mt-2 text-2xl font-black leading-tight text-white md:text-3xl">
                        Shelter us
                        <span className="block text-blue-100">beneath thy wings</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-[1fr_44px] gap-3">
                      <div className="rounded-full bg-white/20 p-1">
                        <div className="h-1.5 w-2/3 rounded-full bg-white/82" />
                      </div>
                      <div className="rounded-full bg-white/14" />
                    </div>
                  </div>
                </div>
                <div className="slide-preview-strip mt-3 grid grid-cols-3 gap-2">
                  {[
                    ["Opening", "Sing with us", "from-blue-500/80 to-cyan-300/70"],
                    ["Prayer", "Hashkiveinu", "from-indigo-400/80 to-blue-200/70"],
                    ["Finale", "Bring us home", "from-emerald-300/75 to-blue-300/70"]
                  ].map(([label, lyric, color]) => (
                    <div key={label} className="slide-preview-tile rounded-lg border border-white/10 bg-white/8 p-2">
                      <div className={`h-1 w-10 rounded-full bg-gradient-to-r ${color}`} />
                      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/52">{label}</p>
                      <p className="mt-1 text-sm font-black leading-tight text-white">{lyric}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="community" data-build-section className="community-section build-section reveal-orbit bg-[#111827] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="community-image-frame overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img src="/media/generated/community-circle.png" alt="" className="dynamic-image h-full min-h-[380px] w-full object-cover opacity-90" />
          </div>
          <div>
            <p className="motion-title text-sm font-black uppercase tracking-[0.24em] text-blue-300">Community</p>
            <h2 className="motion-title mt-3 text-4xl font-black tracking-tight md:text-6xl">Every voice is a part of something bigger.</h2>
            <p className="motion-copy mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/75">
              Songleading is about helping people hear themselves together. This is about togetherness: warm, useful,
              and built around real gatherings.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Belonging", "Ritual", "Joy"].map((item) => (
                <div key={item} className="motion-copy community-card rounded-2xl border border-white/12 bg-white/8 p-5">
                  <Users size={20} className="text-blue-300" />
                  <p className="motion-title mt-4 text-lg font-black">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-build-section className="final-cta build-section reveal-pop mx-auto max-w-7xl px-5 md:px-8">
        <div className="final-cta-panel overflow-hidden rounded-3xl border border-white/45 bg-slate-950 text-white shadow-2xl shadow-blue-950/18">
          <img src="/media/generated/community-circle.png" alt="" className="dynamic-image absolute inset-0 h-full w-full object-cover opacity-34" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(59,130,246,0.42),transparent_34%),linear-gradient(120deg,rgba(2,6,23,0.94)_0%,rgba(15,23,42,0.84)_48%,rgba(14,116,144,0.68)_100%)]" />
          <div className="relative grid min-h-[560px] gap-8 p-7 md:p-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="motion-title text-sm font-black uppercase tracking-[0.24em] text-blue-200">Start here</p>
              <h2 className="motion-title mt-3 max-w-2xl text-4xl font-black leading-[0.98] tracking-tight md:text-6xl">
                Build your next lineup with momentum.
              </h2>
              <p className="motion-copy mt-5 max-w-xl text-lg font-semibold leading-8 text-white/78">
                Open the app, shape the flow, keep slides connected, and walk in with a plan that feels alive.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/lineup/index.html"
                  className="motion-copy cta-primary-action inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  Start Planning
                  <CirclePlay size={18} />
                </a>
                <ContactDialog />
              </div>
            </div>

            <div className="final-lineup-card rounded-3xl border border-white/12 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">Next gathering</p>
                  <h3 className="mt-1 text-3xl font-black">Joyful Set</h3>
                </div>
                <span className="rounded-full bg-emerald-300/18 px-3 py-1 text-xs font-black text-emerald-100">Ready</span>
              </div>
              <div className="mt-6 grid gap-3">
                {[
                  ["1", "Opening", "3 min"],
                  ["2", "Teach + sing", "8 min"],
                  ["3", "Slides connected", "ready"]
                ].map(([number, title, meta]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black text-blue-200">{number}</span>
                      <span className="flex-1 font-black">{title}</span>
                      <span className="text-sm font-black text-white/58">{meta}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-black text-white/78">
                {["Songs", "Notes", "Slides"].map((item) => (
                  <span key={item} className="rounded-full border border-white/12 bg-white/10 px-3 py-2">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeAboutSection />

      <footer className="border-t border-slate-200/80 px-5 py-8 text-sm font-bold text-slate-500 md:px-8">
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
