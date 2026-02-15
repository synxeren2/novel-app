"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Moon, Sun, Maximize, Minimize, AlertCircle, FileWarning } from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// More robust worker configuration for Next.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ReaderProps {
  fileUrl: string;
}

export default function Reader({ fileUrl }: ReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setError(null);
    setLoading(false);
  }

  function onDocumentLoadError(err: Error) {
    console.error("PDF Load Error detail:", err);
    setLoading(false);
    setError(`Dosya yüklenemedi: ${err.message}. Dosya yolu: ${fileUrl}`);
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => Math.min(Math.max(1, prevPageNumber + offset), numPages));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") changePage(1);
      if (e.key === "ArrowLeft") changePage(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [numPages]);

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Reader Controls */}
      <div className="z-10 bg-zinc-950 border-b border-white/10 p-4 flex flex-wrap items-center justify-between gap-4 sticky top-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => changePage(-1)} 
            disabled={pageNumber <= 1}
            className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors"
          >
            <ChevronLeft />
          </button>
          <span className="font-mono text-sm bg-white/10 px-3 py-1 rounded-md min-w-[100px] text-center">
            {numPages > 0 ? `${pageNumber} / ${numPages}` : "..."}
          </span>
          <button 
            onClick={() => changePage(1)} 
            disabled={pageNumber >= numPages || numPages === 0}
            className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 transition-colors"
          >
            <ChevronRight />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/5 rounded-full px-2 border border-white/10">
            <button onClick={() => setScale(s => Math.max(0.4, s - 0.2))} className="p-2 hover:text-gray-400"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-xs font-bold w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(3.0, s + 0.2))} className="p-2 hover:text-gray-400"><ZoomIn className="w-4 h-4" /></button>
          </div>

          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
            title="Gece Modu"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Page Display */}
      <div className="flex-1 overflow-auto flex justify-center p-4 md:p-8 scrollbar-hide bg-[#0a0a0a]">
        <div className={`relative transition-all duration-300 shadow-2xl ${darkMode ? 'pdf-dark-mode' : ''} min-h-[500px]`}>
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-400 gap-4 p-10 text-center max-w-md mx-auto">
              <FileWarning className="w-16 h-16 mb-2" />
              <h2 className="text-xl font-bold">Hata Oluştu</h2>
              <p className="text-sm opacity-80">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-white text-black px-6 py-2 rounded-full font-bold text-sm"
              >
                Sayfayı Yenile
              </button>
            </div>
          ) : (
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-bold uppercase tracking-widest text-sm animate-pulse text-gray-400">Roman Yükleniyor...</p>
                </div>
              }
            >
              {!loading && (
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  className="max-w-full"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              )}
            </Document>
          )}
        </div>
      </div>

      <style jsx global>{`
        .pdf-dark-mode canvas {
          filter: invert(0.9) hue-rotate(180deg) contrast(1.1) brightness(1.1) !important;
        }
        .pdf-dark-mode .react-pdf__Page__textContent,
        .pdf-dark-mode .react-pdf__Page__annotations {
          filter: invert(0.9) hue-rotate(180deg) !important;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .react-pdf__Page {
          background-color: white !important;
          margin-bottom: 20px;
        }
        .pdf-dark-mode .react-pdf__Page {
          background-color: #111 !important;
        }
        .react-pdf__Document {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
