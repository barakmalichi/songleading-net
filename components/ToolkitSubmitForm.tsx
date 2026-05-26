"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { CheckCircle2, Lock, Plus, Trash2 } from "lucide-react";
import { getValidSession } from "@/lib/cloudClient";
import { type ToolkitKind } from "@/lib/toolkitContent";

type SubmitKind = Extract<ToolkitKind, "activity" | "song">;
type ActivityLinkRow = { id: string; label: string; url: string };

const durationOptions = ["5-10 minutes", "10-20 minutes", "20-30 minutes", "30-45 minutes", "45-60 minutes", "Flexible"];
const ageGroupOptions = ["Elementary", "Middle school", "High school", "College", "Adults", "All ages"];
const groupSizeOptions = ["Small group", "10-25", "25-60", "60-120", "120+", "Flexible"];

function makeLinkRow(): ActivityLinkRow {
  const random = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  return { id: `link_${random}`, label: "", url: "" };
}

function Field({ label, value, onChange, rows = 1, placeholder = "", required = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-700">
      {label}{required ? <span className="sr-only"> required</span> : null}
      {rows > 1 ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          required={required}
          placeholder={placeholder}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold leading-7 text-slate-950 outline-none focus:border-blue-500"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          placeholder={placeholder}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-500"
        />
      )}
    </label>
  );
}

