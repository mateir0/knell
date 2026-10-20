import { UncheckedBadge } from "@/components/ui/Badge";
import { strings } from "@/lib/strings";
import type { Candidate } from "@/lib/schema";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <article className="relative border border-faint bg-surface p-xl">
      <div className="absolute right-xl top-xl">
        <UncheckedBadge label={strings.badges.unchecked} />
      </div>

      <h3 className="pr-[140px] text-heading uppercase text-ink break-words">
        {candidate.name}
      </h3>
      <p className="mt-xs text-body-md text-body">{candidate.oneLiner}</p>

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
