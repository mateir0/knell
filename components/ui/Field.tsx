"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";

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
  value,
  ...rest
}: Omit<ComponentProps<"textarea">, "rows">) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    const resize = () => {
      element.style.height = "auto";
      element.style.height = `${Math.min(element.scrollHeight, 164)}px`;
      element.style.overflowY = element.scrollHeight > 164 ? "auto" : "hidden";
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className={`knell-field ${className}`}
      value={value}
      {...rest}
    />
  );
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
