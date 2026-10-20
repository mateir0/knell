import type { Metadata } from "next";
import Link from "next/link";
import { GrainGate } from "@/components/landing/GrainGate";
import { RunPanel } from "@/components/run/RunPanel";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `Knell — ${strings.run.title}`,
  description: strings.run.subtitle,
};

export default function RunPage() {
  return (
    <main className="relative min-h-screen">
      <GrainGate />
      <div className="relative z-10 mx-auto max-w-6xl px-5">
        <nav className="flex items-center justify-between border-b border-faint py-lg">
          <Link
            href="/"
            className="text-caption-sm uppercase text-ink transition-opacity duration-150 hover:opacity-60"
          >
            {strings.nav.wordmark}
          </Link>
          <span className="text-caption-sm uppercase text-muted">
            {strings.nav.run}
          </span>
        </nav>

        <div className="items-start gap-xl pb-section pt-lg lg:grid lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div
              aria-hidden="true"
              className="mb-md h-[2px] w-16 bg-accent"
            />
            <h1 className="knell-display-lg text-display-lg uppercase text-ink">
              {strings.run.title}
            </h1>
            <p className="mt-sm max-w-[54ch] text-body-md text-body">
              {strings.run.subtitle}
            </p>

            <div className="mt-xl">
              <RunPanel />
            </div>
          </div>

          <aside className="hidden sticky top-lg lg:block">
            <div className="border border-faint bg-surface/80 p-lg backdrop-blur-sm">
              <h2 className="text-heading text-ink">
                {strings.landing.sweep.claim}
              </h2>
              <p className="mt-sm text-body-sm text-body">
                {strings.landing.sweep.body}
              </p>
              <div>
                {strings.landing.sweep.checks.map((check, index) => (
                  <div
                    key={check.index}
                    className={`flex gap-md py-md ${
                      index > 0 ? "border-t border-faint" : ""
                    }`}
                  >
                    <span className="pt-0.5 text-caption-sm text-accent">
                      {check.index}
                    </span>
                    <div>
                      <p className="text-body-md font-medium text-ink">
                        {check.title}
                      </p>
                      <p className="text-body-sm text-body">{check.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="border-t border-faint pt-md text-body-xs text-muted">
                {strings.run.resultsNote}
              </p>
            </div>
          </aside>
        </div>

        <footer className="flex items-center justify-between border-t border-faint py-lg">
          <span className="text-caption-sm uppercase text-muted">
            {strings.nav.wordmark}
          </span>
          <span className="hidden text-caption-sm uppercase text-muted sm:block">
            {strings.landing.hero.tagline}
          </span>
        </footer>
      </div>
    </main>
  );
}
