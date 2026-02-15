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

    // Supabase URL'sini doğrudan yönlendiriyoruz. 
    // Bu sayede tarayıcı dosyayı Supabase üzerinden indirecektir.
    return NextResponse.redirect(novel.fileUrl);
  } catch (error) {
    console.error("İndirme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
