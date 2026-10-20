export function UncheckedBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex h-[30px] items-center rounded-xs border border-faint px-[10px] text-caption-sm uppercase text-muted">
      {label}
    </span>
  );
}
