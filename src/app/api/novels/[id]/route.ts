import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const novel = await prisma.novel.findUnique({
      where: { id },
    });
    if (!novel) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json(novel);
  } catch (error) {
    return NextResponse.json({ error: "Hata" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const novel = await prisma.novel.findUnique({ where: { id } });
    if (!novel) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    if (novel.uploaderId !== session.user.id) {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const description = formData.get("description") as string;
    const coverFile = formData.get("cover") as File | null;

    let coverUrl = novel.coverUrl;

    if (coverFile && coverFile.size > 0) {
      const coverBytes = await coverFile.arrayBuffer();
      const coverExtension = path.extname(coverFile.name);
      const coverName = `${uuidv4()}${coverExtension}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");
      await writeFile(path.join(uploadDir, coverName), Buffer.from(coverBytes));
      coverUrl = `/uploads/${coverName}`;
    }

    const updated = await prisma.novel.update({
      where: { id },
      data: {
        title: title || novel.title,
        author: author || novel.author,
        description: description || novel.description,
        coverUrl,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const novel = await prisma.novel.findUnique({ where: { id } });
    if (!novel) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    
    if (novel.uploaderId !== session.user.id) {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 });
    }

    await prisma.novel.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Roman başarıyla silindi" });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
