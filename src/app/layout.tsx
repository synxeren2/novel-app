import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "Roman Oku & İndir | Ücretsiz PDF Kitaplar",
    template: "%s | Roman Oku & İndir",
  },
  description: "En sevdiğiniz romanları çevrimiçi okuyun ve ücretsiz indirin. Geniş PDF kütüphanemizi keşfedin.",
  keywords: ["roman oku", "kitap indir", "pdf kitap", "ücretsiz romanlar", "e-kitap"],
  authors: [{ name: "Roman Oku Ekibi" }],
  creator: "Roman Oku",
  publisher: "Roman Oku",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://romanoku.space"), // Domaini buraya yazın
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Roman Oku & İndir | Ücretsiz PDF Kitaplar",
    description: "En sevdiğiniz romanları çevrimiçi okuyun ve ücretsiz indirin.",
    url: "https://romanoku.space", // Replace with your domain
    siteName: "Roman Oku",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roman Oku & İndir | Ücretsiz PDF Kitaplar",
    description: "En sevdiğiniz romanları çevrimiçi okuyun ve ücretsiz indirin.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased bg-black text-white min-h-screen font-sans">
        <Providers>
          <Navbar />
          <main className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
