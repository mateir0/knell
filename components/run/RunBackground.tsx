"use client";

import { useEffect, useState } from "react";
import { AnimatedFlow } from "@/components/lightswind/animated-flow";

/**
 * Run-page background texture: the Lightswind Animated Flow component — a
 * WebGL domain-warping fluid gradient — retuned to the system's bronze
 * palette. It is mounted as the first child of the /run main element and
 * fills the page, scrolling with it. It never takes pointer events.
 *
 * If WebGL cannot be created on the visitor's machine, a static fallback
 * built from the design tokens takes its place so the page never ships an
 * empty canvas.
 */
export function RunBackground() {
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const gl =
      document.createElement("canvas").getContext("webgl2") ||
      document.createElement("canvas").getContext("webgl");
    setWebglAvailable(Boolean(gl));
  }, []);

  if (webglAvailable === false) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundColor: "var(--color-canvas)",
          backgroundImage: [
            "radial-gradient(ellipse 60% 45% at 50% 0%, color-mix(in srgb, var(--color-accent) 18%, transparent) 0%, transparent 70%)",
            "radial-gradient(ellipse 100% 100% at 50% 50%, color-mix(in srgb, var(--color-accent) 5%, transparent) 0%, transparent 100%)",
          ].join(", "),
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
    >
      <AnimatedFlow
        variant="custom"
        isDark
        colors={["#0A0A0B", "#140702", "#8A6A2F", "#C9A24B", "#E3C878"]}
        flowSpeed={0.6}
        colorContrast={1.15}
        filmGrain={0.3}
        vignetteStrength={0.5}
        interactive
        className="min-h-0"
      />
    </div>
  );
}
