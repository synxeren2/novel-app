"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Image as ImageIcon, AlertCircle, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditNovel({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [novel, setNovel] = useState<any>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/novels/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else {
          setNovel(data);
          setCoverPreview(data.coverUrl);
        }
      })
      .finally(() => setFetching(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Bu romanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/novels/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Silme işlemi sırasında bir hata oluştu");
        setDeleting(false);
      }
    } catch (err) {
      setError("Bağlantı hatası");
      setDeleting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch(`/api/novels/${id}`, {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        router.push(`/novels/${id}`);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Güncelleme sırasında bir hata oluştu");
      }
    } catch (err) {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="text-center py-20">Yükleniyor...</div>;
  if (!novel) return <div className="text-center py-20 text-red-500">Roman bulunamadı.</div>;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Link href={`/novels/${id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Geri Dön
      </Link>
      
      <header className="mb-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Romanı Düzenle</h1>
        <p className="text-gray-400">Roman bilgilerini güncelleyin.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-400">Kapak Resmi</label>
            <div className="relative aspect-[3/4] border-2 border-dashed border-white/20 rounded-2xl overflow-hidden group hover:border-white/40 transition-colors bg-white/5">
              {coverPreview ? (
                <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <span className="text-xs">Kapak Seç</span>
                </div>
              )}
              <input 
                name="cover" 
                type="file" 
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setCoverPreview(URL.createObjectURL(file));
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Başlık</label>
              <input name="title" type="text" defaultValue={novel.title} className="w-full bg-black border border-white/20 rounded-lg p-3 outline-none focus:border-white transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Yazar</label>
              <input name="author" type="text" defaultValue={novel.author} className="w-full bg-black border border-white/20 rounded-lg p-3 outline-none focus:border-white transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Açıklama</label>
              <textarea name="description" rows={6} defaultValue={novel.description} className="w-full bg-black border border-white/20 rounded-lg p-3 outline-none focus:border-white transition-colors resize-none" />
            </div>
          </div>
        </div>

        {error && <div className="text-red-500 bg-red-500/10 p-4 rounded-lg flex gap-2"><AlertCircle /> {error}</div>}

        <div className="flex flex-col gap-4">
          <button type="submit" disabled={loading || deleting} className="w-full bg-white text-black font-black uppercase py-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>

          <button 
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting}
            className="w-full bg-red-500/10 text-red-500 border border-red-500/20 font-bold uppercase py-4 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            {deleting ? "Siliniyor..." : "Romanı Sil"}
          </button>
        </div>
      </form>
    </div>
  );
}
