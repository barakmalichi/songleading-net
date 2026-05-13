import { insertContactMessage } from "@/lib/cloudServer";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const topic = String(body.topic || "").trim();
    const message = String(body.message || "").trim();

    if (!topic || !message) {
      return Response.json({ error: "Please choose a topic and write a message." }, { status: 400 });
    }

    const saved = await insertContactMessage({ name, email, topic, message });
    return Response.json({ ok: true, message: saved });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not send the message." },
      { status: 400 }
    );
  }
}
