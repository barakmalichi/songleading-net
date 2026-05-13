import {
  cloudIsConfigured,
  getUserFromToken,
  readWorkspace,
  upsertWorkspace,
  type WorkspacePayload
} from "@/lib/cloudServer";

function bearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

export async function GET(request: Request) {
  if (!cloudIsConfigured()) {
    return Response.json({ error: "Cloud sync is not configured yet." }, { status: 503 });
  }

  try {
    const token = bearerToken(request);
    if (!token) return Response.json({ error: "Please sign in first." }, { status: 401 });
    const user = await getUserFromToken(token);
    const workspace = await readWorkspace(token, user.id);
    return Response.json({
      user,
      lineupState: workspace?.lineup_state ?? null,
      studioData: workspace?.studio_data ?? null,
      updatedAt: workspace?.updated_at ?? null
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not load cloud workspace." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  if (!cloudIsConfigured()) {
    return Response.json({ error: "Cloud sync is not configured yet." }, { status: 503 });
  }

  try {
    const token = bearerToken(request);
    if (!token) return Response.json({ error: "Please sign in first." }, { status: 401 });
    const user = await getUserFromToken(token);
    const body = (await request.json().catch(() => ({}))) as WorkspacePayload;
    const workspace = await upsertWorkspace(token, user.id, body);
    return Response.json({ user, workspace });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not save cloud workspace." },
      { status: 400 }
    );
  }
}
