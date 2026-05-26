"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageSquareText,
  Plus,
  Save,
  Trash2,
  UsersRound
} from "lucide-react";
import { getValidSession } from "@/lib/cloudClient";
import { ToolkitAdminPanel } from "@/components/ToolkitAdminPanel";
import {
  defaultCommunityContent,
  normalizeCommunityContent,
  type CommunityContent,
  type CommunityEvent,
  type CommunityProfile
} from "@/lib/communityContent";
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

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  help?: string;
  placeholder?: string;
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

function isPlacementContact(contact: ContactMessage) {
  return String(contact.topic || "").startsWith("placement-");
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

function Field({ label, value, onChange, rows = 1, help, placeholder = "" }: FieldProps) {
  const className = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold leading-6 text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white";
  return (
    <label className="grid gap-2 text-sm font-black text-slate-800">
      {label}
      {rows > 1 ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={className}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={className}
        />
      )}
      {help ? <span className="-mt-1 text-xs font-bold leading-5 text-slate-500">{help}</span> : null}
    </label>
  );
}

function StatCard({ label, value, tone = "slate" }: { label: string; value: number; tone?: "slate" | "blue" | "emerald" | "amber" }) {
  const colors = {
    slate: "border-slate-200 bg-white text-slate-950",
    blue: "border-blue-200 bg-blue-50 text-blue-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950"
  };
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${colors[tone]}`}>
      <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] opacity-62">{label}</p>
      <strong className="mt-2 block text-4xl font-black tracking-tight">{value}</strong>
    </article>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm font-bold leading-6 text-slate-500">
      {children}
    </p>
  );
}

function ContactCard({ contact, placement = false }: { contact: ContactMessage; placement?: boolean }) {
  const label = placement
    ? contact.topic === "placement-camp" ? "Needs a songleader" : "Available songleader"
    : contact.topic || "Message";
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${placement ? "border-blue-100 bg-blue-50/78" : "border-slate-200 bg-white"}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <strong className="block text-base font-black text-slate-950">{label}</strong>
          <p className="mt-1 break-words text-sm font-bold text-slate-600">{contact.name || "No name"} · {contact.email || "No email"}</p>
        </div>
        <span className="text-xs font-bold text-slate-500">{formatDate(contact.created_at)}</span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-700">{contact.message}</p>
      {contact.email ? (
        <a href={`mailto:${contact.email}`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-blue-700">
          Reply
          <Mail size={16} />
        </a>
      ) : null}
    </article>
  );
}

function UserCard({ user }: { user: AdminUser }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <strong className="block break-all text-base font-black text-slate-950">{user.email}</strong>
          <p className="mt-1 text-sm font-bold text-slate-600">{metadataValue(user, "full_name") || "No profile name"}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{metadataValue(user, "main_use_case") || "User"}</span>
      </div>
      <div className="mt-4 grid gap-2 text-sm font-bold text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
        <span>Phone: {metadataValue(user, "phone") || "-"}</span>
        <span>Country: {metadataValue(user, "country") || "-"}</span>
        <span>Instrument: {metadataValue(user, "instrument") || "-"}</span>
        <span>Community: {metadataValue(user, "community_institution") || "-"}</span>
      </div>
      <p className="mt-3 text-xs font-bold text-slate-500">Last sign in: {formatDate(user.last_sign_in_at) || "Never"}</p>
    </article>
  );
}

function SectionCard({ id, eyebrow, title, children }: {
  id?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="rounded-3xl border border-slate-200 bg-white/92 p-4 shadow-sm shadow-blue-950/5 sm:p-5">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function EditableBlock({ title, children, defaultOpen = false }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-lg font-black text-slate-950 sm:p-5">
        <span>{title}</span>
        <ChevronDown className="transition group-open:rotate-180" size={20} />
      </summary>
      <div className="border-t border-slate-100 p-4 sm:p-5">
        {children}
      </div>
    </details>
  );
}

function ImagePicker({ label, image, onPathChange, onUpload }: {
  label: string;
  image: string;
  onPathChange: (image: string) => void;
  onUpload: (file?: File) => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[8rem_1fr]">
      <div>
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-900">
          {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-3 text-center text-xs font-black text-slate-900 hover:border-blue-400">
          Upload
          <input type="file" accept="image/*" className="sr-only" onChange={(event) => onUpload(event.target.files?.[0])} />
        </label>
      </div>
      <Field label={label} value={image} onChange={onPathChange} />
    </div>
  );
}

function HomepageEditor({ content, status, onSave, onImageChange, updateSection }: {
  content: HomepageContent;
  status: string;
  onSave: () => void;
  onImageChange: (path: "hero" | "resources" | "training" | "community" | "about", file?: File) => void;
  updateSection: <Key extends keyof HomepageContent>(key: Key, patch: Partial<HomepageContent[Key]>) => void;
}) {
  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 rounded-2xl bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold leading-6 text-blue-950">Homepage edits save to the permanent admin workspace and are loaded by the public site.</p>
        <button type="button" onClick={onSave} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700">
          <Save size={17} />
          Save Homepage
        </button>
      </div>
      {status ? <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-900">{status}</p> : null}

      <EditableBlock title="Hero" defaultOpen>
        <div className="grid gap-4">
          <ImagePicker label="Hero image path" image={content.hero.image} onPathChange={(image) => updateSection("hero", { image })} onUpload={(file) => onImageChange("hero", file)} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Headline before shine" value={content.hero.headlinePrefix} onChange={(headlinePrefix) => updateSection("hero", { headlinePrefix })} />
            <Field label="Shining word" value={content.hero.shineWord} onChange={(shineWord) => updateSection("hero", { shineWord })} />
          </div>
          <Field label="Subheadline" value={content.hero.subheadline} onChange={(subheadline) => updateSection("hero", { subheadline })} />
          <Field label="Intro text" value={content.hero.text} onChange={(text) => updateSection("hero", { text })} rows={2} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Primary button" value={content.hero.primaryLabel} onChange={(primaryLabel) => updateSection("hero", { primaryLabel })} />
            <Field label="Secondary button" value={content.hero.secondaryLabel} onChange={(secondaryLabel) => updateSection("hero", { secondaryLabel })} />
          </div>
        </div>
      </EditableBlock>

      <EditableBlock title="Resources">
        <div className="grid gap-4">
          <ImagePicker label="Resources image path" image={content.resources.image} onPathChange={(image) => updateSection("resources", { image })} onUpload={(file) => onImageChange("resources", file)} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Image eyebrow" value={content.resources.imageEyebrow} onChange={(imageEyebrow) => updateSection("resources", { imageEyebrow })} />
            <Field label="Section eyebrow" value={content.resources.eyebrow} onChange={(eyebrow) => updateSection("resources", { eyebrow })} />
          </div>
          <Field label="Image title" value={content.resources.imageTitle} onChange={(imageTitle) => updateSection("resources", { imageTitle })} />
          <Field label="Section title" value={content.resources.title} onChange={(title) => updateSection("resources", { title })} />
          <Field label="Section text" value={content.resources.text} onChange={(text) => updateSection("resources", { text })} rows={2} />
          <Field label="Badges" value={listToLines(content.resources.badges)} onChange={(value) => updateSection("resources", { badges: linesToList(value) })} rows={3} help="One badge per line." />
          <Field label="Resource cards" value={cardsToLines(content.resources.cards)} onChange={(value) => updateSection("resources", { cards: linesToCards(value) })} rows={6} help="One card per line. Use: Title | Description" />
        </div>
      </EditableBlock>

      <EditableBlock title="Training">
        <div className="grid gap-4">
          <ImagePicker label="Training image path" image={content.training.image} onPathChange={(image) => updateSection("training", { image })} onUpload={(file) => onImageChange("training", file)} />
          <Field label="Eyebrow" value={content.training.eyebrow} onChange={(eyebrow) => updateSection("training", { eyebrow })} />
          <Field label="Title" value={content.training.title} onChange={(title) => updateSection("training", { title })} />
          <Field label="Text" value={content.training.text} onChange={(text) => updateSection("training", { text })} rows={3} />
          <Field label="Second text" value={content.training.secondText} onChange={(secondText) => updateSection("training", { secondText })} rows={3} />
          <Field label="Desktop pills" value={listToLines(content.training.pills)} onChange={(value) => updateSection("training", { pills: linesToList(value) })} rows={4} help="One pill per line." />
        </div>
      </EditableBlock>

      <EditableBlock title="Tools, Community, About, Footer">
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-4">
              <h3 className="text-xl font-black">Tools</h3>
              <Field label="Eyebrow" value={content.tools.eyebrow} onChange={(eyebrow) => updateSection("tools", { eyebrow })} />
              <Field label="Title" value={content.tools.title} onChange={(title) => updateSection("tools", { title })} />
              <Field label="Text" value={content.tools.text} onChange={(text) => updateSection("tools", { text })} rows={3} />
              <Field label="Button label" value={content.tools.buttonLabel} onChange={(buttonLabel) => updateSection("tools", { buttonLabel })} />
              <Field label="Preview eyebrow" value={content.tools.previewEyebrow} onChange={(previewEyebrow) => updateSection("tools", { previewEyebrow })} />
              <Field label="Preview title" value={content.tools.previewTitle} onChange={(previewTitle) => updateSection("tools", { previewTitle })} />
            </div>
            <div className="grid gap-4">
              <h3 className="text-xl font-black">Footer</h3>
              <Field label="Footer text" value={content.footer.text} onChange={(text) => updateSection("footer", { text })} />
              <Field label="Footer note" value={content.footer.note} onChange={(note) => updateSection("footer", { note })} />
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-200 pt-5">
            <h3 className="text-xl font-black">Homepage Community Section</h3>
            <ImagePicker label="Community image path" image={content.community.image} onPathChange={(image) => updateSection("community", { image })} onUpload={(file) => onImageChange("community", file)} />
            <Field label="Eyebrow" value={content.community.eyebrow} onChange={(eyebrow) => updateSection("community", { eyebrow })} />
            <Field label="Title" value={content.community.title} onChange={(title) => updateSection("community", { title })} rows={2} help="Line breaks are kept on the homepage." />
            <Field label="Text" value={content.community.text} onChange={(text) => updateSection("community", { text })} rows={3} />
            <Field label="Second text" value={content.community.secondText} onChange={(secondText) => updateSection("community", { secondText })} rows={3} />
          </div>

          <div className="grid gap-4 border-t border-slate-200 pt-5">
            <h3 className="text-xl font-black">About</h3>
            <ImagePicker label="Portrait image path" image={content.about.image} onPathChange={(image) => updateSection("about", { image })} onUpload={(file) => onImageChange("about", file)} />
            <Field label="Name" value={content.about.name} onChange={(name) => updateSection("about", { name })} />
            <Field label="Title" value={content.about.title} onChange={(title) => updateSection("about", { title })} />
            <Field label="Bio" value={content.about.text} onChange={(text) => updateSection("about", { text })} rows={4} />
            <Field label="Highlights" value={listToLines(content.about.highlights)} onChange={(value) => updateSection("about", { highlights: linesToList(value) })} rows={4} help="One highlight per line." />
          </div>
        </div>
      </EditableBlock>
    </div>
  );
}

function emptyEvent(): CommunityEvent {
  return {
    title: "New community event",
    dateLabel: "Date coming soon",
    format: "Online",
    description: "",
    linkLabel: "",
    linkHref: ""
  };
}

function emptyProfile(): CommunityProfile {
  return {
    name: "",
    role: "Songleader",
    location: "",
    image: "",
    instagramUrl: "",
    videoUrl: ""
  };
}

function CommunityEditor({ content, status, onSave, updateContent }: {
  content: CommunityContent;
  status: string;
  onSave: () => void;
  updateContent: (patch: Partial<CommunityContent>) => void;
}) {
  function updateEvent(index: number, patch: Partial<CommunityEvent>) {
    updateContent({
      events: content.events.map((event, eventIndex) => eventIndex === index ? { ...event, ...patch } : event)
    });
  }

  function updateProfile(index: number, patch: Partial<CommunityProfile>) {
    updateContent({
      profiles: content.profiles.map((profile, profileIndex) => profileIndex === index ? { ...profile, ...patch } : profile)
    });
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 rounded-2xl bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold leading-6 text-emerald-950">Community edits save permanently and update the public Community page.</p>
        <button type="button" onClick={onSave} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700">
          <Save size={17} />
          Save Community
        </button>
      </div>
      {status ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-900">{status}</p> : null}

      <EditableBlock title="WhatsApp" defaultOpen>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-black text-slate-800">
            Status
            <select
              value={content.whatsapp.status}
              onChange={(event) => updateContent({ whatsapp: { ...content.whatsapp, status: event.target.value === "open" ? "open" : "comingSoon" } })}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold outline-none focus:border-blue-500"
            >
              <option value="comingSoon">Coming soon</option>
              <option value="open">Open</option>
            </select>
          </label>
          <Field label="Button label" value={content.whatsapp.label} onChange={(label) => updateContent({ whatsapp: { ...content.whatsapp, label } })} />
          <Field label="Invite link" value={content.whatsapp.href} onChange={(href) => updateContent({ whatsapp: { ...content.whatsapp, href } })} placeholder="https://chat.whatsapp.com/..." />
        </div>
      </EditableBlock>

      <EditableBlock title="Events" defaultOpen>
        <div className="grid gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-slate-500">Add, reorder by dragging later if needed, and save. Empty event descriptions are allowed while dates are still forming.</p>
            <button type="button" onClick={() => updateContent({ events: [...content.events, emptyEvent()] })} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-blue-700">
              <Plus size={17} />
              Add Event
            </button>
          </div>
          {content.events.map((event, index) => (
            <article key={`${event.title}-${index}`} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-black">Event {index + 1}</h3>
                <button type="button" onClick={() => updateContent({ events: content.events.filter((_, eventIndex) => eventIndex !== index) })} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-600" aria-label={`Remove event ${index + 1}`}>
                  <Trash2 size={17} />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Title" value={event.title} onChange={(title) => updateEvent(index, { title })} />
                <Field label="Date label" value={event.dateLabel} onChange={(dateLabel) => updateEvent(index, { dateLabel })} />
                <Field label="Format" value={event.format} onChange={(format) => updateEvent(index, { format })} />
                <Field label="Link label optional" value={event.linkLabel || ""} onChange={(linkLabel) => updateEvent(index, { linkLabel })} />
              </div>
              <Field label="Description" value={event.description} onChange={(description) => updateEvent(index, { description })} rows={3} />
              <Field label="Link URL optional" value={event.linkHref || ""} onChange={(linkHref) => updateEvent(index, { linkHref })} />
            </article>
          ))}
        </div>
      </EditableBlock>

      <EditableBlock title="Featured leader profiles">
        <div className="grid gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-slate-500">Only profiles with a real Instagram or video link will appear publicly.</p>
            <button type="button" onClick={() => updateContent({ profiles: [...content.profiles, emptyProfile()] })} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-blue-700">
              <Plus size={17} />
              Add Profile
            </button>
          </div>
          {content.profiles.length ? content.profiles.map((profile, index) => (
            <article key={`${profile.name}-${index}`} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-black">Profile {index + 1}</h3>
                <button type="button" onClick={() => updateContent({ profiles: content.profiles.filter((_, profileIndex) => profileIndex !== index) })} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-600" aria-label={`Remove profile ${index + 1}`}>
                  <Trash2 size={17} />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Name" value={profile.name} onChange={(name) => updateProfile(index, { name })} />
                <Field label="Role" value={profile.role} onChange={(role) => updateProfile(index, { role })} />
                <Field label="Location" value={profile.location} onChange={(location) => updateProfile(index, { location })} />
                <Field label="Image path optional" value={profile.image || ""} onChange={(image) => updateProfile(index, { image })} />
                <Field label="Instagram URL" value={profile.instagramUrl || ""} onChange={(instagramUrl) => updateProfile(index, { instagramUrl })} />
                <Field label="Video URL" value={profile.videoUrl || ""} onChange={(videoUrl) => updateProfile(index, { videoUrl })} />
              </div>
            </article>
          )) : (
            <EmptyState>No leader profiles yet. Add one when you have real links ready.</EmptyState>
          )}
        </div>
      </EditableBlock>
    </div>
  );
}

export function AdminPortal() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [message, setMessage] = useState("Loading admin portal...");
  const [homeContent, setHomeContent] = useState<HomepageContent>(defaultHomepageContent);
  const [communityContent, setCommunityContent] = useState<CommunityContent>(defaultCommunityContent);
  const [homeStatus, setHomeStatus] = useState("");
  const [communityStatus, setCommunityStatus] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const session = await getValidSession();
        if (!session?.access_token) {
          setMessage("Sign in as Barak to open the admin portal.");
          return;
        }
        const dashboardResponse = await fetch("/api/admin/dashboard", {
          headers: { authorization: `Bearer ${session.access_token}` },
          cache: "no-store"
        });
        const dashboardPayload = await dashboardResponse.json().catch(() => ({}));
        if (!dashboardResponse.ok) throw new Error(dashboardPayload.error || "Could not load admin portal.");
        setData(dashboardPayload);

        const [homepageResponse, communityResponse] = await Promise.all([
          fetch("/api/homepage/content", { cache: "no-store" }),
          fetch("/api/community/content", { cache: "no-store" })
        ]);
        const homepagePayload = await homepageResponse.json().catch(() => ({}));
        const communityPayload = await communityResponse.json().catch(() => ({}));
        if (homepageResponse.ok) setHomeContent(normalizeHomepageContent(homepagePayload.content || {}));
        if (communityResponse.ok) setCommunityContent(normalizeCommunityContent(communityPayload.content || {}));
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
      setHomeStatus("Saving permanent homepage copy...");
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
      const verifyResponse = await fetch(`/api/homepage/content?saved=${Date.now()}`, { cache: "no-store" });
      const verifyPayload = await verifyResponse.json().catch(() => ({}));
      if (!verifyResponse.ok) throw new Error(verifyPayload.error || "Saved, but could not verify the permanent copy.");
      const savedContent = normalizeHomepageContent(verifyPayload.content || payload.content || nextContent);
      setHomeContent(savedContent);
      window.dispatchEvent(new CustomEvent("homepage-content-updated", { detail: savedContent }));
      setHomeStatus("Saved permanently online.");
    } catch (error) {
      setHomeStatus(error instanceof Error ? error.message : "Could not save homepage edits.");
    }
  }

  async function saveCommunityContent() {
    const nextContent = normalizeCommunityContent(communityContent);
    try {
      const session = await getValidSession();
      if (!session?.access_token) throw new Error("Sign in as Barak to save community edits.");
      setCommunityStatus("Saving permanent community copy...");
      const response = await fetch("/api/community/content", {
        method: "PUT",
        headers: {
          authorization: `Bearer ${session.access_token}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({ content: nextContent })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not save community edits.");
      const verifyResponse = await fetch(`/api/community/content?saved=${Date.now()}`, { cache: "no-store" });
      const verifyPayload = await verifyResponse.json().catch(() => ({}));
      if (!verifyResponse.ok) throw new Error(verifyPayload.error || "Saved, but could not verify the permanent copy.");
      const savedContent = normalizeCommunityContent(verifyPayload.content || payload.content || nextContent);
      setCommunityContent(savedContent);
      setCommunityStatus("Saved permanently online.");
    } catch (error) {
      setCommunityStatus(error instanceof Error ? error.message : "Could not save community edits.");
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

  function updateHomeSection<Key extends keyof HomepageContent>(key: Key, patch: Partial<HomepageContent[Key]>) {
    setHomeContent((current) => ({
      ...current,
      [key]: {
        ...(current[key] as object),
        ...patch
      } as HomepageContent[Key]
    }));
  }

  function updateCommunityContent(patch: Partial<CommunityContent>) {
    setCommunityContent((current) => normalizeCommunityContent({ ...current, ...patch }));
  }

  const placementContacts = data?.contacts.filter(isPlacementContact) ?? [];
  const regularContacts = data?.contacts.filter((contact) => !isPlacementContact(contact)) ?? [];
  const recentContacts = useMemo(() => [...placementContacts, ...regularContacts].slice(0, 4), [placementContacts, regularContacts]);

  return (
    <main className="site-theme-page min-h-screen bg-[linear-gradient(135deg,#eef7fb_0%,#f7f2e7_48%,#eef4ff_100%)] px-3 py-4 text-slate-950 sm:px-5 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-3xl border border-white/70 bg-slate-950 text-white shadow-2xl shadow-blue-950/18">
          <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-blue-200">
                <LayoutDashboard size={16} />
                Songleading.net
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">Admin Portal</h1>
              <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-white/70">
                Messages, placement notes, users, and permanent site edits in one mobile-first control center.
              </p>
            </div>
            <a href="/" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/16 bg-white/10 px-4 py-3 text-sm font-black text-white hover:bg-white/16">
              <ArrowLeft size={17} />
              Back to site
            </a>
          </div>
        </header>

        {message ? (
          <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-black text-amber-900">
            {message}
          </section>
        ) : null}

        {data ? (
          <div className="mt-5 grid gap-5">
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="Users" value={data.users.length} tone="slate" />
              <StatCard label="Cloud workspaces" value={data.workspaceCount} tone="blue" />
              <StatCard label="Placements" value={placementContacts.length} tone="emerald" />
              <StatCard label="Messages" value={regularContacts.length} tone="amber" />
            </section>

            <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Control center</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">What needs attention first?</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <a href="#placements" className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-black text-blue-950 hover:border-blue-300">
                    Placement inquiries
                    <BriefcaseBusiness size={18} />
                  </a>
                  <a href="#contacts" className="flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-black text-amber-950 hover:border-amber-300">
                    Contact messages
                    <Inbox size={18} />
                  </a>
                  <a href="#users" className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-950 hover:border-blue-300">
                    User profiles
                    <UsersRound size={18} />
                  </a>
                  <a href="#edit-site" className="flex items-center justify-between gap-3 rounded-2xl border border-slate-900 bg-slate-950 p-4 text-sm font-black text-white hover:bg-blue-700">
                    Edit site content
                    <Edit3 size={18} />
                  </a>
                </div>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Latest communication</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight">Recent notes</h2>
                  </div>
                  <CheckCircle2 className="text-emerald-600" size={24} />
                </div>
                <div className="mt-4 grid gap-3">
                  {recentContacts.length ? recentContacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} placement={isPlacementContact(contact)} />
                  )) : (
                    <EmptyState>No recent communication yet.</EmptyState>
                  )}
                </div>
              </article>
            </section>

            <SectionCard id="placements" eyebrow="Communication" title="Placement Inquiries">
              <div className="grid gap-3">
                {placementContacts.length ? placementContacts.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} placement />
                )) : (
                  <EmptyState>No placement inquiries yet.</EmptyState>
                )}
              </div>
            </SectionCard>

            <SectionCard id="contacts" eyebrow="Communication" title="Contact Messages">
              <div className="grid gap-3">
                {regularContacts.length ? regularContacts.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} />
                )) : (
                  <EmptyState>No contact messages yet.</EmptyState>
                )}
              </div>
            </SectionCard>

            <SectionCard id="users" eyebrow="Control" title="Users">
              <div className="grid gap-3">
                {data.users.map((user) => <UserCard key={user.id} user={user} />)}
              </div>
            </SectionCard>

            <section id="edit-site" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-blue-950/8 sm:p-5">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl bg-slate-950 p-5 text-white">
                  <span>
                    <span className="block text-xs font-black uppercase tracking-[0.2em] text-blue-200">Edit</span>
                    <span className="mt-1 block text-3xl font-black tracking-tight">Edit site content</span>
                    <span className="mt-2 block max-w-2xl text-sm font-bold leading-6 text-white/70">
                      Expand only when you want to change public content. Saves verify the permanent database copy.
                    </span>
                  </span>
                  <ChevronDown className="shrink-0 transition group-open:rotate-180" size={24} />
                </summary>

                <div className="mt-5 grid gap-5">
                  <EditableBlock title="Homepage content">
                    <HomepageEditor
                      content={homeContent}
                      status={homeStatus}
                      onSave={saveHomeContent}
                      onImageChange={handleImageChange}
                      updateSection={updateHomeSection}
                    />
                  </EditableBlock>

                  <EditableBlock title="Community page content">
                    <CommunityEditor
                      content={communityContent}
                      status={communityStatus}
                      onSave={saveCommunityContent}
                      updateContent={updateCommunityContent}
                    />
                  </EditableBlock>

                  <EditableBlock title="Toolkit, activities, songs, and resources">
                    <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-600">
                      Use this for articles, activities, songs, and pending community submissions. Published items are saved permanently through the Toolkit API.
                    </div>
                    <ToolkitAdminPanel />
                  </EditableBlock>
                </div>
              </details>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
