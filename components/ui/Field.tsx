import type { ComponentProps, ReactNode } from "react";

export function FieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-xs text-caption-sm uppercase text-body"
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-accent" />
      {children}
    </label>
  );
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <p className="text-body-xs text-muted">{children}</p>;
}

export function Input({
  className = "",
  ...rest
}: ComponentProps<"input">) {
  return <input className={`knell-field ${className}`} {...rest} />;
}

export function Textarea({
  className = "",
  ...rest
}: ComponentProps<"textarea">) {
  return <textarea className={`knell-field ${className}`} {...rest} />;
}

export function Select({
  className = "",
  children,
  ...rest
}: ComponentProps<"select">) {
  return (
    <select className={`knell-field ${className}`} {...rest}>
      {children}
    </select>
  );
}
