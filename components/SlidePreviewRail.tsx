"use client";

import type { DesignSettings, LyricSlide } from "@/types/song";
import { SlidePreview } from "./SlidePreview";

export function SlidePreviewRail({
  slides,
  activeIndex,
  onSelect,
  design,
  songTitle,
  copyrightInfo
}: {
  slides: LyricSlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
  design: DesignSettings;
  songTitle: string;
  copyrightInfo?: string;
}) {
  const activeSlide = slides[activeIndex] ?? slides[0];

  return (
    <div className="grid min-h-0 grid-cols-[minmax(260px,38vw)_minmax(0,1fr)] gap-3 rounded-lg border border-white/10 bg-[#111417] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="min-w-0">
        <SlidePreview
          slide={activeSlide}
          design={design}
          songTitle={songTitle}
          copyrightInfo={copyrightInfo}
        />
      </div>
      <div className="min-w-0">
        <div className="mb-2 flex items-center justify-between text-sm font-black text-slate-200">
          <span>Slides</span>
          <span className="text-slate-400">{slides.length}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {slides.map((slide, index) => (
            <button
              key={`${slide.id}-rail-${index}`}
              onClick={() => onSelect(index)}
              className={`w-44 shrink-0 rounded-lg border p-1 text-left ${
                activeIndex === index
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-white/10 bg-[#181c20]"
              }`}
            >
              <SlidePreview
                slide={slide}
                design={design}
                songTitle={songTitle}
                copyrightInfo={copyrightInfo}
                scale="thumb"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>{index + 1}</span>
                <span className={slide.warning ? "text-amber-400" : ""}>
                  {slide.warning ? "Crowded" : slide.sectionNames.join(" / ")}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
