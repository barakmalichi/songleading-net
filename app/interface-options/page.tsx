"use client";

import { useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Edit3,
  GripVertical,
  Library,
  Mic2,
  Music2,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tags
} from "lucide-react";

const songs = [
  { title: "Anchor Of Peace", category: "Song Session", key: "G", capo: "2", mood: "Warm" },
  { title: "Open Heaven", category: "Service", key: "D", capo: "-", mood: "Big" },
  { title: "Morning Mercy", category: "Devotional", key: "C", capo: "4", mood: "Quiet" },
  { title: "Still I Sing", category: "Service", key: "A", capo: "1", mood: "Bright" },
  { title: "House Of Grace", category: "Special", key: "E", capo: "-", mood: "Lift" }
];

const lineup = [
  { title: "Morning Mercy", note: "Start soft", capo: "4" },
  { title: "Anchor Of Peace", note: "Full band in V2", capo: "2" },
  { title: "Open Heaven", note: "Tag chorus", capo: "-" }
];

const categories = ["All", "Song Session", "Service", "Devotional", "Special"];

function CapoBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex min-w-12 items-center justify-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-black text-slate-700">
      Capo {value}
    </span>
  );
}

function OptionButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-black transition ${
        active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      }`}
    >
      {active ? <Check size={16} /> : null}
      {children}
    </button>
  );
}

function SongBankPanel({ compact = false }: { compact?: boolean }) {
  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Song bank</p>
          <h2 className="text-lg font-black text-slate-950">Songs you know</h2>
        </div>
        <button className="icon-button" aria-label="Add song" title="Add song">
          <Plus size={18} />
        </button>
      </div>
      <div className="border-b border-slate-200 p-3">
        <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
          <Search size={17} className="text-slate-500" />
          <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search songs, keys, tags" />
        </label>
      </div>
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 p-3">
        {categories.map((category) => (
          <button key={category} className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-black ${category === "All" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}>
            {category}
          </button>
        ))}
      </div>
      <div className={compact ? "max-h-[342px] overflow-hidden" : ""}>
        {songs.map((song) => (
          <div key={song.title} className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 p-3 last:border-b-0">
            <div className="min-w-0">
              <p className="truncate font-black text-slate-950">{song.title}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span>{song.category}</span>
                <span>Key {song.key}</span>
                <span>{song.mood}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CapoBadge value={song.capo} />
              <button className="icon-button h-9 w-9" aria-label={`Edit ${song.title}`} title="Edit song">
                <Edit3 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LineupPanel({ title = "Friday Night Show" }: { title?: string }) {
  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">Lineup</p>
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
        </div>
        <div className="flex gap-2">
          <button className="quiet-button">
            <Save size={16} /> Save
          </button>
          <button className="primary-button">
            <Plus size={16} /> Song
          </button>
        </div>
      </div>
      <div className="grid gap-3 p-4">
        {lineup.map((song, index) => (
          <div key={song.title} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <GripVertical size={18} className="text-slate-400" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-white text-xs font-black text-slate-500">{index + 1}</span>
                <p className="truncate font-black text-slate-950">{song.title}</p>
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-500">{song.note}</p>
            </div>
            <CapoBadge value={song.capo} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 p-4 text-sm font-bold text-slate-500">
        <span>3 songs</span>
        <span>Approx. 14 min</span>
      </div>
    </section>
  );
}

function BoardOption() {
  return (
    <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
      <SongBankPanel compact />
      <LineupPanel />
    </div>
  );
}

function DashboardOption() {
  return (
    <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
      <aside className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-2">
          {[
            ["Song bank", Library],
            ["Lineups", CalendarDays],
            ["Categories", Tags],
            ["Settings", SlidersHorizontal]
          ].map(([label, Icon]) => {
            const NavIcon = Icon as typeof Library;
            return (
              <button key={label as string} className={`flex items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-black ${label === "Lineups" ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"}`}>
                <span className="flex items-center gap-2">
                  <NavIcon size={17} /> {label as string}
                </span>
                <ChevronRight size={16} />
              </button>
            );
          })}
        </div>
      </aside>
      <LineupPanel title="Sunday Service" />
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-700">Quick edit</p>
          <h2 className="text-lg font-black text-slate-950">Open Heaven</h2>
        </div>
        <div className="grid gap-3 p-4">
          <label className="grid gap-1 text-sm font-black text-slate-700">
            Category
            <select className="h-11 rounded-lg border border-slate-200 bg-white px-3 font-semibold text-slate-950">
              <option>Service</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-black text-slate-700">
            Capo
            <input className="h-11 rounded-lg border border-slate-200 px-3 font-semibold" placeholder="Optional" />
          </label>
          <label className="grid gap-1 text-sm font-black text-slate-700">
            Notes
            <textarea className="min-h-24 rounded-lg border border-slate-200 p-3 font-semibold" defaultValue="Repeat bridge if the room is with us." />
          </label>
          <button className="primary-button">
            <Save size={16} /> Save song
          </button>
        </div>
      </section>
    </div>
  );
}

function SetlistOption() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
      <section className="rounded-lg border border-slate-200 bg-[#111827] text-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-300">Tonight</p>
            <h2 className="text-2xl font-black">The lineup is the main thing</h2>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">
            <Sparkles size={16} /> Build flow
          </button>
        </div>
        <div className="grid gap-3 p-5">
          {lineup.map((song, index) => (
            <div key={song.title} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
              <span className="text-2xl font-black text-white/35">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-lg font-black">{song.title}</p>
                <p className="text-sm font-semibold text-slate-300">{song.note}</p>
              </div>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-black text-slate-950">Capo {song.capo}</span>
            </div>
          ))}
        </div>
      </section>
      <SongBankPanel compact />
    </div>
  );
}

export default function InterfaceOptionsPage() {
  const [selected, setSelected] = useState("board");

  return (
    <main className="site-theme-page min-h-screen bg-[#f6f7f4] px-4 py-6 text-slate-950">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-slate-500">
              <Mic2 size={16} /> Lineup app directions
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-normal md:text-5xl">Pick the interface that feels right.</h1>
            <p className="mt-3 max-w-2xl text-base font-semibold text-slate-600">
              Each option includes a categorized song bank, saved lineups, editable songs, and an optional capo field next to each song.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <OptionButton active={selected === "board"} onClick={() => setSelected("board")}>
              Board
            </OptionButton>
            <OptionButton active={selected === "dashboard"} onClick={() => setSelected("dashboard")}>
              Dashboard
            </OptionButton>
            <OptionButton active={selected === "setlist"} onClick={() => setSelected("setlist")}>
              Setlist first
            </OptionButton>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <Music2 className="text-teal-700" size={22} />
            <h2 className="mt-3 font-black">Board</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">Best for dragging songs from the bank into a show lineup.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <CalendarDays className="text-rose-700" size={22} />
            <h2 className="mt-3 font-black">Dashboard</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">Best if you want lineups, song editing, and categories all visible.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <Clock3 className="text-cyan-700" size={22} />
            <h2 className="mt-3 font-black">Setlist first</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">Best if the show order should feel central and performance-ready.</p>
          </div>
        </section>

        {selected === "board" ? <BoardOption /> : null}
        {selected === "dashboard" ? <DashboardOption /> : null}
        {selected === "setlist" ? <SetlistOption /> : null}
      </div>
    </main>
  );
}
