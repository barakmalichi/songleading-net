"use client";

import { useEffect } from "react";

export function HomeScrollEffects() {
  useEffect(() => {
    const observedSections = new Set<HTMLElement>();
    const getBuildThreshold = () => (window.matchMedia("(max-width: 760px)").matches ? 0.18 : 0.34);
    const snapMedia = window.matchMedia("(min-width: 900px) and (pointer: fine) and (hover: hover)");
    const reduceMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    let snapTimer: number | undefined;
    let snapReleaseTimer: number | undefined;
    let settling = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= getBuildThreshold()) {
            entry.target.classList.add("section-built");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: [0.12, 0.18, 0.34, 0.5]
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

    function canSettleScroll() {
      return snapMedia.matches &&
        !reduceMotionMedia.matches &&
        !document.body.classList.contains("account-dialog-open");
    }

    function getMaxScroll() {
      return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }

    function clampScroll(value: number) {
      return Math.max(0, Math.min(getMaxScroll(), value));
    }

    function getSnapPoints() {
      const points: number[] = [];
      document.querySelectorAll<HTMLElement>(".modern-home > section").forEach((section) => {
        const start = clampScroll(section.offsetTop);
        points.push(start);

        const overflow = section.offsetHeight - window.innerHeight;
        if (overflow > Math.max(140, window.innerHeight * 0.18)) {
          points.push(clampScroll(section.offsetTop + overflow));
        }
      });
      points.push(getMaxScroll());
      return points
        .sort((first, second) => first - second)
        .filter((point, index, list) => index === 0 || Math.abs(point - list[index - 1]) > 12);
    }

    function nearestSnapPoint(currentY: number) {
      const points = getSnapPoints();
      if (!points.length) return currentY;
      return points.reduce((nearest, point) => (
        Math.abs(point - currentY) < Math.abs(nearest - currentY) ? point : nearest
      ), points[0]);
    }

    function settleScroll() {
      if (!canSettleScroll()) return;
      const currentY = window.scrollY;
      const targetY = nearestSnapPoint(currentY);
      const distance = Math.abs(targetY - currentY);
      if (distance < 18 || distance > window.innerHeight * 0.72) return;

      settling = true;
      window.clearTimeout(snapReleaseTimer);
      window.scrollTo({ top: targetY, behavior: "smooth" });
      snapReleaseTimer = window.setTimeout(() => {
        settling = false;
      }, 760);
    }

    function handleScroll() {
      if (settling || !canSettleScroll()) return;
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(settleScroll, 150);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(snapTimer);
      window.clearTimeout(snapReleaseTimer);
    };
  }, []);

  return null;
}
