import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function FindAPlacementPage() {
  redirect("/opportunities/im-a-songleader");
}
