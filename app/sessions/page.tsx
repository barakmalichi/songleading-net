"use client";

import { AppShell } from "@/components/AppShell";
import { SessionLibrary } from "@/components/SessionLibrary";

export default function SessionsPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-[1500px] px-4 py-8">
        <SessionLibrary />
      </main>
    </AppShell>
  );
}
