import { ADMIN_EMAIL, getUserFromToken } from "@/lib/cloudServer";
import {
  defaultToolkitItems,
  mergeToolkitItems,
  normalizeToolkitItem,
  normalizeToolkitItems,
  publicToolkitItems,
  slugify,
  type ToolkitItem,
  type ToolkitKind,
  type ToolkitStatus
} from "@/lib/toolkitContent";

type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

type ToolkitRow = {
  id: string;
  kind: ToolkitKind;
  slug: string;
  title: string;
  excerpt?: string;
  status: ToolkitStatus;
  source_type?: string;
  content?: unknown;
  author_id?: string;
  author_email?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function serviceHeaders() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Toolkit storage is not configured yet.");
  }
  return {
    apikey: supabaseServiceKey,
    authorization: `Bearer ${supabaseServiceKey}`,
    "content-type": "application/json"
  };
}

function isAdmin(user: SupabaseUser) {
  return user.email?.toLowerCase() === ADMIN_EMAIL;
}

function rowToItem(row: ToolkitRow): ToolkitItem | null {
  const content = isRecord(row.content) ? row.content : {};
  return normalizeToolkitItem({
    ...content,
    id: row.id,
    kind: row.kind,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || content.excerpt,
    status: row.status,
    sourceType: row.source_type || content.sourceType,
    authorId: row.author_id || content.authorId,
    authorEmail: row.author_email || content.authorEmail,
    createdAt: row.created_at || content.createdAt,
    updatedAt: row.updated_at || content.updatedAt,
    publishedAt: row.published_at || content.publishedAt
  }, row.kind);
}

function itemToRow(item: ToolkitItem) {
  return {
    id: item.id,
    kind: item.kind,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    status: item.status,
    source_type: item.sourceType,
    content: item,
    author_id: item.authorId || null,
    author_email: item.authorEmail || null,
    updated_at: item.updatedAt,
    published_at: item.status === "published" ? item.publishedAt || item.updatedAt : null
  };
}

async function serviceGet(path: string) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    headers: serviceHeaders(),
    cache: "no-store"
  });
  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(details || "Could not load toolkit content.");
  }
  return response.json();
}

async function tableReadItems() {
  const rows = await serviceGet("/rest/v1/toolkit_items?select=*&order=updated_at.desc&limit=500");
  return Array.isArray(rows) ? rows.map(rowToItem).filter((item): item is ToolkitItem => Boolean(item)) : [];
}

async function tableUpsertItem(item: ToolkitItem) {
  const response = await fetch(`${supabaseUrl}/rest/v1/toolkit_items?on_conflict=id`, {
    method: "POST",
    headers: {
      ...serviceHeaders(),
      prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(itemToRow(item))
  });
  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(details || "Could not save toolkit content.");
  }
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rowToItem(rows[0]) || item : item;
}

async function getAdminUserId() {
  const usersPayload = await serviceGet("/auth/v1/admin/users?per_page=100&page=1");
  const users = Array.isArray(usersPayload?.users) ? usersPayload.users as SupabaseUser[] : [];
  const admin = users.find((user) => user.email?.toLowerCase() === ADMIN_EMAIL);
  if (!admin?.id) throw new Error("Admin account was not found.");
  return admin.id;
}

async function workspaceReadItems() {
  const adminUserId = await getAdminUserId();
  const rows = await serviceGet(
    `/rest/v1/user_workspaces?user_id=eq.${encodeURIComponent(adminUserId)}&select=studio_data&limit=1`
  );
  const workspace = Array.isArray(rows) ? rows[0] : null;
  const studioData = isRecord(workspace?.studio_data) ? workspace.studio_data : {};
  return normalizeToolkitItems(studioData.toolkitContent);
}

async function workspaceSaveItems(items: ToolkitItem[]) {
  const adminUserId = await getAdminUserId();
  const rows = await serviceGet(
    `/rest/v1/user_workspaces?user_id=eq.${encodeURIComponent(adminUserId)}&select=lineup_state,studio_data&limit=1`
  );
  const workspace = Array.isArray(rows) ? rows[0] : null;
  const studioData = isRecord(workspace?.studio_data) ? workspace.studio_data : {};
  const response = await fetch(`${supabaseUrl}/rest/v1/user_workspaces?on_conflict=user_id`, {
    method: "POST",
    headers: {
      ...serviceHeaders(),
      prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify({
      user_id: adminUserId,
      lineup_state: workspace?.lineup_state || {},
      studio_data: {
        ...studioData,
        toolkitContent: items
      },
      updated_at: new Date().toISOString()
    })
  });
  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(details || "Could not save toolkit fallback content.");
  }
}

