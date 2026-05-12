"use client";

import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SessionBuilder } from "@/components/SessionBuilder";
import { createBlankSession } from "@/components/SessionLibrary";
import { useStudio } from "@/components/StudioProvider";
import type { Session } from "@/types/session";

export default function LineupPage({ params }: { params: Promise<{ lineupId: string }> }) {
  const { lineupId } = use(params);
  return (
    <AppShell>
      <LineupRoute lineupId={lineupId} />
    </AppShell>
  );
}

function LineupRoute({ lineupId }: { lineupId: string }) {
  const { sessions, hydrated, upsertSession } = useStudio();
  const [newLineup] = useState<Session | null>(() => {
    if (lineupId !== "new") return null;
    return { ...createBlankSession(), name: "New Lineup" };
  });

  useEffect(() => {
    if (newLineup) upsertSession(newLineup);
  }, [newLineup, upsertSession]);

  if (!hydrated) return <main className="p-8 font-bold">Loading lineup...</main>;
  if (lineupId === "new") return newLineup ? <SessionBuilder session={newLineup} /> : null;
  const lineup = sessions.find((item) => item.id === lineupId);
  if (!lineup) return notFound();
  return <SessionBuilder session={lineup} />;
}
