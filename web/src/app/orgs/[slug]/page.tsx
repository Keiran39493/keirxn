import { notFound } from "next/navigation";
import { NgoDetailView } from "@/components/NgoDetailView";
import { OrgDetailNav } from "@/components/OrgDetailNav";
import { getAllNgoSlugs, getNgoBySlug } from "@/lib/ngo-detail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllNgoSlugs().map((slug) => ({ slug }));
}

export default async function OrgDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = getNgoBySlug(slug);
  if (!detail) notFound();

  return (
    <div className="min-h-screen bg-gm-50">
      <OrgDetailNav />
      <NgoDetailView detail={detail} />
      <footer className="border-t border-gm-100 bg-white px-6 py-6 text-center text-xs text-slate-400">
        Prototype project page · Data partly from{" "}
        <a
          href={detail.profile_url}
          className="text-gm-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          gemeinnuetzig.li
        </a>
      </footer>
    </div>
  );
}
