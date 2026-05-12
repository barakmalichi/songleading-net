import { createId } from "./id";
import { parseLyrics } from "./lyricsParser";
import { defaultFlowFromSections } from "./slideGenerator";
import { defaultDesignSettings } from "./themes";
import type { Song } from "@/types/song";

export function createBlankSong(): Song {
  const now = new Date().toISOString();
  const id = createId("song");
  return {
    id,
    title: "Untitled Song",
    artistOrSource: "",
    language: "English",
    tags: [],
    notes: "",
    copyrightInfo: "",
    lyricsRaw: "",
    sections: [],
    savedFlows: [],
    createdAt: now,
    updatedAt: now
  };
}

export function createExampleSong(): Song {
  const now = new Date().toISOString();
  const id = createId("song");
  const lyricsRaw = `Verse 1
Here is a simple gathered song
Easy words for everyone
Voices rising, hearts awake
Every line has room to breathe

Chorus
We sing together
We sing with joy
We sing together
One clear voice

Verse 2
Morning light and evening flame
Every season, still the same
Teach our hands and guide our way
Give us words enough to say

Bridge
Call us onward
Hold us near
Make the message bright and clear

Chorus
We sing together
We sing with joy
We sing together
One clear voice`;
  const sections = parseLyrics(lyricsRaw, id);
  return {
    id,
    title: "Gathered Song Example",
    artistOrSource: "Sample",
    language: "English",
    tags: ["worship", "camp"],
    notes: "A built-in example for trying the editor.",
    copyrightInfo: "Sample text for demonstration.",
    lyricsRaw,
    sections,
    savedFlows: [
      {
        id: createId("flow"),
        songId: id,
        name: "Default flow",
        selectedSectionInstances: defaultFlowFromSections(sections),
        selectedLines: {},
        slideBreaks: [],
        designSettings: defaultDesignSettings,
        createdAt: now,
        updatedAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  };
}
