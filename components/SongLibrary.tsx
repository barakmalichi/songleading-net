"use client";

import Link from "next/link";
import { Copy, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudio } from "./StudioProvider";
import { createBlankSong } from "@/lib/sampleData";
import { createId } from "@/lib/id";
import type { Song } from "@/types/song";

export function SongLibrary({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { songs, upsertSong, deleteSong } = useStudio();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter((song) =>
      [
        song.title,
        song.artistOrSource,
        song.language,
        song.notes,
        song.copyrightInfo,
        song.lyricsRaw,
        song.tags.join(" ")
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query, songs]);

  function createSong() {
    const song = createBlankSong();
    upsertSong(song);
    router.push(`/songs/${song.id}`);
  }

  function duplicate(song: Song) {
    const now = new Date().toISOString();
    const newSongId = createId("song");
    const copy: Song = {
      ...song,
      id: newSongId,
      title: `${song.title} copy`,
      sections: song.sections.map((section) => ({
        ...section,
        id: createId("section"),
        songId: newSongId
      })),
      savedFlows: [],
      createdAt: now,
      updatedAt: now
    };
    upsertSong(copy);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Song library</h2>
          <p className="text-sm text-slate-400">Reusable songs with lyrics only, no music chart fields.</p>
        </div>
        <button
          onClick={createSong}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-bold text-[#120b02] hover:bg-amber-400"
        >
          <Plus size={18} /> New song
        </button>
      </div>
      <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#111417] px-3 py-2">
        <Search size={18} className="text-slate-400" />
        <input
          className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
          placeholder="Search title, artist, tags, or lyrics"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className={`grid gap-3 ${compact ? "" : "md:grid-cols-2 xl:grid-cols-3"}`}>
        {filtered.map((song) => (
          <article key={song.id} className="rounded-lg border border-white/10 bg-[#111417] p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black">{song.title}</h3>
                <p className="text-sm text-slate-400">{song.artistOrSource || song.language}</p>
              </div>
              <span className="rounded-md bg-white/8 px-2 py-1 text-xs font-bold text-slate-300">
                {song.sections.length} sections
              </span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-slate-400">
              {song.tags.map((tag) => `#${tag}`).join(" ") || "No tags yet"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-sm font-bold text-[#120b02]"
                href={`/songs/${song.id}`}
              >
                <Pencil size={15} /> Edit
              </Link>
              <button className="rounded-lg border border-white/10 bg-[#181c20] px-3 py-2 text-sm font-bold text-slate-200" onClick={() => duplicate(song)}>
                <Copy size={15} className="mr-1 inline" /> Duplicate
              </button>
              <button className="rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-sm font-bold text-rose-300" onClick={() => deleteSong(song.id)}>
                <Trash2 size={15} className="mr-1 inline" /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
