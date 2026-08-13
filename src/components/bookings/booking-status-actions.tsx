"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateBookingStatus } from "@/lib/actions";
import type { BookingStatus } from "@/lib/types";

type Props = {
  bookingId: string;
  actions: { label: string; status: BookingStatus; variant?: "default" | "outline" | "destructive" }[];
};

export function BookingStatusActions({ bookingId, actions }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          type="button"
          size="sm"
          variant={action.variant ?? "default"}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await updateBookingStatus(bookingId, action.status);
            })
          }
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
