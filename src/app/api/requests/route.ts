import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  try {
    const { title, author } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Kitap adı zorunludur" }, { status: 400 });
    }

    const request = await prisma.request.create({
      data: {
        title,
        author,
        userId: session.user.id!,
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Hata oluştu" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const requests = await prisma.request.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
      take: 20,
    });
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: "Hata oluştu" }, { status: 500 });
  }
}
