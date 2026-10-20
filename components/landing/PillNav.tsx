"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

/**
 * PillNav — the landing's navigation.
 *
 * A floating bar: wordmark left, a glass pill of section tabs center,
 * a double-ring CTA right (hamburger + floating panel on mobile).
 * The active tab wears a raised "physical" pill that slides between
 * tabs (framer-motion layout animation); the active tab follows the
 * section in view (scrollspy) and is also set on click.
 *
 * The CTA is a metallic outer ring around a bronze inner button with
 * a shine sweep on hover. Reduced motion: no slide, no springs, the
 * mobile panel simply appears.
 */

export interface PillNavItem {
  label: string;
  href: string;
}

interface PillNavProps {
  wordmark: string;
  items: PillNavItem[];
  ctaLabel: string;
  ctaHref: string;
}

function RingCta({
  label,
  href,
  fullWidth = false,
}: {
  label: string;
  href: string;
  fullWidth?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      whileHover={reduced ? undefined : { scale: 1.02 }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      className={`group relative ${fullWidth ? "w-full" : "inline-block"}`}
    >
      <div className="rounded-full border border-black bg-[linear-gradient(180deg,rgba(60,60,60,0.8),rgba(20,20,20,0.9))] p-[3px] shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)]">
        <Link
          href={href}
          className={`relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(180deg,var(--color-accent-bright),var(--color-accent))] px-5 py-2 text-xs font-semibold uppercase text-on-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] ${
            fullWidth ? "w-full" : ""
          }`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-[150%] skew-x-[-12deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[150%]"
          />
          <span className="relative z-10">{label}</span>
        </Link>
      </div>
    </motion.div>
  );
}

export function PillNav({ wordmark, items, ctaLabel, ctaHref }: PillNavProps) {
  const [active, setActive] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const sections = items
      .map((item) => document.querySelector(item.href))
      .filter((el): el is Element => el !== null);
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActive(href);
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex w-[120px] shrink-0 items-center gap-2">
          <span aria-hidden="true" className="h-2 w-2 bg-accent" />
          <span className="text-sm font-black uppercase tracking-tight text-ink">
            {wordmark}
          </span>
        </div>

        <nav
          aria-label="Main"
          className="hidden items-center rounded-full border border-white/5 bg-[linear-gradient(180deg,rgba(30,30,30,0.6),rgba(10,10,10,0.9))] p-1 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md md:flex"
        >
          {items.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={go(item.href)}
              aria-current={active === item.href ? "true" : undefined}
              className="relative rounded-full px-4 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              {active === item.href && (
                <motion.span
                  layoutId={reduced ? undefined : "knell-nav-pill"}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute inset-0 rounded-full border border-white/5 bg-[linear-gradient(180deg,#2a2a2a,#1a1a1a)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.4)]"
                />
              )}
              <span
                className={`relative z-10 transition-colors duration-200 ${
                  active === item.href
                    ? "text-ink"
                    : "text-muted hover:text-body"
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="flex w-[120px] shrink-0 items-center justify-end gap-3">
          <div className="hidden md:block">
            <RingCta label={ctaLabel} href={ctaHref} />
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-white/10 md:hidden"
          >
            <span
              className={`absolute block h-[2px] w-5 bg-ink transition-transform duration-300 ${
                mobileOpen ? "rotate-45" : "-translate-y-[3.5px]"
              }`}
            />
            <span
              className={`absolute block h-[2px] w-5 bg-ink transition-transform duration-300 ${
                mobileOpen ? "-rotate-45" : "translate-y-[3.5px]"
              }`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={
                reduced ? { opacity: 0 } : { y: -20, opacity: 0, scale: 0.95 }
              }
              animate={
                reduced ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }
              }
              exit={
                reduced ? { opacity: 0 } : { y: -20, opacity: 0, scale: 0.95 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-x-4 top-[76px] z-50 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl md:hidden"
            >
              <div className="flex flex-col p-6">
                <div className="flex flex-col gap-1">
                  {items.map((item, idx) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      onClick={go(item.href)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex items-center justify-between rounded-xl px-4 py-3 text-lg font-medium text-body transition-colors hover:bg-white/5 hover:text-ink"
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className="-translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                      >
                        →
                      </span>
                    </motion.a>
                  ))}
                </div>
                <div className="my-4 h-px w-full bg-border" />
                <RingCta label={ctaLabel} href={ctaHref} fullWidth />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
