"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Input, Select } from "@/components/ui/Field";
import { CHANNEL_LABELS, CHANNELS, PROSPECT_STATUSES, STATUS_LABELS } from "@/lib/types";

export function ProspectFilters({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(params.get("q") ?? "");
  const firstRender = useRef(true);

  function apply(next: URLSearchParams) {
    const qs = next.toString();
    // typedRoutes cannot verify a URL assembled at runtime. The path comes from
    // usePathname(), not from user input, so the cast is safe here.
    const url = (qs ? `${pathname}?${qs}` : pathname) as Route;
    startTransition(() => router.replace(url));
  }

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    apply(next);
  }

  // Debounce the search box only. Typing should not put a history entry --
  // and one request per keystroke on a list this small is waste.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (query) next.set("q", query);
      else next.delete("q");
      if (next.toString() !== params.toString()) apply(next);
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const status = params.get("status") ?? "";
  const channel = params.get("channel") ?? "";
  const filtered = Boolean(status || channel || params.get("q"));

  return (
    <div className="flex flex-col gap-3 pb-5">
      {/* Each control fills a sized wrapper: the shared control style is w-full,
          so widths belong on the container, not on the element. */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[11rem] max-w-[20rem] flex-1">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name"
            aria-label="Search prospects by name"
          />
        </div>

        <div className="w-[9.5rem]">
          <Select
            value={status}
            onChange={(e) => setParam("status", e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">Any status</option>
            {PROSPECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-[9.5rem]">
          <Select
            value={channel}
            onChange={(e) => setParam("channel", e.target.value)}
            aria-label="Filter by channel"
          >
            <option value="">Any channel</option>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {CHANNEL_LABELS[c]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <p
        aria-live="polite"
        className={`text-[13px] transition-opacity duration-150 ${
          isPending ? "text-ink-faint opacity-60" : "text-ink-soft"
        }`}
      >
        {total} {total === 1 ? "prospect" : "prospects"}
        {filtered && (
          <>
            {" · "}
            <button
              type="button"
              onClick={() => apply(new URLSearchParams())}
              className="text-accent-ink underline decoration-accent-line underline-offset-[3px] hover:decoration-accent-ink"
            >
              Clear filters
            </button>
          </>
        )}
      </p>
    </div>
  );
}
