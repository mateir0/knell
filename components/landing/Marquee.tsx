import type { ReactNode } from "react";

/**
 * Marquee — an infinite horizontal ticker.
 *
 * The children render twice on a max-content flex track; the track
 * animates translateX from 0 to -50% (keyframes in globals.css via the
 * --animate-marquee token), so the loop is seamless. Hovering pauses
 * the track. The duplicate half is hidden from assistive tech.
 *
 * Speed is controlled with durationSeconds (higher = slower).
 */

interface MarqueeProps {
  children: ReactNode;
  durationSeconds?: number;
  className?: string;
}

export function Marquee({
  children,
  durationSeconds = 36,
  className = "",
}: MarqueeProps) {
  return (
    <div className={`group overflow-hidden ${className}`}>
      <div
        className="animate-marquee flex w-max group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
