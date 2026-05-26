import { getUserFromToken, updateUserPassword } from "@/lib/cloudServer";

function authToken(request: Request) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() || "";
}

export async function PUT(request: Request) {
  try {
    const token = authToken(request);
    await getUserFromToken(token);
    const body = await request.json().catch(() => ({}));
    const password = String(body.password || "");
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    const user = await updateUserPassword(token, password);
    return Response.json({ user });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not change password." }, { status: 400 });
  }
}
