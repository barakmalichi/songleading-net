import type { Metadata } from "next";
import { PlacementPathPage } from "@/components/PlacementPathPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hire A Songleader | Songleading Opportunities",
  description: "Share the role, dates, setting, and context to find the right songleader."
};

export default function HireASongleaderPage() {
  return <PlacementPathPage track="camp" />;
}
