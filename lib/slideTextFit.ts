import type { DesignSettings, LyricSlide } from "@/types/song";

type FitOptions = {
  maxFont?: number;
  minFont?: number;
  reserveTop?: number;
  reserveBottom?: number;
};

let fitMeasureCanvas: HTMLCanvasElement | undefined;

function pageSize(design: DesignSettings) {
  return design.aspectRatio === "4:3"
    ? { width: 960, height: 720 }
    : { width: 1280, height: 720 };
}

function measureText(text: string, fontSize: number, design: DesignSettings) {
  const font = `${design.fontWeight} ${fontSize}px ${design.fontFamily}, Arial, sans-serif`;
  if (typeof document !== "undefined") {
    const canvas = fitMeasureCanvas || (fitMeasureCanvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    if (context) {
      context.font = font;
      return context.measureText(text).width;
    }
  }
  return text.length * fontSize * 0.56;
}

export function slideLineTexts(slide: LyricSlide) {
  return slide.lines.length ? slide.lines.map((line) => line.text || " ") : ["No lyrics selected"];
}

export function fitLyricFontSize(lines: string[], design: DesignSettings, options: FitOptions = {}) {
  const page = pageSize(design);
  const marginX = page.width * (design.margins / 100);
  const marginY = page.height * (design.margins / 100);
  const boxWidth = page.width * (design.textBoxWidth / 100);
  const availableWidth = Math.max(80, boxWidth - marginX * 2);
  const availableHeight = Math.max(
    80,
    page.height - marginY * 2 - (options.reserveTop ?? 0) - (options.reserveBottom ?? 0)
  );
  const cleaned = lines.map((line) => line.trim()).filter(Boolean);
  const textLines = cleaned.length ? cleaned : [" "];
  const minFont = options.minFont ?? 12;
  let low = minFont;
  let high = options.maxFont ?? design.fontSize;
  let best = minFont;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const widest = textLines.reduce((max, line) => Math.max(max, measureText(line, middle, design)), 0);
    const totalHeight = textLines.length * middle * design.lineSpacing;
    if (widest <= availableWidth && totalHeight <= availableHeight) {
      best = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return best;
}

export function fitDeckFontSize(slides: LyricSlide[], design: DesignSettings, options: FitOptions = {}) {
  if (!slides.length) return design.fontSize;
  return slides.reduce(
    (best, slide) => Math.min(best, fitLyricFontSize(slideLineTexts(slide), design, options)),
    options.maxFont ?? design.fontSize
  );
}
