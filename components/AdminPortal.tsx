"use client";

import { useEffect, useState } from "react";
import { getValidSession } from "@/lib/cloudClient";

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
