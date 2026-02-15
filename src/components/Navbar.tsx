"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { BookOpen, Upload, LogIn, UserPlus, LogOut } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-white/10 bg-black py-4 px-6 flex justify-between items-center sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter">
        <BookOpen className="w-6 h-6" />
        <span>ROMAN OKU</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/" className="hover:text-gray-400 transition-colors">Ana Sayfa</Link>
        
        {session ? (
          <>
            <Link href="/upload" className="flex items-center gap-1 hover:text-gray-400 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Ekle</span>
            </Link>
            <div className="flex items-center gap-4 border-l border-white/20 pl-6">
              <span className="text-sm text-gray-400">{session.user?.email}</span>
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-1 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="flex items-center gap-1 hover:text-gray-400 transition-colors">
              <LogIn className="w-4 h-4" />
              <span>Giriş</span>
            </Link>
            <Link href="/register" className="flex items-center gap-1 bg-white text-black px-4 py-1.5 rounded-full font-medium hover:bg-gray-200 transition-colors">
              <UserPlus className="w-4 h-4" />
              <span>Kayıt Ol</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
