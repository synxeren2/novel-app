import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Download, BookOpen, Edit2, Calendar, User, ArrowLeft, Share2, Send } from "lucide-react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import AdBanner from "@/components/AdBanner";
import Comments from "@/components/Comments";
import FavoriteButton from "@/components/FavoriteButton";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const novel = await prisma.novel.findUnique({
    where: { id },
  });

  if (!novel) return { title: "Roman Bulunamadı" };

  return {
    title: novel.title,
    description: novel.description?.slice(0, 160) || `${novel.author} tarafından yazılan ${novel.title} romanını oku ve indir.`,
    openGraph: {
      title: `${novel.title} | Roman Oku & İndir`,
      description: novel.description?.slice(0, 160) || `${novel.author} tarafından yazılan ${novel.title} romanını oku ve indir.`,
      images: novel.coverUrl ? [novel.coverUrl] : [],
    },
  };
}

export default async function NovelDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  // İzlenme sayısını artır
  const novel = await prisma.novel.update({
    where: { id },
    data: { views: { increment: 1 } }
  }).catch(() => null);

  if (!novel) notFound();

  // Benzer romanları getir
  const relatedNovels = await prisma.novel.findMany({
    where: { 
      category: novel.category,
      id: { not: id }
    },
    take: 4,
  });

  const isOwner = session?.user?.id === novel.uploaderId;
  const shareUrl = `https://romanoku.space/novels/${id}`;
  const shareText = `${novel.title} romanını hemen oku!`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": novel.title,
    "author": {
      "@type": "Person",
      "name": novel.author
    },
    "datePublished": novel.createdAt.toISOString(),
    "description": novel.description,
    "image": novel.coverUrl,
    "publisher": {
      "@type": "Organization",
      "name": "Roman Oku"
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kütüphaneye Dön
      </Link>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Cover */}
        <div className="w-full md:w-80 shrink-0 flex justify-center md:block">
          <div className="w-2/3 md:w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 md:sticky md:top-24">
            {novel.coverUrl ? (
              <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-zinc-800" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 md:space-y-8">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <h1 className="text-3xl md:text-5xl font-black uppercase leading-tight tracking-tighter">{novel.title}</h1>
              <div className="flex items-center gap-2">
                <FavoriteButton novelId={id} />
                {isOwner && (
                  <Link href={`/novels/${id}/edit`} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors text-xs md:text-sm font-bold shrink-0 border border-white/5">
                    <Edit2 className="w-4 h-4" /> Düzenle
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 md:gap-6 text-gray-400 font-medium text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 md:w-5 md:h-5" /> {novel.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 md:w-5 md:h-5" /> {new Date(novel.createdAt).toLocaleDateString('tr-TR')}
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5" /> {novel.views} İzlenme
              </div>
              <div className="bg-white/10 px-2 py-0.5 rounded text-[10px] md:text-xs uppercase font-bold tracking-widest text-white">
                {novel.fileType}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
            <Link 
              href={`/novels/${id}/read`}
              className="flex-1 flex items-center justify-center gap-2 md:gap-3 bg-white text-black text-base md:text-lg font-black uppercase py-4 md:py-5 rounded-xl md:rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
            >
              <BookOpen className="w-5 h-5 md:w-6 md:h-6" /> Hemen Oku
            </Link>
            <a 
              href={`/api/novels/download/${id}`}
              className="flex-1 flex items-center justify-center gap-2 md:gap-3 bg-zinc-900 border border-white/10 text-white text-base md:text-lg font-black uppercase py-4 md:py-5 rounded-xl md:rounded-2xl hover:bg-zinc-800 transition-all active:scale-95"
              download
            >
              <Download className="w-5 h-5 md:w-6 md:h-6" /> Dosyayı İndir
            </a>
          </div>

          {/* Social Share */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Paylaş:</span>
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-lg transition-colors"
              title="WhatsApp'ta Paylaş"
            >
              <Share2 className="w-5 h-5" />
            </a>
            <a 
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] rounded-lg transition-colors"
              title="Telegram'da Paylaş"
            >
              <Send className="w-5 h-5" />
            </a>
          </div>

          <AdBanner />

          <div className="space-y-4 pt-6 md:pt-8">
            <h2 className="text-xl md:text-2xl font-bold border-l-4 border-white pl-4">Özet</h2>
            <p className="text-gray-300 leading-relaxed text-base md:text-lg whitespace-pre-wrap">
              {novel.description || "Bu roman için henüz bir açıklama girilmemiş."}
            </p>
          </div>

          <div className="pt-12">
            <Comments novelId={id} session={session} />
          </div>

          {relatedNovels.length > 0 && (
            <div className="pt-12 space-y-6">
              <h2 className="text-xl md:text-2xl font-bold border-l-4 border-white pl-4 uppercase tracking-tighter">İlgini Çekebilir</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedNovels.map((rel) => (
                  <Link key={rel.id} href={`/novels/${rel.id}`} className="group space-y-2">
                    <div className="aspect-[3/4] relative rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 group-hover:ring-white/30 transition-all">
                      {rel.coverUrl ? (
                        <img src={rel.coverUrl} alt={rel.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-zinc-800" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs font-bold leading-tight line-clamp-2 uppercase">{rel.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
