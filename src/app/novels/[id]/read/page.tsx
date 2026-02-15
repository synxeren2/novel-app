import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import Reader from "@/components/Reader";

export default async function ReadNovel({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const novel = await prisma.novel.findUnique({
    where: { id },
  });

  if (!novel) notFound();

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      {/* Top Navigation */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black shrink-0">
        <div className="flex items-center gap-4 overflow-hidden">
          <Link href={`/novels/${id}`} className="hover:text-gray-400 transition-colors shrink-0">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex flex-col leading-none">
            <h1 className="font-bold truncate max-w-[200px] md:max-w-md">{novel.title}</h1>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{novel.author}</span>
          </div>
        </div>
        <a 
          href={`/api/novels/download/${id}`}
          className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-black uppercase flex items-center gap-2 hover:bg-gray-200 transition-all shrink-0"
          download
        >
          <Download className="w-4 h-4" /> İndir
        </a>
      </div>

      {/* Custom Reader Component */}
      <div className="flex-1 relative overflow-hidden">
        <Reader fileUrl={novel.fileUrl} novelId={id} />
      </div>
    </div>
  );
}
