import { strings } from "@/lib/strings";
import { VerdictStamp, type VerdictTone } from "./VerdictStamp";

export function TombstoneCard({
  name,
  killer,
  cause,
  stamp,
  tone = "dead",
}: {
  name: string;
  killer: string;
  cause: string;
  stamp: string;
  tone?: VerdictTone;
}) {
  return (
    <article className="relative border border-faint bg-surface p-xl transition-colors duration-150 hover:bg-surface-raised">
      <div className="absolute right-xl top-xl">
        <VerdictStamp tone={tone} label={stamp} />
      </div>
      <h3 className="pr-[120px] text-heading uppercase text-ink break-words sm:pr-[160px]">
        {name}
      </h3>
      <p className="mt-xs text-caption-sm uppercase text-muted">
        {strings.landing.graveyard.killedBy.replace("{killer}", killer)}
      </p>
      <p className="mt-md text-body-sm text-body">{cause}</p>
    </article>
  );
}
