import { MarketingHeader } from "@/components/ToolkitShared";
import { ToolkitDetailClient } from "@/components/ToolkitDetailClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SongDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <>
      <MarketingHeader />
      <ToolkitDetailClient kind="song" slug={slug} />
    </>
  );
}
