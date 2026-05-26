import { bearerToken, createToolkitItemFromRequest, readAdminToolkitItems, readToolkitItems } from "@/lib/toolkitServer";
import { isToolkitKind, routeKindToToolkitKind } from "@/lib/toolkitContent";

export const dynamic = "force-dynamic";

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("cache-control", "no-store");
  return Response.json(body, {
    ...init,
    headers
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const kind = routeKindToToolkitKind(url.searchParams.get("kind"));
    const admin = url.searchParams.get("admin") === "1";
    const token = bearerToken(request);
    const items = admin
      ? await readAdminToolkitItems(token)
      : await readToolkitItems();
    return jsonNoStore({ items: kind ? items.filter((item) => item.kind === kind) : items });
  } catch (error) {
    return jsonNoStore(
      { error: error instanceof Error ? error.message : "Could not load Toolkit content." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = bearerToken(request);
    const body = await request.json().catch(() => ({}));
    const rawKind = typeof body.kind === "string" ? body.kind : "";
    const kind = isToolkitKind(rawKind) ? rawKind : null;
    if (!kind) return jsonNoStore({ error: "Choose a Toolkit content type." }, { status: 400 });
    const item = await createToolkitItemFromRequest(kind, body, token);
    return jsonNoStore({ ok: true, item });
  } catch (error) {
    return jsonNoStore(
      { error: error instanceof Error ? error.message : "Could not save Toolkit content." },
      { status: 400 }
    );
  }
}
