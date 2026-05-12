"use client";

import Link from "next/link";
import { Copy, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudio } from "./StudioProvider";
import { createId } from "@/lib/id";
import { defaultDesignSettings } from "@/lib/themes";
import type { Session } from "@/types/session";

export function createBlankSession(): Session {
  const now = new Date().toISOString();
  return {
    id: createId("session"),
    name: "Untitled Lineup",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    sessionSongs: [],
    globalDesignSettings: defaultDesignSettings,
    createdAt: now,
    updatedAt: now
  };
}

export function SessionLibrary({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { sessions, songs, upsertSession, deleteSession } = useStudio();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((session) =>
      [session.name, session.date, session.notes]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query, sessions]);

  function createSession() {
    const session = createBlankSession();
    upsertSession(session);
    router.push(`/lineups/${session.id}`);
  }

  function duplicate(session: Session) {
    const now = new Date().toISOString();
    const newSessionId = createId("session");
    const copy: Session = {
      ...session,
      id: newSessionId,
      name: `${session.name} copy`,
      sessionSongs: session.sessionSongs.map((item, order) => ({
        ...item,
        id: createId("sessionSong"),
        sessionId: newSessionId,
        order
      })),
      createdAt: now,
      updatedAt: now
    };
    upsertSession(copy);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Lineups</h2>
          <p className="text-sm text-slate-400">Shows with songs, slide status, and linked lyric slide flows.</p>
        </div>
        <button
          onClick={createSession}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-bold text-[#120b02] hover:bg-amber-400"
        >
          <Plus size={18} /> New lineup
        </button>
      </div>
      <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#111417] px-3 py-2">
        <Search size={18} className="text-slate-400" />
        <input
          className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
          placeholder="Search lineups"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className={`grid gap-3 ${compact ? "" : "md:grid-cols-2 xl:grid-cols-3"}`}>
        {filtered.map((session) => (
          <article key={session.id} className="rounded-lg border border-white/10 bg-[#111417] p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black">{session.name}</h3>
                <p className="text-sm text-slate-400">{session.date || "No date"}</p>
              </div>
              <span className="rounded-md bg-white/8 px-2 py-1 text-xs font-bold text-slate-300">
                {session.sessionSongs.length} songs
              </span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-slate-400">
              {session.sessionSongs
                .map((item) => songs.find((song) => song.id === item.songId)?.title)
                .filter(Boolean)
                .join(" -> ") || "No songs added yet"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-sm font-bold text-[#120b02]"
                href={`/lineups/${session.id}`}
              >
                <Pencil size={15} /> Edit
              </Link>
              <button className="rounded-lg border border-white/10 bg-[#181c20] px-3 py-2 text-sm font-bold text-slate-200" onClick={() => duplicate(session)}>
                <Copy size={15} className="mr-1 inline" /> Duplicate
              </button>
              <button className="rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-sm font-bold text-rose-300" onClick={() => deleteSession(session.id)}>
                <Trash2 size={15} className="mr-1 inline" /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
