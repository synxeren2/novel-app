import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id: novelId } = await params;

  if (!session || !session.user) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const userId = session.user.id!;

  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_novelId: { userId, novelId } },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isFavorite: false });
    } else {
      await prisma.favorite.create({
        data: { userId, novelId },
      });
      return NextResponse.json({ isFavorite: true });
    }
  } catch (error) {
    return NextResponse.json({ error: "Hata" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id: novelId } = await params;

  if (!session || !session.user) {
    return NextResponse.json({ isFavorite: false });
  }

  try {
    const favorite = await prisma.favorite.findUnique({
      where: { userId_novelId: { userId: session.user.id!, novelId } },
    });
    return NextResponse.json({ isFavorite: !!favorite });
  } catch (error) {
    return NextResponse.json({ isFavorite: false });
  }
}
