type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

type ContactMessagePayload = {
  name?: string;
  email?: string;
  topic: string;
  message: string;
};

export type WorkspacePayload = {
  lineupState?: unknown;
  studioData?: unknown;
};

export const ADMIN_EMAIL = "barakmalichi@gmail.com";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function cloudIsConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function jsonHeaders(token?: string) {
  return {
    apikey: supabaseAnonKey || "",
    authorization: token ? `Bearer ${token}` : `Bearer ${supabaseAnonKey || ""}`,
    "content-type": "application/json"
  };
}

function serviceHeaders() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Admin storage is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY in Vercel.");
  }
  return {
    apikey: supabaseServiceKey,
    authorization: `Bearer ${supabaseServiceKey}`,
    "content-type": "application/json"
  };
}

export async function supabaseAuth(path: string, body: unknown) {
  if (!cloudIsConfigured()) {
    return Response.json({ error: "Cloud sync is not configured yet." }, { status: 503 });
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  return Response.json(data, { status: response.status });
}

export async function getUserFromToken(token: string): Promise<SupabaseUser> {
  if (!cloudIsConfigured()) throw new Error("Cloud sync is not configured yet.");

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: jsonHeaders(token),
    cache: "no-store"
  });

  if (!response.ok) throw new Error("Please sign in again.");
  const user = (await response.json()) as SupabaseUser;
  if (!user?.id) throw new Error("Please sign in again.");
  return user;
}

export async function updateUserProfile(token: string, profile: Record<string, unknown>) {
  if (!cloudIsConfigured()) throw new Error("Cloud sync is not configured yet.");

  const cleanProfile = {
    full_name: String(profile.fullName || "").trim(),
    phone: String(profile.phone || "").trim(),
    country: String(profile.country || "").trim(),
    main_use_case: String(profile.useCase || "").trim(),
    camp_name: String(profile.campName || "").trim(),
    synagogue_name: String(profile.synagogueName || "").trim(),
    other_use_case: String(profile.otherUseCase || "").trim(),
    instrument: String(profile.instrument || "").trim(),
    community_institution: String(profile.communityInstitution || "").trim(),
  };

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "PUT",
    headers: jsonHeaders(token),
    body: JSON.stringify({ data: cleanProfile })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error_description || data.msg || data.error || "Could not save profile.");
  return data;
}

export async function readWorkspace(token: string, userId: string) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/user_workspaces?user_id=eq.${encodeURIComponent(userId)}&select=lineup_state,studio_data,updated_at`,
    {
      headers: jsonHeaders(token),
      cache: "no-store"
    }
  );

  if (!response.ok) throw new Error("Could not read your cloud workspace.");
  const rows = (await response.json().catch(() => [])) as Array<{
    lineup_state?: unknown;
    studio_data?: unknown;
    updated_at?: string;
  }>;

  return rows[0] || null;
}

export async function upsertWorkspace(token: string, userId: string, payload: WorkspacePayload) {
  const current = await readWorkspace(token, userId);
  const next = {
    user_id: userId,
    lineup_state: Object.prototype.hasOwnProperty.call(payload, "lineupState")
      ? payload.lineupState
      : current?.lineup_state ?? {},
    studio_data: Object.prototype.hasOwnProperty.call(payload, "studioData")
      ? payload.studioData
      : current?.studio_data ?? {},
    updated_at: new Date().toISOString()
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/user_workspaces?on_conflict=user_id`, {
    method: "POST",
    headers: {
      ...jsonHeaders(token),
      prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(next)
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(details || "Could not save your cloud workspace.");
  }

  const rows = (await response.json().catch(() => [])) as unknown[];
  return rows[0] || next;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

async function getAdminUserId() {
  const usersPayload = await serviceGet("/auth/v1/admin/users?per_page=100&page=1");
  const users = Array.isArray(usersPayload?.users) ? usersPayload.users as SupabaseUser[] : [];
  const admin = users.find((user) => user.email?.toLowerCase() === ADMIN_EMAIL);
  if (!admin?.id) throw new Error("Admin account was not found.");
  return admin.id;
}

export async function readHomepageAboutContent() {
  if (!cloudIsConfigured()) return null;

  const adminUserId = await getAdminUserId();
  const rows = await serviceGet(
    `/rest/v1/user_workspaces?user_id=eq.${encodeURIComponent(adminUserId)}&select=studio_data&limit=1`
  );
  const studioData = Array.isArray(rows) ? rows[0]?.studio_data : null;
  return isRecord(studioData) ? studioData.homepageAboutContent ?? null : null;
}

export async function saveHomepageAboutContent(token: string, user: SupabaseUser, content: unknown) {
  if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
    throw new Error("This admin area is private.");
  }

  const current = await readWorkspace(token, user.id);
  const currentStudioData = isRecord(current?.studio_data) ? current.studio_data : {};
  return upsertWorkspace(token, user.id, {
    studioData: {
      ...currentStudioData,
      homepageAboutContent: content
    }
  });
}

export async function insertContactMessage(payload: ContactMessagePayload) {
  if (!cloudIsConfigured()) throw new Error("Cloud sync is not configured yet.");
  const response = await fetch(`${supabaseUrl}/rest/v1/contact_messages`, {
    method: "POST",
    headers: {
      ...serviceHeaders(),
      prefer: "return=representation"
    },
    body: JSON.stringify({
      name: payload.name || "",
      email: payload.email || "",
      topic: payload.topic,
      message: payload.message,
      created_at: new Date().toISOString()
    })
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(details || "Could not save the message.");
  }

  const rows = (await response.json().catch(() => [])) as unknown[];
  return rows[0] || null;
}

async function serviceGet(path: string) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    headers: serviceHeaders(),
    cache: "no-store"
  });
  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(details || "Could not load admin data.");
  }
  return response.json();
}

export async function getAdminDashboard() {
  if (!cloudIsConfigured()) throw new Error("Cloud sync is not configured yet.");

  const [usersPayload, contacts, workspaces] = await Promise.all([
    serviceGet("/auth/v1/admin/users?per_page=100&page=1"),
    serviceGet("/rest/v1/contact_messages?select=*&order=created_at.desc&limit=100").catch(() => []),
    serviceGet("/rest/v1/user_workspaces?select=user_id").catch(() => [])
  ]);

  const users = Array.isArray(usersPayload?.users) ? usersPayload.users : [];
  return {
    users,
    contacts: Array.isArray(contacts) ? contacts : [],
    workspaceCount: Array.isArray(workspaces) ? workspaces.length : 0
  };
}
