import { ArrowRight, BriefcaseBusiness, Music2, UsersRound } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

const placementPaths = [
  {
    eyebrow: "For songleaders",
    title: "Find a Placement",
    text: "Share availability, location, experience, instruments, and links.",
    href: "/placements/find-a-placement",
    icon: Music2
  },
  {
    eyebrow: "For camps and communities",
    title: "Hire a Songleader",
    text: "Share the role, dates, setting, and budget context.",
    href: "/placements/hire-a-songleader",
    icon: BriefcaseBusiness
  }
];

export default function PlacementsPage() {
  return (
    <main className="min-h-screen bg-[#f4f8fb] text-slate-950 lg:h-screen lg:overflow-hidden">
      <SiteHeader />
      <section className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-24 md:px-8 md:py-28 lg:h-full">
        <div className="absolute inset-x-0 top-0 h-44 bg-slate-950" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-blue-950/10 md:p-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-stretch">
          <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(59,130,246,0.12),transparent_42%),radial-gradient(circle_at_88%_16%,rgba(20,184,166,0.16),transparent_32%)]" />
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-slate-950 p-6 text-white md:p-7">
            <img src="/media/generated/placements-background.png" alt="" className="absolute inset-0 h-full w-full object-cover object-[58%_center] opacity-70" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.96),rgba(15,23,42,0.82)_48%,rgba(15,23,42,0.54))]" />
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-200">
                <UsersRound size={17} />
                Songleading placements
              </p>
              <h1 className="mt-5 max-w-xl text-5xl font-black leading-[0.92] tracking-tight md:text-6xl">Start with the path that fits you.</h1>
              <p className="mt-5 max-w-lg text-base font-semibold leading-7 text-white/72">
                One page, two clear doors: looking for a placement, or looking for a songleader.
              </p>
            </div>
            <p className="relative z-10 mt-8 rounded-2xl border border-white/12 bg-white/8 p-4 text-sm font-bold leading-6 text-white/72 backdrop-blur-sm">
              Send one focused intake note. Relevant follow-up happens directly.
            </p>
          </div>

          <div className="relative grid gap-3 md:grid-cols-2">
            {placementPaths.map((path) => {
              const Icon = path.icon;
              return (
                <Link key={path.href} href={path.href} className="placement-choice-card group flex min-h-[22rem] flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-950/10">
                  <div>
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                      <Icon size={24} />
                    </span>
                    <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-blue-600">{path.eyebrow}</p>
                    <h2 className="mt-3 text-4xl font-black tracking-tight">{path.title}</h2>
                    <p className="mt-4 text-base font-bold leading-7 text-slate-600">{path.text}</p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-blue-700">
                    Open this path
                    <ArrowRight size={17} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
