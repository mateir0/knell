import { strings } from "@/lib/strings";
import { VerdictStamp, type VerdictTone } from "./VerdictStamp";

export function TombstoneCard({
  name,
  killer,
  cause,
  stamp,
  tone = "dead",
  link,
}: {
  name: string;
  killer: string;
  cause: string;
  stamp: string;
  tone?: VerdictTone;
  link?: { label: string; href: string };
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
      {link ? (
        <p className="mt-sm">
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            className="text-body-sm text-link underline-offset-4 transition-colors hover:underline"
          >
            {link.label}
          </a>
        </p>
      ) : null}
    </article>
  );
}
