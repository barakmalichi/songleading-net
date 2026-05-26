import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  MessageCircle,
  PlayCircle,
  Sparkles,
  UsersRound,
  Video
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { readCommunityContent } from "@/lib/cloudServer";
import { normalizeCommunityContent } from "@/lib/communityContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Songleading Community | Songleading.net",
  description: "A gathering place for songleaders, educators, camps, and communities to connect through events, profiles, and shared songleading practice."
};

export default async function CommunityPage() {
  const savedContent = await readCommunityContent().catch(() => null);
  const communityContent = normalizeCommunityContent(savedContent && typeof savedContent === "object" ? savedContent : {});
  const whatsappIsOpen = communityContent.whatsapp.status === "open" && communityContent.whatsapp.href;

  return (
    <main className="site-theme-page min-h-screen bg-[#eef4f8] text-slate-950">
      <SiteHeader />
      <section className="relative overflow-hidden px-5 pb-10 pt-28 md:px-8 md:pb-14 md:pt-36">
        <div className="absolute inset-x-0 top-0 h-52 bg-slate-950" />
        <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-blue-950/10 lg:grid-cols-[1.04fr_0.96fr]">
          <div className="relative p-7 md:p-10">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.12),transparent_40%),radial-gradient(circle_at_86%_18%,rgba(20,184,166,0.16),transparent_30%)]" />
            <div className="relative">
              <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-blue-600">
                <UsersRound size={18} />
                Songleading.net
              </p>
              <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.94] tracking-tight md:text-7xl">Songleading Community</h1>
              <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-600">
                A gathering place for songleaders, educators, camps, and communities to find each other, share what is working, and stay connected beyond one event.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {whatsappIsOpen ? (
                  <a href={communityContent.whatsapp.href} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700">
                    Join WhatsApp
                    <MessageCircle size={18} />
                  </a>
                ) : (
                  <button type="button" disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-950/88 px-5 py-3 text-sm font-black text-white opacity-72">
                    {communityContent.whatsapp.label}
                    <MessageCircle size={18} />
                  </button>
                )}
                <a href="#events" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:border-blue-400">
                  See Events
                  <CalendarDays size={18} />
                </a>
              </div>
            </div>
          </div>
          <div className="relative min-h-[22rem] bg-slate-950">
            <Image
              src="/media/generated/community-circle.png"
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover opacity-88"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/82 via-slate-950/16 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">Built around real communities</p>
              <p className="mt-2 max-w-sm text-2xl font-black leading-tight">Songs, people, events, and links that help leaders stay in motion.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="events" className="mx-auto grid max-w-7xl gap-5 px-5 py-8 md:px-8 lg:grid-cols-[0.42fr_1fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Events</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Small circles for useful exchange.</h2>
          <p className="mt-4 text-base font-semibold leading-7 text-slate-600">
            Manual event cards keep this simple for now: announce the next circle, listening session, or workshop when it is ready.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {communityContent.events.map((event) => (
            <article key={event.title} className="flex min-h-[17rem] flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                  <CalendarDays size={21} />
                </span>
                <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-blue-600">{event.dateLabel}</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight">{event.title}</h3>
                <p className="mt-2 text-sm font-black text-slate-500">{event.format}</p>
                <p className="mt-4 text-sm font-bold leading-6 text-slate-600">{event.description}</p>
              </div>
              {event.linkHref && event.linkLabel ? (
                <a href={event.linkHref} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-blue-700">
                  {event.linkLabel}
                  <ArrowRight size={17} />
                </a>
              ) : (
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-slate-400">
                  Details coming soon
                  <Sparkles size={17} />
                </span>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-10 md:px-8 lg:grid-cols-[0.42fr_1fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Featured leaders</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Real links only.</h2>
          <p className="mt-4 text-base font-semibold leading-7 text-slate-600">
            This space is for curated songleader profiles, videos, and social links once they are ready to publish.
          </p>
        </div>
        {communityContent.profiles.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {communityContent.profiles.map((profile) => (
              <article key={profile.name} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {profile.image ? (
                  <div className="relative h-48 bg-slate-950">
                    <Image src={profile.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  </div>
                ) : null}
                <div className="p-5">
                  <h3 className="text-2xl font-black tracking-tight">{profile.name}</h3>
                  <p className="mt-1 text-sm font-black text-blue-700">{profile.role}</p>
                  <p className="mt-1 text-sm font-bold text-slate-500">{profile.location}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {profile.instagramUrl ? (
                      <a href={profile.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-800 hover:border-blue-300">
                        Instagram
                        <ExternalLink size={16} />
                      </a>
                    ) : null}
                    {profile.videoUrl ? (
                      <a href={profile.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-blue-700">
                        Video
                        <PlayCircle size={16} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-[18rem] place-items-center rounded-3xl border border-dashed border-slate-300 bg-white/76 p-8 text-center">
            <div>
              <Video className="mx-auto text-blue-600" size={38} />
              <h3 className="mt-4 text-3xl font-black tracking-tight">Curated profiles coming soon.</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm font-bold leading-6 text-slate-600">
                Featured leaders will appear here once their real Instagram, video, or profile links are ready to share.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-4 md:px-8">
        <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-blue-950/12 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">Keep building</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Bring the community back into the tools.</h2>
            <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-white/70">
              Browse the Toolkit, submit useful ideas, and turn community inspiration into a practical setlist.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/toolkit" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-blue-50">
              Open Toolkit
              <ArrowRight size={18} />
            </Link>
            <Link href="/lineup/index.html" className="inline-flex items-center gap-2 rounded-xl border border-white/18 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/16">
              Open Lineup
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
