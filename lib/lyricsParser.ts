import { createId } from "./id";
import type { Section, SectionType } from "@/types/song";

const headerPatterns: Array<[RegExp, SectionType]> = [
  [/^(?:\[(?:\s*)?)?(pre[-\s]?chorus)(?:\s*\])?:?$/i, "Pre-Chorus"],
  [/^(?:\[(?:\s*)?)?(call\s*(?:and|&)\s*response)(?:\s*\])?:?$/i, "Call and Response"],
  [/^(?:\[(?:\s*)?)?(verse)(?:\s+\d+)?(?:\s*\])?:?$/i, "Verse"],
  [/^(?:\[(?:\s*)?)?(chorus)(?:\s*\])?:?$/i, "Chorus"],
  [/^(?:\[(?:\s*)?)?(bridge)(?:\s*\])?:?$/i, "Bridge"],
  [/^(?:\[(?:\s*)?)?(tag)(?:\s*\])?:?$/i, "Tag"],
  [/^(?:\[(?:\s*)?)?(ending)(?:\s*\])?:?$/i, "Ending"],
  [/^(?:\[(?:\s*)?)?(outro)(?:\s*\])?:?$/i, "Outro"],
  [/^(?:\[(?:\s*)?)?(refrain)(?:\s*\])?:?$/i, "Refrain"]
];

function cleanHeader(raw: string) {
  return raw.replace(/^\[/, "").replace(/\]$/, "").replace(/:$/, "").trim();
}

function detectType(raw: string): SectionType | null {
  const normalized = cleanHeader(raw);
  for (const [pattern, type] of headerPatterns) {
    if (pattern.test(normalized)) return type;
  }
  return null;
}

function titleFromType(type: SectionType, count: number) {
  if (type === "Verse") return count > 1 ? `Verse ${count}` : "Verse 1";
  return count > 1 ? `${type} ${count}` : type;
}

function normalizeLines(lines: string[]) {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
}

function inferSectionType(lines: string[], repeated: boolean): SectionType {
  const text = lines.join(" ").toLowerCase();
  if (repeated) return "Chorus";
  if (/(bridge|other side|again and again)/i.test(text)) return "Bridge";
  if (lines.length <= 2) return "Tag";
  return "Verse";
}

export function parseLyrics(raw: string, songId: string): Section[] {
  const rows = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: Array<{ header?: string; lines: string[]; lineBreaksAfter: number[] }> = [];
  let current: { header?: string; lines: string[]; lineBreaksAfter: number[] } = {
    lines: [],
    lineBreaksAfter: []
  };

  const pushCurrent = () => {
    if (current.header || current.lines.some((line) => line.trim())) {
      blocks.push({
        header: current.header,
        lines: current.lines.filter(Boolean),
        lineBreaksAfter: current.lineBreaksAfter
      });
    }
    current = { lines: [], lineBreaksAfter: [] };
  };

  for (const row of rows) {
    const trimmed = row.trim();
    const type = detectType(trimmed);
    if (type) {
      pushCurrent();
      current.header = cleanHeader(trimmed);
      continue;
    }
    if (!trimmed) {
      if (current.header && current.lines.length > 0) {
        current.lineBreaksAfter.push(current.lines.length - 1);
        continue;
      }
      pushCurrent();
      continue;
    }
    current.lines.push(row.trim());
  }
  pushCurrent();

  const fingerprints = new Map<string, number>();
  blocks.forEach((block) => {
    const key = normalizeLines(block.lines);
    if (key) fingerprints.set(key, (fingerprints.get(key) ?? 0) + 1);
  });

  const typeCounts = new Map<SectionType, number>();
  return blocks
    .filter((block) => block.lines.length > 0)
    .map((block, order) => {
      const headerType = block.header ? detectType(block.header) : null;
      const repeated = (fingerprints.get(normalizeLines(block.lines)) ?? 0) > 1;
      const type = headerType ?? inferSectionType(block.lines, repeated);
      const count = (typeCounts.get(type) ?? 0) + 1;
      typeCounts.set(type, count);
      const name = block.header ? cleanHeader(block.header) : titleFromType(type, count);
      return {
        id: createId("section"),
        songId,
        type,
        name,
        lines: block.lines,
        lineBreaksAfter: block.lineBreaksAfter,
        order,
        commonlyRepeated: repeated || type === "Chorus"
      } satisfies Section;
    });
}

export function formatSectionsAsLyrics(sections: Section[]) {
  return sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((section) => `${section.name}\n${section.lines.join("\n")}`)
    .join("\n\n");
}
