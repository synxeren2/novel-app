import { prisma } from "@/lib/prisma";
import AdBanner from "@/components/AdBanner";
import NovelGrid from "@/components/NovelGrid";
import HeroNovel from "@/components/HeroNovel";

export const dynamic = "force-dynamic";

const CATEGORIES = ["Hepsi", "Klasik", "Aşk", "Korku", "Bilim Kurgu", "Polisiye", "Kişisel Gelişim", "Dram", "Macera", "Diğer"];

export default async function Home({ searchParams }: { searchParams: Promise<{ cat?: string, sort?: string }> }) {
  const { cat, sort } = await searchParams;

  let orderBy: any = { createdAt: "desc" };

  if (sort === "popular") {
    orderBy = { views: "desc" };
  } else if (sort === "favorites") {
    orderBy = { favorites: { _count: "desc" } };
  } else if (sort === "oldest") {
    orderBy = { createdAt: "asc" };
  }
  
  // Öne çıkan kitap (En son yüklenen veya rastgele)
  const featuredNovel = await prisma.novel.findFirst({
    orderBy: { views: 'desc' },
    select: {
      id: true,
      title: true,
      author: true,
      description: true,
      coverUrl: true,
      category: true,
    }
  });

  const novels = await prisma.novel.findMany({
    where: cat && cat !== "Hepsi" ? { category: { contains: cat } } : {},
    orderBy,
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
      
      {!cat && featuredNovel && <HeroNovel novel={featuredNovel} />}
      
      <NovelGrid 
        initialNovels={novels} 
        categories={CATEGORIES} 
        currentCat={cat} 
      />
    </div>
  );
}
