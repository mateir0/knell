"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AnimatedRollText — the hero wordmark.
 *
 * Each letter sits in a one-letter-high window. On hover (and once shortly
 * after mount, as an intro) every letter rolls upward: the visible copy
 * slides out of the top of its window while an identical copy slides in
 * from below, staggered left to right. The word itself never changes —
 * same text, same color, same weight — only the roll.
 *
 * With reduced motion (or before hydration) it renders as plain text.
 */

const STAGGER_MS = 35;
const ROLL_MS = 500;
const INTRO_DELAY_MS = 1000;
const INTRO_HOLD_MS = 250;

interface AnimatedRollTextProps {
  text: string;
  className?: string;
}

export function AnimatedRollText({ text, className }: AnimatedRollTextProps) {
  const [enhanced, setEnhanced] = useState(false);
  const [rolled, setRolled] = useState(false);
  const interactedRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnhanced(true);

    const letters = text.replace(/ /g, "").length;
    const rollDuration = ROLL_MS + letters * STAGGER_MS;
    const inTimer = window.setTimeout(() => {
      if (!interactedRef.current) setRolled(true);
    }, INTRO_DELAY_MS);
    const outTimer = window.setTimeout(() => {
      if (!interactedRef.current) setRolled(false);
    }, INTRO_DELAY_MS + rollDuration + INTRO_HOLD_MS);
    return () => {
      window.clearTimeout(inTimer);
      window.clearTimeout(outTimer);
    };
  }, [text]);

  const handleEnter = () => {
    interactedRef.current = true;
    setRolled(true);
  };

  const handleLeave = () => {
    setRolled(false);
  };

  return (
    <h1
      data-hero-wordmark
      aria-label={text}
      className={className}
      onMouseEnter={enhanced ? handleEnter : undefined}
      onMouseLeave={enhanced ? handleLeave : undefined}
    >
      {enhanced ? (
        <span aria-hidden="true">
          {text.split("").map((letter, index) =>
            letter === " " ? (
              <span key={index} className="inline-block w-[0.3em]" />
            ) : (
              <span
                key={index}
                className="inline-block h-[0.95em] overflow-hidden align-top"
              >
                <span
                  className="flex flex-col transition-transform duration-500 [transition-timing-function:cubic-bezier(0.76,0,0.24,1)]"
                  style={{
                    transitionDelay: `${index * STAGGER_MS}ms`,
                    transform: rolled ? "translateY(-0.95em)" : "translateY(0)",
                  }}
                >
                  <span className="block h-[0.95em] leading-[0.95]">
                    {letter}
                  </span>
                  <span className="block h-[0.95em] leading-[0.95]">
                    {letter}
                  </span>
                </span>
              </span>
            ),
          )}
        </span>
      ) : (
        text
      )}
    </h1>
  );
}
