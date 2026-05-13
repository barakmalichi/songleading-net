import { getAdminDashboard, getUserFromToken } from "@/lib/cloudServer";

const ADMIN_EMAIL = "barakmalichi@gmail.com";

function bearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

export async function GET(request: Request) {
  try {
    const token = bearerToken(request);
    if (!token) return Response.json({ error: "Please sign in first." }, { status: 401 });

    const user = await getUserFromToken(token);
    if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
      return Response.json({ error: "This admin area is private." }, { status: 403 });
    }

    const dashboard = await getAdminDashboard();
    return Response.json(dashboard);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not load the admin portal." },
      { status: 400 }
    );
  }
}
