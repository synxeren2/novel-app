import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse("Token eksik", { status: 400 });
  }

  const existingToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!existingToken) {
    return new NextResponse("Geçersiz token", { status: 400 });
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return new NextResponse("Token süresi dolmuş", { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: existingToken.identifier },
  });

  if (!user) {
    return new NextResponse("Kullanıcı bulunamadı", { status: 404 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
    },
  });

  await prisma.verificationToken.delete({
    where: { token },
  });

  // Kullanıcıyı giriş sayfasına yönlendiriyoruz
  return NextResponse.redirect(new URL("/login?verified=true", req.url));
}
