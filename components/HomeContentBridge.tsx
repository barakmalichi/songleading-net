"use client";

import { useEffect } from "react";
import { defaultHomepageContent, normalizeHomepageContent, type HomepageContent } from "@/lib/homepageContent";

function setText(selector: string, value: string) {
  document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    element.textContent = value;
  });
}

function setImage(selector: string, src: string) {
  document.querySelectorAll<HTMLImageElement>(selector).forEach((image) => {
    if (!src || image.src.endsWith(src)) return;
    image.removeAttribute("srcset");
    image.removeAttribute("sizes");
    image.src = src;
  });
}

function setLineText(selector: string, value: string) {
  document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);
    element.replaceChildren(
      ...lines.map((line) => {
        const span = document.createElement("span");
        span.textContent = line;
        span.className = "block";
        return span;
      })
    );
  });
}

function setShineWord(selector: string, value: string) {
  document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    const word = value.trim() || defaultHomepageContent.hero.shineWord;
    element.setAttribute("aria-label", word);
    element.dataset.text = word;
    element.replaceChildren(
      ...Array.from(word).map((letter, index) => {
        const span = document.createElement("span");
        span.className = "songleading-letter";
        span.setAttribute("aria-hidden", "true");
        span.dataset.letter = letter;
        span.style.setProperty("--letter-index", String(index));
        span.textContent = letter;
        return span;
      })
    );
  });
}

function applyContent(content: HomepageContent) {
  setImage('[data-home-image="hero.image"]', content.hero.image);
  setText('[data-home-text="hero.headlinePrefix"]', content.hero.headlinePrefix);
  setShineWord('[data-home-shine="hero.shineWord"]', content.hero.shineWord);
  setText('[data-home-text="hero.subheadline"]', content.hero.subheadline);
  setText('[data-home-text="hero.text"]', content.hero.text);
  setText('[data-home-text="hero.primaryLabel"]', content.hero.primaryLabel);
  setText('[data-home-text="hero.secondaryLabel"]', content.hero.secondaryLabel);

  setImage('[data-home-image="resources.image"]', content.resources.image);
  setText('[data-home-text="resources.imageEyebrow"]', content.resources.imageEyebrow);
  setText('[data-home-text="resources.imageTitle"]', content.resources.imageTitle);
  setText('[data-home-text="resources.eyebrow"]', content.resources.eyebrow);
  setText('[data-home-text="resources.title"]', content.resources.title);
  setText('[data-home-text="resources.text"]', content.resources.text);
  document.querySelectorAll<HTMLElement>("[data-home-resource-badge]").forEach((element) => {
    const index = Number(element.dataset.homeResourceBadge);
    const value = content.resources.badges[index];
    element.hidden = !value;
    if (value) element.textContent = value;
  });
  document.querySelectorAll<HTMLElement>("[data-home-resource-card]").forEach((element) => {
    const index = Number(element.dataset.homeResourceCard);
    const card = content.resources.cards[index];
    element.hidden = !card;
    if (!card) return;
    const title = element.querySelector<HTMLElement>('[data-home-card-field="title"]');
    const text = element.querySelector<HTMLElement>('[data-home-card-field="text"]');
    if (title) title.textContent = card.title;
    if (text) text.textContent = card.text;
  });

  setImage('[data-home-image="training.image"]', content.training.image);
  setText('[data-home-text="training.eyebrow"]', content.training.eyebrow);
  setText('[data-home-text="training.title"]', content.training.title);
  setText('[data-home-text="training.text"]', content.training.text);
  setText('[data-home-text="training.secondText"]', content.training.secondText);
  document.querySelectorAll<HTMLElement>("[data-home-training-pill]").forEach((element) => {
    const index = Number(element.dataset.homeTrainingPill);
    const value = content.training.pills[index];
    element.hidden = !value;
    if (value) element.textContent = value;
  });

  setText('[data-home-text="tools.eyebrow"]', content.tools.eyebrow);
  setText('[data-home-text="tools.title"]', content.tools.title);
  setText('[data-home-text="tools.text"]', content.tools.text);
  setText('[data-home-text="tools.buttonLabel"]', content.tools.buttonLabel);
  setText('[data-home-text="tools.previewEyebrow"]', content.tools.previewEyebrow);
  setText('[data-home-text="tools.previewTitle"]', content.tools.previewTitle);

  setImage('[data-home-image="community.image"]', content.community.image);
  setText('[data-home-text="community.eyebrow"]', content.community.eyebrow);
  setLineText('[data-home-lines="community.title"]', content.community.title);
  setText('[data-home-text="community.text"]', content.community.text);
  setText('[data-home-text="community.secondText"]', content.community.secondText);

  setText('[data-home-text="footer.text"]', content.footer.text);
  setText('[data-home-text="footer.note"]', content.footer.note);
}

export function HomeContentBridge() {
  useEffect(() => {
    let active = true;

    async function loadContent() {
      try {
        const response = await fetch(`/api/homepage/content?load=${Date.now()}`, { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (!active || !response.ok) return;
        const content = normalizeHomepageContent(data.content || {});
        applyContent(content);
        window.dispatchEvent(new CustomEvent("homepage-content-updated", { detail: content }));
      } catch {
        if (active) applyContent(defaultHomepageContent);
      }
    }

    function handleUpdate(event: Event) {
      const content = normalizeHomepageContent((event as CustomEvent<HomepageContent>).detail || {});
      applyContent(content);
    }

    applyContent(defaultHomepageContent);
    loadContent();
    window.addEventListener("homepage-content-updated", handleUpdate);
    return () => {
      active = false;
      window.removeEventListener("homepage-content-updated", handleUpdate);
    };
  }, []);

  return null;
}
