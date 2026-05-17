"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CalendarDays, Send, X } from "lucide-react";
import { createPortal } from "react-dom";

const instituteTypes = [
  "Camp",
  "Temple / synagogue",
  "School / educational program",
  "Community",
  "Private event",
  "Other"
];

export function BookBarakDialog() {
  const dialogScrollRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instituteType, setInstituteType] = useState(instituteTypes[0]);
  const [instituteName, setInstituteName] = useState("");
  const [preferredDates, setPreferredDates] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add("account-dialog-open");
    const scrollDialogTop = () => {
      const scroller = dialogScrollRef.current;
      if (!scroller) return;
      scroller.scrollTop = 0;
    };
    const frame = window.requestAnimationFrame(scrollDialogTop);
    const fallback = window.setTimeout(scrollDialogTop, 90);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
      document.body.classList.remove("account-dialog-open");
    };
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const details = [
      `Let's meet inquiry`,
      `Name: ${name || "-"}`,
      `Email: ${email || "-"}`,
      `Phone: ${phone || "-"}`,
      `Institute/community type: ${instituteType}`,
      `Institute/community name: ${instituteName || "-"}`,
      `Possible dates: ${preferredDates || "-"}`,
      "",
      message || "-"
    ].join("\n");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          topic: "Book Barak",
          message: details
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not send request.");
      setName("");
      setEmail("");
      setPhone("");
      setInstituteType(instituteTypes[0]);
      setInstituteName("");
      setPreferredDates("");
      setMessage("");
      setStatus("Thanks - I'll be in touch soon.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="book-barak-action inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
      >
        Book Barak
        <CalendarDays size={18} />
      </button>
      {open && typeof document !== "undefined" ? createPortal(
        <div ref={dialogScrollRef} className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto overscroll-contain bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl">
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Songleading.net</p>
                <h2 className="mt-1 text-2xl font-black">Book Barak</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close booking form">
                <X size={20} />
              </button>
            </header>
            <form onSubmit={submit} className="mt-5 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-bold text-slate-600">
                  Name
                  <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" required />
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-600">
                  Email
                  <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" required />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-bold text-slate-600">
                  Phone
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" />
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-600">
                  Institute / community
                  <select value={instituteType} onChange={(event) => setInstituteType(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400">
                    {instituteTypes.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-bold text-slate-600">
                  Name of place
                  <input value={instituteName} onChange={(event) => setInstituteName(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" placeholder="Camp, temple, school..." />
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-600">
                  Dates, if you know them
                  <input value={preferredDates} onChange={(event) => setPreferredDates(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" placeholder="Optional" />
                </label>
              </div>
              <label className="grid gap-1 text-sm font-bold text-slate-600">
                What are you looking for?
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" />
              </label>
              <button
                type="submit"
                disabled={busy || !name.trim() || !email.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {busy ? "Sending..." : "Let's meet!"}
                <Send size={17} />
              </button>
              {status ? <p className="text-sm font-black leading-5 text-slate-600">{status}</p> : null}
            </form>
          </section>
        </div>,
        document.body
      ) : null}
    </>
  );
}
