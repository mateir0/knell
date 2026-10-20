/**
 * The single header skeleton shared by landing screens 2–5: bronze index
 * eyebrow, optional tracked label, a 2px bronze rule that draws in on scroll
 * ([data-section-rule], animated by LandingMotion), and one shared
 * headline/standfirst treatment so every section speaks the same way.
 */
interface SectionHeaderProps {
  eyebrowIndex: string;
  eyebrowLabel?: string;
  headline: string;
  standfirst?: string;
}

export function SectionHeader({
  eyebrowIndex,
  eyebrowLabel,
  headline,
  standfirst,
}: SectionHeaderProps) {
  return (
    <header>
      <p className="flex items-baseline gap-md text-xs uppercase tracking-widest">
        <span className="text-accent">{eyebrowIndex}</span>
        {eyebrowLabel ? <span className="text-muted">{eyebrowLabel}</span> : null}
      </p>
      <div
        data-section-rule
        className="mt-xs h-[2px] w-16 origin-left bg-accent"
      />
      <h2 className="mt-lg text-[clamp(2.5rem,6vw,4.5rem)] font-black uppercase leading-[0.95] text-ink">
        {headline}
      </h2>
      {standfirst ? (
        <p className="mt-lg max-w-2xl text-lg text-body">{standfirst}</p>
      ) : null}
    </header>
  );
}
