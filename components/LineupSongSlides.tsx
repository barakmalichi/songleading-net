"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@/types/session";
import type { SavedFlow, Song } from "@/types/song";
import { createId } from "@/lib/id";
import { defaultFlowFromSections } from "@/lib/slideGenerator";
import { defaultDesignSettings } from "@/lib/themes";
import { useStudio } from "./StudioProvider";
import { SongEditor } from "./SongEditor";

const STATIC_LINEUP_STORAGE_KEY = "show-lineup-builder-state";

type StaticSlidesStatus = "no-slides" | "slides-ready" | "needs-review";

type StaticLineupSong = {
  id: string;
  type?: string;
  songId: string;
  slideSongId?: string;
  slideFlowId?: string;
  slidesStatus?: StaticSlidesStatus;
};

type StaticLineupShow = {
  id: string;
  name: string;
  date?: string;
  lineup?: StaticLineupSong[];
};

type StaticLineupBankSong = {
  id: string;
  title: string;
  key?: string;
  category?: string;
  notes?: string;
  credits?: string;
  tags?: string[];
  hebrew?: boolean;
  slideSongId?: string;
  slideFlowId?: string;
  slidesStatus?: StaticSlidesStatus;
};

type StaticLineupState = {
  activeShowId?: string;
  shows?: StaticLineupShow[];
  songs?: StaticLineupBankSong[];
};

function staticSongToStudioSong(song: StaticLineupBankSong, lineupSongId: string): Song {
  const now = new Date().toISOString();
  return {
    id: `lineup-slide-${lineupSongId}`,
    title: song.title || "Untitled Song",
    artistOrSource: song.credits || "",
    language: song.hebrew ? "Hebrew" : "English",
    tags: Array.isArray(song.tags) ? song.tags : [],
    notes: song.notes || "",
    copyrightInfo: song.credits || "",
    lyricsRaw: "",
    sections: [],
    savedFlows: [],
    createdAt: now,
    updatedAt: now
  };
}

function ensureDefaultFlow(song: Song): Song {
  if (song.savedFlows.length > 0) return song;
  const now = new Date().toISOString();
  const flow: SavedFlow = {
    id: createId("flow"),
    songId: song.id,
    name: "Default flow",
    selectedSectionInstances: defaultFlowFromSections(song.sections),
    selectedLines: {},
    slideBreaks: [],
    designSettings: defaultDesignSettings,
    createdAt: now,
    updatedAt: now
  };
  return { ...song, savedFlows: [flow], updatedAt: now };
}

