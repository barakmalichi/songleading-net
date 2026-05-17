import { getUserFromToken, readHomepageContent, saveHomepageContent } from "@/lib/cloudServer";
import { normalizeHomepageContent } from "@/lib/homepageContent";

function bearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

export async function GET() {
  try {
    const content = await readHomepageContent();
    return Response.json({ content: normalizeHomepageContent(content && typeof content === "object" ? content : {}) });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not load homepage content." },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const token = bearerToken(request);
    if (!token) return Response.json({ error: "Please sign in first." }, { status: 401 });

    const user = await getUserFromToken(token);
    const body = await request.json().catch(() => ({}));
    const content = normalizeHomepageContent(body.content && typeof body.content === "object" ? body.content : {});
    await saveHomepageContent(token, user, content);
    return Response.json({ ok: true, content });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not save homepage content." },
      { status: 400 }
    );
  }
}
