import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export type ButtonVariant = "filled" | "ghost";

const base =
  "inline-flex h-[41px] items-center justify-center rounded-xs px-[45px] text-button uppercase transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  filled: "bg-accent text-on-accent hover:bg-accent-bright",
  ghost: "border border-faint text-ink hover:border-accent hover:text-accent",
};

export function Button({
  children,
  variant = "filled",
  className = "",
  type = "button",
  ...rest
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "filled",
  className = "",
}: {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
