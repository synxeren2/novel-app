"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Moon, Sun, Maximize, Minimize, FileWarning } from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ReaderProps {
  fileUrl: string;
  novelId: string;
}

export default function Reader({ fileUrl, novelId }: ReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(0.8);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sayfayı yükle
  useEffect(() => {
    const savedPage = localStorage.getItem(`novel_page_${novelId}`);
    if (savedPage) {
      setPageNumber(parseInt(savedPage));
    }
  }, [novelId]);

  // Sayfayı kaydet
  useEffect(() => {
    if (pageNumber > 0) {
      localStorage.setItem(`novel_page_${novelId}`, pageNumber.toString());
    }
  }, [pageNumber, novelId]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setError(null);
    setLoading(false);
  }

  const changePage = (offset: number) => {
    setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages));
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) setScale(0.5);
  }, []);

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden">
      {/* Reader Controls */}
      <div className="z-20 bg-zinc-950 border-b border-white/10 p-2 md:p-4 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 sticky top-0">
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1 md:gap-2">
            <button onClick={() => changePage(-1)} disabled={pageNumber <= 1} className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-mono text-[10px] md:text-sm bg-white/10 px-2 md:px-3 py-1 rounded-md min-w-[70px] md:min-w-[100px] text-center">
              {numPages > 0 ? `${pageNumber} / ${numPages}` : "..."}
            </span>
            <button onClick={() => changePage(1)} disabled={pageNumber >= numPages || numPages === 0} className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-1 md:hidden">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full ${darkMode ? 'bg-white text-black' : 'bg-white/10'}`}>
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center bg-white/5 rounded-full px-1 border border-white/10 flex-1 md:flex-none justify-between">
            <button onClick={() => setScale(s => Math.max(0.3, s - 0.1))} className="p-2 hover:text-gray-400"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-[10px] md:text-xs font-bold w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(3.0, s + 0.1))} className="p-2 hover:text-gray-400"><ZoomIn className="w-4 h-4" /></button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full ${darkMode ? 'bg-white text-black' : 'bg-white/10'}`}>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Page Display */}
      <div className="flex-1 overflow-auto flex justify-center p-2 md:p-8 scrollbar-hide bg-[#0a0a0a]">
        <div className={`relative transition-all duration-300 shadow-2xl ${darkMode ? 'pdf-dark-mode' : ''}`}>
          {error ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <FileWarning className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="py-20 animate-pulse text-sm font-bold uppercase tracking-widest text-gray-500">Yükleniyor...</div>}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                className="max-w-full"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          )}
        </div>
      </div>

      <style jsx global>{`
        .pdf-dark-mode canvas { filter: invert(0.9) hue-rotate(180deg) contrast(1.1) brightness(1.1) !important; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .react-pdf__Page { background-color: white !important; margin-bottom: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .pdf-dark-mode .react-pdf__Page { background-color: #111 !important; }
      `}</style>
    </div>
  );
}
