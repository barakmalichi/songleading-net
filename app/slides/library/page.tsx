"use client";

import { AppShell } from "@/components/AppShell";
import { SongLibrary } from "@/components/SongLibrary";

export default function SlidesLibraryPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-[1500px] px-4 py-8">
        <SongLibrary />
      </main>
    </AppShell>
  );
}
