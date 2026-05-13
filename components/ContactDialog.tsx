"use client";

import { useMemo, useState } from "react";
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

  const mailto = useMemo(() => {
    const subject = `Songleading.net contact: ${topic}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Topic: ${topic}`,
      "",
      message
    ].join("\n");
    return `mailto:barakmalichi@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [email, message, name, topic]);

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
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm">
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
            <div className="mt-5 grid gap-3">
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
              <a
                href={mailto}
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Send message
                <Send size={17} />
              </a>
              <p className="text-xs font-bold leading-5 text-slate-500">This opens your email app with the message prepared.</p>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
