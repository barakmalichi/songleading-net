"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { Session } from "@/types/session";
import type { Song } from "@/types/song";
import {
  emptyStudioData,
  loadStudioData,
  saveStudioData,
  type StudioData
} from "@/lib/storage";
import { createExampleSong } from "@/lib/sampleData";

type StudioContextValue = StudioData & {
  hydrated: boolean;
  upsertSong: (song: Song) => void;
  deleteSong: (songId: string) => void;
  upsertSession: (session: Session) => void;
  deleteSession: (sessionId: string) => void;
};

const StudioContext = createContext<StudioContextValue | null>(null);

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<StudioData>(emptyStudioData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStudioData();
    const normalized = {
      ...stored,
      sessions: stored.sessions.map((session) => ({
        ...session,
        sessionSongs: session.sessionSongs.map((item) => ({
          ...item,
          slideSongId: item.slideSongId ?? item.songId,
          slideFlowId: item.slideFlowId ?? item.savedFlowId,
          slidesStatus:
            item.slidesStatus ??
            (item.savedFlowId || item.slideFlowId ? "slides-ready" : "no-slides")
        }))
      }))
    };
    if (normalized.songs.length === 0 && normalized.sessions.length === 0) {
      setData({ songs: [createExampleSong()], sessions: [] });
    } else {
      setData(normalized);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveStudioData(data);
  }, [data, hydrated]);

  const upsertSong = useCallback((song: Song) => {
    setData((current) => ({
      ...current,
      songs: current.songs.some((item) => item.id === song.id)
        ? current.songs.map((item) => (item.id === song.id ? song : item))
        : [song, ...current.songs]
    }));
  }, []);

  const deleteSong = useCallback((songId: string) => {
    setData((current) => ({
      songs: current.songs.filter((song) => song.id !== songId),
      sessions: current.sessions.map((session) => ({
        ...session,
        sessionSongs: session.sessionSongs.filter((item) => item.songId !== songId)
      }))
    }));
  }, []);

  const upsertSession = useCallback((session: Session) => {
    setData((current) => ({
      ...current,
      sessions: current.sessions.some((item) => item.id === session.id)
        ? current.sessions.map((item) => (item.id === session.id ? session : item))
        : [session, ...current.sessions]
    }));
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setData((current) => ({
      ...current,
      sessions: current.sessions.filter((session) => session.id !== sessionId)
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...data,
      hydrated,
      upsertSong,
      deleteSong,
      upsertSession,
      deleteSession
    }),
    [data, hydrated, upsertSong, deleteSong, upsertSession, deleteSession]
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) throw new Error("useStudio must be used inside StudioProvider");
  return context;
}
