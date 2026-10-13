"use client";

import { useRef, useState } from "react";

import { deleteProspect } from "@/lib/actions/prospects";
import { Button } from "@/components/ui/Button";

/*
  Delete is the only irreversible thing in the product, so it asks first, and
  the question names what actually goes: the person AND every touch logged
  against them, because the cascade takes the history too and someone who
  thinks they are tidying a list would not expect that.

  A native <dialog> rather than a window.confirm: confirm() cannot say how many
  touches are about to disappear, and the count is the whole point of asking.
*/
export function DeleteProspect({
  id,
  name,
  touchCount,
}: {
  id: string;
  name: string;
  touchCount: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="press rounded-md px-2.5 py-1.5 text-[13px] text-ink-faint hover:bg-late/[0.08] hover:text-late"
      >
        Delete
      </button>

      <dialog
        ref={dialog}
        onClose={() => setPending(false)}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-xl border border-rule bg-surface p-0 text-ink shadow-lg backdrop:bg-black/55 backdrop:backdrop-blur-[3px]"
      >
        <div className="px-6 pt-6 pb-5">
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-ink">
            Delete {name}?
          </h2>
          <p className="mt-2 text-[14px] leading-[1.6] text-ink-soft">
            {touchCount === 0
              ? "This removes them from your list for good."
              : `This also deletes ${touchCount} logged ${
                  touchCount === 1 ? "touch" : "touches"
                }. There is no undo.`}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-rule bg-paper-sunk/60 px-6 py-4">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            disabled={pending}
            className="press rounded-md px-3 py-1.5 text-[14px] text-ink-soft hover:bg-surface hover:text-ink"
          >
            Keep
          </button>

          <form action={deleteProspect} onSubmit={() => setPending(true)}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="danger" size="md" pending={pending}>
              {pending ? "Deleting" : "Delete"}
            </Button>
          </form>
        </div>
      </dialog>
    </>
  );
}
