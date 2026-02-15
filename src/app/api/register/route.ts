import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve şifre zorunludur" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Bu e-posta zaten kullanımda" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluştur (emailVerified henüz null)
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Doğrulama token'ı oluştur
    const token = uuidv4();
    const expires = new Date(Date.now() + 3600 * 1000); // 1 saat geçerli

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // E-posta gönder
    try {
      await sendVerificationEmail(email, token);
    } catch (mailError) {
      console.error("Mail gönderme hatası:", mailError);
      // Kullanıcı oluşturuldu ama mail gitmediyse kullanıcıya bilgi verilmeli
      return NextResponse.json({ error: "Kayıt başarılı ancak doğrulama e-postası gönderilemedi." }, { status: 500 });
    }

    return NextResponse.json({ message: "Doğrulama e-postası gönderildi. Lütfen kutunuzu kontrol edin." }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
