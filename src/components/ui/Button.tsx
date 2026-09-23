import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

/*
  Primary is an amber fill carrying ink text -- the same button as the landing
  page, and high contrast in both directions. Secondary is a white surface with
  a hairline and a whisper of elevation, not a grey box.
*/
const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-ink shadow-xs hover:bg-accent-hover active:bg-accent-hover disabled:bg-rule-strong disabled:text-ink-faint disabled:shadow-none",
  secondary:
    "bg-surface text-ink border border-rule-strong shadow-xs hover:bg-paper-sunk hover:border-ink-faint/60",
  ghost: "bg-transparent text-ink-soft hover:bg-paper-sunk hover:text-ink",
  danger:
    "bg-surface text-late border border-rule-strong shadow-xs hover:border-late/45 hover:bg-late/5",
};

const SIZES: Record<Size, string> = {
  md: "h-9 px-3.5 text-[14px]",
  sm: "h-8 px-3 text-[13px]",
};

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-[background-color,border-color,box-shadow,color] duration-150";

/** The same styling for anchors, so a link that acts as a button looks like one. */
export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]}`;
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  pending?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
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
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-[background-color,border-color,box-shadow,color] duration-150 disabled:cursor-not-allowed ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
    >
      {pending && (
        <span
          aria-hidden
          className="size-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent opacity-70"
        />
      )}
      {children}
    </button>
  );
}
