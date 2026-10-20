import { strings } from "@/lib/strings";
import { VerdictStamp, type VerdictTone } from "./VerdictStamp";

/**
 * Burial card. Used as the Verdikt receipt on the sweep screen (when it has a
 * link) and as tombstones in the graveyard (no link) — the two variants carry
 * the hover behaviors specified for each screen.
 */
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
    <article
      className={
        link
          ? "group relative border border-faint bg-surface-raised p-xl transition duration-200 ease-out hover:border-link"
          : "group relative border border-faint bg-surface-raised p-xl transition duration-200 ease-out hover:border-accent/50 motion-safe:hover:-translate-y-[3px]"
      }
    >
      <div className="absolute right-xl top-xl">
        <VerdictStamp
          tone={tone}
          label={stamp}
          className={
            link
              ? "duration-200 ease-out motion-safe:group-hover:rotate-0 motion-safe:group-hover:scale-[1.05]"
              : "duration-200 ease-out motion-safe:group-hover:-rotate-2 motion-safe:group-hover:scale-[1.05]"
          }
        />
      </div>
      <h3
        className={
          link
            ? "pr-[120px] text-heading uppercase text-ink break-words sm:pr-[160px]"
            : "pr-[120px] text-heading uppercase text-ink break-words transition-colors duration-200 group-hover:text-accent-bright sm:pr-[160px]"
        }
      >
        {name}
      </h3>
      <p className="mt-xs text-xs uppercase tracking-widest text-muted">
        {strings.landing.graveyard.killedBy.replace("{killer}", killer)}
      </p>
      <p className="mt-md text-body-sm text-body">{cause}</p>
      {link ? (
        <p className="mt-sm">
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            className="relative text-body-sm text-link transition-colors duration-200 after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-0 after:bg-link after:transition-[width] after:duration-200 after:ease-out hover:after:w-full"
          >
            {link.label}
          </a>
        </p>
      ) : null}
    </article>
  );
}
