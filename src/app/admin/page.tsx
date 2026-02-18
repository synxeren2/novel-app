import { prisma } from "@/lib/prisma";
import { Users, BookOpen, MessageCircle, AlertCircle } from "lucide-react";

export default async function AdminDashboard() {
  const [userCount, novelCount, requestCount, reportCount] = await Promise.all([
    prisma.user.count(),
    prisma.novel.count(),
    prisma.request.count({ where: { status: "Beklemede" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
  ]);

  const stats = [
    { label: "Toplam Kullanıcı", value: userCount, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Toplam Roman", value: novelCount, icon: BookOpen, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Bekleyen İstekler", value: requestCount, icon: MessageCircle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Aktif Raporlar", value: reportCount, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black uppercase tracking-tighter">Genel Bakış</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-white/10 p-6 rounded-2xl flex items-center gap-4 hover:border-white/30 transition-colors">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-3xl font-black">{stat.value}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Placeholder */}
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-4">
          <h2 className="text-xl font-bold">Son Aktiviteler</h2>
          <p className="text-gray-500 text-sm">Henüz aktivite kaydı tutulmuyor.</p>
        </div>

        {/* Quick Actions Placeholder */}
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-4">
          <h2 className="text-xl font-bold">Hızlı İşlemler</h2>
          <div className="flex gap-4">
             <button className="bg-white text-black px-4 py-2 rounded-xl text-sm font-bold uppercase hover:bg-gray-200 transition-colors">Roman Ekle</button>
             <button className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold uppercase hover:bg-white/20 transition-colors">Duyuru Yap</button>
          </div>
        </div>
      </div>
    </div>
  );
}
