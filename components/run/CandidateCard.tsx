"use client";

import { useEffect, useState } from "react";
import { UncheckedBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { strings } from "@/lib/strings";
import type { Candidate } from "@/lib/schema";
import type { CheckResult, VerdictKind } from "@/lib/verdict";

const VERDICT_LABELS: Record<VerdictKind, string> = {
  dead: strings.run.verdicts.dead,
  no_demand: strings.run.verdicts.noDemand,
  zombie_gap: strings.run.verdicts.zombieGap,
  alive: strings.run.verdicts.alive,
  could_not_check: strings.run.verdicts.couldNotCheck,
};

const STAMP_COLORS: Record<VerdictKind, string> = {
  dead: "border-dead text-dead",
  no_demand: "border-muted text-muted",
  zombie_gap: "border-accent text-accent",
  alive: "border-alive text-alive",
  could_not_check: "border-muted text-muted",
};

function hostname(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return rawUrl;
  }
}

export type CandidateStatus = "idle" | "checking" | "done";

export function CandidateCard({
  candidate,
  status = "idle",
  result = null,
  onRetry,
  sweepRunning = false,
}: {
  candidate: Candidate;
  status?: CandidateStatus;
  result?: CheckResult | null;
  onRetry?: () => void;
  sweepRunning?: boolean;
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (status !== "checking") return;
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1600);
    return () => clearInterval(interval);
  }, [status]);

  const checkingLabel =
    strings.run.sweep.checking[tick % strings.run.sweep.checking.length];

  const verdictLabelLine =
    result && result.verdict !== "could_not_check"
      ? result.verdict === "alive"
        ? strings.run.sweep.opening
        : strings.run.sweep.cause
      : null;

  return (
    <article className="relative border border-faint bg-surface/80 p-xl backdrop-blur-sm transition-colors duration-150 hover:border-accent/50">
      <div className="absolute right-xl top-xl">
        {status === "checking" ? (
          <span
            aria-live="polite"
            className="inline-flex h-[30px] whitespace-nowrap items-center rounded-xs border border-accent px-[10px] text-caption-sm uppercase text-accent animate-pulse"
          >
            {checkingLabel}
          </span>
        ) : status === "done" && result ? (
          <span
            className={`knell-stamp-in inline-flex items-center rounded-xs border-2 px-3 py-1 whitespace-nowrap text-body-sm font-black uppercase ${STAMP_COLORS[result.verdict]}`}
          >
            {VERDICT_LABELS[result.verdict]}
          </span>
        ) : (
          <UncheckedBadge label={strings.badges.unchecked} />
        )}
      </div>

      <h3 className="pr-[190px] text-heading uppercase text-ink break-words">
        {candidate.name}
      </h3>
      <p className="mt-xs text-body-md text-body">{candidate.oneLiner}</p>

      {result && status === "done" ? (
        <div className="mt-md space-y-xs border-t border-faint pt-md">
          {verdictLabelLine ? (
            <p className="text-caption-sm uppercase text-muted">
              {verdictLabelLine}
            </p>
          ) : null}
          <p className="text-body-sm text-body">{result.headline}</p>
          {result.killerUrl ? (
            <p className="text-body-sm text-body">
              {strings.run.sweep.killedBy}{" "}
              <a
                href={result.killerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-link underline transition-colors hover:text-accent-bright"
              >
                {result.killerName ?? hostname(result.killerUrl)}
              </a>
            </p>
          ) : null}
          {result.receiptUrls.length > 0 ? (
            <ul className="space-y-xs">
              {result.receiptUrls.map((url) => (
                <li key={url} className="break-all">
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-body-xs text-link underline transition-colors hover:text-accent-bright"
                  >
                    {hostname(url)}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {status === "done" && result.cached ? (
            <p className="text-caption-sm uppercase text-muted">
              {strings.run.sweep.fromGraveyard}
            </p>
          ) : null}
          {onRetry && !sweepRunning ? (
            <div className="pt-xs">
              <Button variant="ghost" onClick={onRetry}>
                {strings.run.sweep.retry}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <dl className="mt-md space-y-xs">
        <div>
          <dt className="text-caption-sm uppercase text-muted">
            {strings.run.cards.whoItsFor}
          </dt>
          <dd className="text-body-sm text-body">{candidate.whoItsFor}</dd>
        </div>
        <div>
          <dt className="text-caption-sm uppercase text-muted">
            {strings.run.cards.workItRemoves}
          </dt>
          <dd className="text-body-sm text-body">{candidate.workItRemoves}</dd>
        </div>
        <div>
          <dt className="text-caption-sm uppercase text-muted">
            {strings.run.cards.buildShape}
          </dt>
          <dd className="text-body-sm text-body">{candidate.buildShape}</dd>
        </div>
      </dl>
    </article>
  );
}
