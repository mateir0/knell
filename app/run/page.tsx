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
      <nav className="flex items-center justify-between px-5 py-lg">
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

      <div className="knell-container px-5 pb-section pt-lg">
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
    </main>
  );
}
