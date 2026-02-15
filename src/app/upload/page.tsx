"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload as UploadIcon, CheckCircle, AlertCircle, Image as ImageIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const router = useRouter();

  async function generateThumbnail(file: File): Promise<Blob | null> {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      if (!context) return null;
      await page.render({ canvasContext: context, viewport: viewport, canvas: canvas }).promise;
      return new Promise((resolve) => { canvas.toBlob((blob) => resolve(blob), "image/png"); });
    } catch (err) { return null; }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    const cover = formData.get("cover") as File;

    if ((!cover || cover.size === 0) && file.type === "application/pdf") {
      const thumbnailBlob = await generateThumbnail(file);
      if (thumbnailBlob) {
        formData.set("cover", new File([thumbnailBlob], "auto-cover.png", { type: "image/png" }));
      }
    }
    
    try {
      const res = await fetch("/api/novels", { method: "POST", body: formData });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/"), 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Hata oluştu");
      }
    } catch (err) { setError("Bağlantı hatası"); } finally { setLoading(false); }
  }

  return (
    <div className="max-w-4xl mx-auto px-2 py-4 md:py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Geri Dön
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Yeni Roman Ekle</h1>
        <p className="text-gray-400 text-sm">Roman bilgilerini eksiksiz doldurun.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-400">Roman Kapağı</label>
            <div className="relative aspect-[3/4] border-2 border-dashed border-white/20 rounded-2xl overflow-hidden group hover:border-white/40 transition-colors bg-white/5 mx-auto w-2/3 md:w-full">
              {coverPreview ? (
                <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                  <ImageIcon className="w-10 h-10 mb-2" />
                  <span className="text-[10px] md:text-xs">Kapak Seç (Opsiyonel)</span>
                </div>
              )}
              <input name="cover" type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setCoverPreview(URL.createObjectURL(file));
              }} />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Roman Başlığı</label>
              <input name="title" type="text" className="w-full bg-black border border-white/20 rounded-xl p-3 md:p-4 outline-none focus:border-white transition-colors text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Yazar</label>
              <input name="author" type="text" className="w-full bg-black border border-white/20 rounded-xl p-3 md:p-4 outline-none focus:border-white transition-colors text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Açıklama</label>
              <textarea name="description" rows={5} className="w-full bg-black border border-white/20 rounded-xl p-3 md:p-4 outline-none focus:border-white transition-colors resize-none text-sm" placeholder="Özet..." />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-400">Roman Dosyası (PDF)</label>
          <div className="relative border-2 border-dashed border-white/20 rounded-2xl p-6 md:p-10 text-center hover:border-white/40 transition-colors cursor-pointer group bg-white/5">
            <input name="file" type="file" accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
            <UploadIcon className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-4 text-gray-500 group-hover:text-white transition-colors" />
            <p className="font-medium text-gray-300 text-sm md:text-base">Dosyayı seçmek için tıklayın</p>
          </div>
        </div>

        {error && <div className="text-red-500 bg-red-500/10 p-4 rounded-xl flex gap-2 text-sm"><AlertCircle /> {error}</div>}
        {success && <div className="text-green-500 bg-green-500/10 p-4 rounded-xl flex gap-2 text-sm"><CheckCircle /> Roman eklendi!</div>}

        <button type="submit" disabled={loading} className="w-full bg-white text-black font-black uppercase py-4 md:py-5 rounded-xl md:rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50 active:scale-95 text-sm md:text-base">
          {loading ? "Yükleniyor..." : "Romanı Yayınla"}
        </button>
      </form>
    </div>
  );
}
