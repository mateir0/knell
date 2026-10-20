import { Fragment } from "react";
import { AnimatedRollText } from "@/components/landing/AnimatedRollText";
import { GrainGate } from "@/components/landing/GrainGate";
import { Marquee } from "@/components/landing/Marquee";
import { PillNav } from "@/components/landing/PillNav";
import { MagneticButton } from "@/components/lightswind/magnetic-button";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { ScreenIndex } from "@/components/landing/ScreenIndex";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { TombstoneCard } from "@/components/ui/TombstoneCard";
import { VerdictStamp } from "@/components/ui/VerdictStamp";
import { strings } from "@/lib/strings";

export default function LandingPage() {
  const { hero, modes, sweep, verdict, graveyard, indices, footer } =
    strings.landing;
  const heroWords = hero.tagline.split(" ");

  return (
    <>
      <PillNav
        wordmark={strings.nav.wordmark}
        items={strings.nav.items.filter((item) => item.href.startsWith("#"))}
        ctaLabel={hero.cta}
        ctaHref="/run"
      />
      <main className="relative z-10">
      {/* Screen 1 — KNELL */}
      <section className="relative isolate flex min-h-screen flex-col overflow-hidden pt-24">
        <GrainGate />
        <div
          className="knell-hero-glow pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <div className="knell-container relative z-10 flex flex-1 flex-col justify-center px-5 pb-section">
        <ScreenIndex value={indices[0]} plated />

          <AnimatedRollText
            text={hero.wordmark}
            className="knell-display-xxl text-display-xxl uppercase text-ink"
          />

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
            <MagneticButton
              href="/run"
              variant="ghost"
              size="lg"
              strength={0.35}
              radius={90}
              className="h-[41px] rounded-xs bg-accent px-[45px] text-button uppercase text-on-accent hover:bg-accent-bright"
            >
              {hero.cta}
            </MagneticButton>
          </div>

          <div className="mt-xl border border-faint bg-canvas/80 px-md py-sm backdrop-blur-sm">
            <ul className="sr-only">
              {hero.ledger.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div aria-hidden="true" className="motion-reduce:hidden">
              <Marquee
                durationSeconds={36}
                className="[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
              >
                {Array.from({ length: 4 }).flatMap((_, sequenceIndex) =>
                  hero.ledger.map((item) => (
                    <span
                      key={`${sequenceIndex}-${item}`}
                      className="flex items-center gap-md pr-xl text-caption-sm font-medium uppercase text-body"
                    >
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 shrink-0 bg-accent"
                      />
                      {item}
                    </span>
                  )),
                )}
              </Marquee>
            </div>
            <ul
              aria-hidden="true"
              className="hidden motion-reduce:grid grid-cols-1 gap-y-xs sm:grid-cols-3 sm:gap-x-lg"
            >
              {hero.ledger.map((item, index) => (
                <li
                  key={item}
                  className={
                    index > 0
                      ? "border-t border-faint pt-xs text-caption-sm font-medium uppercase text-body sm:border-l sm:border-t-0 sm:pl-lg sm:pt-0"
                      : "text-caption-sm font-medium uppercase text-body"
                  }
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Screen 2 — the two modes */}
      <section
        id="modes"
        className="scroll-mt-24 px-5 py-section lg:py-band"
      >
        <div
          data-reveal
          className="knell-container relative z-10 flex min-h-[80vh] flex-col justify-center"
        >
          <SectionHeader
            eyebrowIndex={indices[1]}
            headline={modes.claim}
            standfirst={modes.body}
          />

          <div className="mt-xl grid gap-md md:grid-cols-2">
            {modes.panels.map((panel) => (
              <article
                key={panel.title}
                className="group border border-faint bg-surface p-xl transition duration-200 ease-out hover:border-accent/60 motion-safe:hover:-translate-y-1"
              >
                <h3 className="text-body-xl uppercase text-ink transition-colors duration-200 group-hover:text-accent-bright">
                  {panel.title}
                </h3>
                <dl className="mt-lg">
                  {panel.rows.map((row, index) => (
                    <div
                      key={row.label}
                      className={
                        index > 0 ? "border-t border-faint py-xs" : "pb-xs"
                      }
                    >
                      <dt className="text-xs uppercase tracking-widest text-muted">
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
      <section
        id="sweep"
        className="scroll-mt-24 bg-surface border-t border-faint px-5 py-section lg:py-band"
      >
        <div
          data-reveal
          className="knell-container relative z-10 flex min-h-[80vh] flex-col justify-center"
        >
          <SectionHeader
            eyebrowIndex={indices[2]}
            headline={sweep.claim}
            standfirst={sweep.body}
          />

          <div className="mt-xl">
            {sweep.checks.map((check, index) => (
              <div
                key={check.index}
                className={
                  index > 0
                    ? "group relative grid grid-cols-1 gap-y-xs border-t border-faint py-md transition-colors duration-200 ease-out hover:bg-surface-raised sm:grid-cols-2 sm:gap-x-lg"
                    : "group relative grid grid-cols-1 gap-y-xs py-md transition-colors duration-200 ease-out hover:bg-surface-raised sm:grid-cols-2 sm:gap-x-lg"
                }
              >
                <h3 className="text-body-lg uppercase text-ink">
                  <span className="text-muted transition-colors duration-200 group-hover:text-accent">
                    {check.index}
                  </span>
                  <span className="px-xs">—</span>
                  {check.title}
                </h3>
                <p className="max-w-[56ch] text-body-sm text-body transition-colors duration-200 group-hover:text-ink">
                  {check.body}
                </p>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-0 top-md hidden select-none text-body-lg text-accent opacity-0 transition-all duration-200 ease-out motion-safe:-translate-x-1 motion-safe:group-hover:translate-x-0 group-hover:opacity-100 sm:block"
                >
                  →
                </span>
              </div>
            ))}
          </div>

          <div className="mt-xl max-w-[440px]">
            <p className="text-xs uppercase tracking-widest text-muted">
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
      <section
        id="verdicts"
        className="scroll-mt-24 px-5 py-section lg:py-band"
      >
        <div
          data-reveal
          className="knell-container relative z-10 flex min-h-[80vh] flex-col justify-center"
        >
          <SectionHeader
            eyebrowIndex={indices[3]}
            headline={verdict.claim}
            standfirst={verdict.body}
          />

          <div className="mt-xl grid gap-y-md sm:grid-cols-2 sm:gap-x-lg">
            {verdict.legend.map((item) => (
              <div
                key={item.label}
                className="group flex items-start gap-md border-t border-faint pt-md"
              >
                <VerdictStamp
                  tone={item.tone}
                  label={item.label}
                  className="duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover:rotate-0 motion-safe:group-hover:scale-[1.06]"
                />
                <p className="max-w-[40ch] text-body-sm text-body">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screen 5 — the graveyard */}
      <section
        id="graveyard"
        className="scroll-mt-24 bg-surface border-t border-faint px-5 py-section lg:py-band"
      >
        <div
          data-graveyard
          data-reveal
          className="knell-container relative z-10"
        >
          <SectionHeader eyebrowIndex={indices[4]} headline={graveyard.claim} />

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
          <span className="relative transition-colors duration-200 ease-out after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-0 after:bg-link after:transition-[width] after:duration-200 after:ease-out hover:text-ink hover:after:w-full">
            {footer.caption}
          </span>
        </p>
      </footer>

      <LandingMotion />
      </main>
    </>
  );
}
