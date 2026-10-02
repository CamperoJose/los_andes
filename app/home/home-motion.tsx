"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function HomeMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    const moving = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax]"));
    const reveals = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));

    function paint() {
      frame = 0;
      if (preference.matches) return;
      const positions = moving.map(element => {
        const bounds = element.getBoundingClientRect();
        const rate = Number(element.dataset.parallax || 0);
        const shift = Math.max(-45, Math.min(45, (window.innerHeight / 2 - bounds.top - bounds.height / 2) * rate));
        return { element, shift };
      });
      positions.forEach(({ element, shift }) => element.style.setProperty("--drift", `${shift.toFixed(1)}px`));
    }
    function schedule() {
      if (!frame && !preference.matches) frame = window.requestAnimationFrame(paint);
    }
    function configure() {
      observer?.disconnect();
      window.cancelAnimationFrame(frame);
      frame = 0;
      if (preference.matches) {
        root?.removeAttribute("data-motion");
        moving.forEach(element => element.style.removeProperty("--drift"));
        return;
      }
      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer?.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
        reveals.forEach(element => observer?.observe(element));
        root?.setAttribute("data-motion", "ready");
      }
      schedule();
    }
    configure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", configure);
    return () => {
      observer?.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", configure);
    };
  }, []);

  return <main ref={rootRef} className="site-shell home-motion min-h-screen overflow-hidden">{children}</main>;
}
