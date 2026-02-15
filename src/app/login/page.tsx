"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContent() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setSuccess("E-posta adresiniz başarıyla doğrulandı. Şimdi giriş yapabilirsiniz.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      if (res.error.includes("EMAIL_NOT_VERIFIED") || res.code === "EMAIL_NOT_VERIFIED") {
        setError("Lütfen giriş yapmadan önce e-posta adresinizi doğrulayın.");
      } else {
        setError("Giriş bilgileri hatalı");
      }
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border border-white/10 rounded-2xl bg-white/5 shadow-2xl">
      <h1 className="text-3xl font-bold mb-6">Giriş Yap</h1>
      
      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-lg mb-6 text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-400">E-posta</label>
          <input name="email" type="email" className="w-full bg-black border border-white/20 rounded-lg p-3 outline-none focus:border-white transition-colors" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-400">Şifre</label>
          <input name="password" type="password" className="w-full bg-black border border-white/20 rounded-lg p-3 outline-none focus:border-white transition-colors" required />
        </div>
        <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors">
          Giriş Yap
        </button>
      </form>

      <p className="mt-8 text-center text-gray-400 text-sm">
        Hesabınız yok mu? <Link href="/register" className="text-white hover:underline">Kayıt olun</Link>
      </p>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Yükleniyor...</div>}>
      <LoginContent />
    </Suspense>
  );
}
