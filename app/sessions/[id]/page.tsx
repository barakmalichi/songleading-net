"use client";

import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SessionBuilder } from "@/components/SessionBuilder";
import { useStudio } from "@/components/StudioProvider";
import { createBlankSession } from "@/components/SessionLibrary";
import type { Session } from "@/types/session";

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AppShell>
      <SessionRoute id={id} />
    </AppShell>
  );
}

function SessionRoute({ id }: { id: string }) {
  const { sessions, hydrated, upsertSession } = useStudio();
  const [newSession] = useState<Session | null>(() => (id === "new" ? createBlankSession() : null));

  useEffect(() => {
    if (newSession) upsertSession(newSession);
  }, [newSession, upsertSession]);

  if (!hydrated) return <main className="p-8 font-bold">Loading session...</main>;
  if (id === "new") {
    return newSession ? <SessionBuilder session={newSession} /> : null;
  }
  const session = sessions.find((item) => item.id === id);
  if (!session) return notFound();
  return <SessionBuilder session={session} />;
}
