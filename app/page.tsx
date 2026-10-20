import { Fragment } from "react";
import Link from "next/link";
import { GrainGate } from "@/components/landing/GrainGate";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { ScreenIndex } from "@/components/landing/ScreenIndex";
import { ButtonLink } from "@/components/ui/Button";
import { TombstoneCard } from "@/components/ui/TombstoneCard";
import { VerdictStamp } from "@/components/ui/VerdictStamp";
import { strings } from "@/lib/strings";

export default function LandingPage() {
  const { hero, modes, sweep, verdict, graveyard, indices, footer } =
    strings.landing;
  const heroWords = hero.tagline.split(" ");

  return (
    <main className="relative z-10">
      <GrainGate />

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
          <ScreenIndex value={indices[0]} />

          <h1
            data-hero-wordmark
            className="knell-display-xxl text-display-xxl uppercase text-ink"
          >
            {hero.wordmark}
          </h1>

          <p className="mt-xl max-w-[32ch] knell-display-lg text-display-lg uppercase text-ink">
            {heroWords.map((word, index) => (
              <Fragment key={`${word}-${index}`}>
                <span data-hero-word className="inline-block">
                  {word}
                </span>
                {index < heroWords.length - 1 ? " " : null}
              </Fragment>
            ))}
          </p>

          <div data-hero-cta className="mt-xl">
            <ButtonLink href="/run">{hero.cta}</ButtonLink>
          </div>

          <ul className="mt-xl grid grid-cols-1 gap-y-xs sm:grid-cols-3 sm:gap-x-lg">
            {hero.ledger.map((item, index) => (
              <li
                key={item}
                className={
                  index > 0
                    ? "border-t border-faint pt-xs text-caption-sm uppercase text-muted sm:border-l sm:border-t-0 sm:pl-lg sm:pt-0"
                    : "text-caption-sm uppercase text-muted"
                }
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Screen 2 — the two modes */}
      <section className="knell-section-fade px-5 py-section lg:py-band">
        <div
          data-reveal
          className="knell-container relative z-10 flex min-h-[80vh] flex-col justify-center"
        >
          <ScreenIndex value={indices[1]} />

          <h2 className="knell-display-xl text-display-xl uppercase text-ink">
            {modes.claim}
          </h2>
          <p className="mt-xl max-w-[54ch] text-body-md text-body lg:text-body-lg">
            {modes.body}
          </p>

          <div className="mt-xl grid gap-md md:grid-cols-2">
            {modes.panels.map((panel) => (
              <article
                key={panel.title}
                className="border border-faint bg-surface p-xl"
              >
                <h3 className="text-body-xl uppercase text-ink">{panel.title}</h3>
                <dl className="mt-lg">
                  {panel.rows.map((row, index) => (
                    <div
                      key={row.label}
                      className={
                        index > 0 ? "border-t border-faint py-xs" : "pb-xs"
                      }
                    >
                      <dt className="text-caption-sm uppercase text-muted">
                        {row.label}
                      </dt>
                      <dd className="text-body-sm text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Screen 3 — the sweep */}
      <section className="px-5 py-section lg:py-band">
        <div
          data-reveal
          className="knell-container relative z-10 flex min-h-[80vh] flex-col justify-center"
        >
          <ScreenIndex value={indices[2]} />

          <h2 className="knell-display-xl text-display-xl uppercase text-ink">
            {sweep.claim}
          </h2>
          <p className="mt-xl max-w-[54ch] text-body-md text-body lg:text-body-lg">
            {sweep.body}
          </p>

          <div className="mt-xl">
            {sweep.checks.map((check, index) => (
              <div
                key={check.index}
                className={
                  index > 0
                    ? "grid grid-cols-1 gap-y-xs border-t border-faint py-md sm:grid-cols-2 sm:gap-x-lg"
                    : "grid grid-cols-1 gap-y-xs py-md sm:grid-cols-2 sm:gap-x-lg"
                }
              >
                <h3 className="text-body-lg uppercase text-ink">
                  <span className="text-muted">{check.index}</span>
                  <span className="px-xs">—</span>
                  {check.title}
                </h3>
                <p className="max-w-[56ch] text-body-sm text-body">{check.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-xl max-w-[440px]">
            <p className="text-caption-sm uppercase text-muted">
              {sweep.receipt.caption}
            </p>
            <div className="mt-xs">
              <TombstoneCard
                name={sweep.receipt.name}
                killer={sweep.receipt.killer}
                cause={sweep.receipt.cause}
                stamp={sweep.receipt.stamp}
                link={{
                  label: sweep.receipt.linkLabel,
                  href: sweep.receipt.linkHref,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Screen 4 — the verdicts */}
      <section className="knell-section-fade px-5 py-section lg:py-band">
        <div
          data-reveal
          className="knell-container relative z-10 flex min-h-[80vh] flex-col justify-center"
        >
          <ScreenIndex value={indices[3]} />

          <h2 className="knell-display-xl text-display-xl uppercase text-ink">
            {verdict.claim}
          </h2>
          <p className="mt-xl max-w-[54ch] text-body-md text-body lg:text-body-lg">
            {verdict.body}
          </p>

          <div className="mt-xl grid gap-y-md sm:grid-cols-2 sm:gap-x-lg">
            {verdict.legend.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-md border-t border-faint pt-md"
              >
                <VerdictStamp tone={item.tone} label={item.label} />
                <p className="max-w-[40ch] text-body-sm text-body">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screen 5 — the graveyard */}
      <section className="px-5 py-section lg:py-band">
        <div
          data-graveyard
          data-reveal
          className="knell-container relative z-10"
        >
          <ScreenIndex value={indices[4]} />

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

      {/* Closing band */}
      <footer className="relative z-10 px-5 pt-section">
        <div className="knell-container overflow-hidden">
          <p
            className="knell-display-xxl text-display-xxl text-center uppercase -mb-[0.14em]"
            style={{
              WebkitTextStroke: "1px var(--color-faint)",
              color: "transparent",
            }}
          >
            {footer.wordmark}
          </p>
        </div>
        <p className="knell-container pb-section pt-md text-center text-caption-sm uppercase text-muted">
          {footer.caption}
        </p>
      </footer>

      <LandingMotion />
    </main>
  );
}
