import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  ChevronRight,
  Music2,
  Rows3,
  Users,
  Wrench
} from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { AuthButton } from "@/components/AuthButton";
import { HomeContentBridge } from "@/components/HomeContentBridge";
import { HomeAboutSection } from "@/components/HomeAboutSection";
import { HomeScrollEffects } from "@/components/HomeScrollEffects";
import { HomeThemeToggle } from "@/components/HomeThemeToggle";
import { defaultHomepageContent } from "@/lib/homepageContent";

export const dynamic = "force-static";

function ShineWord({ word }: { word: string }) {
  return (
    <span className="songleading-shine" aria-label={word} data-text={word} data-home-shine="hero.shineWord">
      {word.split("").map((letter, index) => (
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
  );
}

function LineText({ text, field }: { text: string; field: string }) {
  return (
    <span data-home-lines={field}>
      {text.split("\n").map((line) => (
        <span key={line} className="block">{line}</span>
      ))}
    </span>
  );
}

function SiteHeader() {
  return (
    <header className="site-header z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-5" style={{ background: "rgba(15, 23, 42, 0.9)" }}>
      <a href="/" className="site-brand flex min-w-0 items-center gap-2.5 font-black tracking-tight" aria-label="Songleading.net home">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 backdrop-blur">
          <Music2 size={19} />
        </span>
        <span className="brand-text min-w-0 leading-tight">
          <span className="block truncate text-base">Songleading.net</span>
          <span className="block whitespace-nowrap text-[10px] font-black uppercase tracking-[0.14em] text-white/[0.62]">by Barak Malichi</span>
        </span>
      </a>
      <nav className="site-icon-nav hidden items-center gap-1.5 md:flex" aria-label="Homepage sections">
        <a className="top-nav-link" href="#resources" aria-label="Resources" title="Resources">
          <BookOpenText size={17} />
          <span>Resources</span>
        </a>
        <a className="top-nav-link" href="#training" aria-label="Training" title="Training">
          <BookOpenText size={17} />
          <span>Training</span>
        </a>
        <a className="top-nav-link" href="#tools" aria-label="Tools" title="Tools">
          <Wrench size={17} />
          <span>Tools</span>
        </a>
        <a className="top-nav-link" href="#about" aria-label="About Barak" title="About Barak">
          <Users size={17} />
          <span>About</span>
        </a>
      </nav>
      <div className="site-actions flex shrink-0 items-center gap-1.5">
        <HomeThemeToggle />
        <a
          href="/lineup/index.html"
          className="top-symbol-button lineup-app-nav-link"
          aria-label="Lineup App"
          title="Lineup App"
        >
          <img src="/lineup/icon.svg" alt="" className="lineup-app-mark" />
          <span>Lineup App</span>
        </a>
        <AuthButton />
      </div>
    </header>
  );
}

export default function HomePage() {
  const content = defaultHomepageContent;

  return (
    <main className="modern-home min-h-screen bg-[#eef4f8] text-slate-950">
      <HomeScrollEffects />
      <HomeContentBridge />
      <SiteHeader />
      <section className="hero-section relative min-h-[92vh] overflow-hidden bg-slate-950 text-white">
        <Image
          src={content.hero.image}
          alt=""
          fill
          priority
          sizes="100vw"
          data-home-image="hero.image"
          className="hero-art absolute inset-0 h-full w-full object-cover opacity-[0.72]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/35 to-slate-950/88" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.20),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.25),transparent_30%)]" />

        <div className="hero-content relative z-10 mx-auto flex min-h-[74vh] w-full max-w-7xl items-center px-5 pb-16 pt-8 md:px-8">
          <div className="hero-copy hero-copy-modern">
            <h1 className="hero-heading max-w-5xl text-5xl font-black leading-[0.94] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span data-home-text="hero.headlinePrefix">{content.hero.headlinePrefix}</span>{" "}
              <ShineWord word={content.hero.shineWord} />
            </h1>
            <p className="mt-6 max-w-3xl text-2xl font-black text-white sm:text-3xl" data-home-text="hero.subheadline">{content.hero.subheadline}</p>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/78" data-home-text="hero.text">
              {content.hero.text}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/lineup/index.html"
                className="hero-primary-action inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                <span data-home-text="hero.primaryLabel">{content.hero.primaryLabel}</span>
                <ArrowRight size={18} />
              </a>
              <a
                href="#resources"
                className="hero-secondary-action inline-flex items-center gap-2 rounded-xl border border-white/28 bg-slate-950/38 px-5 py-3 text-sm font-black text-white shadow-xl shadow-slate-950/15 backdrop-blur transition hover:-translate-y-0.5 hover:bg-slate-950/52"
              >
                <span data-home-text="hero.secondaryLabel">{content.hero.secondaryLabel}</span>
                <ChevronRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="resources" data-build-section className="focus-resources-section build-section reveal-arc mx-auto max-w-7xl px-5 md:px-8">
        <div className="resources-layout grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
          <div className="resources-visual-card overflow-hidden rounded-3xl border border-white/45 bg-slate-950 shadow-2xl shadow-blue-950/12">
            <Image
              src={content.resources.image}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 52vw"
              data-home-image="resources.image"
              className="dynamic-image object-cover object-[50%_54%] opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/82 via-slate-950/12 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200" data-home-text="resources.imageEyebrow">{content.resources.imageEyebrow}</p>
              <h2 className="mt-2 max-w-sm text-4xl font-black leading-tight tracking-tight" data-home-text="resources.imageTitle">{content.resources.imageTitle}</h2>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-black">
                {content.resources.badges.map((item, index) => (
                  <span key={`${item}-${index}`} data-home-resource-badge={index} className="rounded-full border border-white/18 bg-white/12 px-3 py-2 backdrop-blur">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="resources-block">
            <div>
              <p className="motion-title text-sm font-black uppercase tracking-[0.24em] text-blue-600" data-home-text="resources.eyebrow">{content.resources.eyebrow}</p>
              <h2 className="motion-title mt-3 text-4xl font-black tracking-tight md:text-6xl" data-home-text="resources.title">{content.resources.title}</h2>
            </div>
            <p className="motion-copy mt-4 max-w-xl text-base font-semibold leading-7 text-slate-600" data-home-text="resources.text">
              {content.resources.text}
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {content.resources.cards.map((item, index) => (
                <article key={item.title} data-home-resource-card={index} className="motion-copy resource-card rounded-2xl border border-slate-200/80 bg-white/78 backdrop-blur p-5" style={{ "--card-index": index } as CSSProperties}>
                  <div className="flex items-start gap-3">
                    <BookOpenText size={20} className="mt-1 shrink-0 text-blue-600" />
                    <div>
                      <h3 className="motion-title text-lg font-black" data-home-card-field="title">{item.title}</h3>
                      <p className="mt-1 text-sm font-bold leading-5 text-slate-600" data-home-card-field="text">{item.text}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="training" data-build-section className="story-section build-section reveal-split mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="section-narrative section-narrative-light story-copy">
          <p className="motion-title text-sm font-black uppercase tracking-[0.24em] text-blue-600" data-home-text="training.eyebrow">{content.training.eyebrow}</p>
          <h2 className="motion-title mt-3 text-4xl font-black tracking-tight md:text-6xl" data-home-text="training.title">{content.training.title}</h2>
          <div className="section-inline-flow mt-6">
            <div className="section-inline-image story-image-frame">
              <Image
                src={content.training.image}
                alt=""
                fill
                sizes="(max-width: 760px) 100vw, 52vw"
                data-home-image="training.image"
                className="dynamic-image object-cover"
              />
            </div>
            <p className="motion-copy text-lg font-semibold leading-8 text-slate-600" data-home-text="training.text">
              {content.training.text}
            </p>
            <p className="motion-copy mt-4 text-lg font-semibold leading-8 text-slate-600" data-home-text="training.secondText">
              {content.training.secondText}
            </p>
          </div>
          <div className="training-pill-row mt-7 flex flex-wrap gap-2">
            {content.training.pills.map((item, index) => (
              <span key={`${item}-${index}`} data-home-training-pill={index} className="motion-copy training-pill rounded-full border border-slate-300/80 bg-white/82 backdrop-blur px-4 py-2 text-sm font-black text-slate-700">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="tools" data-build-section className="tools-section reveal-tools build-section mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="motion-title text-sm font-black uppercase tracking-[0.24em] text-blue-600" data-home-text="tools.eyebrow">{content.tools.eyebrow}</p>
          <h2 className="motion-title mt-3 text-4xl font-black tracking-tight md:text-6xl" data-home-text="tools.title">{content.tools.title}</h2>
          <p className="motion-copy mt-5 text-lg font-semibold leading-8 text-slate-600" data-home-text="tools.text">
            {content.tools.text}
          </p>
          <a
            href="/lineup/index.html"
            className="motion-copy mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <span data-home-text="tools.buttonLabel">{content.tools.buttonLabel}</span>
            <Rows3 size={18} />
          </a>
        </div>
        <div className="tools-preview overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-950 p-4 shadow-xl">
          <div className="tools-preview-inner rounded-2xl border border-white/10 bg-[#07111f] p-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="motion-title text-xs font-black uppercase tracking-[0.2em] text-blue-300" data-home-text="tools.previewEyebrow">{content.tools.previewEyebrow}</p>
                <h3 className="motion-title mt-1 text-3xl font-black" data-home-text="tools.previewTitle">{content.tools.previewTitle}</h3>
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
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="section-narrative section-narrative-dark">
            <p className="motion-title text-sm font-black uppercase tracking-[0.24em] text-blue-300" data-home-text="community.eyebrow">{content.community.eyebrow}</p>
            <h2 className="motion-title mt-3 text-4xl font-black tracking-tight md:text-6xl">
              <LineText text={content.community.title} field="community.title" />
            </h2>
            <div className="section-inline-flow mt-6">
              <div className="section-inline-image community-image-frame">
                <Image
                  src={content.community.image}
                  alt=""
                  fill
                  sizes="(max-width: 760px) 100vw, 52vw"
                  data-home-image="community.image"
                  className="dynamic-image object-cover opacity-90"
                />
              </div>
              <p className="motion-copy text-lg font-semibold leading-8 text-white/75" data-home-text="community.text">
                {content.community.text}
              </p>
              <p className="motion-copy mt-4 text-lg font-semibold leading-8 text-white/75" data-home-text="community.secondText">
                {content.community.secondText}
              </p>
            </div>
          </div>
        </div>
      </section>

      <HomeAboutSection />

      <footer className="border-t border-slate-200/80 px-5 py-8 text-sm font-bold text-slate-500 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span data-home-text="footer.text">{content.footer.text}</span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={16} />
            <span data-home-text="footer.note">{content.footer.note}</span>
          </span>
        </div>
      </footer>
    </main>
  );
}