export function LineupSongSlides({ lineupId, lineupSongId }: { lineupId: string; lineupSongId: string }) {
  const { sessions, songs, hydrated, upsertSong, upsertSession } = useStudio();
  const [autoCreated, setAutoCreated] = useState(false);
  const [staticState, setStaticState] = useState<StaticLineupState | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STATIC_LINEUP_STORAGE_KEY);
      setStaticState(raw ? (JSON.parse(raw) as StaticLineupState) : null);
    } catch {
      setStaticState(null);
    }
  }, []);

  const lineup = sessions.find((item) => item.id === lineupId);
  const lineupSong = lineup?.sessionSongs.find((item) => item.id === lineupSongId);
  const studioSourceSong = songs.find((item) => item.id === lineupSong?.songId);
  const staticLineup =
    staticState?.shows?.find((show) => show.id === lineupId) ??
    staticState?.shows?.find((show) => show.id === staticState.activeShowId);
  const staticLineupSong = staticLineup?.lineup?.find(
    (item) => item.id === lineupSongId && item.type !== "note"
  );
  const staticBankSong = staticState?.songs?.find((item) => item.id === staticLineupSong?.songId);
  const staticSourceSong =
    staticBankSong && staticLineupSong ? staticSongToStudioSong(staticBankSong, staticLineupSong.id) : undefined;
  const sourceSong = studioSourceSong ?? staticSourceSong;
  const linkedSlideSongIdFromLineup = lineupSong?.slideSongId ?? staticLineupSong?.slideSongId;
  const slideSong = songs.find((item) => item.id === linkedSlideSongIdFromLineup);
  const connectedSong = slideSong ?? undefined;
  const lineupName = lineup?.name ?? staticLineup?.name ?? "Lineup";
  const backHref = "/";

  function updateLineup(session: Session) {
    upsertSession({ ...session, updatedAt: new Date().toISOString() });
  }

  function updateStaticLineup(slideSongId: string, slideFlowId: string | undefined, status: StaticSlidesStatus) {
    if (!staticState || !staticLineup || !staticLineupSong) return;
    const nextState: StaticLineupState = {
      ...staticState,
      songs: (staticState.songs ?? []).map((song) =>
        song.id === staticLineupSong.songId
          ? {
              ...song,
              slideSongId,
              slideFlowId,
              slidesStatus: status
            }
          : song
      ),
      shows: (staticState.shows ?? []).map((show) =>
        show.id === staticLineup.id
          ? {
              ...show,
              lineup: (show.lineup ?? []).map((item) =>
                item.id === staticLineupSong.id
                  ? {
                      ...item,
                      slideSongId,
                      slideFlowId,
                      slidesStatus: status
                    }
                  : item
              )
            }
          : show
      )
    };
    window.localStorage.setItem(STATIC_LINEUP_STORAGE_KEY, JSON.stringify(nextState));
    setStaticState(nextState);
  }

  function connect(song: Song, status: "no-slides" | "slides-ready" | "needs-review" = "slides-ready") {
    const readySong = ensureDefaultFlow(song);
    if (readySong !== song) upsertSong(readySong);
    const flowId = readySong.savedFlows[0]?.id;
    if (lineup && lineupSong) {
      updateLineup({
        ...lineup,
        sessionSongs: lineup.sessionSongs.map((item) =>
          item.id === lineupSong.id
            ? {
                ...item,
                slideSongId: readySong.id,
                slideFlowId: flowId,
                savedFlowId: flowId,
                slidesStatus: status
              }
            : item
        )
      });
      return;
    }
    updateStaticLineup(readySong.id, flowId, status);
    upsertSong(readySong);
  }

  function createForThisSong() {
    if (!sourceSong) return;
    upsertSong(sourceSong);
    connect(sourceSong, sourceSong.sections.length > 0 ? "needs-review" : "no-slides");
  }

  function markSaved(savedSong: Song, flowId: string) {
    const status: StaticSlidesStatus = savedSong.sections.length > 0 ? "slides-ready" : "no-slides";
    if (lineup && lineupSong) {
      updateLineup({
        ...lineup,
        sessionSongs: lineup.sessionSongs.map((item) =>
          item.id === lineupSong.id
            ? {
                ...item,
                slideSongId: savedSong.id,
                slideFlowId: flowId,
                savedFlowId: flowId,
                slidesStatus: status
              }
            : item
        )
      });
      return;
    }
    updateStaticLineup(savedSong.id, flowId, status);
  }

  useEffect(() => {
    if (!hydrated || autoCreated || connectedSong || !sourceSong || (!lineupSong && !staticLineupSong)) return;
    setAutoCreated(true);
    createForThisSong();
  }, [hydrated, autoCreated, connectedSong, sourceSong, lineupSong, staticLineupSong]);

  if (!hydrated) return <main className="p-8 font-bold">Loading slides...</main>;
  if (!sourceSong || (!lineupSong && !staticLineupSong)) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-3xl font-black">Lineup song not found</h1>
        <Link className="mt-4 inline-block rounded-lg bg-slate-950 px-4 py-2 font-bold text-white" href="/">
          Back to lineups
        </Link>
      </main>
    );
  }

  if (connectedSong) {
    return (
      <SongEditor
        song={connectedSong}
        backHref={backHref}
        contextLabel={`Slides for ${sourceSong.title} in ${lineupName}`}
        onSaved={markSaved}
      />
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0f14] p-8 text-slate-100">
      <div className="rounded-lg border border-white/10 bg-[#111820] px-6 py-5 shadow-2xl">
        <p className="text-sm font-black uppercase tracking-wide text-amber-400">Lineup slides</p>
        <h1 className="mt-1 text-2xl font-black">Opening slide editor...</h1>
        <p className="mt-2 text-sm text-slate-400">{sourceSong.title} · {lineupName}</p>
      </div>
    </main>
  );
}
