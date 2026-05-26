"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, FileSliders, Plus, Save, Trash2 } from "lucide-react";
import type { Session, SessionSong } from "@/types/session";
import { createId } from "@/lib/id";
import { defaultFlowFromSections, generateSlides } from "@/lib/slideGenerator";
import { useStudio } from "./StudioProvider";
import { SlidePreview } from "./SlidePreview";
import { SlideThumbnailList } from "./SlideThumbnailList";
import { DesignControls } from "./DesignControls";
import { ExportControls } from "./ExportControls";

export function SessionBuilder({ session }: { session: Session }) {
  const router = useRouter();
  const { songs, upsertSession } = useStudio();
  const [draft, setDraft] = useState<Session>(session);
  const [activeSlide, setActiveSlide] = useState(0);

  const deck = useMemo(() => {
    return draft.sessionSongs
      .slice()
      .sort((a, b) => a.order - b.order)
      .flatMap((sessionSong) => {
        if (!sessionSong.slideSongId && sessionSong.slidesStatus === "no-slides") return [];
        const song = songs.find((item) => item.id === (sessionSong.slideSongId ?? sessionSong.songId));
        if (!song) return [];
        const savedFlow =
          song.savedFlows.find((flow) => flow.id === (sessionSong.slideFlowId ?? sessionSong.savedFlowId)) ??
          song.savedFlows[0];
        const flow = sessionSong.customSectionFlow ?? savedFlow?.selectedSectionInstances ?? defaultFlowFromSections(song.sections);
        const breaks = sessionSong.customSlideBreaks ?? savedFlow?.slideBreaks ?? [];
        return generateSlides(song.title, song.sections, flow, breaks).map((slide) => ({
          ...slide,
          title: song.title
        }));
      });
  }, [draft.sessionSongs, songs]);

  function addSong(songId: string) {
    const song = songs.find((item) => item.id === songId);
    if (!song) return;
    const item: SessionSong = {
      id: createId("sessionSong"),
      sessionId: draft.id,
      songId,
      slidesStatus: "no-slides",
      order: draft.sessionSongs.length,
    };
    setDraft({ ...draft, sessionSongs: [...draft.sessionSongs, item] });
  }

  function moveSong(index: number, direction: -1 | 1) {
    const ordered = draft.sessionSongs.slice().sort((a, b) => a.order - b.order);
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    setDraft({ ...draft, sessionSongs: ordered.map((item, order) => ({ ...item, order })) });
  }

  function save() {
    upsertSession({ ...draft, updatedAt: new Date().toISOString() });
  }

  function updateSessionSong(itemId: string, patch: Partial<SessionSong>) {
    setDraft({
      ...draft,
      sessionSongs: draft.sessionSongs.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item
      )
    });
  }

  function saveDuplicate() {
    const now = new Date().toISOString();
    const newSessionId = createId("session");
    const copy: Session = {
      ...draft,
      id: newSessionId,
      name: `${draft.name} copy`,
      sessionSongs: draft.sessionSongs.map((item, order) => ({
        ...item,
        id: createId("sessionSong"),
        sessionId: newSessionId,
        order
      })),
      createdAt: now,
      updatedAt: now
    };
    upsertSession(copy);
    router.push(`/lineups/${copy.id}`);
  }

  const firstSong = draft.sessionSongs[0]
    ? songs.find((song) => song.id === draft.sessionSongs[0].songId)
    : undefined;

  return (
    <main className="mx-auto grid max-w-[1500px] gap-4 px-4 py-5 text-slate-100 xl:grid-cols-[minmax(0,1fr)_460px]">
      <section className="space-y-4">
        <div className="rounded-lg border border-white/10 bg-[#111417] p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-black">Lineup builder</h1>
            <div className="flex gap-2">
              <button onClick={saveDuplicate} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#15191d] px-3 py-2 font-bold text-slate-200">
                <Copy size={16} /> Duplicate
              </button>
              <button onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-bold text-[#120b02]">
                <Save size={16} /> Save lineup
              </button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold text-slate-300">
              Lineup name
              <input className="rounded-lg border border-white/10 bg-[#0c0f11] px-3 py-2 text-slate-100" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
            </label>
            <label className="grid gap-1 text-sm font-bold text-slate-300">
              Date
              <input type="date" className="rounded-lg border border-white/10 bg-[#0c0f11] px-3 py-2 text-slate-100" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
            </label>
          </div>
          <label className="mt-3 grid gap-1 text-sm font-bold text-slate-300">
            Notes
            <textarea className="min-h-20 rounded-lg border border-white/10 bg-[#0c0f11] px-3 py-2 text-slate-100" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
          </label>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#111417] p-4">
          <h2 className="mb-3 font-black">Add songs to lineup</h2>
          <div className="grid gap-2 md:grid-cols-2">
            {songs.map((song) => (
              <button key={song.id} onClick={() => addSong(song.id)} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#181c20] p-3 text-left hover:border-white/20">
                <span>
                  <span className="block font-black">{song.title}</span>
                  <span className="text-sm text-slate-400">{song.savedFlows.length ? "Slides available" : "No slides yet"}</span>
                </span>
                <Plus size={18} />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#111417] p-4">
          <h2 className="mb-3 font-black">Lineup order</h2>
          <div className="space-y-3">
            {draft.sessionSongs
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((item, index) => {
                const song = songs.find((candidate) => candidate.id === item.songId);
                if (!song) return null;
                const slideStatusValue = item.slidesStatus === "needs-review"
                  ? "slides-ready"
                  : item.slidesStatus ?? "no-slides";
                return (
                  <div key={item.id} className="rounded-lg border border-white/10 bg-[#181c20] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-black">{song.title}</div>
                        <div className="text-sm text-slate-400">{song.artistOrSource || song.language}</div>
                      </div>
                      <div className="flex gap-1">
                        <Link
                          className="rounded border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-xs font-black text-amber-200"
                          href={`/lineups/${draft.id}/songs/${item.id}/slides`}
                        >
                          <FileSliders size={13} className="mr-1 inline" />
                          Slides
                        </Link>
                        <button className="rounded border border-white/10 bg-[#101316] px-2 py-1 text-xs text-slate-300" onClick={() => moveSong(index, -1)}>Up</button>
                        <button className="rounded border border-white/10 bg-[#101316] px-2 py-1 text-xs text-slate-300" onClick={() => moveSong(index, 1)}>Down</button>
                        <button className="rounded border border-white/10 bg-[#101316] px-2 py-1 text-xs text-rose-400" onClick={() => setDraft({ ...draft, sessionSongs: draft.sessionSongs.filter((candidate) => candidate.id !== item.id) })}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
                      <label className="grid gap-1 text-sm font-bold text-slate-300">
                        Slide status
                        <select
                          className="rounded-lg border border-white/10 bg-[#0c0f11] px-3 py-2 text-slate-100"
                          value={slideStatusValue}
                          onChange={(event) =>
                            updateSessionSong(item.id, {
                              slidesStatus: event.target.value as SessionSong["slidesStatus"]
                            })
                          }
                        >
                          <option value="no-slides">No slides</option>
                          <option value="slides-ready">Slides ready</option>
                        </select>
                      </label>
                      <div className="rounded-lg border border-white/10 bg-[#101316] px-3 py-2 text-sm text-slate-300">
                        {item.slideSongId ? (
                          <>
                            Connected to{" "}
                            <span className="font-black text-slate-100">
                              {songs.find((candidate) => candidate.id === item.slideSongId)?.title ?? "saved slide song"}
                            </span>
                          </>
                        ) : (
                          "No slide song connected yet."
                        )}
                      </div>
                    </div>
                    <label className="mt-3 grid gap-1 text-sm font-bold text-slate-300">
                      Saved lyric version
                      <select
                        className="rounded-lg border border-white/10 bg-[#0c0f11] px-3 py-2 text-slate-100"
                        value={item.slideFlowId ?? item.savedFlowId ?? ""}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            sessionSongs: draft.sessionSongs.map((candidate) =>
                              candidate.id === item.id
                                ? {
                                    ...candidate,
                                    slideSongId: song.id,
                                    slideFlowId: event.target.value,
                                    savedFlowId: event.target.value,
                                    slidesStatus: "slides-ready",
                                    customSectionFlow:
                                      song.savedFlows.find((flow) => flow.id === event.target.value)
                                        ?.selectedSectionInstances ?? defaultFlowFromSections(song.sections),
                                    customSlideBreaks:
                                      song.savedFlows.find((flow) => flow.id === event.target.value)
                                        ?.slideBreaks ?? []
                                  }
                                : candidate
                            )
                          })
                        }
                      >
                        {song.savedFlows.length === 0 && <option value="">Current sections</option>}
                        {song.savedFlows.map((flow) => (
                          <option key={flow.id} value={flow.id}>{flow.name}</option>
                        ))}
                      </select>
                    </label>
                    <div className="mt-3 grid gap-1">
                      {(item.customSectionFlow ?? song.savedFlows[0]?.selectedSectionInstances ?? defaultFlowFromSections(song.sections)).map((instance) => {
                        const section = song.sections.find((sectionItem) => sectionItem.id === instance.sectionId);
                        return (
                          <label key={instance.id} className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-300 hover:bg-white/5">
                            <input
                              className="accent-amber-500"
                              type="checkbox"
                              checked={(item.customSectionFlow ?? []).some((flowItem) => flowItem.id === instance.id)}
                              onChange={(event) => {
                                const base = item.customSectionFlow ?? song.savedFlows[0]?.selectedSectionInstances ?? defaultFlowFromSections(song.sections);
                                const nextFlow = event.target.checked
                                  ? [...base, instance]
                                  : base.filter((flowItem) => flowItem.id !== instance.id);
                                setDraft({
                                  ...draft,
                                  sessionSongs: draft.sessionSongs.map((candidate) =>
                                    candidate.id === item.id ? { ...candidate, customSectionFlow: nextFlow } : candidate
                                  )
                                });
                              }}
                            />
                            {section?.name ?? instance.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="sticky top-20 space-y-4">
          <div className="rounded-lg border border-white/10 bg-[#111417] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-black">Lineup slide preview</h2>
              <ExportControls slides={deck} design={draft.globalDesignSettings} songTitle={deck[activeSlide]?.title ?? draft.name} copyrightInfo={firstSong?.copyrightInfo} />
            </div>
            <SlidePreview slide={deck[activeSlide] ?? { id: "empty", title: draft.name, sectionNames: [], lines: [], warning: "Add songs to create slides." }} design={draft.globalDesignSettings} songTitle={deck[activeSlide]?.title ?? draft.name} copyrightInfo={firstSong?.copyrightInfo} />
          </div>
          <SlideThumbnailList slides={deck} activeIndex={activeSlide} onSelect={setActiveSlide} design={draft.globalDesignSettings} songTitle={draft.name} copyrightInfo={firstSong?.copyrightInfo} />
          <DesignControls design={draft.globalDesignSettings} onChange={(globalDesignSettings) => setDraft({ ...draft, globalDesignSettings })} />
        </div>
      </aside>
    </main>
  );
}
