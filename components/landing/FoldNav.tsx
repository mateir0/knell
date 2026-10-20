"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

/**
 * FoldNav — the landing's navigation.
 *
 * A fixed glass bar (wordmark left; RUN link and a MENU trigger right).
 * Opening the menu folds the page itself back in 3D: the element with
 * id "knell-page" scales down, tilts in perspective, and rounds its
 * corners into a card resting on the black menu layer, while the menu
 * links reveal in sequence. Closing reverses the fold.
 *
 * Under reduced motion there is no fold — the menu layer simply fades.
 */

export interface FoldNavItem {
  label: string;
  href: string;
}

interface FoldNavProps {
  wordmark: string;
  runLabel: string;
  menuLabel: string;
  closeLabel: string;
  items: FoldNavItem[];
  footerLine: string;
  footerMeta: string;
}

export function FoldNav({
  wordmark,
  runLabel,
  menuLabel,
  closeLabel,
  items,
  footerLine,
  footerMeta,
}: FoldNavProps) {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const openRef = useRef(false);

  useEffect(() => {
    const page = document.getElementById("knell-page");
    const overlay = overlayRef.current;
    if (!page || !overlay) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const links = overlay.querySelectorAll("[data-fold-link]");
    const footer = overlay.querySelector("[data-fold-footer]");

    gsap.set(overlay, { autoAlpha: 0 });

    const tl = gsap.timeline({
      paused: true,
      onStart: () => {
        document.documentElement.style.overflow = "hidden";
        gsap.set(overlay, { pointerEvents: "auto" });
        gsap.set(page, { pointerEvents: "none", willChange: "transform" });
      },
      onReverseComplete: () => {
        document.documentElement.style.overflow = "";
        gsap.set(overlay, { pointerEvents: "none" });
        gsap.set(page, {
          pointerEvents: "",
          willChange: "",
          clearProps: "transform,borderRadius,backgroundColor",
        });
      },
    });

    if (reduced) {
      tl.to(overlay, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, 0);
    } else {
      tl.to(overlay, { autoAlpha: 1, duration: 0.35, ease: "power2.out" }, 0)
        .to(
          page,
          {
            scale: 0.9,
            y: "5vh",
            rotationX: 5,
            rotationY: -6,
            transformPerspective: 1400,
            transformOrigin: "50% 0%",
            borderRadius: "24px",
            backgroundColor: "var(--color-canvas)",
            duration: 0.6,
            ease: "power3.inOut",
          },
          0,
        )
        .fromTo(
          links,
          { y: 34, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.45,
            stagger: 0.06,
            ease: "power3.out",
          },
          0.2,
        )
        .fromTo(
          footer,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.3, ease: "power1.out" },
          0.35,
        );
    }

    timelineRef.current = tl;
    return () => {
      tl.kill();
      timelineRef.current = null;
      document.documentElement.style.overflow = "";
    };
  }, []);

  const toggle = (next: boolean) => {
    openRef.current = next;
    setOpen(next);
    const tl = timelineRef.current;
    if (!tl) return;
    if (next) {
      tl.timeScale(1).play();
    } else {
      tl.timeScale(1.4).reverse();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openRef.current) toggle(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleItemClick = (href: string) => (e: React.MouseEvent) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    toggle(false);
    window.setTimeout(() => {
      document
        .querySelector(href)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 500);
  };

  return (
    <>
      <div
        ref={overlayRef}
        aria-hidden={!open}
        className="invisible fixed inset-0 z-40 bg-abyss opacity-0"
        style={{ pointerEvents: "none" }}
      >
        <nav
          aria-label="Main"
          className="flex h-full flex-col items-center justify-center px-5"
        >
          <ul className="flex flex-col items-center gap-md text-center lg:flex-row lg:gap-xl">
            {items.map((item) => (
              <li key={item.href} data-fold-link>
                <Link
                  href={item.href}
                  onClick={handleItemClick(item.href)}
                  tabIndex={open ? 0 : -1}
                  className={`text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-none tracking-tight transition-colors duration-150 ${
                    item.href === "/run"
                      ? "text-accent-bright hover:text-accent"
                      : "text-ink hover:text-accent-bright"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div
            data-fold-footer
            className="absolute inset-x-0 bottom-0 flex items-center justify-between px-5 py-lg text-caption-sm uppercase text-muted"
          >
            <span>{footerLine}</span>
            <span className="hidden sm:block">{footerMeta}</span>
          </div>
        </nav>
      </div>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-faint bg-canvas/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-5 py-md">
          <span className="text-caption-sm font-semibold uppercase tracking-widest text-ink">
            {wordmark}
          </span>
          <div className="flex items-center gap-lg">
            <Link
              href="/run"
              className="hidden text-caption-sm uppercase text-ink transition-opacity duration-150 hover:opacity-60 sm:block"
            >
              {runLabel}
            </Link>
            <button
              type="button"
              onClick={() => toggle(!open)}
              aria-expanded={open}
              aria-label={open ? closeLabel : menuLabel}
              className="group flex items-center gap-sm"
            >
              <span className="text-caption-sm uppercase text-ink">
                {open ? closeLabel : menuLabel}
              </span>
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors duration-150 group-hover:border-accent">
                <span
                  className={`absolute block h-[2px] w-4 bg-ink transition-transform duration-300 ${
                    open ? "rotate-45" : "-translate-y-[3px]"
                  }`}
                />
                <span
                  className={`absolute block h-[2px] w-4 bg-ink transition-transform duration-300 ${
                    open ? "-rotate-45" : "translate-y-[3px]"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
