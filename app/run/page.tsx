import type { Metadata } from "next";
import Link from "next/link";
import { RunPanel } from "@/components/run/RunPanel";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `Knell — ${strings.run.title}`,
  description: strings.run.subtitle,
};

export default function RunPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[860px] px-5">
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

        <div className="pb-section pt-lg">
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

          <div className="mt-section">
            <RunPanel />
          </div>
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
