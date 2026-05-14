import { getUserFromToken, readHomepageAboutContent, saveHomepageAboutContent } from "@/lib/cloudServer";
import { normalizeHomepageAboutContent } from "@/lib/homepageContent";

function bearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

export async function GET() {
  try {
    const content = await readHomepageAboutContent();
    return Response.json({ content: normalizeHomepageAboutContent(content && typeof content === "object" ? content : {}) });
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
    const content = normalizeHomepageAboutContent(body.content && typeof body.content === "object" ? body.content : {});
    await saveHomepageAboutContent(token, user, content);
    return Response.json({ ok: true, content });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not save homepage content." },
      { status: 400 }
    );
  }
}
