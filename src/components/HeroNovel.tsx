import Link from "next/link";
import { BookOpen, Star, TrendingUp } from "lucide-react";

interface HeroNovelProps {
  novel: {
    id: string;
    title: string;
    author: string | null;
    description: string | null;
    coverUrl: string | null;
    category: string;
  };
}

export default function HeroNovel({ novel }: HeroNovelProps) {
  return (
    <div className="relative w-full min-h-[400px] md:min-h-[500px] rounded-3xl overflow-hidden group mb-12">
      {/* Background Image with Blur */}
      {novel.coverUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-30 transition-transform duration-700 group-hover:scale-100"
          style={{ backgroundImage: `url(${novel.coverUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col md:flex-row items-center gap-8 p-6 md:p-12">
        <div className="w-40 md:w-64 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20 shrink-0 transform -rotate-2 group-hover:rotate-0 transition-transform duration-500">
          {novel.coverUrl ? (
            <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-zinc-800" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Günün Öne Çıkanı
            </span>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">
              {novel.category}
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">
            {novel.title}
          </h2>
          
          <p className="text-gray-400 font-medium text-sm md:text-lg line-clamp-3 max-w-2xl">
            {novel.description || "Bu muhteşem eseri hemen keşfedin ve okumaya başlayın."}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link 
              href={`/novels/${novel.id}`}
              className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 text-center"
            >
              Hemen İncele
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
