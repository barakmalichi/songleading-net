"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Layers3,
  Merge,
  PanelRightOpen,
  Plus,
  Redo2,
  Save,
  Scissors,
  Settings2,
  SlidersHorizontal,
  Moon,
  MoreHorizontal,
  Minus,
  Sun,
  Trash2,
  Undo2,
  X
} from "lucide-react";
import type { DesignSettings, SavedFlow, Section, SelectedSectionInstance, Song } from "@/types/song";
import { createId } from "@/lib/id";
import { parseLyrics } from "@/lib/lyricsParser";
import { defaultFlowFromSections, flattenFlow, generateSlides } from "@/lib/slideGenerator";
import { fitDeckFontSize } from "@/lib/slideTextFit";
import { defaultDesignSettings } from "@/lib/themes";
import { useStudio } from "./StudioProvider";
import { DesignControls } from "./DesignControls";
import { ExportControls } from "./ExportControls";
import { SlidePreview } from "./SlidePreview";

type Drawer = "more" | "song" | "flow" | "slide" | "design" | null;
type EditorSnapshot = {
  draft: Song;
  flow: SelectedSectionInstance[];
  slideBreaks: string[];
  design: DesignSettings;
};

function editorSignature(
  draft: Song,
  flow: SelectedSectionInstance[],
  slideBreaks: string[],
  design: DesignSettings,
  flowName: string
) {
  return JSON.stringify({
    draft,
    flow,
    slideBreaks,
    design,
    flowName
  });
}