export async function readToolkitItems(options: { includeUnpublished?: boolean } = {}) {
  let stored: ToolkitItem[] = [];
  try {
    stored = await tableReadItems();
  } catch {
    try {
      stored = await workspaceReadItems();
    } catch {
      stored = [];
    }
  }
  const merged = mergeToolkitItems(stored, defaultToolkitItems);
  return options.includeUnpublished ? merged : publicToolkitItems(merged);
}

async function writeToolkitItem(item: ToolkitItem) {
  try {
    return await tableUpsertItem(item);
  } catch {
    const current = await workspaceReadItems().catch(() => []);
    const withoutCurrent = mergeToolkitItems(current, []).filter((existing) => existing.id !== item.id && `${existing.kind}:${existing.slug}` !== `${item.kind}:${item.slug}`);
    const next = mergeToolkitItems([item, ...withoutCurrent], []);
    await workspaceSaveItems(next);
    return item;
  }
}

function uniqueSlug(base: string, items: ToolkitItem[], kind: ToolkitKind, currentId?: string) {
  const clean = slugify(base);
  const existing = new Set(
    items
      .filter((item) => item.kind === kind && item.id !== currentId)
      .map((item) => item.slug)
  );
  if (!existing.has(clean)) return clean;
  for (let index = 2; index < 1000; index += 1) {
    const next = `${clean}-${index}`;
    if (!existing.has(next)) return next;
  }
  return `${clean}-${Date.now()}`;
}

export async function readToolkitItemForUser(kind: ToolkitKind, slug: string, token: string) {
  if (!token) throw new Error("Please sign in to open this Toolkit item.");
  const user = await getUserFromToken(token);
  const items = await readToolkitItems({ includeUnpublished: true });
  const item = items.find((candidate) => candidate.kind === kind && candidate.slug === slug);
  if (!item) throw new Error("That Toolkit item was not found.");
  if (item.status === "published" || isAdmin(user) || item.authorId === user.id) return item;
  throw new Error("This Toolkit item is waiting for approval.");
}

export async function createToolkitItemFromRequest(kind: ToolkitKind, body: unknown, token: string) {
  if (!token) throw new Error("Please sign in to submit to the Toolkit.");
  const user = await getUserFromToken(token);
  const admin = isAdmin(user);
  const status: ToolkitStatus = admin && isRecord(body) && body.status === "published" ? "published" : admin && isRecord(body) && body.status === "draft" ? "draft" : "pending";
  const sourceType = admin ? "official" : "community";
  const createdAt = new Date().toISOString();
  const input = isRecord(body) ? body : {};
  const allItems = await readToolkitItems({ includeUnpublished: true });
  const normalized = normalizeToolkitItem({
    ...input,
    kind,
    status,
    sourceType,
    authorId: user.id,
    authorEmail: user.email || "",
    submitterName: String(user.user_metadata?.full_name || input.submitterName || "").trim(),
    submitterEmail: user.email || String(input.submitterEmail || "").trim(),
    createdAt,
    updatedAt: createdAt,
    publishedAt: status === "published" ? createdAt : "",
    slug: uniqueSlug(String(input.slug || input.title || kind), allItems, kind)
  }, kind, status);
  if (!normalized) throw new Error("Could not prepare that Toolkit item.");
  return writeToolkitItem(normalized);
}

export async function updateToolkitItemFromRequest(kind: ToolkitKind, slug: string, body: unknown, token: string) {
  if (!token) throw new Error("Please sign in first.");
  const user = await getUserFromToken(token);
  if (!isAdmin(user)) throw new Error("This admin area is private.");
  const items = await readToolkitItems({ includeUnpublished: true });
  const current = items.find((item) => item.kind === kind && item.slug === slug);
  if (!current) throw new Error("That Toolkit item was not found.");
  const input = isRecord(body) ? body : {};
  const nextStatus = input.status === "draft" || input.status === "pending" || input.status === "published" || input.status === "rejected"
    ? input.status
    : current.status;
  const updatedAt = new Date().toISOString();
  const next = normalizeToolkitItem({
    ...current,
    ...input,
    kind,
    id: current.id,
    slug: uniqueSlug(String(input.slug || current.slug || current.title), items, kind, current.id),
    status: nextStatus,
    sourceType: input.sourceType || current.sourceType,
    createdAt: current.createdAt,
    updatedAt,
    publishedAt: nextStatus === "published" ? current.publishedAt || updatedAt : ""
  }, kind, nextStatus);
  if (!next) throw new Error("Could not update that Toolkit item.");
  return writeToolkitItem(next);
}

export async function readAdminToolkitItems(token: string) {
  if (!token) throw new Error("Please sign in first.");
  const user = await getUserFromToken(token);
  if (!isAdmin(user)) throw new Error("This admin area is private.");
  return readToolkitItems({ includeUnpublished: true });
}

export function bearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}
