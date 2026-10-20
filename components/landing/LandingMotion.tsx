"use client";

import { useLayoutEffect } from "react";

/**
 * Landing-page motion only (design.md §6).
 * GSAP + ScrollTrigger: the hero line reveals word by word with a slight 3D
 * rotation, sections fade in on scroll, and exactly one clip-path transition
 * opens the graveyard. Everything becomes instant under prefers-reduced-motion.
 */
export function LandingMotion() {
  useLayoutEffect(() => {
    let cancelled = false;
    let revert: (() => void) | undefined;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduced) return;

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        gsap.from("[data-hero-wordmark]", {
          opacity: 0,
          y: 48,
          duration: 1,
          ease: "power3.out",
        });

        gsap.from("[data-hero-word]", {
          opacity: 0,
          yPercent: 70,
          rotateX: -62,
          transformPerspective: 900,
          transformOrigin: "50% 100%",
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.09,
          delay: 0.15,
        });

        gsap.from("[data-hero-cta]", {
          opacity: 0,
          y: 20,
          duration: 0.7,
          delay: 0.55,
          ease: "power2.out",
        });

        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((section) => {
          gsap.from(section, {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 85%" },
          });
        });

        gsap.utils
          .toArray<HTMLElement>("[data-section-rule]")
          .forEach((rule) => {
            gsap.from(rule, {
              scaleX: 0,
              transformOrigin: "left",
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: { trigger: rule, start: "top 80%" },
            });
          });

        const graveyard = document.querySelector<HTMLElement>("[data-graveyard]");
        if (graveyard) {
          gsap.from(graveyard, {
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 1,
            ease: "power2.inOut",
            scrollTrigger: { trigger: graveyard, start: "top 80%" },
          });
        }
      });

      revert = () => context.revert();
      if (cancelled) {
        context.revert();
        return;
      }
    })();

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return null;
}
