"use client";

import { useEffect, useState } from "react";
import { AnimatedGrain } from "@/components/lightswind/animated-grain";

/**
 * Hero-only background texture: the Lightswind Animated Grain component in
 * its solar variant, retuned to the system's bronze palette. It is mounted as
 * the first child of the hero section and fills exactly that section,
 * scrolling away with it; screens below show the plain canvas color. It never
 * takes pointer events.
 *
 * It renders for every visitor regardless of reduced-motion settings. If WebGL
 * cannot be created on the visitor's machine, a static fallback built from the
 * design tokens takes its place so the hero never ships an empty canvas.
 */
export function GrainGate() {
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
      <AnimatedGrain
        variant="solar"
        colors={["#C9A24B", "#8A6A2F", "#140702", "#E3C878"]}
        speed={0.35}
        scale={5}
        intensity={1.2}
        grainAmount={0.2}
        contrast={1.0}
        vignetteStrength={0.45}
        opacity={0.55}
        interactive={true}
      />
    </div>
  );
}
