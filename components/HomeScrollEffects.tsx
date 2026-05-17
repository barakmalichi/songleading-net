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

    type SnapPoint = {
      edge: "start" | "end";
      element: HTMLElement;
      y: number;
    };

    const getSnapElements = () => Array.from(document.querySelectorAll<HTMLElement>(".modern-home > section, .modern-home > footer"));
    const usesSectionSnap = () => (
      !document.body.classList.contains("account-dialog-open") &&
      window.matchMedia("(min-width: 1201px) and (pointer: fine)").matches
    );
    let snapping = false;
    let snapTimer: number | undefined;
    let wheelIntentTimer: number | undefined;
    let wheelIntentDelta = 0;
    let lastSnapAt = 0;
    let touchStartY = 0;
    let touchStartX = 0;
    let touchActive = false;
    let lastTouchDeltaY = 0;
    let lastTouchDeltaX = 0;

    const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
    const getMaxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const clampScrollY = (value: number) => Math.max(0, Math.min(getMaxScroll(), value));
    const getEndSnapOverflow = () => (window.matchMedia("(max-width: 760px)").matches ? Math.max(96, window.innerHeight * 0.12) : 24);
    const getWheelSnapThreshold = () => (window.matchMedia("(max-width: 760px)").matches ? 88 : 140);
    const getWheelExtremeThreshold = () => (window.matchMedia("(max-width: 760px)").matches ? 540 : 920);
    const getSnapCooldown = () => (window.matchMedia("(max-width: 760px)").matches ? 420 : 660);

    function normalizedWheelDelta(event: WheelEvent) {
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 40;
      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
      return event.deltaY;
    }

    function getSnapPoints() {
      const snapPoints: SnapPoint[] = [];

      getSnapElements().forEach((element) => {
        const startY = clampScrollY(element.offsetTop);
        snapPoints.push({ edge: "start", element, y: startY });

        const overflow = element.offsetHeight - window.innerHeight;
        const endY = clampScrollY(element.offsetTop + overflow);
        if (overflow > getEndSnapOverflow() && Math.abs(endY - startY) > 12) {
          snapPoints.push({ edge: "end", element, y: endY });
        }
      });

      return snapPoints
        .sort((first, second) => first.y - second.y)
        .filter((point, index, points) => index === 0 || Math.abs(point.y - points[index - 1].y) > 8);
    }

    function snapToPosition(targetY: number) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const start = window.scrollY;
      const end = clampScrollY(targetY);
      const distance = end - start;

      if (Math.abs(distance) < 4) return;

      lastSnapAt = performance.now();
      snapping = true;
      window.clearTimeout(snapTimer);

      if (reduceMotion) {
        window.scrollTo(0, end);
        snapTimer = window.setTimeout(() => {
          snapping = false;
        }, 70);
        return;
      }

      const duration = 360;
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
        }, 70);
      }

      requestAnimationFrame(frame);
    }

    function getCurrentSnapPointIndex(snapPoints: SnapPoint[]) {
      const currentY = window.scrollY;
      return snapPoints.reduce((closestIndex, point, index) => {
        const currentDistance = Math.abs(point.y - currentY);
        const closestPoint = snapPoints[closestIndex];
        const closestDistance = Math.abs(closestPoint.y - currentY);
        return currentDistance < closestDistance ? index : closestIndex;
      }, 0);
    }

    function moveBySnapPoint(direction: 1 | -1, stepCount = 1) {
      const snapPoints = getSnapPoints();
      if (!snapPoints.length) return;

      const currentIndex = getCurrentSnapPointIndex(snapPoints);
      const currentPoint = snapPoints[currentIndex];
      const isAnchored = Math.abs(currentPoint.y - window.scrollY) <= 36;
      const steps = Math.max(1, Math.min(2, stepCount));
      let nextIndex = -1;

      if (isAnchored) {
        nextIndex = currentIndex + direction * steps;
      } else if (direction > 0) {
        for (let index = 0; index < snapPoints.length; index += 1) {
          if (snapPoints[index].y > window.scrollY + 36) {
            nextIndex = index + steps - 1;
            break;
          }
        }
      } else {
        for (let index = snapPoints.length - 1; index >= 0; index -= 1) {
          if (snapPoints[index].y < window.scrollY - 36) {
            nextIndex = index - steps + 1;
            break;
          }
        }
      }

      nextIndex = Math.max(0, Math.min(snapPoints.length - 1, nextIndex === -1 ? currentIndex : nextIndex));
      if (nextIndex === currentIndex) return;
      snapToPosition(snapPoints[nextIndex].y);
    }

    function handleWheel(event: WheelEvent) {
      if (!usesSectionSnap()) return;
      if (isInteractiveTarget(event.target)) return;
      if (snapping || event.ctrlKey || event.metaKey) return;

      event.preventDefault();
      if (performance.now() - lastSnapAt < getSnapCooldown()) return;

      wheelIntentDelta += normalizedWheelDelta(event);
      window.clearTimeout(wheelIntentTimer);
      wheelIntentTimer = window.setTimeout(() => {
        wheelIntentDelta = 0;
      }, 160);

      const absoluteDelta = Math.abs(wheelIntentDelta);
      if (absoluteDelta < getWheelSnapThreshold()) return;

      const direction = wheelIntentDelta > 0 ? 1 : -1;
      const steps = absoluteDelta >= getWheelExtremeThreshold() ? 2 : 1;
      wheelIntentDelta = 0;
      window.clearTimeout(wheelIntentTimer);
      moveBySnapPoint(direction, steps);
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
      if (Math.abs(deltaY) < 24 || Math.abs(deltaY) < Math.abs(deltaX) * 1.15) return;
      event.preventDefault();
      touchActive = false;
      moveBySnapPoint(deltaY > 0 ? 1 : -1);
    }

    function handleTouchEnd() {
      if (!touchActive || snapping) {
        touchActive = false;
        return;
      }
      const shouldMoveBySwipe = Math.abs(lastTouchDeltaY) >= 24 && Math.abs(lastTouchDeltaY) >= Math.abs(lastTouchDeltaX) * 1.15;
      touchActive = false;
      if (shouldMoveBySwipe) {
        moveBySnapPoint(lastTouchDeltaY > 0 ? 1 : -1);
      }
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
      window.clearTimeout(wheelIntentTimer);
    };
  }, []);

  return null;
}
