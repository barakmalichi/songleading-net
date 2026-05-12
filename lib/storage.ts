"use client";

import type { Session } from "@/types/session";
import type { Song } from "@/types/song";

export interface StudioData {
  songs: Song[];
  sessions: Session[];
}

const STORAGE_KEY = "lyric-slide-studio:v1";

export const emptyStudioData: StudioData = {
  songs: [],
  sessions: []
};

export function loadStudioData(): StudioData {
  if (typeof window === "undefined") return emptyStudioData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStudioData;
    const parsed = JSON.parse(raw) as StudioData;
    return {
      songs: Array.isArray(parsed.songs) ? parsed.songs : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : []
    };
  } catch {
    return emptyStudioData;
  }
}

export function saveStudioData(data: StudioData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
