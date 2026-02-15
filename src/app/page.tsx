import { prisma } from "@/lib/prisma";
import AdBanner from "@/components/AdBanner";
import NovelGrid from "@/components/NovelGrid";

export const dynamic = "force-dynamic";

const CATEGORIES = ["Hepsi", "Klasik", "Aşk", "Korku", "Bilim Kurgu", "Polisiye", "Kişisel Gelişim", "Dram", "Macera", "Diğer"];

export default async function Home({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  
  const novels = await prisma.novel.findMany({
    where: cat && cat !== "Hepsi" ? { category: { contains: cat } } : {},
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      author: true,
      coverUrl: true,
      category: true,
    }
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Roman Oku & İndir",
    "url": "https://romanoku.space",
    "description": "En sevdiğiniz romanları okuyun ve indirin.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://romanoku.space/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="space-y-8 md:space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AdBanner />
      
      <NovelGrid 
        initialNovels={novels} 
        categories={CATEGORIES} 
        currentCat={cat} 
      />
    </div>
  );
}
