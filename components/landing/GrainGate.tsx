"use client";

import { useEffect, useState } from "react";
import { AnimatedGrain } from "@/components/lightswind/animated-grain";

/**
 * Landing-only background texture: the Lightswind Animated Grain component in
 * its solar (amber) variant. It sits behind every screen as a fixed,
 * full-viewport layer and never takes pointer events.
 *
 * Reduced motion means no grain at all: the texture is motion, so it is
 * skipped rather than frozen.
 */
export function GrainGate() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!reduced);
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    >
      <AnimatedGrain
        variant="solar"
        speed={0.35}
        intensity={0.7}
        grainAmount={0.25}
        contrast={1.05}
        vignetteStrength={0.35}
        opacity={0.85}
        interactive={false}
      />
    </div>
  );
}
