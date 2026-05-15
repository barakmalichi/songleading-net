"use client";

import { FormEvent, useState } from "react";
import { Mail, Send, X } from "lucide-react";

const contactTopics = [
  "Training",
  "Lineup app",
  "Slides",
  "Camp / school program",
  "App issue",
  "Other"
];

export function ContactDialog() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(contactTopics[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, topic, message })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not send message.");
      setName("");
      setEmail("");
      setMessage("");
      setStatus("Message sent.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send message.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:-translate-y-0.5 hover:border-blue-400 hover:text-blue-700"
      >
        Contact us
        <Mail size={18} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl">
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Songleading.net</p>
                <h2 className="mt-1 text-2xl font-black">Contact us</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close contact form">
                <X size={20} />
              </button>
            </header>
            <form onSubmit={submit} className="mt-5 grid gap-3">
              <label className="grid gap-1 text-sm font-bold text-slate-600">
                Topic
                <select value={topic} onChange={(event) => setTopic(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400">
                  {contactTopics.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-bold text-slate-600">
                  Name
                  <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" />
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-600">
                  Email
                  <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" />
                </label>
              </div>
              <label className="grid gap-1 text-sm font-bold text-slate-600">
                Message
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" />
              </label>
              <button
                type="submit"
                disabled={busy || !message.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {busy ? "Sending..." : "Send message"}
                <Send size={17} />
              </button>
              {status ? <p className="text-sm font-black leading-5 text-slate-600">{status}</p> : null}
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
