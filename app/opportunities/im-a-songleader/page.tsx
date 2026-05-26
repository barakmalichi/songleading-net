import type { Metadata } from "next";
import { PlacementPathPage } from "@/components/PlacementPathPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "I'm A Songleader | Songleading Opportunities",
  description: "Share your availability, experience, instruments, and links for songleading opportunities."
};

export default function ImASongleaderPage() {
  return <PlacementPathPage track="songleader" />;
}
