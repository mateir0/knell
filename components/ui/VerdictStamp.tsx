export type VerdictTone = "dead" | "alive" | "zombie";

const tones: Record<VerdictTone, string> = {
  dead: "border-dead text-dead",
  alive: "border-alive text-alive",
  zombie: "border-accent text-accent",
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
