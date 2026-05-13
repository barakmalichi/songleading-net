"use client";

export const AUTH_STORAGE_KEY = "songleading-auth-session:v1";
export const LINEUP_STORAGE_KEY = "show-lineup-builder-state";
export const CLOUD_STUDIO_STORAGE_KEY = "lyric-slide-studio:v1";

type CloudStudioData = {
  songs: unknown[];
  sessions: unknown[];
};

export type CloudSession = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user?: {
    id?: string;
    email?: string;
  };
};

export function getStoredSession(): CloudSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CloudSession;
    return parsed?.access_token ? parsed : null;
  } catch {
    return null;
  }
}

export function setStoredSession(session: CloudSession | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

async function apiJson(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.msg || "Something went wrong.");
  return data;
}

export async function signInToCloud(email: string, password: string) {
  const data = await apiJson("/api/auth/sign-in", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  if ((data as CloudSession).access_token) setStoredSession(data);
  return data as CloudSession;
}

export async function signUpForCloud(email: string, password: string) {
  const data = await apiJson("/api/auth/sign-up", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  if ((data as CloudSession).access_token) setStoredSession(data);
  return data as CloudSession;
}

export async function getValidSession() {
  const session = getStoredSession();
  if (!session) return null;

  const expiry = session.expires_at ? session.expires_at * 1000 : 0;
  if (!expiry || expiry > Date.now() + 60_000 || !session.refresh_token) return session;

  const refreshed = await apiJson("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: session.refresh_token })
  });
  setStoredSession(refreshed);
  return refreshed as CloudSession;
}

export async function fetchCloudWorkspace() {
  const session = await getValidSession();
  if (!session) throw new Error("Please sign in first.");

  return apiJson("/api/workspace", {
    headers: { authorization: `Bearer ${session.access_token}` }
  });
}

export async function saveCloudWorkspace(partial: { lineupState?: unknown; studioData?: CloudStudioData }) {
  const session = await getValidSession();
  if (!session) return null;

  return apiJson("/api/workspace", {
    method: "POST",
    headers: { authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(partial)
  });
}

let studioSyncTimer: number | null = null;

export function queueStudioCloudSave(studioData: CloudStudioData) {
  if (typeof window === "undefined" || !getStoredSession()) return;
  if (studioSyncTimer) window.clearTimeout(studioSyncTimer);
  studioSyncTimer = window.setTimeout(() => {
    saveCloudWorkspace({ studioData }).catch((error) => {
      console.warn("Studio cloud sync failed.", error);
    });
  }, 900);
}

export async function loadCloudWorkspaceOntoDevice() {
  const workspace = await fetchCloudWorkspace();
  if (typeof window === "undefined") return workspace;

  if (workspace.lineupState) {
    window.localStorage.setItem(LINEUP_STORAGE_KEY, JSON.stringify(workspace.lineupState));
  }
  if (workspace.studioData) {
    window.localStorage.setItem(CLOUD_STUDIO_STORAGE_KEY, JSON.stringify(workspace.studioData));
  }

  window.dispatchEvent(new CustomEvent("songleading-cloud-loaded", { detail: workspace }));
  return workspace;
}

export async function saveCurrentDeviceToCloud() {
  if (typeof window === "undefined") return null;

  const lineupRaw = window.localStorage.getItem(LINEUP_STORAGE_KEY);
  const studioRaw = window.localStorage.getItem(CLOUD_STUDIO_STORAGE_KEY);
  return saveCloudWorkspace({
    lineupState: lineupRaw ? JSON.parse(lineupRaw) : undefined,
    studioData: studioRaw ? JSON.parse(studioRaw) : undefined
  });
}