export function SongEditor({
  song,
  backHref,
  contextLabel,
  onSaved
}: {
  song: Song;
  backHref?: string;
  contextLabel?: string;
  onSaved?: (song: Song, flowId: string) => void;
}) {
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
  const [history, setHistory] = useState<EditorSnapshot[]>([]);
  const [future, setFuture] = useState<EditorSnapshot[]>([]);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);
  const [slideDropIndex, setSlideDropIndex] = useState<number | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [textEditSnapshot, setTextEditSnapshot] = useState<EditorSnapshot | null>(null);
  const [lastSavedSignature, setLastSavedSignature] = useState("");
  const hasDetectedSlides = draft.sections.length > 0;

  const slides = useMemo(
    () => generateSlides(draft.title, draft.sections, flow, slideBreaks),
    [draft.sections, draft.title, flow, slideBreaks]
  );
  const orderedSections = draft.sections.slice().sort((a, b) => a.order - b.order);
  const activeSlideData = slides[activeSlide] ?? slides[0];
  const flatLines = useMemo(() => flattenFlow(draft.sections, flow), [draft.sections, flow]);
  const currentSignature = useMemo(
    () => editorSignature(draft, flow, slideBreaks, design, flowName),
    [draft, flow, slideBreaks, design, flowName]
  );
  const hasUnsavedChanges = Boolean(lastSavedSignature) && currentSignature !== lastSavedSignature;

  useEffect(() => {
    setLastSavedSignature(currentSignature);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    setActiveSlide((index) => Math.min(index, Math.max(0, slides.length - 1)));
  }, [slides.length]);

  function snapshot(): EditorSnapshot {
    return { draft, flow, slideBreaks, design };
  }

  function restoreSnapshot(item: EditorSnapshot) {
    setDraft(item.draft);
    setFlow(item.flow);
    setSlideBreaks(item.slideBreaks);
    setDesign(item.design);
  }

  function remember() {
    setHistory((items) => [snapshot(), ...items].slice(0, 30));
    setFuture([]);
  }

  function beginSlideTextEdit() {
    setTextEditSnapshot((item) => item ?? snapshot());
  }

  function finishSlideTextEdit() {
    if (!textEditSnapshot) return;
    setHistory((items) => [textEditSnapshot, ...items].slice(0, 30));
    setFuture([]);
    setTextEditSnapshot(null);
  }

  function commit(next: Song) {
    remember();
    setDraft(next);
  }

  function updateDesign(next: DesignSettings) {
    remember();
    setDesign(next);
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
    const nextFlow = defaultFlowFromSections(sections);
    const nextDesign: DesignSettings = {
      ...design,
      textBoxWidth: 100,
      margins: 2,
      lineSpacing: 1.03,
      verticalPlacement: "center",
      horizontalPlacement: "center"
    };
    const nextSlides = generateSlides(draft.title, sections, nextFlow, []);
    commit({ ...draft, sections, updatedAt: new Date().toISOString() });
    setFlow(nextFlow);
    setSlideBreaks([]);
    setDesign({
      ...nextDesign,
      fontSize: fitDeckFontSize(nextSlides, nextDesign, { maxFont: 320, minFont: 18 })
    });
    setActiveSlide(0);
  }

  function rebuildRawLyricsFromSlides() {
    return slides
      .map((slide) => slide.lines.map((line) => line.text).join("\n"))
      .join("\n\n");
  }

  function updateSlideText(slideIndex: number, value: string) {
    const slide = slides[slideIndex];
    if (!slide) return;
    const nextLines = value.split("\n");
    const removedLines = slide.lines.slice(nextLines.length);
    if (removedLines.length > 0) {
      setFlow((items) =>
        items.map((item) => ({
          ...item,
          selectedLineIndexes: item.selectedLineIndexes.filter(
            (lineIndex) =>
              !removedLines.some((line) => line.instanceId === item.id && line.lineIndex === lineIndex)
          )
        }))
      );
      setSlideBreaks((breaks) =>
        breaks.filter((id) => !removedLines.some((line) => id === line.id || id === `no:${line.id}`))
      );
    }
    setDraft((current) => {
      const sections = current.sections.map((section) => ({ ...section, lines: [...section.lines] }));
      slide.lines.forEach((line, index) => {
        const section = sections.find((item) => item.id === line.sectionId);
        if (section && index < nextLines.length) {
          section.lines[line.lineIndex] = nextLines[index];
        }
      });

      const extraLines = nextLines.slice(slide.lines.length).filter((line) => line.length > 0);
      const lastLine = slide.lines.at(-1);
      if (lastLine && extraLines.length > 0) {
        const section = sections.find((item) => item.id === lastLine.sectionId);
        const instance = flow.find((item) => item.id === lastLine.instanceId);
        if (section && instance) {
          section.lines.splice(lastLine.lineIndex + 1, 0, ...extraLines);
          const newIndexes = extraLines.map((_, offset) => lastLine.lineIndex + 1 + offset);
          setFlow((items) =>
            items.map((item) =>
              item.id === instance.id
                ? {
                    ...item,
                    selectedLineIndexes: Array.from(
                      new Set([...item.selectedLineIndexes, ...newIndexes])
                    ).sort((a, b) => a - b)
                  }
                : item
            )
          );
        }
      }

      return {
        ...current,
        lyricsRaw: sections.map((section) => section.lines.join("\n")).join("\n\n"),
        sections,
        updatedAt: new Date().toISOString()
      };
    });
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
    setLastSavedSignature(editorSignature(next, flow, slideBreaks, design, flowName));
    onSaved?.(next, savedFlow.id);
  }

  function leaveToLineup() {
    if (!backHref) return;
    if (hasUnsavedChanges) {
      const shouldSave = window.confirm("Save slide changes before leaving? Press OK to save, or Cancel to leave without saving.");
      if (shouldSave) saveSong();
    }
    router.push(backHref);
  }

  function saveDuplicate() {
    const now = new Date().toISOString();
    const newSongId = createId("song");
    const sectionIds = new Map<string, string>();
    const duplicatedSections = draft.sections.map((section) => {
      const nextSectionId = createId("section");
      sectionIds.set(section.id, nextSectionId);
      return {
        ...section,
        id: nextSectionId,
        songId: newSongId
      };
    });
    const duplicatedFlow: SavedFlow = {
      id: createId("flow"),
      songId: newSongId,
      name: `${flowName} copy`,
      selectedSectionInstances: flow.map((instance) => ({
        ...instance,
        id: createId("instance"),
        sectionId: sectionIds.get(instance.sectionId) ?? instance.sectionId
      })),
      selectedLines: { ...draft.savedFlows[0]?.selectedLines },
      slideBreaks: [...slideBreaks],
      designSettings: { ...design },
      createdAt: now,
      updatedAt: now
    };
    const next = {
      ...draft,
      id: newSongId,
      title: `${draft.title} copy`,
      sections: duplicatedSections,
      savedFlows: [duplicatedFlow],
      createdAt: now,
      updatedAt: now
    };
    upsertSong(next);
    setDraft(next);
    setFlow(duplicatedFlow.selectedSectionInstances);
    setFlowName(duplicatedFlow.name);
    setSlideBreaks(duplicatedFlow.slideBreaks);
    setLastSavedSignature(editorSignature(next, duplicatedFlow.selectedSectionInstances, duplicatedFlow.slideBreaks, design, duplicatedFlow.name));
    onSaved?.(next, duplicatedFlow.id);
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
    const firstBreaks = (section.lineBreaksAfter ?? []).filter((item) => item < lineIndex - 1);
    const secondBreaks = (section.lineBreaksAfter ?? [])
      .filter((item) => item >= lineIndex)
      .map((item) => item - lineIndex);
    const first = { ...section, lines: section.lines.slice(0, lineIndex), lineBreaksAfter: firstBreaks };
    const second: Section = {
      ...section,
      id: createId("section"),
      name: `${section.name} split`,
      lines: section.lines.slice(lineIndex),
      lineBreaksAfter: secondBreaks,
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
    const offset = previous.lines.length;
    const merged = {
      ...previous,
      lines: [...previous.lines, ...section.lines],
      lineBreaksAfter: [
        ...(previous.lineBreaksAfter ?? []),
        offset - 1,
        ...(section.lineBreaksAfter ?? []).map((item) => item + offset)
      ],
      name: `${previous.name} / ${section.name}`
    };
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

  function updateSectionText(section: Section, value: string) {
    const lines = value.split("\n");
    updateSection(section.id, {
      lines,
      lineBreaksAfter: section.lineBreaksAfter?.filter((lineIndex) => lineIndex < lines.length - 1)
    });
  }

  function updateSlideLineText(sectionId: string, lineIndex: number, text: string) {
    const section = draft.sections.find((item) => item.id === sectionId);
    if (!section) return;
    const lines = section.lines.map((line, index) => (index === lineIndex ? text : line));
    updateSection(sectionId, { lines });
  }

  function toggleNaturalBreak(section: Section, lineIndex: number) {
    const existing = section.lineBreaksAfter ?? [];
    updateSection(section.id, {
      lineBreaksAfter: existing.includes(lineIndex)
        ? existing.filter((item) => item !== lineIndex)
        : [...existing, lineIndex].sort((a, b) => a - b)
    });
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

  function removeFlow(instanceId: string) {
    remember();
    setFlow(flow.filter((item) => item.id !== instanceId));
  }

  function setBreakBefore(lineId: string, checked: boolean) {
    remember();
    setSlideBreaks((breaks) => {
      const withoutSuppression = breaks.filter((id) => id !== `no:${lineId}`);
      if (checked) return Array.from(new Set([...withoutSuppression, lineId]));
      return withoutSuppression.filter((id) => id !== lineId);
    });
  }

  function suppressBreakBefore(lineId: string) {
    const lineIndex = flatLines.findIndex((line) => line.id === lineId);
    const line = flatLines[lineIndex];
    const previous = flatLines[lineIndex - 1];
    if (!line || !previous) return;

    if (previous.sectionId === line.sectionId) {
      const section = draft.sections.find((item) => item.id === previous.sectionId);
      if (section?.lineBreaksAfter?.includes(previous.lineIndex)) {
        updateSection(section.id, {
          lineBreaksAfter: section.lineBreaksAfter.filter((item) => item !== previous.lineIndex)
        });
      }
    }

    remember();
    setSlideBreaks((breaks) =>
      Array.from(new Set([...breaks.filter((id) => id !== line.id), `no:${line.id}`]))
    );
  }

  function connectActiveSlideWithPrevious() {
    const firstLine = activeSlideData?.lines[0];
    if (!firstLine || activeSlide <= 0) return;
    suppressBreakBefore(firstLine.id);
    setActiveSlide(Math.max(0, activeSlide - 1));
  }

  function connectActiveSlideWithNext() {
    const nextLine = slides[activeSlide + 1]?.lines[0];
    if (!nextLine) return;
    suppressBreakBefore(nextLine.id);
  }

  function activeFlowIndex() {
    const line = activeSlideData?.lines.at(-1);
    if (!line) return flow.length - 1;
    const index = flow.findIndex((item) => item.id === line.instanceId);
    return index >= 0 ? index : flow.length - 1;
  }

  function insertSlideAfter(lines: string[], name: string) {
    const sectionId = createId("section");
    const instanceId = createId("instance");
    const order = Math.max(-1, ...draft.sections.map((section) => section.order)) + 1;
    const section: Section = {
      id: sectionId,
      songId: draft.id,
      type: "Section",
      name,
      lines,
      order
    };
    const instance: SelectedSectionInstance = {
      id: instanceId,
      sectionId,
      label: name,
      repeatIndex: 1,
      selectedLineIndexes: lines.map((_, index) => index)
    };
    const insertAt = activeFlowIndex() + 1;
    remember();
    setDraft({
      ...draft,
      sections: [...draft.sections, section],
      updatedAt: new Date().toISOString()
    });
    setFlow([...flow.slice(0, insertAt), instance, ...flow.slice(insertAt)]);
    setSlideBreaks((breaks) => Array.from(new Set([...breaks, `${instanceId}:0`])));
    setActiveSlide(Math.min(activeSlide + 1, slides.length));
  }

  function addSlideAfter() {
    insertSlideAfter([""], "Blank slide");
  }

  function duplicateActiveSlide() {
    const lines = activeSlideData?.lines.map((line) => line.text).filter(Boolean) ?? [];
    if (lines.length === 0) return;
    insertSlideAfter(lines, `${activeSlideData.sectionNames.join(" / ") || "Slide"} copy`);
  }

  function deleteSlideAt(slideIndex: number) {
    const slide = slides[slideIndex];
    if (!slide?.lines.length) return;
    const removeByInstance = new Map<string, Set<number>>();
    slide.lines.forEach((line) => {
      const existing = removeByInstance.get(line.instanceId) ?? new Set<number>();
      existing.add(line.lineIndex);
      removeByInstance.set(line.instanceId, existing);
    });
    remember();
    setFlow((items) =>
      items
        .map((item) => ({
          ...item,
          selectedLineIndexes: item.selectedLineIndexes.filter(
            (lineIndex) => !removeByInstance.get(item.id)?.has(lineIndex)
          )
        }))
        .filter((item) => item.selectedLineIndexes.length > 0)
    );
    setSlideBreaks((breaks) =>
      breaks.filter((id) => !slide.lines.some((line) => id === line.id || id === `no:${line.id}`))
    );
    setActiveSlide(Math.max(0, slideIndex - 1));
  }

  function deleteActiveSlide() {
    deleteSlideAt(activeSlide);
  }

  function moveActiveSlide(direction: -1 | 1) {
    const instanceIds = Array.from(new Set(activeSlideData?.lines.map((line) => line.instanceId) ?? []));
    if (instanceIds.length === 0) return;
    const indexes = instanceIds
      .map((id) => flow.findIndex((item) => item.id === id))
      .filter((index) => index >= 0)
      .sort((a, b) => a - b);
    const first = indexes[0];
    const last = indexes[indexes.length - 1];
    if (indexes.some((index, offset) => index !== first + offset)) return;
    if (direction === -1 && first === 0) return;
    if (direction === 1 && last === flow.length - 1) return;
    const block = flow.slice(first, last + 1);
    const before = flow.slice(0, first);
    const after = flow.slice(last + 1);
    remember();
    if (direction === -1) {
      const previous = before[before.length - 1];
      setFlow([...before.slice(0, -1), ...block, previous, ...after]);
      setActiveSlide(Math.max(0, activeSlide - 1));
    } else {
      const next = after[0];
      setFlow([...before, next, ...block, ...after.slice(1)]);
      setActiveSlide(Math.min(slides.length - 1, activeSlide + 1));
    }
  }

  function moveSlideTo(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= slides.length) return;
    const sourceSlide = slides[fromIndex];
    const targetSlide = slides[Math.min(toIndex, slides.length - 1)];
    const sourceInstanceIds = Array.from(new Set(sourceSlide?.lines.map((line) => line.instanceId) ?? []));
    const targetInstanceIds = Array.from(new Set(targetSlide?.lines.map((line) => line.instanceId) ?? []));
    if (!sourceInstanceIds.length || !targetInstanceIds.length) return;

    const sourceIndexes = sourceInstanceIds
      .map((id) => flow.findIndex((item) => item.id === id))
      .filter((index) => index >= 0)
      .sort((a, b) => a - b);
    const sourceFirst = sourceIndexes[0];
    const sourceLast = sourceIndexes[sourceIndexes.length - 1];
    if (sourceIndexes.some((index, offset) => index !== sourceFirst + offset)) return;

    const targetIndexes = targetInstanceIds
      .map((id) => flow.findIndex((item) => item.id === id))
      .filter((index) => index >= 0)
      .sort((a, b) => a - b);
    if (!targetIndexes.length) return;

    const block = flow.slice(sourceFirst, sourceLast + 1);
    const withoutBlock = [...flow.slice(0, sourceFirst), ...flow.slice(sourceLast + 1)];
    const rawTargetIndex = fromIndex < toIndex ? targetIndexes[targetIndexes.length - 1] + 1 : targetIndexes[0];
    const insertAt = rawTargetIndex > sourceLast ? rawTargetIndex - block.length : rawTargetIndex;
    remember();
    setFlow([...withoutBlock.slice(0, insertAt), ...block, ...withoutBlock.slice(insertAt)]);
    setActiveSlide(Math.min(toIndex, slides.length - 1));
  }

  function changeFont(delta: number) {
    updateDesign({ ...design, fontSize: Math.max(12, Math.min(320, design.fontSize + delta)) });
  }

  function fitFontToScreen() {
    const nextDesign: DesignSettings = {
      ...design,
      textBoxWidth: 100,
      margins: 2,
      lineSpacing: 1.03,
      verticalPlacement: "center",
      horizontalPlacement: "center"
    };
    updateDesign({
      ...nextDesign,
      fontSize: fitDeckFontSize(slides, nextDesign, { maxFont: 320, minFont: 18 })
    });
  }

  function undo() {
    const previous = history[0];
    if (!previous) return;
    setFuture((items) => [snapshot(), ...items]);
    restoreSnapshot(previous);
    setHistory((items) => items.slice(1));
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setHistory((items) => [snapshot(), ...items]);
    restoreSnapshot(next);
    setFuture((items) => items.slice(1));
  }

  return (
    <main
      className={`slide-editor-app h-[calc(100vh-65px)] overflow-hidden ${
        isDarkMode ? "slide-editor-dark bg-[#070b10] text-slate-50" : "bg-[#f7f4ee] text-slate-950"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-[58px] shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-[#faf8f3] px-4">
          <div className="flex min-w-0 items-center gap-2">
            {backHref && (
              <button type="button" onClick={leaveToLineup} className="quiet-button">
                <ArrowLeft size={18} /> Lineup
              </button>
            )}
            <button type="button" onClick={saveSong} className="primary-button">
              <Save size={18} /> Save
            </button>
            <button
              type="button"
              onClick={() => setIsDarkMode((value) => !value)}
              className="quiet-button"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              {isDarkMode ? "Light" : "Dark"}
            </button>
            <button type="button" onClick={() => setDrawer("more")} className="quiet-button">
              <MoreHorizontal size={18} /> More
            </button>
          </div>
          <ExportControls slides={slides} design={design} songTitle={draft.title} copyrightInfo={draft.copyrightInfo} />
        </div>
        {contextLabel && (
          <div className="shrink-0 border-b border-slate-200 bg-amber-50 px-4 py-2 text-sm font-black text-amber-900">
            {contextLabel}
          </div>
        )}

        <div className="flex h-[52px] shrink-0 items-center justify-between gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4">
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={undo} className="icon-button" aria-label="Undo">
              <Undo2 size={17} />
            </button>
            <button type="button" onClick={redo} className="icon-button" aria-label="Redo">
              <Redo2 size={17} />
            </button>
            <span className="mx-1 h-7 w-px bg-slate-200" />
            <button type="button" onClick={() => changeFont(-6)} className="small-button">
              <Minus size={14} /> Font
            </button>
            <button type="button" onClick={() => changeFont(6)} className="small-button">
              <Plus size={14} /> Font
            </button>
            <button type="button" onClick={fitFontToScreen} className="small-button">
              Fit screen
            </button>
            <label className="small-button cursor-pointer">
              Background
              <input
                type="color"
                className="h-5 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                value={design.backgroundColor}
                onChange={(event) =>
                  updateDesign({ ...design, backgroundColor: event.target.value, backgroundImage: "" })
                }
              />
            </label>
            <button type="button" onClick={() => setDrawer("design")} className="small-button">
              <SlidersHorizontal size={14} /> Design
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => moveActiveSlide(-1)} className="small-button">
              <ArrowLeft size={14} /> Move
            </button>
            <button type="button" onClick={() => moveActiveSlide(1)} className="small-button">
              Move <ArrowRight size={14} />
            </button>
            <button type="button" onClick={addSlideAfter} className="small-button">
              <Plus size={14} /> Add slide
            </button>
            <button type="button" onClick={duplicateActiveSlide} className="small-button">
              <Copy size={14} /> Duplicate
            </button>
            <button
              type="button"
              onClick={deleteActiveSlide}
              onDragOver={(event) => {
                if (draggedSlideIndex === null) return;
                event.preventDefault();
                setIsOverTrash(true);
              }}
              onDragLeave={() => setIsOverTrash(false)}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedSlideIndex !== null) deleteSlideAt(draggedSlideIndex);
                setDraggedSlideIndex(null);
                setSlideDropIndex(null);
                setIsOverTrash(false);
              }}
              className={`small-button text-rose-700 ${isOverTrash ? "ring-2 ring-rose-400" : ""}`}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(360px,0.92fr)_minmax(460px,1.08fr)] gap-3 p-3">
          <section className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 px-4">
              <input
                className="min-w-0 flex-1 bg-transparent text-xl font-black outline-none placeholder:text-slate-400"
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                placeholder="Song title"
              />
              {hasDetectedSlides ? (
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, lyricsRaw: rebuildRawLyricsFromSlides(), sections: [] })}
                  className="quiet-button"
                >
                  Edit full lyrics
                </button>
              ) : (
                <button type="button" onClick={detectSections} className="primary-button">
                  Create slides
                </button>
              )}
            </div>
            {hasDetectedSlides ? (
              <div className="min-h-0 flex-1 overflow-auto p-3">
                <div className="grid gap-3">
                  {slides.map((slide, index) => (
                    <div
                      key={`${slide.id}-editor`}
                      draggable
                      onDragStart={(event) => {
                        setDraggedSlideIndex(index);
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/slide-index", String(index));
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setSlideDropIndex(index);
                      }}
                      onDragLeave={() => setSlideDropIndex(null)}
                      onDrop={(event) => {
                        event.preventDefault();
                        const from = Number(event.dataTransfer.getData("text/slide-index"));
                        if (Number.isFinite(from)) moveSlideTo(from, index);
                        setDraggedSlideIndex(null);
                        setSlideDropIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedSlideIndex(null);
                        setSlideDropIndex(null);
                        setIsOverTrash(false);
                      }}
                      onClick={() => setActiveSlide(index)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") setActiveSlide(index);
                      }}
                      className={`slide-edit-card rounded-lg border p-3 text-left transition ${
                        activeSlide === index
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-slate-50 hover:bg-white"
                      } ${slideDropIndex === index && draggedSlideIndex !== index ? "ring-2 ring-blue-400" : ""}`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Slide {index + 1}
                        </span>
                        <span className="truncate text-xs font-bold text-slate-400">
                          {slide.sectionNames.join(" / ") || "Custom slide"}
                        </span>
                      </div>
                      <textarea
                        dir="auto"
                        className="slide-block-text min-h-24 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-[17px] font-bold leading-[1.45] text-slate-950 outline-none focus:border-blue-500"
                        value={slide.lines.map((line) => line.text).join("\n")}
                        onClick={(event) => event.stopPropagation()}
                        onFocus={beginSlideTextEdit}
                        onBlur={finishSlideTextEdit}
                        onChange={(event) => updateSlideText(index, event.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <textarea
                dir="auto"
                className="min-h-0 flex-1 resize-none rounded-b-lg px-5 py-4 font-mono text-[19px] font-bold leading-[1.55] text-slate-950 outline-none placeholder:text-slate-400"
                value={draft.lyricsRaw}
                onChange={(event) => setDraft({ ...draft, lyricsRaw: event.target.value })}
                placeholder="Paste lyrics here. Blank lines become slide breaks."
              />
            )}
          </section>

          <section className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-black">Slides</h1>
                <p className="text-sm font-semibold text-slate-500">
                  Slide {Math.min(activeSlide + 1, slides.length)} of {slides.length}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  disabled={activeSlide === 0}
                  onClick={connectActiveSlideWithPrevious}
                  className="small-button disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Merge size={14} /> Merge with previous
                </button>
                <button
                  type="button"
                  disabled={!slides[activeSlide + 1]?.lines[0]}
                  onClick={connectActiveSlideWithNext}
                  className="small-button disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Merge size={14} /> Merge with next
                </button>
                <button type="button" onClick={() => setDrawer("slide")} className="quiet-button">
                  Edit
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              {activeSlideData && (
                <SlidePreview
                  slide={activeSlideData}
                  design={design}
                  songTitle={draft.title}
                  copyrightInfo={draft.copyrightInfo}
                />
              )}
            </div>
            <div className="mt-2 flex h-[118px] shrink-0 gap-2 overflow-x-auto pb-1">
              {slides.map((slide, index) => (
                <button
                  type="button"
                  key={slide.id}
                  draggable
                  onDragStart={(event) => {
                    setDraggedSlideIndex(index);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/slide-index", String(index));
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setSlideDropIndex(index);
                  }}
                  onDragLeave={() => setSlideDropIndex(null)}
                  onDrop={(event) => {
                    event.preventDefault();
                    const from = Number(event.dataTransfer.getData("text/slide-index"));
                    if (Number.isFinite(from)) moveSlideTo(from, index);
                    setDraggedSlideIndex(null);
                    setSlideDropIndex(null);
                  }}
                  onDragEnd={() => {
                    setDraggedSlideIndex(null);
                    setSlideDropIndex(null);
                    setIsOverTrash(false);
                  }}
                  onClick={() => setActiveSlide(index)}
                  className={`w-44 shrink-0 rounded-lg border p-1 text-left ${
                    activeSlide === index
                      ? "border-slate-950 bg-slate-100"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  } ${slideDropIndex === index && draggedSlideIndex !== index ? "ring-2 ring-blue-400" : ""}`}
                >
                  <SlidePreview
                    slide={slide}
                    design={design}
                    songTitle={draft.title}
                    copyrightInfo={draft.copyrightInfo}
                    scale="thumb"
                  />
                  <div className="mt-1 flex items-center justify-between text-xs font-black text-slate-600">
                    <span>{index + 1}</span>
                    <span className={slide.warning ? "text-amber-700" : ""}>
                      {slide.warning ? "Too full" : slide.sectionNames.join(" / ")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-40 bg-slate-950/30" onClick={() => setDrawer(null)}>
          <aside
            className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
              <h2 className="text-xl font-black">{drawerTitle(drawer)}</h2>
              <button type="button" onClick={() => setDrawer(null)} className="icon-button" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-5">
              {drawer === "song" && (
                <SongDetails draft={draft} setDraft={setDraft} />
              )}
              {drawer === "more" && (
                <MoreDetails
                  undo={undo}
                  redo={redo}
                  saveDuplicate={saveDuplicate}
                  openDrawer={setDrawer}
                />
              )}
              {drawer === "flow" && (
                <FlowDetails
                  flowName={flowName}
                  setFlowName={setFlowName}
                  sections={orderedSections}
                  flow={flow}
                  addSectionToFlow={addSectionToFlow}
                  updateSection={updateSection}
                  updateSectionText={updateSectionText}
                  toggleNaturalBreak={toggleNaturalBreak}
                  splitSection={splitSection}
                  mergeWithPrevious={mergeWithPrevious}
                  duplicateSection={duplicateSection}
                  deleteSection={(sectionId) => commit({ ...draft, sections: draft.sections.filter((item) => item.id !== sectionId) })}
                  moveFlow={moveFlow}
                  removeFlow={removeFlow}
                  toggleLine={toggleLine}
                />
              )}
              {drawer === "slide" && (
                <SlideDetails
                  activeSlide={activeSlide}
                  activeSlideData={activeSlideData}
                  slideBreaks={slideBreaks}
                  setBreakBefore={setBreakBefore}
                  connectActiveSlideWithPrevious={connectActiveSlideWithPrevious}
                  connectActiveSlideWithNext={connectActiveSlideWithNext}
                  canConnectNext={Boolean(slides[activeSlide + 1]?.lines[0])}
                  updateSlideLineText={updateSlideLineText}
                />
              )}
              {drawer === "design" && <DesignControls design={design} onChange={updateDesign} />}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

function drawerTitle(drawer: Exclude<Drawer, null>) {
  return {
    more: "More options",
    song: "Song details",
    flow: "Sections and flow",
    slide: "Selected slide",
    design: "Design"
  }[drawer];
}

function MoreDetails({
  undo,
  redo,
  saveDuplicate,
  openDrawer
}: {
  undo: () => void;
  redo: () => void;
  saveDuplicate: () => void;
  openDrawer: (drawer: Drawer) => void;
}) {
  return (
    <div className="grid gap-3">
      <button type="button" className="quiet-button justify-start" onClick={undo}>
        <Undo2 size={18} /> Undo
      </button>
      <button type="button" className="quiet-button justify-start" onClick={redo}>
        <Redo2 size={18} /> Redo
      </button>
      <button type="button" className="quiet-button justify-start" onClick={saveDuplicate}>
        <Copy size={18} /> Save as duplicate
      </button>
      <button type="button" className="quiet-button justify-start" onClick={() => openDrawer("song")}>
        <Settings2 size={18} /> Song details
      </button>
      <button type="button" className="quiet-button justify-start" onClick={() => openDrawer("flow")}>
        <Layers3 size={18} /> Sections and flow
      </button>
      <button type="button" className="quiet-button justify-start" onClick={() => openDrawer("slide")}>
        <PanelRightOpen size={18} /> Selected slide
      </button>
      <button type="button" className="quiet-button justify-start" onClick={() => openDrawer("design")}>
        <SlidersHorizontal size={18} /> Design
      </button>
    </div>
  );
}

function SongDetails({
  draft,
  setDraft
}: {
  draft: Song;
  setDraft: (song: Song) => void;
}) {
  return (
    <div className="grid gap-4">
      <TextInput label="Artist or source" value={draft.artistOrSource ?? ""} onChange={(artistOrSource) => setDraft({ ...draft, artistOrSource })} />
      <TextInput label="Language" value={draft.language} onChange={(language) => setDraft({ ...draft, language })} />
      <TextInput label="Tags" value={draft.tags.join(", ")} onChange={(value) => setDraft({ ...draft, tags: value.split(",").map((tag) => tag.trim()).filter(Boolean) })} />
      <TextArea label="Notes" value={draft.notes} onChange={(notes) => setDraft({ ...draft, notes })} />
      <TextArea label="Copyright / attribution" value={draft.copyrightInfo ?? ""} onChange={(copyrightInfo) => setDraft({ ...draft, copyrightInfo })} />
    </div>
  );
}

function FlowDetails({
  flowName,
  setFlowName,
  sections,
  flow,
  addSectionToFlow,
  updateSection,
  updateSectionText,
  toggleNaturalBreak,
  splitSection,
  mergeWithPrevious,
  duplicateSection,
  deleteSection,
  moveFlow,
  removeFlow,
  toggleLine
}: {
  flowName: string;
  setFlowName: (name: string) => void;
  sections: Section[];
  flow: SelectedSectionInstance[];
  addSectionToFlow: (section: Section) => void;
  updateSection: (sectionId: string, patch: Partial<Section>) => void;
  updateSectionText: (section: Section, value: string) => void;
  toggleNaturalBreak: (section: Section, lineIndex: number) => void;
  splitSection: (section: Section, lineIndex: number) => void;
  mergeWithPrevious: (section: Section) => void;
  duplicateSection: (section: Section) => void;
  deleteSection: (sectionId: string) => void;
  moveFlow: (index: number, direction: -1 | 1) => void;
  removeFlow: (instanceId: string) => void;
  toggleLine: (instanceId: string, lineIndex: number) => void;
}) {
  return (
    <div className="grid gap-5">
      <TextInput label="Flow name" value={flowName} onChange={setFlowName} />
      <div className="grid gap-3">
        <h3 className="font-black">Available sections</h3>
        {sections.map((section) => (
          <details key={section.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <summary className="cursor-pointer font-black">{section.name}</summary>
            <div className="mt-3 grid gap-3">
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 font-bold outline-none focus:border-slate-950"
                value={section.name}
                onChange={(event) => updateSection(section.id, { name: event.target.value })}
              />
              <textarea
                dir="auto"
                className="h-28 resize-none rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
                value={section.lines.join("\n")}
                onChange={(event) => updateSectionText(section, event.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <button type="button" className="primary-button" onClick={() => addSectionToFlow(section)}>Add to slides</button>
                <button type="button" className="quiet-button" onClick={() => duplicateSection(section)}><Copy size={16} /> Duplicate</button>
                <button type="button" className="quiet-button" onClick={() => mergeWithPrevious(section)}><Merge size={16} /> Merge previous</button>
                <button type="button" className="quiet-button text-rose-700" onClick={() => deleteSection(section.id)}><Trash2 size={16} /> Delete</button>
              </div>
              <div className="grid gap-1">
                {section.lines.map((line, index) => (
                  <div key={`${section.id}-${index}`} className="rounded-lg bg-white p-2 text-sm">
                    <div dir="auto">{line || "Blank line"}</div>
                    {index < section.lines.length - 1 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" className="small-button" onClick={() => toggleNaturalBreak(section, index)}>
                          {section.lineBreaksAfter?.includes(index) ? "Remove slide break" : "Break slide here"}
                        </button>
                        <button type="button" className="small-button" onClick={() => splitSection(section, index + 1)}>
                          <Scissors size={14} /> Split section
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </details>
        ))}
      </div>
      <div className="grid gap-3">
        <h3 className="font-black">Selected order</h3>
        {flow.map((instance, index) => {
          const section = sections.find((item) => item.id === instance.sectionId);
          if (!section) return null;
          return (
            <details key={instance.id} className="rounded-lg border border-slate-200 p-3" open>
              <summary className="cursor-pointer font-black">{index + 1}. {instance.label}</summary>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="small-button" onClick={() => moveFlow(index, -1)}>Up</button>
                <button type="button" className="small-button" onClick={() => moveFlow(index, 1)}>Down</button>
                <button type="button" className="small-button text-rose-700" onClick={() => removeFlow(instance.id)}>Remove</button>
              </div>
              <div className="mt-3 grid gap-1">
                {section.lines.map((line, lineIndex) => (
                  <label key={`${instance.id}-${lineIndex}`} className="flex gap-2 rounded-lg px-2 py-1 text-sm hover:bg-slate-50">
                    <input type="checkbox" checked={instance.selectedLineIndexes.includes(lineIndex)} onChange={() => toggleLine(instance.id, lineIndex)} />
                    <span dir="auto">{line}</span>
                  </label>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

function SlideDetails({
  activeSlide,
  activeSlideData,
  slideBreaks,
  setBreakBefore,
  connectActiveSlideWithPrevious,
  connectActiveSlideWithNext,
  canConnectNext,
  updateSlideLineText
}: {
  activeSlide: number;
  activeSlideData?: ReturnType<typeof generateSlides>[number];
  slideBreaks: string[];
  setBreakBefore: (lineId: string, checked: boolean) => void;
  connectActiveSlideWithPrevious: () => void;
  connectActiveSlideWithNext: () => void;
  canConnectNext: boolean;
  updateSlideLineText: (sectionId: string, lineIndex: number, text: string) => void;
}) {
  if (!activeSlideData) return null;
  return (
    <div className="grid gap-4">
      <div className="rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-600">
        These edits affect only slide {activeSlide + 1} from the preview.
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={activeSlide === 0}
          onClick={connectActiveSlideWithPrevious}
          className="primary-button disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Merge size={16} /> Connect previous
        </button>
        <button
          type="button"
          disabled={!canConnectNext}
          onClick={connectActiveSlideWithNext}
          className="primary-button disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Merge size={16} /> Connect next
        </button>
      </div>
      <div className="grid gap-3">
        {activeSlideData.lines.map((line, index) => (
          <div key={line.id} className="rounded-lg border border-slate-200 p-3">
            {index > 0 && (
              <label className="mb-2 flex items-center gap-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={slideBreaks.includes(line.id)}
                  onChange={(event) => setBreakBefore(line.id, event.target.checked)}
                />
                Start a new slide before this line
              </label>
            )}
            <textarea
              dir="auto"
              className="min-h-20 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
              value={line.text}
              onChange={(event) => updateSlideLineText(line.sectionId, line.lineIndex, event.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {label}
      <input className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {label}
      <textarea className="min-h-24 resize-none rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
