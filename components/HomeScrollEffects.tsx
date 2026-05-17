"use client";

import { useEffect } from "react";

export function HomeScrollEffects() {
  useEffect(() => {
    const observedSections = new Set<HTMLElement>();
    const getBuildThreshold = () => (window.matchMedia("(max-width: 760px)").matches ? 0.18 : 0.34);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("section-built", entry.isIntersecting && entry.intersectionRatio >= getBuildThreshold());
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

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
