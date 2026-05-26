"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Edit3, Send, X } from "lucide-react";
import { getValidSession } from "@/lib/cloudClient";
import { listToLines, linesToList, toolkitKindLabels, type ToolkitItem, type ToolkitKind, type ToolkitRelatedLink, type ToolkitStatus } from "@/lib/toolkitContent";

type AdminForm = Record<string, string> & {
  kind: ToolkitKind;
  status: ToolkitStatus;
  rightsConfirmed: string;
};

const emptyForm: AdminForm = {
  kind: "article",
  status: "draft",
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  heroImage: "",
  categories: "",
  tags: "",
  body: "",
  mediaUrl: "",
  description: "",
  goals: "",
  equipment: "",
  duration: "",
  ageGroup: "",
  musicalLevel: "",
  groupSize: "",
  energyLevel: "",
  location: "",
  preparation: "",
  steps: "",
  relatedSongs: "",
  relatedLinks: "",
  artist: "",
  context: "",
  whyTeach: "",
  setting: "",
  youtubeUrl: "",
  externalLinks: "",
  teachingNotes: "",
  rightsConfirmed: "false",
  lyricsChords: ""
};

function linksToLines(items: ToolkitRelatedLink[] = []) {
  return items.map((item) => `${item.label} | ${item.url}`).join("\n");
}

function linesToLinks(value: string) {
  return value
    .split("\n")
    .map((line) => {
      const [label, ...rest] = line.split("|");
      return { label: label?.trim() || "", url: rest.join("|").trim() };
    })
    .filter((item) => item.label && item.url);
}

function itemToForm(item: ToolkitItem): AdminForm {
  const base = {
    ...emptyForm,
    kind: item.kind,
    status: item.status,
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    heroImage: item.heroImage || "",
    categories: listToLines(item.categories),
    tags: listToLines(item.tags)
  };
  if (item.kind === "article") {
    return { ...base, body: item.body, mediaUrl: item.mediaUrl || "" };
  }
  if (item.kind === "activity") {
    return {
      ...base,
      description: item.description,
      goals: item.goals,
      equipment: item.equipment,
      duration: item.duration,
      ageGroup: item.ageGroup,
      musicalLevel: item.musicalLevel,
      groupSize: item.groupSize,
      energyLevel: item.energyLevel,
      location: item.location,
      preparation: item.preparation,
      steps: listToLines(item.steps),
      relatedSongs: listToLines(item.relatedSongs),
      relatedLinks: linksToLines(item.relatedLinks)
    };
  }
  return {
    ...base,
    artist: item.artist,
    context: item.context,
    whyTeach: item.whyTeach,
    ageGroup: item.ageGroup,
    musicalLevel: item.musicalLevel,
    energyLevel: item.energyLevel,
    setting: item.setting,
    youtubeUrl: item.youtubeUrl || "",
    externalLinks: listToLines(item.externalLinks),
    teachingNotes: item.teachingNotes,
    rightsConfirmed: item.rightsConfirmed ? "true" : "false",
    lyricsChords: item.lyricsChords || ""
  };
}

function Field({ label, value, onChange, rows = 1, placeholder = "" }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black">
      {label}
      {rows > 1 ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} placeholder={placeholder} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold leading-6 outline-none focus:border-blue-500" />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500" />
      )}
    </label>
  );
}

