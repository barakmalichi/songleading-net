"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  GripVertical,
  Merge,
  Plus,
  Redo2,
  Save,
  Scissors,
  Trash2,
  Undo2
} from "lucide-react";
import type { SavedFlow, Section, SelectedSectionInstance, Song } from "@/types/song";
import { createId } from "@/lib/id";
import { parseLyrics } from "@/lib/lyricsParser";
import { defaultFlowFromSections, generateSlides } from "@/lib/slideGenerator";
import { defaultDesignSettings } from "@/lib/themes";
import { useStudio } from "./StudioProvider";
import { SlidePreview } from "./SlidePreview";
import { SlideThumbnailList } from "./SlideThumbnailList";
import { DesignControls } from "./DesignControls";
import { ExportControls } from "./ExportControls";

export function SongEditor({ song }: { song: Song }) {
  const router = useRouter();
  const { upsertSong } = useStudio();
  const [draft, setDraft] = useState<Song>(song);
  const initialFlow = song.savedFlows[0]?.selectedSectionInstances.length
    ? song.savedFlows[0].selectedSectionInstances
    : defaultFlowFromSections(song.sections);
  const [flow, setFlow] = useState<SelectedSectionInstance[]>(initialFlow);
  const [slideBreaks, setSlideBreaks] = useState<string[]>(song.savedFlows[0]?.slideBreaks ?? []);
  const [design, setDesign] = useState(song.savedFlows[0]?.designSettings ?? defaultDesignSettings);
  const [activeSlide, setActiveSlide] = useState(0);
  const [flowName, setFlowName] = useState(song.savedFlows[0]?.name ?? "Default flow");
  const [history, setHistory] = useState<Song[]>([]);
  const [future, setFuture] = useState<Song[]>([]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const slides = useMemo(
    () => generateSlides(draft.title, draft.sections, flow, slideBreaks),
    [draft.sections, draft.title, flow, slideBreaks]
  );
  const flatLines = useMemo(() => slides.flatMap((slide) => slide.lines), [slides]);

  function commit(next: Song) {
    setHistory((items) => [draft, ...items].slice(0, 30));
    setFuture([]);
    setDraft(next);
  }

  function updateSection(sectionId: string, patch: Partial<Section>) {
    commit({
      ...draft,
      sections: draft.sections.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section
      ),
      updatedAt: new Date().toISOString()
    });
  }

  function detectSections() {
    const sections = parseLyrics(draft.lyricsRaw, draft.id);
    commit({ ...draft, sections, updatedAt: new Date().toISOString() });
    setFlow(defaultFlowFromSections(sections));
    setSlideBreaks([]);
  }

  function saveSong() {
    const now = new Date().toISOString();
    const savedFlow: SavedFlow = {
      id: draft.savedFlows[0]?.id ?? createId("flow"),
      songId: draft.id,
      name: flowName,
      selectedSectionInstances: flow,
      selectedLines: Object.fromEntries(flow.map((item) => [item.id, item.selectedLineIndexes])),
      slideBreaks,
      designSettings: design,
      createdAt: draft.savedFlows[0]?.createdAt ?? now,
      updatedAt: now
    };
    const next = { ...draft, savedFlows: [savedFlow, ...draft.savedFlows.slice(1)], updatedAt: now };
    setDraft(next);
    upsertSong(next);
  }

  function saveDuplicate() {
    const now = new Date().toISOString();
    const newSongId = createId("song");
    const next = {
      ...draft,
      id: newSongId,
      title: `${draft.title} copy`,
      sections: draft.sections.map((section) => ({ ...section, id: createId("section"), songId: newSongId })),
      savedFlows: [],
      createdAt: now,
      updatedAt: now
    };
    upsertSong(next);
    router.push(`/songs/${next.id}`);
  }

  function addSectionToFlow(section: Section) {
    const repeats = flow.filter((item) => item.sectionId === section.id).length + 1;
    setFlow([
      ...flow,
      {
        id: createId("instance"),
        sectionId: section.id,
        label: repeats > 1 ? `${section.name} x${repeats}` : section.name,
        repeatIndex: repeats,
        selectedLineIndexes: section.lines.map((_, index) => index)
      }
    ]);
  }

  function splitSection(section: Section, lineIndex: number) {
    if (lineIndex <= 0 || lineIndex >= section.lines.length) return;
    const first = { ...section, lines: section.lines.slice(0, lineIndex) };
    const second: Section = {
      ...section,
      id: createId("section"),
      name: `${section.name} split`,
      lines: section.lines.slice(lineIndex),
      order: section.order + 0.5
    };
    const sections = draft.sections
      .map((item) => (item.id === section.id ? first : item))
      .concat(second)
      .sort((a, b) => a.order - b.order)
      .map((item, order) => ({ ...item, order }));
    commit({ ...draft, sections, updatedAt: new Date().toISOString() });
  }

  function mergeWithPrevious(section: Section) {
    const ordered = draft.sections.slice().sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((item) => item.id === section.id);
    if (index <= 0) return;
    const previous = ordered[index - 1];
    const merged = { ...previous, lines: [...previous.lines, ...section.lines], name: `${previous.name} / ${section.name}` };
    const sections = ordered
      .filter((item) => item.id !== section.id)
      .map((item) => (item.id === previous.id ? merged : item))
      .map((item, order) => ({ ...item, order }));
    commit({ ...draft, sections, updatedAt: new Date().toISOString() });
    setFlow(flow.filter((item) => item.sectionId !== section.id));
  }

  function duplicateSection(section: Section) {
    const copy: Section = {
      ...section,
      id: createId("section"),
      name: `${section.name} copy`,
      order: section.order + 0.5
    };
    const sections = draft.sections
      .concat(copy)
      .sort((a, b) => a.order - b.order)
      .map((item, order) => ({ ...item, order }));
    commit({ ...draft, sections, updatedAt: new Date().toISOString() });
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    const ordered = draft.sections.slice().sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((section) => section.id === sectionId);
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    commit({ ...draft, sections: ordered.map((section, order) => ({ ...section, order })) });
  }

  function toggleLine(instanceId: string, lineIndex: number) {
    setFlow((items) =>
      items.map((item) =>
        item.id === instanceId
          ? {
              ...item,
              selectedLineIndexes: item.selectedLineIndexes.includes(lineIndex)
                ? item.selectedLineIndexes.filter((index) => index !== lineIndex)
                : [...item.selectedLineIndexes, lineIndex].sort((a, b) => a - b)
            }
          : item
      )
    );
  }

  function moveFlow(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= flow.length) return;
    const next = flow.slice();
    [next[index], next[target]] = [next[target], next[index]];
    setFlow(next);
  }

  function undo() {
    const previous = history[0];
    if (!previous) return;
    setFuture((items) => [draft, ...items]);
    setDraft(previous);
    setHistory((items) => items.slice(1));
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setHistory((items) => [draft, ...items]);
    setDraft(next);
    setFuture((items) => items.slice(1));
  }

  const orderedSections = draft.sections.slice().sort((a, b) => a.order - b.order);

  return (
    <main className="mx-auto grid max-w-[1500px] gap-4 px-4 py-5 xl:grid-cols-[320px_minmax(0,1fr)_420px]">
      <aside className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-black">Detected sections</h2>
            <button onClick={detectSections} className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white">
              Detect
            </button>
          </div>
          <div className="space-y-3">
            {orderedSections.map((section, index) => (
              <div key={section.id} className="rounded-lg border border-slate-200 p-3">
                <input
                  className="mb-2 w-full rounded-md border border-slate-300 px-2 py-1 font-bold"
                  value={section.name}
                  onChange={(event) => updateSection(section.id, { name: event.target.value })}
                />
                <div className="mb-2 flex flex-wrap gap-1 text-xs">
                  <button onClick={() => moveSection(section.id, -1)} className="rounded border px-2 py-1">Up</button>
                  <button onClick={() => moveSection(section.id, 1)} className="rounded border px-2 py-1">Down</button>
                  <button onClick={() => addSectionToFlow(section)} className="rounded border px-2 py-1">Add</button>
                  <button onClick={() => duplicateSection(section)} className="rounded border px-2 py-1"><Copy size={12} /></button>
                  <button onClick={() => mergeWithPrevious(section)} className="rounded border px-2 py-1"><Merge size={12} /></button>
                  <button onClick={() => commit({ ...draft, sections: draft.sections.filter((item) => item.id !== section.id) })} className="rounded border px-2 py-1 text-rose-700"><Trash2 size={12} /></button>
                </div>
                <textarea
                  dir="auto"
                  className="mb-2 min-h-24 w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
                  value={section.lines.join("\n")}
                  onChange={(event) => updateSection(section.id, { lines: event.target.value.split("\n") })}
                />
                <div className="space-y-1 text-sm text-slate-700">
                  {section.lines.map((line, lineIndex) => (
                    <div key={`${section.id}-${lineIndex}`} className="flex items-center justify-between gap-2">
                      <span className="line-clamp-1">{line}</span>
                      {lineIndex > 0 && (
                        <button title="Split here" onClick={() => splitSection(section, lineIndex)} className="rounded border p-1">
                          <Scissors size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <label className="mt-2 flex items-center gap-2 text-xs font-semibold">
                  <input type="checkbox" checked={Boolean(section.hidden)} onChange={(event) => updateSection(section.id, { hidden: event.target.checked })} />
                  Hide from default flow
                </label>
                <label className="mt-1 flex items-center gap-2 text-xs font-semibold">
                  <input type="checkbox" checked={Boolean(section.optional)} onChange={(event) => updateSection(section.id, { optional: event.target.checked })} />
                  Optional
                </label>
                <label className="mt-1 flex items-center gap-2 text-xs font-semibold">
                  <input type="checkbox" checked={Boolean(section.commonlyRepeated)} onChange={(event) => updateSection(section.id, { commonlyRepeated: event.target.checked })} />
                  Commonly repeated
                </label>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-black">Song editor</h1>
            <div className="flex flex-wrap gap-2">
              <button onClick={undo} className="rounded-lg border px-3 py-2"><Undo2 size={16} /></button>
              <button onClick={redo} className="rounded-lg border px-3 py-2"><Redo2 size={16} /></button>
              <button onClick={saveDuplicate} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-bold"><Copy size={16} /> Save as duplicate</button>
              <button onClick={saveSong} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 font-bold text-white"><Save size={16} /> Save song</button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold">
              Title
              <input className="rounded-lg border border-slate-300 px-3 py-2" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            </label>
            <label className="grid gap-1 text-sm font-bold">
              Artist or source
              <input className="rounded-lg border border-slate-300 px-3 py-2" value={draft.artistOrSource} onChange={(event) => setDraft({ ...draft, artistOrSource: event.target.value })} />
            </label>
            <label className="grid gap-1 text-sm font-bold">
              Language
              <input className="rounded-lg border border-slate-300 px-3 py-2" value={draft.language} onChange={(event) => setDraft({ ...draft, language: event.target.value })} />
            </label>
            <label className="grid gap-1 text-sm font-bold">
              Tags
              <input className="rounded-lg border border-slate-300 px-3 py-2" value={draft.tags.join(", ")} onChange={(event) => setDraft({ ...draft, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} />
            </label>
          </div>
          <label className="mt-3 grid gap-1 text-sm font-bold">
            Lyrics
            <textarea
              dir="auto"
              className="min-h-[310px] rounded-lg border border-slate-300 px-3 py-3 font-mono text-sm leading-6"
              value={draft.lyricsRaw}
              onChange={(event) => setDraft({ ...draft, lyricsRaw: event.target.value })}
              placeholder="Paste lyrics here. Headers like Verse:, [Chorus], BRIDGE, and Hebrew text are supported."
            />
          </label>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold">
              Notes
              <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
            </label>
            <label className="grid gap-1 text-sm font-bold">
              Copyright / attribution
              <textarea className="min-h-20 rounded-lg border border-slate-300 px-3 py-2" value={draft.copyrightInfo} onChange={(event) => setDraft({ ...draft, copyrightInfo: event.target.value })} />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-black">Build lyric flow</h2>
            <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold" value={flowName} onChange={(event) => setFlowName(event.target.value)} />
          </div>
          <div className="space-y-3">
            {flow.map((instance, index) => {
              const section = draft.sections.find((item) => item.id === instance.sectionId);
              if (!section) return null;
              return (
                <div key={instance.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-black"><GripVertical size={16} /> {instance.label}</div>
                    <div className="flex gap-1">
                      <button className="rounded border px-2 py-1 text-xs" onClick={() => moveFlow(index, -1)}>Up</button>
                      <button className="rounded border px-2 py-1 text-xs" onClick={() => moveFlow(index, 1)}>Down</button>
                      <button className="rounded border px-2 py-1 text-xs text-rose-700" onClick={() => setFlow(flow.filter((item) => item.id !== instance.id))}>Remove</button>
                    </div>
                  </div>
                  <div className="grid gap-1">
                    {section.lines.map((line, lineIndex) => (
                      <label key={`${instance.id}-${lineIndex}`} className="flex gap-2 rounded-md px-2 py-1 text-sm hover:bg-slate-50">
                        <input type="checkbox" checked={instance.selectedLineIndexes.includes(lineIndex)} onChange={() => toggleLine(instance.id, lineIndex)} />
                        <span dir="auto">{line}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-black">Slide breaks</h2>
          <div className="grid gap-2">
            {flatLines.map((line, index) => (
              <div key={line.id} className="rounded-lg border border-slate-200 p-2">
                {index > 0 && (
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold text-blue-800">
                    <input
                      type="checkbox"
                      checked={slideBreaks.includes(line.id)}
                      onChange={(event) =>
                        setSlideBreaks((breaks) =>
                          event.target.checked ? [...breaks, line.id] : breaks.filter((id) => id !== line.id)
                        )
                      }
                    />
                    Start a new slide here
                  </label>
                )}
                <div className="text-sm" dir="auto">{line.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="sticky top-20 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-black">Live preview</h2>
              <ExportControls slides={slides} design={design} songTitle={draft.title} copyrightInfo={draft.copyrightInfo} />
            </div>
            <SlidePreview slide={slides[activeSlide] ?? slides[0]} design={design} songTitle={draft.title} copyrightInfo={draft.copyrightInfo} />
            {slides[activeSlide]?.warning && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
                {slides[activeSlide].warning}
              </p>
            )}
          </div>
          <SlideThumbnailList slides={slides} activeIndex={activeSlide} onSelect={setActiveSlide} design={design} songTitle={draft.title} copyrightInfo={draft.copyrightInfo} />
          <DesignControls design={design} onChange={setDesign} />
        </div>
      </aside>
    </main>
  );
}
