"use client";

import type { DesignSettings, LyricSlide } from "@/types/song";

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const value = clean.length === 3
    ? clean.split("").map((char) => char + char).join("")
    : clean.padEnd(6, "0").slice(0, 6);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function pptColor(hex: string) {
  return hex.replace("#", "").padEnd(6, "0").slice(0, 6);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function emu(inches: number) {
  return Math.round(inches * 914400);
}

function fitFont(slide: LyricSlide, design: DesignSettings) {
  const lineCount = Math.max(1, slide.lines.length);
  const maxChars = Math.max(12, ...slide.lines.map((line) => line.text.length));
  const heightFit = Math.max(26, Math.min(110, 72 / Math.max(1, lineCount * design.lineSpacing)));
  const widthFit = Math.max(24, Math.min(96, 124 / Math.sqrt(maxChars)));
  return Math.max(24, Math.min(design.fontSize, heightFit, widthFit));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not render slide for export."));
    }, "image/png");
  });
}

function safeName(name: string) {
  return (name || "lyric-slides").replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

function drawBackground(context: CanvasRenderingContext2D, design: DesignSettings, width: number, height: number) {
  if (design.backgroundColor.startsWith("linear")) {
    const gradient = context.createLinearGradient(0, 0, width, height);
    const colors = Array.from(design.backgroundColor.matchAll(/#[0-9a-fA-F]{3,6}/g)).map((match) => match[0]);
    gradient.addColorStop(0, colors[0] ?? "#111827");
    gradient.addColorStop(1, colors[1] ?? colors[0] ?? "#000000");
    context.fillStyle = gradient;
  } else {
    context.fillStyle = design.backgroundColor;
  }
  context.fillRect(0, 0, width, height);
}

function slidePageSize(design: DesignSettings) {
  return design.aspectRatio === "4:3"
    ? { width: 960, height: 720, pptWidth: 10, pptHeight: 7.5 }
    : { width: 1280, height: 720, pptWidth: 13.333, pptHeight: 7.5 };
}

function slideTextBox(design: DesignSettings, width: number, height: number) {
  const marginX = width * (design.margins / 100);
  const marginY = height * (design.margins / 100);
  const boxW = width * (design.textBoxWidth / 100);
  const x =
    design.horizontalPlacement === "start"
      ? marginX
      : design.horizontalPlacement === "end"
        ? width - boxW - marginX
        : (width - boxW) / 2;
  return { x, marginX, marginY, boxW, boxH: height - marginY * 2 };
}

function drawSlideToCanvas(
  slide: LyricSlide,
  design: DesignSettings,
  songTitle: string,
  copyrightInfo?: string
) {
  const page = slidePageSize(design);
  const canvas = document.createElement("canvas");
  canvas.width = page.width;
  canvas.height = page.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare slide renderer.");

  drawBackground(context, design, page.width, page.height);
  const { x, marginX, marginY, boxW } = slideTextBox(design, page.width, page.height);
  const lines = slide.lines.length ? slide.lines.map((line) => line.text || " ") : ["No lyrics selected"];
  const fontSize = Math.max(12, design.fontSize);
  const lineHeight = fontSize * design.lineSpacing;
  const textHeight = lines.length * lineHeight;
  const startY =
    design.verticalPlacement === "start"
      ? marginY + fontSize
      : design.verticalPlacement === "end"
        ? page.height - marginY - textHeight + fontSize
        : page.height / 2 - textHeight / 2 + fontSize;

  context.fillStyle = design.textColor;
  context.textBaseline = "alphabetic";
  context.textAlign = design.textAlign;
  context.font = `${design.fontWeight} ${fontSize}px ${design.fontFamily}, Arial, sans-serif`;
  const textX = design.textAlign === "center" ? x + boxW / 2 : design.textAlign === "right" ? x + boxW : x;

  if (design.showSongTitle) {
    context.save();
    context.globalAlpha = 0.8;
    context.font = `700 ${Math.max(16, fontSize * 0.36)}px ${design.fontFamily}, Arial, sans-serif`;
    context.fillText(songTitle, textX, Math.max(marginY + fontSize * 0.35, startY - lineHeight * 0.85), boxW);
    context.restore();
  }

  lines.forEach((line, index) => {
    context.fillText(line, textX, startY + index * lineHeight, boxW);
  });

  if (design.showSlideNumbers) {
    context.save();
    context.globalAlpha = 0.75;
    context.textAlign = "right";
    context.font = `700 18px ${design.fontFamily}, Arial, sans-serif`;
    context.fillText(slide.id.slice(-2), page.width - marginX, page.height - Math.max(18, marginY * 0.5));
    context.restore();
  }

  if (design.showCopyrightFooter && copyrightInfo) {
    context.save();
    context.globalAlpha = 0.72;
    context.textAlign = "center";
    context.font = `500 16px ${design.fontFamily}, Arial, sans-serif`;
    context.fillText(copyrightInfo, page.width / 2, page.height - Math.max(18, marginY * 0.5), page.width - marginX * 2);
    context.restore();
  }

  context.save();
  context.globalAlpha = 0.55;
  context.fillStyle = design.textColor;
  context.textAlign = "right";
  context.font = `700 14px ${design.fontFamily}, Arial, sans-serif`;
  context.fillText("Created with LINEUP", page.width - 18, page.height - 30);
  context.fillText("Songleading.net", page.width - 18, page.height - 14);
  context.restore();

  return canvas;
}

export async function exportSlidesAsPptx(
  slides: LyricSlide[],
  design: DesignSettings,
  songTitle: string,
  copyrightInfo?: string
) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const page = slidePageSize(design);
  const slideW = emu(page.pptWidth);
  const slideH = emu(page.pptHeight);

  zip.file("[Content_Types].xml", contentTypes(slides.length, true));
  zip.folder("_rels")?.file(".rels", rootRels());
  zip.folder("docProps")?.file("app.xml", appProps(slides.length));
  zip.folder("docProps")?.file("core.xml", coreProps(songTitle));
  zip.folder("ppt")?.file("presentation.xml", presentationXml(slides.length, slideW, slideH));
  zip.folder("ppt")?.folder("_rels")?.file("presentation.xml.rels", presentationRels(slides.length));
  zip.file("ppt/slideMasters/slideMaster1.xml", slideMasterXml());
  zip.file("ppt/slideMasters/_rels/slideMaster1.xml.rels", slideMasterRels());
  zip.file("ppt/slideLayouts/slideLayout1.xml", slideLayoutXml());
  zip.file("ppt/slideLayouts/_rels/slideLayout1.xml.rels", slideLayoutRels());
  zip.file("ppt/theme/theme1.xml", themeXml());

  for (const [index, lyricSlide] of slides.entries()) {
    const imageName = `image${index + 1}.png`;
    const canvas = drawSlideToCanvas(lyricSlide, design, songTitle, copyrightInfo);
    zip.file(`ppt/media/${imageName}`, await canvasBlob(canvas));
    zip.file(`ppt/slides/slide${index + 1}.xml`, imageSlideXml(index + 1, slideW, slideH));
    zip.file(`ppt/slides/_rels/slide${index + 1}.xml.rels`, imageSlideRels(imageName));
  }

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  });
  downloadBlob(blob, `${safeName(songTitle)}.pptx`);
}

