"use client";

import Link from "next/link";
import { Home, Music2, Rows3 } from "lucide-react";
import { StudioProvider } from "./StudioProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <StudioProvider>
      <div className="site-theme-page min-h-screen bg-[#f7f4ee] text-slate-950">
        <header className="no-print sticky top-0 z-20 border-b border-slate-200 bg-[#faf8f3]/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-3 font-display text-lg font-black">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white">
                <Music2 size={22} />
              </span>
              <span className="grid leading-none">
                <span>Lineup</span>
                <span className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">by Barak Malichi</span>
              </span>
            </Link>
            <nav className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Link className="rounded-lg px-3 py-2 hover:bg-white" href="/">
                <Home className="mr-1 inline" size={16} /> Home
              </Link>
              <Link className="rounded-lg px-3 py-2 hover:bg-white" href="/lineup/index.html">
                <Rows3 className="mr-1 inline" size={16} /> Lineups
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </div>
    </StudioProvider>
  );
}
