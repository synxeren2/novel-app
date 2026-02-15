import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const coverFile = formData.get("cover") as File | null;
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string || "Genel";

    if (!file || !title) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    // 1. Roman Dosyasını Supabase'e Yükle
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const { data: fileData, error: fileError } = await supabase.storage
      .from("novels")
      .upload(`files/${fileName}`, file);

    if (fileError) throw fileError;

    const { data: { publicUrl: fileUrl } } = supabase.storage
      .from("novels")
      .getPublicUrl(`files/${fileName}`);

    // 2. Kapak Resmini Supabase'e Yükle
    let coverUrl = null;
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

    // 3. Veritabanına Kaydet
    const novel = await prisma.novel.create({
      data: {
        title,
        author,
        description,
        coverUrl,
        fileUrl,
        fileType: fileExtension || "pdf",
        category,
        uploaderId: session.user.id!,
      },
    });

    return NextResponse.json(novel, { status: 201 });
  } catch (error: any) {
    console.error("Yükleme hatası:", error);
    return NextResponse.json({ error: error.message || "Sunucu hatası" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const novels = await prisma.novel.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(novels);
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
