import { bearerToken, readToolkitItemForUser, updateToolkitItemFromRequest } from "@/lib/toolkitServer";
import { routeKindToToolkitKind } from "@/lib/toolkitContent";

export const dynamic = "force-dynamic";

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("cache-control", "no-store");
  return Response.json(body, {
    ...init,
    headers
  });
}

type RouteContext = {
  params: Promise<{
    kind: string;
    slug: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const kind = routeKindToToolkitKind(params.kind);
    if (!kind) return jsonNoStore({ error: "That Toolkit section does not exist." }, { status: 404 });
    const item = await readToolkitItemForUser(kind, params.slug, bearerToken(request));
    return jsonNoStore({ item });
  } catch (error) {
    return jsonNoStore(
      { error: error instanceof Error ? error.message : "Could not open that Toolkit item." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const kind = routeKindToToolkitKind(params.kind);
    if (!kind) return jsonNoStore({ error: "That Toolkit section does not exist." }, { status: 404 });
    const body = await request.json().catch(() => ({}));
    const item = await updateToolkitItemFromRequest(kind, params.slug, body, bearerToken(request));
    return jsonNoStore({ ok: true, item });
  } catch (error) {
    return jsonNoStore(
      { error: error instanceof Error ? error.message : "Could not update that Toolkit item." },
      { status: 400 }
    );
  }
}