function SelectField({ label, value, onChange, options, required = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-700">
      {label}{required ? <span className="sr-only"> required</span> : null}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-500"
      >
        <option value="">Choose...</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function splitList(value: string) {
  return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
}

export function ToolkitSubmitForm({ kind }: { kind: SubmitKind }) {
  const [signedIn, setSignedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [activityLinks, setActivityLinks] = useState<ActivityLinkRow[]>([makeLinkRow()]);
  const [form, setForm] = useState<Record<string, string>>({
    title: "",
    excerpt: "",
    categories: "",
    tags: "",
    goals: "",
    equipment: "",
    duration: "",
    ageGroup: "",
    groupSize: "",
    steps: "",
    artist: "",
    context: "",
    whyTeach: "",
    musicalLevel: "",
    energyLevel: "",
    setting: "",
    youtubeUrl: "",
    externalLinks: "",
    teachingNotes: "",
    lyricsChords: ""
  });

  useEffect(() => {
    async function checkSession() {
      const session = await getValidSession();
      setSignedIn(Boolean(session?.access_token));
      setChecking(false);
    }
    checkSession();
    const onSignedIn = () => checkSession();
    window.addEventListener("songleading-auth-signed-in", onSignedIn);
    return () => window.removeEventListener("songleading-auth-signed-in", onSignedIn);
  }, []);

  function update(key: string, value: string) {
    setPreviewing(false);
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateActivityLink(id: string, patch: Partial<ActivityLinkRow>) {
    setPreviewing(false);
    setActivityLinks((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  }

  function cleanActivityLinks() {
    return activityLinks
      .map((row) => ({ label: row.label.trim(), url: row.url.trim() }))
      .filter((row) => row.label && row.url);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (kind === "activity" && !previewing) {
      setPreviewing(true);
      return;
    }

    setBusy(true);
    try {
      const session = await getValidSession();
      if (!session?.access_token) throw new Error("Please sign in before submitting.");
      const body = {
        ...form,
        kind,
        status: "pending",
        description: "",
        musicalLevel: "",
        energyLevel: "",
        location: "",
        preparation: "",
        categories: splitList(form.categories),
        tags: splitList(form.tags),
        steps: form.steps.split("\n").map((item) => item.trim()).filter(Boolean),
        relatedSongs: [],
        relatedLinks: kind === "activity" ? cleanActivityLinks() : [],
        externalLinks: splitList(form.externalLinks),
        rightsConfirmed,
        lyricsChords: rightsConfirmed ? form.lyricsChords : ""
      };
      const response = await fetch("/api/toolkit", {
        method: "POST",
        headers: {
          authorization: `Bearer ${session.access_token}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(body)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not submit this item.");
      setMessage("Submitted. It will appear publicly after admin approval.");
      setForm((current) => Object.fromEntries(Object.keys(current).map((key) => [key, ""])));
      setActivityLinks([makeLinkRow()]);
      setPreviewing(false);
      setRightsConfirmed(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit this item.");
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-black text-slate-500">Checking your account...</p>;
  }

  if (!signedIn) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl">
        <Lock className="mx-auto text-blue-600" size={34} />
        <h1 className="mt-4 text-3xl font-black">Sign in to submit</h1>
        <p className="mt-3 text-sm font-bold leading-6 text-slate-600">Community submissions are connected to an account and reviewed before publishing.</p>
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("songleading-auth-open", { detail: { mode: "sign-in" } }))} className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white">
          Sign in
        </button>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-blue-950/8">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Community submission</p>
        <h1 className="mt-1 text-3xl font-black">{kind === "activity" ? "Share an activity" : "Submit a Song to Teach"}</h1>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-500">Send the useful parts now. Barak reviews everything before it appears publicly.</p>
      </div>
      <Field label="Title" value={form.title} onChange={(value) => update("title", value)} required />
      <Field label="Short preview" value={form.excerpt} onChange={(value) => update("excerpt", value)} rows={2} required />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Categories" value={form.categories} onChange={(value) => update("categories", value)} placeholder="Camp culture, prayer, song session" />
        <Field label="Tags" value={form.tags} onChange={(value) => update("tags", value)} placeholder="warmup, high energy" />
      </div>

      {kind === "activity" ? (
        <>
          <Field label="Goals / outcomes" value={form.goals} onChange={(value) => update("goals", value)} rows={2} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Equipment needed" value={form.equipment} onChange={(value) => update("equipment", value)} />
            <SelectField label="Duration" value={form.duration} onChange={(value) => update("duration", value)} options={durationOptions} />
            <SelectField label="Age group" value={form.ageGroup} onChange={(value) => update("ageGroup", value)} options={ageGroupOptions} />
            <SelectField label="Group size" value={form.groupSize} onChange={(value) => update("groupSize", value)} options={groupSizeOptions} />
          </div>
          <Field label="Step-by-step instructions" value={form.steps} onChange={(value) => update("steps", value)} rows={6} placeholder="One step per line" required />
          <section className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-slate-800">Useful links</h2>
                <p className="mt-1 text-xs font-bold text-slate-500">YouTube, Spotify, playlists, docs, or examples.</p>
              </div>
              <button type="button" onClick={() => setActivityLinks((current) => [...current, makeLinkRow()])} className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white" aria-label="Add link">
                <Plus size={18} />
              </button>
            </div>
            {activityLinks.map((row, index) => (
              <div key={row.id} className="grid gap-2 md:grid-cols-[1fr_1fr_40px]">
                <input value={row.label} onChange={(event) => updateActivityLink(row.id, { label: event.target.value })} placeholder="Description" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-blue-500" />
                <input value={row.url} onChange={(event) => updateActivityLink(row.id, { url: event.target.value })} placeholder="https://..." type="url" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-blue-500" />
                <button type="button" onClick={() => setActivityLinks((current) => current.length > 1 ? current.filter((item) => item.id !== row.id) : [makeLinkRow()])} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-600" aria-label={`Remove link ${index + 1}`}>
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </section>

          {previewing ? (
            <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Preview</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{form.title || "Untitled activity"}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{form.excerpt}</p>
              <div className="mt-4 grid gap-2 text-sm font-bold text-slate-700 md:grid-cols-3">
                {[form.duration, form.ageGroup, form.groupSize].filter(Boolean).map((item) => <span key={item} className="rounded-xl bg-white px-3 py-2">{item}</span>)}
              </div>
              {cleanActivityLinks().length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {cleanActivityLinks().map((link) => <span key={`${link.label}-${link.url}`} className="rounded-full bg-white px-3 py-2 text-xs font-black text-blue-700">{link.label}</span>)}
                </div>
              ) : null}
              <p className="mt-4 text-sm font-black text-slate-700">Looks good? Confirm below and it will go to review.</p>
            </section>
          ) : null}
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Artist / composer" value={form.artist} onChange={(value) => update("artist", value)} />
            <Field label="YouTube link" value={form.youtubeUrl} onChange={(value) => update("youtubeUrl", value)} />
            <Field label="Age group" value={form.ageGroup} onChange={(value) => update("ageGroup", value)} />
            <Field label="Musical level" value={form.musicalLevel} onChange={(value) => update("musicalLevel", value)} />
            <Field label="Energy level" value={form.energyLevel} onChange={(value) => update("energyLevel", value)} />
            <Field label="Setting" value={form.setting} onChange={(value) => update("setting", value)} />
          </div>
          <Field label="Context" value={form.context} onChange={(value) => update("context", value)} rows={3} required />
          <Field label="Why teach it?" value={form.whyTeach} onChange={(value) => update("whyTeach", value)} rows={3} />
          <Field label="Teaching notes" value={form.teachingNotes} onChange={(value) => update("teachingNotes", value)} rows={4} />
          <Field label="External links" value={form.externalLinks} onChange={(value) => update("externalLinks", value)} rows={3} placeholder="One link per line" />
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-700">
            <input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)} className="mt-1" />
            I own, wrote, or have permission to share these lyrics/chords.
          </label>
          <Field label="Lyrics and chords" value={form.lyricsChords} onChange={(value) => update("lyricsChords", value)} rows={7} placeholder={rightsConfirmed ? "Paste lyrics/chords here" : "Enable rights confirmation to add lyrics/chords"} />
        </>
      )}

      {message ? (
        <p className={`rounded-2xl px-4 py-3 text-sm font-black ${message.startsWith("Submitted") ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
          {message.startsWith("Submitted") ? <CheckCircle2 className="mr-2 inline" size={17} /> : null}
          {message}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-end gap-3">
        {previewing ? (
          <button type="button" onClick={() => setPreviewing(false)} className="rounded-xl border border-slate-300 px-5 py-4 text-sm font-black text-slate-900">
            Edit more
          </button>
        ) : null}
        <button type="submit" disabled={busy} className="rounded-xl bg-slate-950 px-5 py-4 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60">
          {busy ? "Submitting..." : kind === "activity" && !previewing ? "Preview activity" : "Submit for approval"}
        </button>
      </div>
    </form>
  );
}
