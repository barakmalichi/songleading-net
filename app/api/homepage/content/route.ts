import { getUserFromToken, readHomepageContent, saveHomepageContent } from "@/lib/cloudServer";
import { normalizeHomepageContent } from "@/lib/homepageContent";

export const dynamic = "force-dynamic";

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("cache-control", "no-store");
  return Response.json(body, {
    ...init,
    headers
  });
}

function bearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

export async function GET() {
  try {
    const content = await readHomepageContent();
    return jsonNoStore({ content: normalizeHomepageContent(content && typeof content === "object" ? content : {}) });
  } catch (error) {
    return jsonNoStore(
      { error: error instanceof Error ? error.message : "Could not load homepage content." },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const token = bearerToken(request);
    if (!token) return jsonNoStore({ error: "Please sign in first." }, { status: 401 });

    const user = await getUserFromToken(token);
    const body = await request.json().catch(() => ({}));
    const content = normalizeHomepageContent(body.content && typeof body.content === "object" ? body.content : {});
    await saveHomepageContent(token, user, content);
    return jsonNoStore({ ok: true, content });
  } catch (error) {
    return jsonNoStore(
      { error: error instanceof Error ? error.message : "Could not save homepage content." },
      { status: 400 }
    );
  }
}
