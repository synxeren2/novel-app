"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, Clock, CheckCircle, ArrowLeft, MessageSquarePlus } from "lucide-react";
import Link from "next/link";

export default function RequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/requests").then(res => res.json()).then(setRequests);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return alert("Lütfen giriş yapın");
    
    setLoading(true);
    const res = await fetch("/api/requests", {
      method: "POST",
      body: JSON.stringify({ title, author }),
    });

    if (res.ok) {
      setTitle("");
      setAuthor("");
      const updated = await fetch("/api/requests").then(res => res.json());
      setRequests(updated);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Kütüphaneye Dön
      </Link>

      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Kitap İstek Merkezi</h1>
        <p className="text-gray-400">Aradığınız kitabı bulamadınız mı? Bize bildirin, en kısa sürede ekleyelim.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white/5 p-6 rounded-3xl border border-white/10 sticky top-24 space-y-4">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-lg">
              <MessageSquarePlus className="w-5 h-5" /> Yeni İstek
            </h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Kitap Adı</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-white transition-colors" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Yazar (Opsiyonel)</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-white transition-colors" />
            </div>
            <button disabled={loading || !session} className="w-full bg-white text-black font-black uppercase py-3 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Gönder
            </button>
            {!session && <p className="text-[10px] text-red-400 text-center font-bold uppercase">İstek yapmak için giriş yapmalısınız</p>}
          </form>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-lg mb-6">Son İstekler</h3>
          {requests.map((req: any) => (
            <div key={req.id} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex justify-between items-center group hover:border-white/20 transition-all">
              <div>
                <h4 className="font-bold text-lg leading-tight">{req.title}</h4>
                <p className="text-sm text-gray-500 font-medium">{req.author || "Yazar bilinmiyor"}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded uppercase font-bold text-gray-400">
                    {req.user?.name || "Anonim"}
                  </span>
                  <span className="text-[10px] text-gray-600 font-bold uppercase">
                    {new Date(req.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
              <div className={`flex flex-col items-end gap-1 ${req.status === 'Tamamlandı' ? 'text-green-500' : 'text-yellow-500'}`}>
                {req.status === 'Tamamlandı' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                <span className="text-[10px] font-black uppercase tracking-widest">{req.status}</span>
              </div>
            </div>
          ))}
          {requests.length === 0 && <p className="text-gray-500 italic py-10 text-center">Henüz hiç istek yapılmamış.</p>}
        </div>
      </div>
    </div>
  );
}
