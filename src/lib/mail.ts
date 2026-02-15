import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

  await resend.emails.send({
    from: "Roman Kütüphanesi <noreply@romanoku.space>", // Burayı kendi domaininle değiştir
    to: email,
    subject: "E-postanızı Doğrulayın",
    html: `<p>Roman uygulamasına hoş geldiniz! Hesabınızı doğrulamak için <a href="${confirmLink}">buraya tıklayın</a>.</p>`,
  });
};
