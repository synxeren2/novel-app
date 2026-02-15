import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const novel = await prisma.novel.findUnique({
      where: { id },
    });

    if (!novel) {
      return NextResponse.json({ error: "Roman bulunamadı" }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), "public", novel.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = `${novel.title}.${novel.fileType}`;

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
