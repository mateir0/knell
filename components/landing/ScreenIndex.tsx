export function ScreenIndex({
  value,
  plated,
}: {
  value: string;
  plated?: boolean;
}) {
  return (
    <span
      className={
        plated
          ? "absolute right-5 top-0 text-caption-xs uppercase text-muted border border-faint bg-canvas/80 px-2 py-1 backdrop-blur-sm"
          : "absolute right-5 top-0 text-caption-xs uppercase text-muted"
      }
    >
      {value}
    </span>
  );
}
