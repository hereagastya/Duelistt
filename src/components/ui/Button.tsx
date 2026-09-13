import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-paper hover:bg-accent-hover disabled:bg-ink-faint",
  secondary:
    "bg-paper text-ink border border-rule-strong hover:border-ink-faint hover:bg-paper-sunk",
  ghost:
    "bg-transparent text-ink-soft hover:text-ink hover:bg-paper-sunk",
  danger:
    "bg-paper text-late border border-rule-strong hover:border-late hover:bg-accent-wash",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  pending?: boolean;
};

export function Button({
  variant = "primary",
  pending = false,
  className = "",
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-3.5 py-2 text-[14px] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-70 ${VARIANTS[variant]} ${className}`}
    >
      {pending && (
        <span
          aria-hidden
          className="size-3 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
