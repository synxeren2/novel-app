"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Heart, Upload, BookOpen, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/user/profile")
        .then(res => res.json())
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (!session) return <div className="text-center py-20">Lütfen giriş yapın.</div>;
  if (loading) return <div className="text-center py-20 animate-pulse font-bold uppercase tracking-widest text-gray-500">Profil Yükleniyor...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-12">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Geri Dön
      </Link>

      {/* Profile Header */}
      <header className="flex flex-col md:flex-row items-center gap-8 bg-white/5 p-8 rounded-3xl border border-white/10">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/5 shadow-2xl shrink-0">
          <User className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
        </div>
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">{session.user?.name || "Kullanıcı"}</h1>
          <p className="text-gray-500 font-medium">{session.user?.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
            <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-300">
              Üye
            </span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <Heart className="w-5 h-5 fill-red-500" />
            <span className="text-xs font-black uppercase tracking-widest">Favoriler</span>
          </div>
          <p className="text-3xl font-black">{data?.stats.totalFavorites || 0}</p>
          <p className="text-xs text-gray-500 font-bold uppercase">Kitap Kaydedildi</p>
        </div>
        
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Upload className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Yüklemeler</span>
          </div>
          <p className="text-3xl font-black">{data?.stats.totalUploads || 0}</p>
          <p className="text-xs text-gray-500 font-bold uppercase">Kitap Paylaşıldı</p>
        </div>

        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center gap-2 text-yellow-500 mb-2">
            <Star className="w-5 h-5 fill-yellow-500" />
            <span className="text-xs font-black uppercase tracking-widest">Favori Tür</span>
          </div>
          <p className="text-3xl font-black truncate">{data?.stats.topCategory}</p>
          <p className="text-xs text-gray-500 font-bold uppercase">En Çok Okunan</p>
        </div>
      </div>

      {/* Favorites Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-black uppercase tracking-tighter border-l-4 border-white pl-4">Kişisel Kitaplığım</h2>
        
        {data?.favorites.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <BookOpen className="w-12 h-12 mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500">Henüz favori kitap eklememişsiniz.</p>
            <Link href="/" className="inline-block mt-4 text-white font-bold underline underline-offset-4">Keşfetmeye Başla</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {data?.favorites.map((novel: any) => (
              <Link key={novel.id} href={`/novels/${novel.id}`} className="group space-y-2">
                <div className="aspect-[3/4] relative rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 group-hover:ring-white/30 transition-all shadow-xl">
                  {novel.coverUrl ? (
                    <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-zinc-800" />
                    </div>
                  )}
                </div>
                <h3 className="text-xs font-bold leading-tight line-clamp-2 uppercase">{novel.title}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