function textShape(id: number, text: string, x: number, y: number, w: number, h: number, size: number, align: string, bold: boolean, design: DesignSettings) {
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="Text ${id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${emu(x)}" y="${emu(y)}"/><a:ext cx="${emu(w)}" cy="${emu(h)}"/></a:xfrm><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr wrap="square"/><a:lstStyle/><a:p><a:pPr algn="${align}"/><a:r><a:rPr lang="en-US" sz="${Math.round(size * 100)}" b="${bold ? 1 : 0}"><a:solidFill><a:srgbClr val="${pptColor(design.textColor)}"/></a:solidFill><a:latin typeface="Arial"/></a:rPr><a:t>${escapeXml(text)}</a:t></a:r></a:p></p:txBody></p:sp>`;
}

function contentTypes(slideCount: number, includePng = false) {
  const png = includePng ? `<Default Extension="png" ContentType="image/png"/>` : "";
  const slides = Array.from({ length: slideCount }, (_, index) => `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${png}<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>${slides}</Types>`;
}

function imageSlideXml(index: number, width: number, height: number) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree>
    <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
    <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${width}" cy="${height}"/><a:chOff x="0" y="0"/><a:chExt cx="${width}" cy="${height}"/></a:xfrm></p:grpSpPr>
    <p:pic>
      <p:nvPicPr><p:cNvPr id="2" name="Slide ${index}"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr>
      <p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
      <p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${width}" cy="${height}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
    </p:pic>
  </p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
}

function imageSlideRels(imageName: string) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${imageName}"/></Relationships>`;
}

