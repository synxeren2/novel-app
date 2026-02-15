"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { BookOpen, Upload, LogIn, UserPlus, LogOut, Menu, X, User } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b border-white/10 bg-black/80 backdrop-blur-md py-4 px-4 md:px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-lg md:text-xl font-bold tracking-tighter shrink-0">
          <img src="/logo.png" alt="Roman Oku Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
          <span>ROMAN OKU</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="hover:text-gray-400 transition-colors">Ana Sayfa</Link>
          <Link href="/requests" className="hover:text-gray-400 transition-colors">İstekler</Link>
          
          {session ? (
            <>
              <Link href="/upload" className="flex items-center gap-1 hover:text-gray-400 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Ekle</span>
              </Link>
              <div className="flex items-center gap-4 border-l border-white/20 pl-6">
                <Link href="/profile" className="text-sm text-gray-400 hover:text-white transition-colors truncate max-w-[150px] flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {session.user?.name || "Profilim"}
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="flex items-center gap-1 hover:text-red-400 transition-colors text-gray-500"
                >
                  <LogOut className="w-4 h-4" />
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

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black border-b border-white/10 p-6 space-y-6 flex flex-col animate-in fade-in slide-in-from-top-4">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-xl font-bold">Ana Sayfa</Link>
          <Link href="/requests" onClick={() => setIsOpen(false)} className="text-xl font-bold">İstek Paneli</Link>
          {session ? (
            <>
              <Link href="/upload" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-xl">
                <Upload className="w-5 h-5" /> Ekle
              </Link>
              <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-xl">
                <User className="w-5 h-5" /> Profilim
              </Link>
              <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
                <span className="text-sm text-gray-500">{session.user?.email}</span>
                <button 
                  onClick={() => { signOut(); setIsOpen(false); }}
                  className="flex items-center gap-2 text-red-500 text-xl text-left"
                >
                  <LogOut className="w-5 h-5" /> Çıkış Yap
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-xl">
                <LogIn className="w-5 h-5" /> Giriş Yap
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl font-bold">
                <UserPlus className="w-5 h-5" /> Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
