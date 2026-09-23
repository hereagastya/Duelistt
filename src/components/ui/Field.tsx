import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/*
  Controls sit on white with a hairline and a soft focus ring in the brand
  amber -- the modern light-UI pattern, rather than a hard blue browser outline
  or a flat grey box.
*/
const CONTROL =
  "w-full rounded-md border border-rule-strong bg-surface text-ink shadow-xs " +
  "placeholder:text-ink-faint transition-[border-color,box-shadow] duration-150 " +
  "hover:border-ink-faint/60 " +
  "focus:border-accent-line focus:ring-[3px] focus:ring-accent/30 focus:outline-none " +
  "disabled:bg-paper-sunk disabled:text-ink-faint disabled:shadow-none";

const CONTROL_SIZE = "h-9 px-3 text-[14px]";

export function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-3">
      <span className="text-[13px] font-medium text-ink">{children}</span>
      {hint && <span className="text-[12px] text-ink-faint">{hint}</span>}
    </label>
  );
}

export function Input({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={`${CONTROL} ${CONTROL_SIZE} ${className}`} />;
}

// appearance-none removes the platform arrow, so we draw one; without it the
// select is indistinguishable from a text input.
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23a3a09b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6.5 4 3.5 4-3.5'/%3E%3C/svg%3E\")";

export function Select({ className = "", ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      style={{
        backgroundImage: CHEVRON,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.625rem center",
        backgroundSize: "1rem",
        ...rest.style,
      }}
      className={`${CONTROL} ${CONTROL_SIZE} appearance-none pr-9 ${className}`}
    />
  );
}

export function Textarea({ className = "", ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={`${CONTROL} resize-y px-3 py-2 text-[14px] leading-[1.55] ${className}`}
    />
  );
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-md border border-late/25 bg-late/[0.06] px-3 py-2 text-[13px] text-late"
    >
      {children}
    </p>
  );
}
