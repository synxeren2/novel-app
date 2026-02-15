"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";

export default function FavoriteButton({ novelId }: { novelId: string }) {
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch(`/api/novels/${novelId}/favorite`)
        .then(res => res.json())
        .then(data => setIsFavorite(data.isFavorite))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [novelId, session]);

  const toggleFavorite = async () => {
    if (!session) return alert("Favorilere eklemek için giriş yapmalısınız");
    
    const res = await fetch(`/api/novels/${novelId}/favorite`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setIsFavorite(data.isFavorite);
    }
  };

  if (loading) return <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />;

  return (
    <button 
      onClick={toggleFavorite}
      className={`p-3 rounded-full transition-all active:scale-90 flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${
        isFavorite 
          ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
          : "bg-white/5 text-gray-400 hover:bg-white/10"
      }`}
    >
      <Heart className={`w-5 h-5 ${isFavorite ? "fill-white" : ""}`} />
      {isFavorite ? "Favorilerde" : "Favoriye Ekle"}
    </button>
  );
}
