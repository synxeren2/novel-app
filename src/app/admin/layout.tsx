import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { User, Book, MessageSquare, AlertTriangle, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Admin kontrolü
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  const menuItems = [
    { href: "/admin", label: "Panel", icon: LayoutDashboard },
    { href: "/admin/requests", label: "İstekler", icon: Book },
    { href: "/admin/reports", label: "Raporlar", icon: AlertTriangle },
    { href: "/admin/users", label: "Kullanıcılar", icon: User },
    { href: "/admin/comments", label: "Yorumlar", icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col gap-8 hidden md:flex fixed h-full bg-zinc-950 top-0 left-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-xl">
            A
          </div>
          <div>
            <h2 className="font-bold text-lg">Admin Paneli</h2>
            <p className="text-xs text-gray-500">Yönetim Konsolu</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-gray-400 hover:text-white"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-xs text-gray-500 mb-2">Giriş yapan yönetici:</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                {session.user.name?.[0] || "A"}
              </div>
              <p className="text-sm font-bold truncate">{session.user.name}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
