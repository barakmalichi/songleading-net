import type {
  LyricSlide,
  Section,
  SelectedSectionInstance,
  SlideLine
} from "@/types/song";
import { createId } from "./id";

export function defaultFlowFromSections(
  sections: Section[]
): SelectedSectionInstance[] {
  return sections
    .filter((section) => !section.hidden)
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      id: createId("instance"),
      sectionId: section.id,
      label: section.name,
      repeatIndex: 1,
      selectedLineIndexes: section.lines.map((_, index) => index)
    }));
}

export function flattenFlow(
  sections: Section[],
  flow: SelectedSectionInstance[]
): SlideLine[] {
  return flow.flatMap((instance) => {
    const section = sections.find((candidate) => candidate.id === instance.sectionId);
    if (!section) return [];
    return instance.selectedLineIndexes
      .filter((lineIndex) => section.lines[lineIndex] !== undefined)
      .map((lineIndex) => ({
        id: `${instance.id}:${lineIndex}`,
        text: section.lines[lineIndex],
        sectionId: section.id,
        sectionName: section.name,
        instanceId: instance.id,
        lineIndex
      }));
  });
}

function shouldBreakByContent(previous: SlideLine, current: SlideLine) {
  return previous.sectionId !== current.sectionId || previous.text.length + current.text.length > 82;
}

function sectionWantsBreak(sections: Section[], previous: SlideLine) {
  const section = sections.find((candidate) => candidate.id === previous.sectionId);
  return Boolean(section?.lineBreaksAfter?.includes(previous.lineIndex));
}

export function generateSlides(
  title: string,
  sections: Section[],
  flow: SelectedSectionInstance[],
  manualBreaks: string[]
): LyricSlide[] {
  const lines = flattenFlow(sections, flow);
  if (lines.length === 0) {
    return [
      {
        id: "empty-slide",
        title,
        sectionNames: [],
        lines: [],
        warning: "Select lyrics to create slides."
      }
    ];
  }

  const slides: LyricSlide[] = [];
  let current: SlideLine[] = [];

  lines.forEach((line, index) => {
    const previous = lines[index - 1];
    const forceBreak = manualBreaks.includes(line.id);
    const suppressBreak = manualBreaks.includes(`no:${line.id}`);
    const naturalBreak = previous ? sectionWantsBreak(sections, previous) : false;
    const autoBreak =
      current.length >= 4 ||
      (current.length >= 2 && previous && shouldBreakByContent(previous, line));
    if (current.length > 0 && !suppressBreak && (forceBreak || naturalBreak || autoBreak)) {
      slides.push(makeSlide(title, current));
      current = [];
    }
    current.push(line);
  });

  if (current.length > 0) slides.push(makeSlide(title, current));
  return slides;
}

function makeSlide(title: string, lines: SlideLine[]): LyricSlide {
  const sectionNames = Array.from(new Set(lines.map((line) => line.sectionName)));
  const longLine = lines.some((line) => line.text.length > 54);
  const stableId = lines.length
    ? `slide-${lines.map((line) => line.id.replace(/[^a-zA-Z0-9_-]/g, "_")).join("--")}`
    : "empty-slide";
  return {
    id: stableId,
    title,
    sectionNames,
    lines,
    warning:
      lines.length > 5 || (lines.length > 4 && longLine)
        ? "This slide may be crowded."
        : undefined
  };
}
