"use client";

import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { ContactDialog } from "@/components/ContactDialog";
import {
  defaultHomepageAboutContent,
  normalizeHomepageAboutContent,
  type HomepageAboutContent
} from "@/lib/homepageContent";

export function HomeAboutSection() {
  const [content, setContent] = useState<HomepageAboutContent>(defaultHomepageAboutContent);

  useEffect(() => {
    let active = true;

    async function loadContent() {
      try {
        const response = await fetch("/api/homepage/about", { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (active && response.ok) setContent(normalizeHomepageAboutContent(data.content || {}));
      } catch {
        if (active) setContent(defaultHomepageAboutContent);
      }
    }

    function handleUpdate(event: Event) {
      const nextContent = (event as CustomEvent<HomepageAboutContent>).detail;
      setContent(normalizeHomepageAboutContent(nextContent || {}));
    }

    loadContent();
    window.addEventListener("homepage-about-updated", handleUpdate);
    return () => {
      active = false;
      window.removeEventListener("homepage-about-updated", handleUpdate);
    };
  }, []);

  return (
    <section id="about" data-build-section className="about-section build-section mx-auto max-w-7xl px-5 md:px-8">
      <div className="about-panel grid overflow-hidden rounded-3xl border border-slate-200/70 bg-white/82 shadow-2xl shadow-blue-950/10 backdrop-blur lg:grid-cols-[0.88fr_1.12fr]">
        <div className="about-image-frame min-h-[520px] overflow-hidden bg-slate-950">
          <img src={content.image} alt="" className="dynamic-image h-full w-full object-cover" />
        </div>
        <div className="p-7 md:p-10">
          <p className="motion-title text-sm font-black uppercase tracking-[0.24em] text-blue-600">About</p>
          <h2 className="motion-title mt-3 text-4xl font-black leading-tight tracking-tight md:text-6xl">{content.name}</h2>
          <p className="motion-copy mt-5 max-w-2xl text-xl font-black leading-8 text-slate-800">{content.title}</p>
          <p className="motion-copy mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-600">{content.text}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {content.highlights.map((item) => (
              <div key={item} className="about-highlight rounded-2xl border border-slate-200/80 bg-white/76 p-4 font-black text-slate-800">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <ContactDialog />
            <a
              href="mailto:barakmalichi@gmail.com?subject=Booking%20Barak%20Malichi"
              className="book-barak-action inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Book Barak
              <CalendarDays size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
