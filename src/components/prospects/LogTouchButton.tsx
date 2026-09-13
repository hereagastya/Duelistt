"use client";

import { useState } from "react";

import { LogTouchModal } from "@/components/touches/LogTouchModal";
import { Button } from "@/components/ui/Button";
import type { Channel } from "@/lib/types";

export function LogTouchButton({
  prospect,
  today,
  timezone,
  defaultInterval,
}: {
  prospect: { id: string; name: string; channel: Channel };
  today: string;
  timezone: string;
  defaultInterval: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Log a touch
      </Button>
      <LogTouchModal
        open={open}
        onClose={() => setOpen(false)}
        prospect={prospect}
        today={today}
        timezone={timezone}
        defaultInterval={defaultInterval}
      />
    </>
  );
}
