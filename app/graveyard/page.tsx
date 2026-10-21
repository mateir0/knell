import type { Metadata } from "next";
import { VerdictStamp, type VerdictTone } from "@/components/ui/VerdictStamp";
import { listGraves } from "@/lib/graveyard";
import { strings } from "@/lib/strings";
import type { VerdictKind } from "@/lib/verdict";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Knell — ${strings.graveyard.title}`,
  description: strings.graveyard.subtitle,
};

const VERDICT_TONES: Record<VerdictKind, VerdictTone> = {
  dead: "dead",
  no_demand: "demand",
  zombie_gap: "zombie",
  alive: "alive",
  could_not_check: "demand",
};

const VERDICT_LABELS: Record<VerdictKind, string> = {
  dead: strings.run.verdicts.dead,
  no_demand: strings.run.verdicts.noDemand,
  zombie_gap: strings.run.verdicts.zombieGap,
  alive: strings.run.verdicts.alive,
  could_not_check: strings.run.verdicts.couldNotCheck,
};

function hostname(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return rawUrl;
  }
}

export default async function GraveyardPage() {
  const graves = await listGraves(60);

  return (
    <main className="relative min-h-screen px-5 pt-24 pb-section lg:pb-band">
      <div className="knell-container">
        <h1 className="knell-display-xl text-display-xl uppercase text-ink">
          {strings.graveyard.title}
        </h1>
        <p className="mt-md max-w-[64ch] text-body-md text-muted">
          {strings.graveyard.subtitle}
        </p>

        {graves.length === 0 ? (
          <p className="mt-xl text-body-md text-body">
            {strings.graveyard.empty}
          </p>
        ) : (
          <div className="mt-xl grid gap-md lg:grid-cols-2 min-[1440px]:grid-cols-3">
            {graves.map((grave) => (
              <article
                key={`${grave.createdAt}-${grave.name}`}
                className="group relative border border-faint bg-surface-raised p-xl transition duration-200 ease-out hover:border-accent/50 motion-safe:hover:-translate-y-[3px]"
              >
                <div className="absolute right-xl top-xl">
                  <VerdictStamp
                    tone={VERDICT_TONES[grave.result.verdict]}
                    label={VERDICT_LABELS[grave.result.verdict]}
                    className="duration-200 ease-out motion-safe:group-hover:-rotate-2 motion-safe:group-hover:scale-[1.05]"
                  />
                </div>
                <h3 className="pr-[120px] text-heading uppercase text-ink break-words transition-colors duration-200 group-hover:text-accent-bright sm:pr-[160px]">
                  {grave.name}
                </h3>
                <p className="mt-md text-body-sm text-body">
                  {grave.result.headline}
                </p>
                {grave.result.killerUrl ? (
                  <p className="mt-sm text-body-sm text-body">
                    {strings.run.sweep.killedBy}{" "}
                    <a
                      href={grave.result.killerUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="relative text-body-sm text-link transition-colors duration-200 after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-0 after:bg-link after:transition-[width] after:duration-200 after:ease-out hover:after:w-full"
                    >
                      {grave.result.killerName ?? hostname(grave.result.killerUrl)}
                    </a>
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
