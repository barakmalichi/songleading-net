"use client";

import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SongEditor } from "@/components/SongEditor";
import { useStudio } from "@/components/StudioProvider";
import type { Song } from "@/types/song";
import { createBlankSong } from "@/lib/sampleData";

export default function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AppShell>
      <SongRoute id={id} />
    </AppShell>
  );
}

function SongRoute({ id }: { id: string }) {
  const { songs, hydrated, upsertSong } = useStudio();
  const [newSong] = useState<Song | null>(() => (id === "new" ? createBlankSong() : null));

  useEffect(() => {
    if (newSong) upsertSong(newSong);
  }, [newSong, upsertSong]);

  if (!hydrated) return <main className="p-8 font-bold">Loading song...</main>;
  if (id === "new") {
    return newSong ? <SongEditor song={newSong} /> : null;
  }
  const song = songs.find((item) => item.id === id);
  if (!song) return notFound();
  return <SongEditor song={song} />;
}
