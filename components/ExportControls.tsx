"use client";

import { Download, FileType2, Maximize2, Presentation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { DesignSettings, LyricSlide } from "@/types/song";
import { SlidePreview } from "./SlidePreview";
import { exportSlidesAsPdf, exportSlidesAsPptx } from "@/lib/exportDeck";

export function ExportControls({
  slides,
  design,
  songTitle,
  copyrightInfo
}: {
  slides: LyricSlide[];
  design: DesignSettings;
  songTitle: string;
  copyrightInfo?: string;
}) {
  const [presentIndex, setPresentIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "pptx" | null>(null);
  const [error, setError] = useState("");
  const presentStageRef = useRef<HTMLDivElement | null>(null);
  const activeSlide = slides[presentIndex] ?? slides[0];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isPresenting && !document.fullscreenElement) return;
      if (event.key === "ArrowRight" || event.key === " ") {
        setPresentIndex((index) => Math.min(slides.length - 1, index + 1));
      }
      if (event.key === "ArrowLeft") {
        setPresentIndex((index) => Math.max(0, index - 1));
      }
      if (event.key === "Escape") {
        setIsPresenting(false);
        document.exitFullscreen?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPresenting, slides.length]);

  async function present(fullscreen = false) {
    setPresentIndex(0);
    setIsPresenting(true);
    setError("");
    if (fullscreen) {
      try {
        await presentStageRef.current?.requestFullscreen?.();
      } catch {
        setError("Fullscreen was blocked by the browser. Use the Fullscreen button in the presenter.");
      }
    }
  }

  async function enterFullscreen() {
    try {
      await presentStageRef.current?.requestFullscreen?.();
    } catch {
      setError("Fullscreen was blocked by the browser.");
    }
  }

  async function exportPdf() {
    setExporting("pdf");
    setError("");
    try {
      await exportSlidesAsPdf(slides, design, songTitle, copyrightInfo);
    } catch (caught) {
      console.error("PDF export failed", caught);
      setError(caught instanceof Error ? caught.message : "PDF export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  }

  async function exportPptx() {
    setExporting("pptx");
    setError("");
    try {
      await exportSlidesAsPptx(slides, design, songTitle, copyrightInfo);
    } catch (caught) {
      console.error("PowerPoint export failed", caught);
      setError(caught instanceof Error ? caught.message : "PowerPoint export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => present(true)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-950 px-3 py-2 text-sm font-bold text-white hover:bg-slate-800">
        <Presentation size={16} /> Present fullscreen
      </button>
      <button type="button" onClick={exportPptx} disabled={Boolean(exporting)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-950 disabled:opacity-50 hover:bg-slate-50">
        <FileType2 size={16} /> {exporting === "pptx" ? "Exporting..." : "PowerPoint"}
      </button>
      <button type="button" onClick={exportPdf} disabled={Boolean(exporting)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-950 disabled:opacity-50 hover:bg-slate-50">
        <Download size={16} /> {exporting === "pdf" ? "Exporting..." : "PDF"}
      </button>
      {error && <div className="flex items-center text-sm font-bold text-rose-600">{error}</div>}
      <div
        id="present-stage"
        ref={presentStageRef}
        className={`present-stage fixed inset-0 z-50 grid place-items-center bg-black p-6 transition ${
          isPresenting ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="w-[94vw]">
          {activeSlide && (
            <SlidePreview slide={activeSlide} design={design} songTitle={activeSlide.title || songTitle} copyrightInfo={copyrightInfo} />
          )}
          <div className="mt-3 flex items-center justify-center gap-3 text-sm font-bold text-white">
            <button type="button" className="rounded-lg bg-white/15 px-3 py-2" onClick={() => setPresentIndex((index) => Math.max(0, index - 1))}>
              Previous
            </button>
            <span>{presentIndex + 1} / {slides.length}</span>
            <button type="button" className="rounded-lg bg-white/15 px-3 py-2" onClick={() => setPresentIndex((index) => Math.min(slides.length - 1, index + 1))}>
              Next
            </button>
            <button type="button" className="rounded-lg bg-white/15 px-3 py-2" onClick={enterFullscreen}>
              Fullscreen
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsPresenting(false);
            document.exitFullscreen?.();
          }}
          className="absolute right-4 top-4 rounded-lg bg-white px-3 py-2 font-bold text-slate-950"
        >
          <Maximize2 size={16} className="mr-1 inline" /> Exit
        </button>
      </div>
    </div>
  );
}
