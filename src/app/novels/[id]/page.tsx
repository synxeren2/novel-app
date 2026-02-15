import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Download, BookOpen, Edit2, Calendar, User } from "lucide-react";
import { notFound } from "next/navigation";

export default async function NovelDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  const novel = await prisma.novel.findUnique({
    where: { id },
  });

  if (!novel) notFound();

  const isOwner = session?.user?.id === novel.uploaderId;

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Cover */}
        <div className="w-full md:w-80 shrink-0">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 sticky top-24">
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
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-5xl font-black uppercase leading-tight tracking-tighter">{novel.title}</h1>
              {isOwner && (
                <Link href={`/novels/${id}/edit`} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm font-bold">
                  <Edit2 className="w-4 h-4" /> Düzenle
                </Link>
              )}
            </div>
            
            <div className="flex flex-wrap gap-6 text-gray-400 font-medium">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" /> {novel.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> {new Date(novel.createdAt).toLocaleDateString('tr-TR')}
              </div>
              <div className="bg-white/10 px-3 py-1 rounded text-xs uppercase font-bold tracking-widest text-white">
                {novel.fileType}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              href={`/novels/${id}/read`}
              className="flex-1 flex items-center justify-center gap-3 bg-white text-black text-lg font-black uppercase py-5 rounded-2xl hover:bg-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpen className="w-6 h-6" /> Hemen Oku
            </Link>
            <a 
              href={`/api/novels/download/${id}`}
              className="flex-1 flex items-center justify-center gap-3 bg-zinc-900 border border-white/10 text-white text-lg font-black uppercase py-5 rounded-2xl hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
              download
            >
              <Download className="w-6 h-6" /> Dosyayı İndir
            </a>
          </div>

          <div className="space-y-4 pt-8">
            <h2 className="text-2xl font-bold border-l-4 border-white pl-4">Özet</h2>
            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
              {novel.description || "Bu roman için henüz bir açıklama girilmemiş."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
