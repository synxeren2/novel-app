import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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

    // Eğer yeni bir kapak resmi yüklendiyse Supabase'e gönder
    if (coverFile && coverFile.size > 0) {
      const coverExtension = coverFile.name.split(".").pop();
      const coverName = `${uuidv4()}.${coverExtension}`;
      
      const { data: coverData, error: coverError } = await supabase.storage
        .from("novels")
        .upload(`covers/${coverName}`, coverFile);

      if (coverError) throw coverError;

      const { data: { publicUrl: cUrl } } = supabase.storage
        .from("novels")
        .getPublicUrl(`covers/${coverName}`);
      
      coverUrl = cUrl;
    }

    const updated = await prisma.novel.update({
      where: { id },
      data: {
        title: title || novel.title,
        author: author || novel.author,
        description: description !== null ? description : novel.description,
        coverUrl,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Güncelleme hatası:", error);
    return NextResponse.json({ error: error.message || "Sunucu hatası" }, { status: 500 });
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

    // İsteğe bağlı: Supabase Storage'daki dosyaları da silebiliriz
    // Ama şimdilik sadece DB'den siliyoruz
    await prisma.novel.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Roman başarıyla silindi" });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
