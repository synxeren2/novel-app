import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const userId = session.user.id!;

  try {
    // Favori kitapları getir
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        novel: {
          select: {
            id: true,
            title: true,
            author: true,
            coverUrl: true,
            category: true,
          }
        }
      }
    });

    // Okuma ilerlemelerini getir
    const readingProgress = await prisma.readingProgress.findMany({
      where: { userId },
      include: {
        novel: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
            author: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const reading = readingProgress.filter(p => p.status === 'READING').map(p => ({...p.novel, progress: p.page, updatedAt: p.updatedAt}));
    const completed = readingProgress.filter(p => p.status === 'COMPLETED').map(p => ({...p.novel, updatedAt: p.updatedAt}));
    const onHold = readingProgress.filter(p => p.status === 'ON_HOLD').map(p => ({...p.novel, progress: p.page, updatedAt: p.updatedAt}));
    const dropped = readingProgress.filter(p => p.status === 'DROPPED').map(p => ({...p.novel, progress: p.page, updatedAt: p.updatedAt}));

    // Kullanıcının yüklediği kitapları getir
    const uploadsCount = await prisma.novel.count({
      where: { uploaderId: userId }
    });

    // En çok okunan kategori (Örnek mantık)
    const favoriteNovels = favorites.map(f => f.novel);
    const categoryCounts = favoriteNovels.reduce((acc: any, novel) => {
      acc[novel.category] = (acc[novel.category] || 0) + 1;
      return acc;
    }, {});
    
    const topCategory = Object.entries(categoryCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "Henüz Yok";

    return NextResponse.json({
      favorites: favoriteNovels,
      reading,
      completed,
      onHold,
      dropped,
      stats: {
        totalFavorites: favorites.length,
        totalUploads: uploadsCount,
        topCategory
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Hata" }, { status: 500 });
  }
}
