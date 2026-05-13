import { supabaseAuth } from "@/lib/cloudServer";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return supabaseAuth("signup", body);
}
