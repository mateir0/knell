import Link from "next/link";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { ButtonLink } from "@/components/ui/Button";
import { TombstoneCard } from "@/components/ui/TombstoneCard";
import { strings } from "@/lib/strings";

export default function LandingPage() {
  const { hero, modes, sweep, verdict, graveyard } = strings.landing;
  const heroWords = hero.emphasis.split(" ");

  return (
    <main>
      {/* Screen 1 — KNELL */}
      <section className="relative isolate flex min-h-screen flex-col overflow-hidden">
        <div
          className="knell-hero-glow pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <nav className="relative z-10 flex items-center justify-between px-5 py-lg">
          <span className="text-caption-sm uppercase text-ink">
            {strings.nav.wordmark}
          </span>
          <Link
            href="/run"
            className="text-caption-sm uppercase text-ink transition-opacity duration-150 hover:opacity-60"
          >
            {strings.nav.run}
          </Link>
        </nav>

        <div className="knell-container relative z-10 flex flex-1 flex-col justify-center px-5 pb-section">
          <h1
            data-hero-wordmark
            className="knell-display-xxl text-display-xxl uppercase text-ink"
          >
            {hero.wordmark}
          </h1>

          <p className="mt-xl max-w-[26ch] text-body-xl text-body md:text-body-lg">
            {heroWords.map((word, index) => (
              <span
                key={word}
                data-hero-word
                className="inline-block font-black uppercase text-ink"
              >
                {word}
                {index < heroWords.length - 1 ? "\u00a0" : ""}
              </span>
            ))}
            {"\u00a0"}
            <span className="text-body text-muted">{hero.tail}</span>
          </p>

          <div data-hero-cta className="mt-xl">
            <ButtonLink href="/run">{hero.cta}</ButtonLink>
          </div>
        </div>
      </section>

      {/* Screen 2 — the two modes */}
      <section
        data-reveal
        className="knell-section-fade px-5 py-section lg:py-band"
      >
        <div className="knell-container flex min-h-[80vh] flex-col justify-center">
          <h2 className="knell-display-xl text-display-xl uppercase text-ink">
            {modes.claim}
          </h2>
          <p className="mt-xl max-w-[54ch] text-body-md text-body lg:text-body-lg">
            {modes.body}
          </p>
        </div>
      </section>

      {/* Screen 3 — the sweep */}
      <section data-reveal className="px-5 py-section lg:py-band">
        <div className="knell-container flex min-h-[80vh] flex-col justify-center">
          <h2 className="knell-display-xl text-display-xl uppercase text-ink">
            {sweep.claim}
          </h2>
          <p className="mt-xl max-w-[54ch] text-body-md text-body lg:text-body-lg">
            {sweep.body}
          </p>
        </div>
      </section>

      {/* Screen 4 — the verdicts */}
      <section
        data-reveal
        className="knell-section-fade px-5 py-section lg:py-band"
      >
        <div className="knell-container flex min-h-[80vh] flex-col justify-center">
          <h2 className="knell-display-xl text-display-xl uppercase text-ink">
            {verdict.claim}
          </h2>
          <p className="mt-xl max-w-[54ch] text-body-md text-body lg:text-body-lg">
            {verdict.body}
          </p>
        </div>
      </section>

      {/* Screen 5 — the graveyard */}
      <section
        data-graveyard
        data-reveal
        className="px-5 py-section lg:py-band"
      >
        <div className="knell-container">
          <h2 className="knell-display-xl text-display-xl uppercase text-ink">
            {graveyard.claim}
          </h2>

          <div className="mt-xl grid gap-md lg:grid-cols-2 min-[1440px]:grid-cols-3">
            {graveyard.tombstones.map((tombstone) => (
              <TombstoneCard
                key={tombstone.name}
                name={tombstone.name}
                killer={tombstone.killer}
                cause={tombstone.cause}
                stamp={tombstone.stamp}
              />
            ))}
          </div>

          <p className="mt-xl text-body-md text-muted">{graveyard.tally}</p>
        </div>
      </section>

      <LandingMotion />
    </main>
  );
}
