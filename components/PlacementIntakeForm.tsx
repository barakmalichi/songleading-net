"use client";

import { useState } from "react";
import type React from "react";
import { CheckCircle2, Send } from "lucide-react";

type PlacementTrack = "camp" | "songleader";

const trackLabels: Record<PlacementTrack, string> = {
  camp: "I need a songleader",
  songleader: "I'm available to lead"
};

function Field({ label, value, onChange, rows = 1, type = "text", required = false, placeholder = "" }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-700">
      {label}
      {rows > 1 ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} required={required} placeholder={placeholder} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold leading-7 text-slate-950 outline-none focus:border-blue-500" />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-500" />
      )}
    </label>
  );
}

function formatMessage(track: PlacementTrack, values: Record<string, string>, poolPermission: boolean) {
  const lines = track === "camp"
    ? [
      ["Organization", values.organization],
      ["Role", values.role],
      ["Dates", values.dates],
      ["Location", values.location],
      ["Setting", values.setting],
      ["Budget / range", values.budget],
      ["Notes", values.notes]
    ]
    : [
      ["Availability", values.availability],
      ["Location", values.location],
      ["Experience", values.experience],
      ["Instruments", values.instruments],
      ["Links", values.links],
      ["Pool permission", poolPermission ? "Yes" : "No"],
      ["Notes", values.notes]
    ];

  return [
    `Opportunity track: ${trackLabels[track]}`,
    "",
    ...lines.map(([label, value]) => `${label}: ${value || "-"}`)
  ].join("\n");
}

export function PlacementIntakeForm({ track }: { track: PlacementTrack }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [poolPermission, setPoolPermission] = useState(track === "songleader");
  const [values, setValues] = useState<Record<string, string>>({
    name: "",
    email: "",
    organization: "",
    role: "",
    dates: "",
    location: "",
    setting: "",
    budget: "",
    availability: "",
    experience: "",
    instruments: "",
    links: "",
    notes: ""
  });

  function update(key: string, value: string) {
    setMessage("");
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          topic: track === "camp" ? "placement-camp" : "placement-songleader",
          message: formatMessage(track, values, poolPermission)
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not send this opportunity note.");
      setMessage("Sent. Barak can follow up from the opportunities inbox.");
      setValues((current) => Object.fromEntries(Object.keys(current).map((key) => [key, ""])));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send this opportunity note.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-blue-950/8">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Opportunity intake</p>
        <h2 className="mt-1 text-2xl font-black">{trackLabels[track]}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" value={values.name} onChange={(value) => update("name", value)} required />
        <Field label="Email" value={values.email} onChange={(value) => update("email", value)} type="email" required />
      </div>

      {track === "camp" ? (
        <>
          <Field label="Camp / institution" value={values.organization} onChange={(value) => update("organization", value)} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Role / need" value={values.role} onChange={(value) => update("role", value)} placeholder="Song session, services, weekend, staff training" />
            <Field label="Dates" value={values.dates} onChange={(value) => update("dates", value)} />
            <Field label="Location" value={values.location} onChange={(value) => update("location", value)} />
            <Field label="Setting" value={values.setting} onChange={(value) => update("setting", value)} placeholder="Camp, synagogue, school, retreat" />
          </div>
          <Field label="Budget / range optional" value={values.budget} onChange={(value) => update("budget", value)} />
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Availability" value={values.availability} onChange={(value) => update("availability", value)} placeholder="Summer, weekends, one-off events" />
            <Field label="Location" value={values.location} onChange={(value) => update("location", value)} />
            <Field label="Experience" value={values.experience} onChange={(value) => update("experience", value)} />
            <Field label="Instruments" value={values.instruments} onChange={(value) => update("instruments", value)} />
          </div>
          <Field label="Links" value={values.links} onChange={(value) => update("links", value)} placeholder="Website, video, Instagram, recordings" />
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-700">
            <input type="checkbox" checked={poolPermission} onChange={(event) => setPoolPermission(event.target.checked)} className="mt-1" />
            Barak may keep me in a private pool for relevant songleading opportunities.
          </label>
        </>
      )}

      <Field label="Notes" value={values.notes} onChange={(value) => update("notes", value)} rows={4} />

      {message ? (
        <p className={`rounded-2xl px-4 py-3 text-sm font-black ${message.startsWith("Sent") ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
          {message.startsWith("Sent") ? <CheckCircle2 className="mr-2 inline" size={17} /> : null}
          {message}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-4 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60">
        {busy ? "Sending..." : "Send opportunity note"}
        <Send size={17} />
      </button>
    </form>
  );
}
