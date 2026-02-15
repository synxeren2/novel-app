import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Book, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const novels = await prisma.novel.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black uppercase tracking-tighter">Kütüphane</h1>
          <p className="text-gray-400">Yeni dünyaları keşfedin.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Roman ara..." 
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 outline-none focus:border-white/30 transition-colors"
          />
        </div>
      </header>

      {novels.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-3xl p-20 text-center space-y-4">
          <Book className="w-16 h-16 mx-auto text-gray-700" />
          <p className="text-gray-500 text-lg">Henüz hiç roman eklenmemiş.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {novels.map((novel) => (
            <Link key={novel.id} href={`/novels/${novel.id}`} className="group space-y-3">
              <div className="aspect-[3/4] relative rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 group-hover:ring-white/30 transition-all group-hover:-translate-y-1 shadow-2xl">
                {novel.coverUrl ? (
                  <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                    <Book className="w-10 h-10 text-zinc-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-white">İncele</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold leading-tight group-hover:text-gray-300 transition-colors line-clamp-2">{novel.title}</h3>
                <p className="text-sm text-gray-500 truncate">{novel.author}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
