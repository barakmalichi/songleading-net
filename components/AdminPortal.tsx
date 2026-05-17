"use client";

import { useEffect, useState } from "react";
import { getValidSession } from "@/lib/cloudClient";
import {
  defaultHomepageContent,
  normalizeHomepageContent,
  type HomepageCardContent,
  type HomepageContent
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

function listToLines(items: string[]) {
  return items.join("\n");
}

function linesToList(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function cardsToLines(items: HomepageCardContent[]) {
  return items.map((item) => `${item.title} | ${item.text}`).join("\n");
}

function linesToCards(value: string) {
  return value
    .split("\n")
    .map((line) => {
      const [title, ...rest] = line.split("|");
      return { title: title?.trim() || "", text: rest.join("|").trim() };
    })
    .filter((item) => item.title || item.text);
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  help?: string;
};

function Field({ label, value, onChange, rows = 1, help }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-black">
      {label}
      {rows > 1 ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold leading-6 outline-none focus:border-blue-500"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
        />
      )}
      {help ? <span className="-mt-1 text-xs font-bold leading-5 text-slate-500">{help}</span> : null}
    </label>
  );
}

export function AdminPortal() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [message, setMessage] = useState("Loading admin portal...");
  const [homeContent, setHomeContent] = useState<HomepageContent>(defaultHomepageContent);
  const [homeStatus, setHomeStatus] = useState("");

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
        const contentResponse = await fetch("/api/homepage/content", { cache: "no-store" });
        const contentPayload = await contentResponse.json().catch(() => ({}));
        if (contentResponse.ok) setHomeContent(normalizeHomepageContent(contentPayload.content || {}));
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load the admin portal.");
      }
    }
    load();
  }, []);

  async function saveHomeContent() {
    const nextContent = normalizeHomepageContent(homeContent);
    try {
      const session = await getValidSession();
      if (!session?.access_token) throw new Error("Sign in as Barak to save homepage edits.");
      setHomeStatus("Saving...");
      const response = await fetch("/api/homepage/content", {
        method: "PUT",
        headers: {
          authorization: `Bearer ${session.access_token}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({ content: nextContent })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not save homepage edits.");
      const savedContent = normalizeHomepageContent(payload.content || nextContent);
      setHomeContent(savedContent);
      window.dispatchEvent(new CustomEvent("homepage-content-updated", { detail: savedContent }));
      setHomeStatus("Saved online.");
    } catch (error) {
      setHomeStatus(error instanceof Error ? error.message : "Could not save homepage edits.");
    }
  }

  async function resizeImageToDataUrl(file: File) {
    const image = new Image();
    const source = URL.createObjectURL(file);
    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Could not read that image."));
        image.src = source;
      });
      const maxSize = 1400;
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not prepare that image.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.86);
    } finally {
      URL.revokeObjectURL(source);
    }
  }

  async function handleImageChange(path: "hero" | "resources" | "training" | "community" | "about", file?: File) {
    if (!file) return;
    try {
      setHomeStatus("Preparing image...");
      const image = await resizeImageToDataUrl(file);
      setHomeContent((current) => {
        if (path === "about") return { ...current, about: { ...current.about, image } };
        return { ...current, [path]: { ...current[path], image } };
      });
      setHomeStatus("Image ready. Save homepage to publish it online.");
    } catch (error) {
      setHomeStatus(error instanceof Error ? error.message : "Could not prepare that image.");
    }
  }

  function updateSection<Key extends keyof HomepageContent>(key: Key, patch: Partial<HomepageContent[Key]>) {
    setHomeContent((current) => ({
      ...current,
      [key]: {
        ...(current[key] as object),
        ...patch
      } as HomepageContent[Key]
    }));
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
                  <h2 className="mt-1 text-2xl font-black">Homepage Content</h2>
                  <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-slate-500">
                    Edit the public homepage text and pictures from this admin account. Paste an image path, or upload a picture and save.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={saveHomeContent}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700"
                >
                  Save Homepage
                </button>
              </div>
              {homeStatus ? <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-900">{homeStatus}</p> : null}
              <div className="mt-5 grid gap-5">
                <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-900">
                      <img src={homeContent.hero.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:border-blue-400">
                      Upload hero picture
                      <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleImageChange("hero", event.target.files?.[0])} />
                    </label>
                  </div>
                  <div className="grid gap-4">
                    <h3 className="text-xl font-black">Hero</h3>
                    <Field label="Hero image path" value={homeContent.hero.image} onChange={(image) => updateSection("hero", { image })} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Headline before shine" value={homeContent.hero.headlinePrefix} onChange={(headlinePrefix) => updateSection("hero", { headlinePrefix })} />
                      <Field label="Shining word" value={homeContent.hero.shineWord} onChange={(shineWord) => updateSection("hero", { shineWord })} />
                    </div>
                    <Field label="Subheadline" value={homeContent.hero.subheadline} onChange={(subheadline) => updateSection("hero", { subheadline })} />
                    <Field label="Intro text" value={homeContent.hero.text} onChange={(text) => updateSection("hero", { text })} rows={2} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Primary button" value={homeContent.hero.primaryLabel} onChange={(primaryLabel) => updateSection("hero", { primaryLabel })} />
                      <Field label="Secondary button" value={homeContent.hero.secondaryLabel} onChange={(secondaryLabel) => updateSection("hero", { secondaryLabel })} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-slate-200 pt-5 lg:grid-cols-[240px_1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-900">
                      <img src={homeContent.resources.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:border-blue-400">
                      Upload resources picture
                      <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleImageChange("resources", event.target.files?.[0])} />
                    </label>
                  </div>
                  <div className="grid gap-4">
                    <h3 className="text-xl font-black">Resources</h3>
                    <Field label="Image path" value={homeContent.resources.image} onChange={(image) => updateSection("resources", { image })} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Image eyebrow" value={homeContent.resources.imageEyebrow} onChange={(imageEyebrow) => updateSection("resources", { imageEyebrow })} />
                      <Field label="Section eyebrow" value={homeContent.resources.eyebrow} onChange={(eyebrow) => updateSection("resources", { eyebrow })} />
                    </div>
                    <Field label="Image title" value={homeContent.resources.imageTitle} onChange={(imageTitle) => updateSection("resources", { imageTitle })} />
                    <Field label="Section title" value={homeContent.resources.title} onChange={(title) => updateSection("resources", { title })} />
                    <Field label="Section text" value={homeContent.resources.text} onChange={(text) => updateSection("resources", { text })} rows={2} />
                    <Field label="Badges" value={listToLines(homeContent.resources.badges)} onChange={(value) => updateSection("resources", { badges: linesToList(value) })} rows={3} help="One badge per line." />
                    <Field label="Resource cards" value={cardsToLines(homeContent.resources.cards)} onChange={(value) => updateSection("resources", { cards: linesToCards(value) })} rows={6} help="One card per line. Use: Title | Description" />
                  </div>
                </div>

                <div className="grid gap-4 border-t border-slate-200 pt-5 lg:grid-cols-[240px_1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-900">
                      <img src={homeContent.training.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:border-blue-400">
                      Upload training picture
                      <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleImageChange("training", event.target.files?.[0])} />
                    </label>
                  </div>
                  <div className="grid gap-4">
                    <h3 className="text-xl font-black">Training</h3>
                    <Field label="Image path" value={homeContent.training.image} onChange={(image) => updateSection("training", { image })} />
                    <Field label="Eyebrow" value={homeContent.training.eyebrow} onChange={(eyebrow) => updateSection("training", { eyebrow })} />
                    <Field label="Title" value={homeContent.training.title} onChange={(title) => updateSection("training", { title })} />
                    <Field label="Text" value={homeContent.training.text} onChange={(text) => updateSection("training", { text })} rows={3} />
                    <Field label="Second text" value={homeContent.training.secondText} onChange={(secondText) => updateSection("training", { secondText })} rows={3} />
                    <Field label="Desktop pills" value={listToLines(homeContent.training.pills)} onChange={(value) => updateSection("training", { pills: linesToList(value) })} rows={4} help="Shown on desktop only." />
                  </div>
                </div>

                <div className="grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2">
                  <div className="grid gap-4">
                    <h3 className="text-xl font-black">Tools</h3>
                    <Field label="Eyebrow" value={homeContent.tools.eyebrow} onChange={(eyebrow) => updateSection("tools", { eyebrow })} />
                    <Field label="Title" value={homeContent.tools.title} onChange={(title) => updateSection("tools", { title })} />
                    <Field label="Text" value={homeContent.tools.text} onChange={(text) => updateSection("tools", { text })} rows={3} />
                    <Field label="Button label" value={homeContent.tools.buttonLabel} onChange={(buttonLabel) => updateSection("tools", { buttonLabel })} />
                    <Field label="Preview eyebrow" value={homeContent.tools.previewEyebrow} onChange={(previewEyebrow) => updateSection("tools", { previewEyebrow })} />
                    <Field label="Preview title" value={homeContent.tools.previewTitle} onChange={(previewTitle) => updateSection("tools", { previewTitle })} />
                  </div>
                  <div className="grid gap-4">
                    <h3 className="text-xl font-black">Footer</h3>
                    <Field label="Footer text" value={homeContent.footer.text} onChange={(text) => updateSection("footer", { text })} />
                    <Field label="Footer note" value={homeContent.footer.note} onChange={(note) => updateSection("footer", { note })} />
                  </div>
                </div>

                <div className="grid gap-4 border-t border-slate-200 pt-5 lg:grid-cols-[240px_1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-900">
                      <img src={homeContent.community.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:border-blue-400">
                      Upload community picture
                      <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleImageChange("community", event.target.files?.[0])} />
                    </label>
                  </div>
                  <div className="grid gap-4">
                    <h3 className="text-xl font-black">Community</h3>
                    <Field label="Image path" value={homeContent.community.image} onChange={(image) => updateSection("community", { image })} />
                    <Field label="Eyebrow" value={homeContent.community.eyebrow} onChange={(eyebrow) => updateSection("community", { eyebrow })} />
                    <Field label="Title" value={homeContent.community.title} onChange={(title) => updateSection("community", { title })} rows={2} help="Line breaks are kept on the homepage." />
                    <Field label="Text" value={homeContent.community.text} onChange={(text) => updateSection("community", { text })} rows={3} />
                    <Field label="Second text" value={homeContent.community.secondText} onChange={(secondText) => updateSection("community", { secondText })} rows={3} />
                  </div>
                </div>

                <div className="grid gap-4 border-t border-slate-200 pt-5 lg:grid-cols-[240px_1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-900">
                      <img src={homeContent.about.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:border-blue-400">
                      Upload Barak picture
                      <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleImageChange("about", event.target.files?.[0])} />
                    </label>
                  </div>
                  <div className="grid gap-4">
                    <h3 className="text-xl font-black">About</h3>
                    <Field label="Name" value={homeContent.about.name} onChange={(name) => updateSection("about", { name })} />
                    <Field label="Portrait image path" value={homeContent.about.image} onChange={(image) => updateSection("about", { image })} />
                    <Field label="Title" value={homeContent.about.title} onChange={(title) => updateSection("about", { title })} />
                    <Field label="Bio" value={homeContent.about.text} onChange={(text) => updateSection("about", { text })} rows={4} />
                    <Field label="Highlights" value={listToLines(homeContent.about.highlights)} onChange={(value) => updateSection("about", { highlights: linesToList(value) })} rows={4} help="One highlight per line." />
                  </div>
                </div>
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
