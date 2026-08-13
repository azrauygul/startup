"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReview } from "@/lib/actions";

type Props = {
  bookingId: string;
  cleanerId: string;
};

export function ReviewForm({ bookingId, cleanerId }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await createReview({
        bookingId,
        cleanerId,
        rating,
        comment,
      });
      setMessage(result.error ?? result.success ?? null);
    });
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border/80 bg-muted/40 p-4">
      <p className="text-sm font-medium">Değerlendirme yaz</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className="rounded-md p-1 transition hover:scale-105"
            aria-label={`${value} yıldız`}
          >
            <Star
              className={
                value <= rating
                  ? "size-5 fill-amber-400 text-amber-400"
                  : "size-5 text-muted-foreground"
              }
            />
          </button>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Deneyiminizi kısaca anlatın..."
        rows={3}
      />
      <Button type="button" onClick={submit} disabled={pending} size="sm">
        {pending ? "Gönderiliyor..." : "Gönder"}
      </Button>
      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}
