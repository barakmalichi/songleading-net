import Link from "next/link";
import type React from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, MapPin, Music2, UsersRound } from "lucide-react";
import { PlacementIntakeForm } from "@/components/PlacementIntakeForm";
import { SiteHeader } from "@/components/SiteHeader";

type PlacementTrack = "camp" | "songleader";

const placementCopy: Record<PlacementTrack, {
  eyebrow: string;
  title: string;
  text: string;
  formIntro: string;
  siblingHref: string;
  siblingLabel: string;
  bullets: Array<{ icon: React.ReactNode; title: string; text: string }>;
}> = {
  songleader: {
    eyebrow: "Find a Placement",
    title: "Let the right camp or community know you are available.",
    text: "Share your timing, location, experience, instruments, and links in one focused place so matching starts with the right context.",
    formIntro: "For songleaders looking for summer work, weekends, services, one-off events, staff training, or community moments.",
    siblingHref: "/placements/hire-a-songleader",
    siblingLabel: "I need to hire a songleader",
    bullets: [
      { icon: <Music2 size={19} />, title: "Your availability", text: "Timing, travel range, and the kinds of rooms you can lead." },
      { icon: <MapPin size={19} />, title: "Your setting", text: "Camp, synagogue, school, retreat, Israel program, or community work." },
      { icon: <UsersRound size={19} />, title: "Your fit", text: "Experience, instruments, links, and any useful context." }
    ]
  },
  camp: {
    eyebrow: "Hire a Songleader",
    title: "Find a songleader for the room you are building.",
    text: "Share the setting, dates, location, and role so the placement note is immediately useful instead of becoming a back-and-forth guessing game.",
    formIntro: "For camps, synagogues, schools, retreats, and organizations looking for songleading support.",
    siblingHref: "/placements/find-a-placement",
    siblingLabel: "I am a songleader looking for placement",
    bullets: [
      { icon: <BriefcaseBusiness size={19} />, title: "The role", text: "Song sessions, services, weekends, staff training, or special programs." },
      { icon: <MapPin size={19} />, title: "The context", text: "Dates, location, audience, budget range, and setting." },
      { icon: <UsersRound size={19} />, title: "The match", text: "Enough detail for relevant follow-up without overcomplicating the first step." }
    ]
  }
};

export function PlacementPathPage({ track }: { track: PlacementTrack }) {
  const copy = placementCopy[track];

  return (
    <main className="site-theme-page min-h-screen bg-[#f4f8fb] text-slate-950">
      <SiteHeader />
      <section className="relative overflow-hidden px-5 pb-10 pt-28 md:px-8 md:pb-14 md:pt-36">
        <div className="absolute inset-x-0 top-0 h-48 bg-slate-950" />
        <div className="relative mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 shadow-2xl shadow-blue-950/10 md:p-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.12),transparent_42%),radial-gradient(circle_at_86%_18%,rgba(20,184,166,0.18),transparent_32%)]" />
          <div className="relative">
            <Link href="/placements" className="inline-flex items-center gap-2 text-sm font-black text-blue-700">
              <ArrowLeft size={17} />
              Placements overview
            </Link>
            <p className="mt-6 text-sm font-black uppercase tracking-[0.24em] text-blue-600">{copy.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.94] tracking-tight md:text-7xl">{copy.title}</h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-600">{copy.text}</p>
          </div>
          <aside className="relative rounded-3xl border border-slate-200 bg-slate-50/88 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Also here</p>
            <Link href={copy.siblingHref} className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-black text-slate-950 hover:border-blue-300">
              <span>{copy.siblingLabel}</span>
              <ArrowRight size={17} />
            </Link>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-16 md:px-8 lg:grid-cols-[0.72fr_1fr] lg:items-start">
        <aside className="placement-side-nav">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">This path asks for</p>
          <div className="mt-4 grid gap-3">
            {copy.bullets.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">{item.icon}</span>
                  <div>
                    <h2 className="font-black">{item.title}</h2>
                    <p className="mt-1 text-sm font-bold leading-6 text-slate-600">{item.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold leading-6 text-slate-600">{copy.formIntro}</p>
        </aside>
        <PlacementIntakeForm track={track} />
      </section>
    </main>
  );
}
