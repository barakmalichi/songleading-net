import { getUserFromToken, updateUserProfile } from "@/lib/cloudServer";

function authToken(request: Request) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() || "";
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(authToken(request));
    return Response.json({ profile: user.user_metadata || {}, user });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load profile." }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const token = authToken(request);
    await getUserFromToken(token);
    const body = await request.json().catch(() => ({}));
    const user = await updateUserProfile(token, body.profile || {});
    return Response.json({ user, profile: user?.user_metadata || {} });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not save profile." }, { status: 400 });
  }
}
