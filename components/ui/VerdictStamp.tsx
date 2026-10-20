export type VerdictTone = "dead" | "alive" | "zombie" | "demand";

const tones: Record<VerdictTone, string> = {
  dead: "border-dead text-dead",
  alive: "border-alive text-alive",
  zombie: "border-accent text-accent",
  demand: "border-muted text-muted",
};

export function VerdictStamp({
  tone,
  label,
}: {
  tone: VerdictTone;
  label: string;
}) {
  return (
    <span
      className={`inline-block border-2 px-[14px] py-[6px] text-stamp uppercase -rotate-4 ${tones[tone]}`}
    >
      {label}
    </span>
  );
}
