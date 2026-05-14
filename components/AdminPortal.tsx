"use client";

import { useEffect, useState } from "react";
import { getValidSession } from "@/lib/cloudClient";
import {
  defaultHomepageAboutContent,
  homepageAboutStorageKey,
  normalizeHomepageAboutContent,
  type HomepageAboutContent
} from "@/lib/homepageContent";

type AdminUser = {
  id: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string;
  user_metadata?: Record<string, unknown>;
};

type ContactMessage = {
  id: string;
  created_at?: string;
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
};

type AdminDashboardData = {
  users: AdminUser[];
  contacts: ContactMessage[];
  workspaceCount: number;
};

function formatDate(value?: string) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

function metadataValue(user: AdminUser, key: string) {
  const value = user.user_metadata?.[key];
  return typeof value === "string" ? value : "";
}

export function AdminPortal() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [message, setMessage] = useState("Loading admin portal...");
  const [aboutContent, setAboutContent] = useState<HomepageAboutContent>(defaultHomepageAboutContent);
  const [aboutSaved, setAboutSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const session = await getValidSession();
        if (!session?.access_token) {
          setMessage("Sign in as Barak to open the admin portal.");
          return;
        }
        const response = await fetch("/api/admin/dashboard", {
          headers: { authorization: `Bearer ${session.access_token}` },
          cache: "no-store"
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Could not load admin portal.");
        setData(payload);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load the admin portal.");
      }
    }
    load();
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(homepageAboutStorageKey);
      if (stored) setAboutContent(normalizeHomepageAboutContent(JSON.parse(stored) as Partial<HomepageAboutContent>));
    } catch {
      setAboutContent(defaultHomepageAboutContent);
    }
  }, []);

  function saveAboutContent() {
    const nextContent = normalizeHomepageAboutContent(aboutContent);
    setAboutContent(nextContent);
    window.localStorage.setItem(homepageAboutStorageKey, JSON.stringify(nextContent));
    window.dispatchEvent(new Event("homepage-about-updated"));
    setAboutSaved(true);
    window.setTimeout(() => setAboutSaved(false), 1800);
  }

  return (
    <main className="min-h-screen bg-[#f7f2e7] px-5 py-8 text-slate-950 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">Songleading.net</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">Admin Portal</h1>
            <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-slate-600">
              Private view for users, saved workspaces, and contact messages.
            </p>
          </div>
          <a href="/" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:border-blue-400">
            Back to Songleading.net
          </a>
        </header>

        {message ? (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-black text-amber-900">
            {message}
          </section>
        ) : null}

        {data ? (
          <div className="mt-6 grid gap-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Homepage</p>
                  <h2 className="mt-1 text-2xl font-black">About Section</h2>
                  <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-slate-500">
                    Edit the public About block. The portrait field can point to any image in the site, like /media/generated/barak-about-portrait.png.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={saveAboutContent}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700"
                >
                  {aboutSaved ? "Saved" : "Save About"}
                </button>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2 text-sm font-black">
                  Name
                  <input
                    value={aboutContent.name}
                    onChange={(event) => setAboutContent((current) => ({ ...current, name: event.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                  />
                </label>
                <label className="grid gap-2 text-sm font-black">
                  Portrait image path
                  <input
                    value={aboutContent.image}
                    onChange={(event) => setAboutContent((current) => ({ ...current, image: event.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                  />
                </label>
                <label className="grid gap-2 text-sm font-black lg:col-span-2">
                  Title
                  <input
                    value={aboutContent.title}
                    onChange={(event) => setAboutContent((current) => ({ ...current, title: event.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                  />
                </label>
                <label className="grid gap-2 text-sm font-black lg:col-span-2">
                  Bio
                  <textarea
                    value={aboutContent.text}
                    onChange={(event) => setAboutContent((current) => ({ ...current, text: event.target.value }))}
                    rows={4}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold leading-6 outline-none focus:border-blue-500"
                  />
                </label>
                <label className="grid gap-2 text-sm font-black lg:col-span-2">
                  Highlights
                  <input
                    value={aboutContent.highlights.join(", ")}
                    onChange={(event) => setAboutContent((current) => ({ ...current, highlights: event.target.value.split(",") }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                  />
                </label>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Users</p>
                <strong className="mt-2 block text-4xl font-black">{data.users.length}</strong>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Cloud workspaces</p>
                <strong className="mt-2 block text-4xl font-black">{data.workspaceCount}</strong>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Contact messages</p>
                <strong className="mt-2 block text-4xl font-black">{data.contacts.length}</strong>
              </article>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-black">Users</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                      <th className="border-b border-slate-200 py-3 pr-4">Email</th>
                      <th className="border-b border-slate-200 py-3 pr-4">Name</th>
                      <th className="border-b border-slate-200 py-3 pr-4">Phone</th>
                      <th className="border-b border-slate-200 py-3 pr-4">Country</th>
                      <th className="border-b border-slate-200 py-3 pr-4">Instrument</th>
                      <th className="border-b border-slate-200 py-3 pr-4">Community</th>
                      <th className="border-b border-slate-200 py-3 pr-4">Use</th>
                      <th className="border-b border-slate-200 py-3 pr-4">Last sign in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((user) => (
                      <tr key={user.id} className="align-top">
                        <td className="border-b border-slate-100 py-3 pr-4 font-black">{user.email}</td>
                        <td className="border-b border-slate-100 py-3 pr-4">{metadataValue(user, "full_name")}</td>
                        <td className="border-b border-slate-100 py-3 pr-4">{metadataValue(user, "phone")}</td>
                        <td className="border-b border-slate-100 py-3 pr-4">{metadataValue(user, "country")}</td>
                        <td className="border-b border-slate-100 py-3 pr-4">{metadataValue(user, "instrument")}</td>
                        <td className="border-b border-slate-100 py-3 pr-4">{metadataValue(user, "community_institution")}</td>
                        <td className="border-b border-slate-100 py-3 pr-4">{metadataValue(user, "main_use_case")}</td>
                        <td className="border-b border-slate-100 py-3 pr-4">{formatDate(user.last_sign_in_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-black">Contact Messages</h2>
              <div className="mt-4 grid gap-3">
                {data.contacts.length ? data.contacts.map((contact) => (
                  <article key={contact.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong>{contact.topic || "Message"}</strong>
                      <span className="text-xs font-bold text-slate-500">{formatDate(contact.created_at)}</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-slate-600">{contact.name || "No name"} · {contact.email || "No email"}</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{contact.message}</p>
                  </article>
                )) : (
                  <p className="text-sm font-bold text-slate-500">No contact messages yet.</p>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
