"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function Register() {
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const name = formData.get("name");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Bir hata oluştu");
      }
    } catch (err) {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto mt-20 p-10 border border-white/10 rounded-2xl bg-white/5 text-center space-y-6 shadow-2xl">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-bold text-white">E-posta Gönderildi!</h1>
        <p className="text-gray-400">
          Lütfen e-posta adresinizi doğrulamak için kutunuzu kontrol edin. Doğrulama linkini açtıktan sonra giriş yapabilirsiniz.
        </p>
        <Link href="/login" className="block w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors">
          Giriş Sayfasına Git
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border border-white/10 rounded-2xl bg-white/5 shadow-2xl">
      <h1 className="text-3xl font-bold mb-6">Kayıt Ol</h1>
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-400">İsim</label>
          <input name="name" type="text" className="w-full bg-black border border-white/20 rounded-lg p-3 outline-none focus:border-white transition-colors" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-400">E-posta</label>
          <input name="email" type="email" className="w-full bg-black border border-white/20 rounded-lg p-3 outline-none focus:border-white transition-colors" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-400">Şifre</label>
          <input name="password" type="password" className="w-full bg-black border border-white/20 rounded-lg p-3 outline-none focus:border-white transition-colors" required />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
        </button>
      </form>
      <p className="mt-8 text-center text-gray-400 text-sm">
        Zaten hesabınız var mı? <Link href="/login" className="text-white hover:underline">Giriş yapın</Link>
      </p>
    </div>
  );
}