export function ToolkitAdminPanel() {
  const [items, setItems] = useState<ToolkitItem[]>([]);
  const [form, setForm] = useState<AdminForm>(emptyForm);
  const [status, setStatus] = useState("Loading Toolkit content...");
  const [busy, setBusy] = useState(false);

  const pendingItems = useMemo(() => items.filter((item) => item.status === "pending"), [items]);
  const currentItems = useMemo(() => items.filter((item) => item.kind === form.kind), [items, form.kind]);

  async function load() {
    try {
      const session = await getValidSession();
      if (!session?.access_token) throw new Error("Sign in as Barak to manage Toolkit content.");
      const response = await fetch("/api/toolkit?admin=1", {
        headers: { authorization: `Bearer ${session.access_token}` },
        cache: "no-store"
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not load Toolkit content.");
      setItems(payload.items || []);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load Toolkit content.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function update(key: keyof AdminForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function payloadFromForm(nextStatus?: ToolkitStatus) {
    return {
      ...form,
      status: nextStatus || form.status,
      categories: linesToList(form.categories),
      tags: linesToList(form.tags),
      steps: linesToList(form.steps),
      relatedSongs: linesToList(form.relatedSongs),
      relatedLinks: linesToLinks(form.relatedLinks),
      externalLinks: linesToList(form.externalLinks),
      rightsConfirmed: form.rightsConfirmed === "true",
      lyricsChords: form.rightsConfirmed === "true" ? form.lyricsChords : ""
    };
  }

  async function save(nextStatus?: ToolkitStatus) {
    setBusy(true);
    setStatus("Saving...");
    try {
      const session = await getValidSession();
      if (!session?.access_token) throw new Error("Sign in as Barak to save Toolkit content.");
      const isUpdate = Boolean(form.id && form.slug);
      const response = await fetch(isUpdate ? `/api/toolkit/${form.kind === "article" ? "articles" : form.kind === "activity" ? "activities" : "songs"}/${form.slug}` : "/api/toolkit", {
        method: isUpdate ? "PATCH" : "POST",
        headers: {
          authorization: `Bearer ${session.access_token}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(payloadFromForm(nextStatus))
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not save Toolkit content.");
      setStatus("Saved.");
      setForm(itemToForm(payload.item));
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save Toolkit content.");
    } finally {
      setBusy(false);
    }
  }

  async function quickStatus(item: ToolkitItem, nextStatus: ToolkitStatus) {
    setForm(itemToForm(item));
    await new Promise((resolve) => setTimeout(resolve, 0));
    const session = await getValidSession();
    if (!session?.access_token) {
      setStatus("Sign in as Barak to review Toolkit content.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/toolkit/${item.kind === "article" ? "articles" : item.kind === "activity" ? "activities" : "songs"}/${item.slug}`, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${session.access_token}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({ ...item, status: nextStatus })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not update Toolkit status.");
      setStatus(nextStatus === "published" ? "Published." : "Rejected.");
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not update Toolkit status.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Songleader Toolkit</p>
          <h2 className="mt-1 text-2xl font-black">Toolkit Content</h2>
          <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-slate-500">
            Publish official articles, activities, and songs. Community submissions stay pending until approved.
          </p>
        </div>
        <button type="button" onClick={() => setForm({ ...emptyForm, kind: form.kind })} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-slate-900 hover:border-blue-400">
          New {toolkitKindLabels[form.kind]}
        </button>
      </div>

      {status ? <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-900">{status}</p> : null}

      {pendingItems.length ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-lg font-black text-amber-950">Pending community submissions</h3>
          <div className="mt-3 grid gap-2">
            {pendingItems.map((item) => (
              <article key={item.id} className="flex flex-col justify-between gap-3 rounded-xl bg-white p-3 md:flex-row md:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  {item.heroImage ? <img src={item.heroImage} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" /> : <span className="h-12 w-16 shrink-0 rounded-lg bg-slate-100" />}
                  <div className="min-w-0">
                    <strong className="block truncate">{item.title}</strong>
                    <p className="text-xs font-bold text-slate-500">{toolkitKindLabels[item.kind]} · {item.submitterEmail || item.authorEmail || "No email"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setForm(itemToForm(item))} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black"><Edit3 size={14} className="inline" /> Edit</button>
                  <button type="button" disabled={busy} onClick={() => quickStatus(item, "published")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white"><Check size={14} className="inline" /> Approve</button>
                  <button type="button" disabled={busy} onClick={() => quickStatus(item, "rejected")} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white"><X size={14} className="inline" /> Reject</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid grid-cols-3 gap-2">
            {(["article", "activity", "song"] as ToolkitKind[]).map((kind) => (
              <button key={kind} type="button" onClick={() => setForm({ ...emptyForm, kind })} className={`rounded-xl px-3 py-2 text-xs font-black ${form.kind === kind ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`}>
                {kind}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            {currentItems.map((item) => (
              <button key={item.id} type="button" onClick={() => setForm(itemToForm(item))} className="rounded-xl border border-slate-200 bg-white p-3 text-left text-sm hover:border-blue-300">
                <span className="flex items-center gap-3">
                  {item.heroImage ? <img src={item.heroImage} alt="" className="h-10 w-12 shrink-0 rounded-lg object-cover" /> : null}
                  <strong>{item.title}</strong>
                </span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{item.status} · {item.sourceType}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-black">
              Type
              <select value={form.kind} onChange={(event) => update("kind", event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none">
                <option value="article">Article</option>
                <option value="activity">Activity</option>
                <option value="song">Song</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black">
              Status
              <select value={form.status} onChange={(event) => update("status", event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none">
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <Field label="Slug" value={form.slug} onChange={(value) => update("slug", value)} />
          </div>
          <Field label="Title" value={form.title} onChange={(value) => update("title", value)} />
          <Field label="Preview / excerpt" value={form.excerpt} onChange={(value) => update("excerpt", value)} rows={2} />
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[88px_1fr] md:items-center">
            <div className="h-16 w-[88px] overflow-hidden rounded-xl bg-slate-200">
              {form.heroImage ? <img src={form.heroImage} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <Field label="Hero image path" value={form.heroImage} onChange={(value) => update("heroImage", value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Categories" value={form.categories} onChange={(value) => update("categories", value)} rows={3} />
            <Field label="Tags" value={form.tags} onChange={(value) => update("tags", value)} rows={3} />
          </div>

          {form.kind === "article" ? (
            <>
              <Field label="Article body (Markdown)" value={form.body} onChange={(value) => update("body", value)} rows={9} />
              <Field label="Embedded media URL" value={form.mediaUrl} onChange={(value) => update("mediaUrl", value)} />
            </>
          ) : null}

          {form.kind === "activity" ? (
            <>
              <Field label="Goals / outcomes" value={form.goals} onChange={(value) => update("goals", value)} rows={2} />
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Equipment" value={form.equipment} onChange={(value) => update("equipment", value)} />
                <Field label="Duration" value={form.duration} onChange={(value) => update("duration", value)} />
                <Field label="Age group" value={form.ageGroup} onChange={(value) => update("ageGroup", value)} />
                <Field label="Group size" value={form.groupSize} onChange={(value) => update("groupSize", value)} />
              </div>
              <Field label="Steps" value={form.steps} onChange={(value) => update("steps", value)} rows={6} />
              <Field label="Related links" value={form.relatedLinks} onChange={(value) => update("relatedLinks", value)} rows={4} placeholder="Description | https://..." />
              <Field label="Legacy related songs / playlists" value={form.relatedSongs} onChange={(value) => update("relatedSongs", value)} rows={2} />
            </>
          ) : null}

          {form.kind === "song" ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Artist / composer" value={form.artist} onChange={(value) => update("artist", value)} />
                <Field label="YouTube URL" value={form.youtubeUrl} onChange={(value) => update("youtubeUrl", value)} />
                <Field label="Age group" value={form.ageGroup} onChange={(value) => update("ageGroup", value)} />
                <Field label="Musical level" value={form.musicalLevel} onChange={(value) => update("musicalLevel", value)} />
                <Field label="Energy" value={form.energyLevel} onChange={(value) => update("energyLevel", value)} />
                <Field label="Setting" value={form.setting} onChange={(value) => update("setting", value)} />
              </div>
              <Field label="Context" value={form.context} onChange={(value) => update("context", value)} rows={3} />
              <Field label="Why teach it" value={form.whyTeach} onChange={(value) => update("whyTeach", value)} rows={3} />
              <Field label="Teaching notes" value={form.teachingNotes} onChange={(value) => update("teachingNotes", value)} rows={4} />
              <Field label="External links" value={form.externalLinks} onChange={(value) => update("externalLinks", value)} rows={3} />
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-black">
                <input type="checkbox" checked={form.rightsConfirmed === "true"} onChange={(event) => update("rightsConfirmed", event.target.checked ? "true" : "false")} className="mt-1" />
                Rights confirmed for lyrics/chords
              </label>
              <Field label="Lyrics and chords" value={form.lyricsChords} onChange={(value) => update("lyricsChords", value)} rows={7} />
            </>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => save()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60">
              <Send size={16} />
              Save
            </button>
            <button type="button" disabled={busy} onClick={() => save("published")} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60">Save and Publish</button>
            <button type="button" disabled={busy} onClick={() => save("draft")} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-slate-900 disabled:opacity-60">Save Draft</button>
          </div>
        </div>
      </div>
    </section>
  );
}
