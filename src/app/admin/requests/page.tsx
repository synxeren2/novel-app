"use client";

import { useState, useEffect } from "react";
import { Check, X, Clock, User } from "lucide-react";

interface Request {
  id: string;
  title: string;
  author: string | null;
  status: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchRequests(); // Listeyi yenile
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-gray-500 font-bold uppercase tracking-widest">Yükleniyor...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black uppercase tracking-tighter">Kitap İstekleri</h1>

      {requests.length === 0 ? (
        <div className="bg-zinc-900 border border-white/10 p-10 rounded-3xl text-center text-gray-500">
          Henüz hiç istek yok.
        </div>
      ) : (
        <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="p-4">Kitap / Yazar</th>
                <th className="p-4">İsteyen</th>
                <th className="p-4">Tarih</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{req.title}</div>
                    <div className="text-gray-500 text-xs">{req.author || "Bilinmiyor"}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {req.user.name?.[0] || "U"}
                      </div>
                      <span className="text-gray-300">{req.user.name || "Anonim"}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                      req.status === "Tamamlandı" ? "bg-green-500/20 text-green-400" :
                      req.status === "Reddedildi" ? "bg-red-500/20 text-red-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {req.status === "Beklemede" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(req.id, "Tamamlandı")}
                          className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
                          title="Onayla"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req.id, "Reddedildi")}
                          className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                          title="Reddet"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
