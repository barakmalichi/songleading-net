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

    const getSnapSections = () => Array.from(document.querySelectorAll<HTMLElement>(".modern-home > section"));
    const usesSectionSnap = () => window.matchMedia("(max-width: 760px)").matches;
    let snapping = false;
    let snapTimer: number | undefined;
    let touchStartY = 0;
    let touchStartX = 0;
    let touchActive = false;
    let lastTouchDeltaY = 0;
    let lastTouchDeltaX = 0;

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

    function getCurrentSectionIndex(snapSections: HTMLElement[]) {
      const viewportMiddle = window.scrollY + window.innerHeight / 2;
      return snapSections.reduce((closestIndex, section, index) => {
        const currentDistance = Math.abs(section.offsetTop + section.offsetHeight / 2 - viewportMiddle);
        const closestSection = snapSections[closestIndex];
        const closestDistance = Math.abs(closestSection.offsetTop + closestSection.offsetHeight / 2 - viewportMiddle);
        return currentDistance < closestDistance ? index : closestIndex;
      }, 0);
    }

    function moveBySection(direction: 1 | -1) {
      const snapSections = getSnapSections();
      if (!snapSections.length) return;
      const currentIndex = getCurrentSectionIndex(snapSections);
      const nextIndex = Math.max(0, Math.min(snapSections.length - 1, currentIndex + direction));
      if (nextIndex === currentIndex) return;
      snapToSection(snapSections[nextIndex]);
    }

    function handleWheel(event: WheelEvent) {
      if (!usesSectionSnap()) return;
      if (snapping || Math.abs(event.deltaY) < 18 || event.ctrlKey || event.metaKey) return;

      event.preventDefault();
      moveBySection(event.deltaY > 0 ? 1 : -1);
    }

    function isInteractiveTarget(target: EventTarget | null) {
      return target instanceof Element && Boolean(target.closest("a, button, input, textarea, select, dialog, [role='dialog']"));
    }

    function handleTouchStart(event: TouchEvent) {
      if (!usesSectionSnap() || snapping || event.touches.length !== 1 || isInteractiveTarget(event.target)) {
        touchActive = false;
        return;
      }
      touchActive = true;
      touchStartY = event.touches[0].clientY;
      touchStartX = event.touches[0].clientX;
      lastTouchDeltaY = 0;
      lastTouchDeltaX = 0;
    }

    function handleTouchMove(event: TouchEvent) {
      if (!touchActive || snapping || event.touches.length !== 1) return;
      const deltaY = touchStartY - event.touches[0].clientY;
      const deltaX = touchStartX - event.touches[0].clientX;
      lastTouchDeltaY = deltaY;
      lastTouchDeltaX = deltaX;
      if (Math.abs(deltaY) < 34 || Math.abs(deltaY) < Math.abs(deltaX) * 1.15) return;
      event.preventDefault();
      touchActive = false;
      moveBySection(deltaY > 0 ? 1 : -1);
    }

    function handleTouchEnd() {
      if (!touchActive || snapping) {
        touchActive = false;
        return;
      }
      if (Math.abs(lastTouchDeltaY) >= 34 && Math.abs(lastTouchDeltaY) >= Math.abs(lastTouchDeltaX) * 1.15) {
        moveBySection(lastTouchDeltaY > 0 ? 1 : -1);
      }
      touchActive = false;
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.clearTimeout(snapTimer);
    };
  }, []);

  return null;
}
