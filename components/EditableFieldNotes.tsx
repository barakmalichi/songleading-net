"use client";

import { useEffect, useState } from "react";
import { Pencil, Save, Sparkles } from "lucide-react";
import { getStoredSession } from "@/lib/cloudClient";

const ADMIN_EMAIL = "barakmalichi@gmail.com";
const FIELD_NOTES_KEY = "songleading-home-field-notes:v1";
const defaultNotes = ["Read the room", "Build momentum", "Create belonging"];

export function EditableFieldNotes() {
  const [notes, setNotes] = useState(defaultNotes);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const session = getStoredSession();
    setIsAdmin(session?.user?.email?.toLowerCase() === ADMIN_EMAIL);
    try {
      const stored = window.localStorage.getItem(FIELD_NOTES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) setNotes(parsed.slice(0, 3).map(String));
      }
    } catch {
      setNotes(defaultNotes);
    }
  }, []);

  function updateNote(index: number, value: string) {
    setNotes((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function save() {
    const cleaned = notes.map((item) => item.trim()).filter(Boolean).slice(0, 3);
    const next = cleaned.length ? cleaned : defaultNotes;
    setNotes(next);
    window.localStorage.setItem(FIELD_NOTES_KEY, JSON.stringify(next));
    setEditing(false);
  }

  return (
    <aside className="self-end rounded-2xl border border-white/20 bg-white/12 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">Field Notes</p>
        {isAdmin ? (
          <button
            type="button"
            onClick={editing ? save : () => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/18 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20"
          >
            {editing ? <Save size={14} /> : <Pencil size={14} />}
            {editing ? "Save" : "Edit"}
          </button>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3">
        {notes.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-3 rounded-xl border border-white/14 bg-slate-950/24 px-4 py-3">
            {editing ? (
              <input
                value={item}
                onChange={(event) => updateNote(index, event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/12 px-3 py-2 font-black text-white outline-none placeholder:text-white/45 focus:border-blue-200"
                placeholder="Field note"
              />
            ) : (
              <span className="font-black">{item}</span>
            )}
            <Sparkles size={18} className="shrink-0 text-blue-200" />
          </div>
        ))}
      </div>
    </aside>
  );
}
