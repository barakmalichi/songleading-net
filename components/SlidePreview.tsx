"use client";

import type { DesignSettings, LyricSlide } from "@/types/song";

function placementClass(value: DesignSettings["verticalPlacement"] | DesignSettings["horizontalPlacement"], axis: "x" | "y") {
  if (axis === "y") {
    if (value === "start") return "justify-start";
    if (value === "end") return "justify-end";
    return "justify-center";
  }
  if (value === "start") return "items-start";
  if (value === "end") return "items-end";
  return "items-center";
}

export function SlidePreview({
  slide,
  design,
  songTitle,
  copyrightInfo,
  scale = "large"
}: {
  slide: LyricSlide;
  design: DesignSettings;
  songTitle: string;
  copyrightInfo?: string;
  scale?: "large" | "thumb";
}) {
  const isThumb = scale === "thumb";
  const background = design.backgroundImage || design.backgroundColor;
  const style: React.CSSProperties = {
    background: background.startsWith("linear") ? background : undefined,
    backgroundColor: background.startsWith("linear") ? undefined : design.backgroundColor,
    backgroundImage:
      design.backgroundImage && !design.backgroundImage.startsWith("linear")
        ? `url(${design.backgroundImage})`
        : design.backgroundImage.startsWith("linear")
          ? design.backgroundImage
          : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: design.textColor,
    fontFamily: design.fontFamily,
    containerType: "inline-size"
  };
  const fontSize = isThumb ? Math.max(7, design.fontSize / 5.3) : Math.max(12, design.fontSize);

  return (
    <div
      className={`relative flex overflow-hidden rounded-lg shadow-[0_22px_60px_rgba(0,0,0,0.38)] ring-1 ring-white/10 ${
        design.aspectRatio === "4:3" ? "slide-aspect-43" : "slide-aspect"
      } ${placementClass(design.verticalPlacement, "y")} ${placementClass(
        design.horizontalPlacement,
        "x"
      )}`}
      dir="auto"
      style={style}
    >
      <div
        className="flex flex-col"
        style={{
          width: `${design.textBoxWidth}%`,
          padding: `${design.margins}%`,
          textAlign: design.textAlign
        }}
      >
        {design.showSongTitle && (
          <div className="mb-3 text-[0.36em] font-semibold opacity-80">{songTitle}</div>
        )}
        {design.showSectionTitle && slide.sectionNames.length > 0 && (
          <div className="mb-4 text-[0.28em] font-bold uppercase tracking-[0.18em] opacity-75">
            {slide.sectionNames.join(" / ")}
          </div>
        )}
        <div
          className="whitespace-pre-wrap"
          style={{
            fontSize,
            fontWeight: design.fontWeight,
            lineHeight: design.lineSpacing
          }}
        >
          {slide.lines.length ? slide.lines.map((line) => line.text).join("\n") : "No lyrics selected"}
        </div>
      </div>
      {design.showLogo && design.logoText && (
        <div className="absolute right-[4%] top-[4%] text-xs font-bold opacity-75">
          {design.logoText}
        </div>
      )}
      {design.showSlideNumbers && (
        <div className="absolute bottom-[4%] right-[4%] text-xs font-semibold opacity-70">
          {slide.id.slice(-2)}
        </div>
      )}
      {design.showCopyrightFooter && copyrightInfo && (
        <div className="absolute bottom-[3%] left-[4%] right-[4%] truncate text-center text-[10px] font-medium opacity-70">
          {copyrightInfo}
        </div>
      )}
    </div>
  );
}