function rootRels() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
}

function presentationXml(slideCount: number, width: number, height: number) {
  const ids = Array.from({ length: slideCount }, (_, index) => `<p:sldId id="${256 + index}" r:id="rId${index + 1}"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId${slideCount + 1}"/></p:sldMasterIdLst><p:sldIdLst>${ids}</p:sldIdLst><p:sldSz cx="${width}" cy="${height}" type="wide"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`;
}

function presentationRels(slideCount: number) {
  const slides = Array.from({ length: slideCount }, (_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${slides}<Relationship Id="rId${slideCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/><Relationship Id="rId${slideCount + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>`;
}

function appProps(slideCount: number) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Lyric Slide Studio</Application><PresentationFormat>On-screen Show</PresentationFormat><Slides>${slideCount}</Slides></Properties>`;
}

function coreProps(title: string) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${escapeXml(title)}</dc:title><dc:creator>Lyric Slide Studio</dc:creator></cp:coreProperties>`;
}

function slideMasterXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="1" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>`;
}

function slideMasterRels() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`;
}

function slideLayoutXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`;
}

function slideLayoutRels() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`;
}

function themeXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Lyric Slide Studio"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1F2937"/></a:dk2><a:lt2><a:srgbClr val="F8FAFC"/></a:lt2><a:accent1><a:srgbClr val="2563EB"/></a:accent1><a:accent2><a:srgbClr val="0F766E"/></a:accent2><a:accent3><a:srgbClr val="F59E0B"/></a:accent3><a:accent4><a:srgbClr val="DC2626"/></a:accent4><a:accent5><a:srgbClr val="7C3AED"/></a:accent5><a:accent6><a:srgbClr val="0891B2"/></a:accent6><a:hlink><a:srgbClr val="2563EB"/></a:hlink><a:folHlink><a:srgbClr val="7C3AED"/></a:folHlink></a:clrScheme><a:fontScheme name="Arial"><a:majorFont><a:latin typeface="Arial"/></a:majorFont><a:minorFont><a:latin typeface="Arial"/></a:minorFont></a:fontScheme><a:fmtScheme name="Simple"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`;
}

export async function exportSlidesAsPdf(
  slides: LyricSlide[],
  design: DesignSettings,
  songTitle: string,
  copyrightInfo?: string
) {
  const { PDFDocument, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const pageSize = slidePageSize(design);

  for (const slide of slides) {
    const canvas = drawSlideToCanvas(slide, design, songTitle, copyrightInfo);
    const blob = await canvasBlob(canvas);
    const image = await pdf.embedPng(await blob.arrayBuffer());
    const page = pdf.addPage([pageSize.width, pageSize.height]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageSize.width,
      height: pageSize.height,
      color: rgb(1, 1, 1)
    });
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: pageSize.width,
      height: pageSize.height
    });
  }

  const bytes = await pdf.save();
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  downloadBlob(new Blob([buffer], { type: "application/pdf" }), `${safeName(songTitle)}.pdf`);
}
