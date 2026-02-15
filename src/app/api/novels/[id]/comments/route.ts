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
    return NextResponse.json({ error: "Yorum yapmak için giriş yapmalısınız" }, { status: 401 });
  }

  try {
    const { content, rating } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Yorum içeriği boş olamaz" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        rating: Number(rating) || 5,
        novelId,
        userId: session.user.id!,
        userName: session.user.name || session.user.email?.split('@')[0] || "Anonim",
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Yorum eklenirken bir hata oluştu" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: novelId } = await params;

  try {
    const comments = await prisma.comment.findMany({
      where: { novelId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: "Yorumlar yüklenirken bir hata oluştu" }, { status: 500 });
  }
}
