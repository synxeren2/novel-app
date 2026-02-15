import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const novel = await prisma.novel.findUnique({
      where: { id },
    });

    if (!novel || !novel.fileUrl) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 });
    }

    // Dosyayı Supabase'den çekiyoruz
    const response = await fetch(novel.fileUrl);
    const blob = await response.blob();

    // Dosya adını güvenli hale getiriyoruz (Türkçe karakter vb. sorun olmaması için)
    const safeTitle = novel.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${safeTitle}.${novel.fileType}`;

    // Dosyayı indirme başlıklarıyla geri döndürüyoruz
    return new NextResponse(blob, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": response.headers.get("Content-Type") || "application/pdf",
      },
    });
  } catch (error) {
    console.error("İndirme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
