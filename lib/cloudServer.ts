type SupabaseUser = {
  id: string;
  email?: string;
};

export type WorkspacePayload = {
  lineupState?: unknown;
  studioData?: unknown;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
