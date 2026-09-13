import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const CONTROL =
  "w-full rounded-sm border border-rule-strong bg-paper px-3 py-2 text-[15px] text-ink " +
  "placeholder:text-ink-faint transition-colors duration-150 " +
  "hover:border-ink-faint focus:border-accent focus:outline-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent " +
  "disabled:bg-paper-sunk disabled:text-ink-faint";

export function Label({ htmlFor, children, hint }: { htmlFor: string; children: ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-3">
      <span className="text-[13px] font-medium text-ink-soft">{children}</span>
      {hint && <span className="text-[12px] text-ink-faint">{hint}</span>}
    </label>
  );
}

export function Input({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={`${CONTROL} ${className}`} />;
}

// appearance-none removes the platform arrow, so we draw one. Without this the
// select is indistinguishable from a text input.
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%237a7168' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6.5 4 3.5 4-3.5'/%3E%3C/svg%3E\")";

export function Select({ className = "", ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      style={{
        backgroundImage: CHEVRON,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.6rem center",
        backgroundSize: "1rem",
        ...rest.style,
      }}
      className={`${CONTROL} appearance-none pr-9 ${className}`}
    />
  );
}

export function Textarea({ className = "", ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={`${CONTROL} resize-y ${className}`} />;
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-[13px] text-late">
      {children}
    </p>
  );
}
