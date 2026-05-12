"use client";

import type { DesignSettings, LyricSlide } from "@/types/song";
import { SlidePreview } from "./SlidePreview";

export function SlideThumbnailList({
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
  return (
    <div className="grid max-h-[360px] gap-3 overflow-auto pr-1">
      {slides.map((slide, index) => (
        <button
          key={`${slide.id}-${index}`}
          onClick={() => onSelect(index)}
          className={`rounded-lg border p-1 text-left ${
            activeIndex === index ? "border-amber-500 bg-amber-500/10" : "border-white/10 bg-[#181c20]"
          }`}
        >
          <SlidePreview
            slide={slide}
            design={design}
            songTitle={songTitle}
            copyrightInfo={copyrightInfo}
            scale="thumb"
          />
          <div className="mt-1 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Slide {index + 1}</span>
            {slide.warning && <span className="text-amber-400">Warning</span>}
          </div>
        </button>
      ))}
    </div>
  );
}
