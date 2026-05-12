"use client";

import { use } from "react";
import { AppShell } from "@/components/AppShell";
import { LineupSongSlides } from "@/components/LineupSongSlides";

export default function LineupSongSlidesPage({
  params
}: {
  params: Promise<{ lineupId: string; songId: string }>;
}) {
  const { lineupId, songId } = use(params);
  return (
    <AppShell>
      <LineupSongSlides lineupId={lineupId} lineupSongId={songId} />
    </AppShell>
  );
}
