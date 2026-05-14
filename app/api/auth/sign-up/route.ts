import { supabaseAuth } from "@/lib/cloudServer";

const ADMIN_EMAIL = "barakmalichi@gmail.com";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const profile = body.profile || {};
  const email = String(body.email || "").trim();
  return supabaseAuth("signup", {
    email,
    password: body.password,
    data: {
      full_name: profile.fullName || "",
      phone: profile.phone || "",
      country: profile.country || "",
      main_use_case: profile.useCase || "",
      camp_name: profile.campName || "",
      synagogue_name: profile.synagogueName || "",
      other_use_case: profile.otherUseCase || "",
      instrument: profile.instrument || "",
      community_institution: profile.communityInstitution || "",
      role: email.toLowerCase() === ADMIN_EMAIL ? "admin" : "user",
    },
  });
}
