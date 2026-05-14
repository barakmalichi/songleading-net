"use client";

import { useEffect } from "react";

export function HomeScrollEffects() {
  useEffect(() => {
    const observedSections = new Set<HTMLElement>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("section-built", entry.isIntersecting);
        });
      },
      {
        root: null,
        threshold: 0.62
      }
    );

    function observeBuildSections() {
      document.querySelectorAll<HTMLElement>("[data-build-section]").forEach((section) => {
        if (observedSections.has(section)) return;
        observedSections.add(section);
        observer.observe(section);
      });
    }

    observeBuildSections();

    const mutationObserver = new MutationObserver(() => {
      observeBuildSections();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const snapSections = Array.from(document.querySelectorAll<HTMLElement>(".modern-home > section"));
    let snapping = false;
    let snapTimer: number | undefined;

    const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

    function snapToSection(target: HTMLElement) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const start = window.scrollY;
      const end = target.offsetTop;
      const distance = end - start;

      if (Math.abs(distance) < 4) return;

      snapping = true;
      window.clearTimeout(snapTimer);

      if (reduceMotion) {
        window.scrollTo(0, end);
        snapTimer = window.setTimeout(() => {
          snapping = false;
        }, 120);
        return;
      }

      const duration = 520;
      const startedAt = performance.now();

      function frame(now: number) {
        const progress = Math.min(1, (now - startedAt) / duration);
        window.scrollTo(0, start + distance * easeOutCubic(progress));

        if (progress < 1) {
          requestAnimationFrame(frame);
          return;
        }

        snapTimer = window.setTimeout(() => {
          snapping = false;
        }, 120);
      }

      requestAnimationFrame(frame);
    }

    function handleWheel(event: WheelEvent) {
      if (snapping || Math.abs(event.deltaY) < 18 || event.ctrlKey || event.metaKey) return;

      const viewportMiddle = window.scrollY + window.innerHeight / 2;
      const currentIndex = snapSections.reduce((closestIndex, section, index) => {
        const currentDistance = Math.abs(section.offsetTop + section.offsetHeight / 2 - viewportMiddle);
        const closestSection = snapSections[closestIndex];
        const closestDistance = Math.abs(closestSection.offsetTop + closestSection.offsetHeight / 2 - viewportMiddle);
        return currentDistance < closestDistance ? index : closestIndex;
      }, 0);
      const nextIndex = Math.max(0, Math.min(snapSections.length - 1, currentIndex + (event.deltaY > 0 ? 1 : -1)));

      if (nextIndex === currentIndex) return;

      event.preventDefault();
      snapToSection(snapSections[nextIndex]);
    }

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("wheel", handleWheel);
      window.clearTimeout(snapTimer);
    };
  }, []);

  return null;
}
