"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BookBarakDialog } from "@/components/BookBarakDialog";
import { ContactDialog } from "@/components/ContactDialog";
import {
  defaultHomepageAboutContent,
  normalizeHomepageContent,
  normalizeHomepageAboutContent,
  type HomepageContent,
  type HomepageAboutContent
} from "@/lib/homepageContent";

export function HomeAboutSection() {
  const [content, setContent] = useState<HomepageAboutContent>(defaultHomepageAboutContent);

  useEffect(() => {
    let active = true;

    async function loadContent() {
      try {
        const response = await fetch(`/api/homepage/content?about=${Date.now()}`, { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (active && response.ok) setContent(normalizeHomepageContent(data.content || {}).about);
      } catch {
        if (active) setContent(defaultHomepageAboutContent);
      }
    }

    function handleUpdate(event: Event) {
      const nextContent = (event as CustomEvent<HomepageContent>).detail;
      setContent(normalizeHomepageContent(nextContent || {}).about);
    }

    function handleAboutUpdate(event: Event) {
      const nextContent = (event as CustomEvent<HomepageAboutContent>).detail;
      setContent(normalizeHomepageAboutContent(nextContent || {}));
    }

    loadContent();
    window.addEventListener("homepage-content-updated", handleUpdate);
    window.addEventListener("homepage-about-updated", handleAboutUpdate);
    return () => {
      active = false;
      window.removeEventListener("homepage-content-updated", handleUpdate);
      window.removeEventListener("homepage-about-updated", handleAboutUpdate);
    };
  }, []);

  const canOptimizeImage = content.image.startsWith("/");

  return (
    <section id="about" data-build-section className="about-section build-section mx-auto max-w-7xl px-5 md:px-8">
      <div className="about-panel overflow-hidden rounded-3xl border border-slate-200/70 bg-white/82 p-7 shadow-2xl shadow-blue-950/10 backdrop-blur md:p-10">
        <div className="about-copy">
          <p className="motion-title text-sm font-black uppercase tracking-[0.24em] text-blue-600">About</p>
          <h2 className="motion-title mt-3 text-4xl font-black leading-tight tracking-tight md:text-6xl">{content.name}</h2>
          <div className="section-inline-flow about-inline-flow mt-6">
            <div className="section-inline-image about-image-frame">
              {canOptimizeImage ? (
                <Image
                  src={content.image}
                  alt=""
                  fill
                  sizes="(max-width: 760px) 100vw, 460px"
                  className="dynamic-image object-cover"
                />
              ) : (
                <img src={content.image} alt="" className="dynamic-image h-full w-full object-cover" />
              )}
            </div>
            <div className="about-text-stack">
              <p className="motion-copy text-xl font-black leading-8 text-slate-800">{content.title}</p>
              <p className="motion-copy mt-5 text-lg font-semibold leading-8 text-slate-600">{content.text}</p>
              <div className="about-highlight-grid mt-7 grid gap-3 sm:grid-cols-2">
                {content.highlights.map((item) => (
                  <div key={item} className="about-highlight rounded-2xl border border-slate-200/80 bg-white/76 p-4 font-black text-slate-800">
                    {item}
                  </div>
                ))}
              </div>
              <div className="about-actions mt-8 flex flex-nowrap items-center gap-3">
                <ContactDialog />
                <BookBarakDialog />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
