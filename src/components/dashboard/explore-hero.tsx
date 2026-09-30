import { TRUST_FEATURES } from "@/lib/constants";
import { BadgeCheck } from "lucide-react";

export function ExploreHero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-[linear-gradient(135deg,var(--brand-soft),var(--background)_50%,oklch(0.97_0.03_215))] px-6 py-8 sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-medium text-primary">
          <BadgeCheck className="size-3.5" />
          TaskRabbit tarzı güvenilir temizlik platformu
        </div>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Ev temizliği için doğru personeli bulun
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Profilleri inceleyin, kaç temizlik yaptıklarını görün, ev
            büyüklüğünüzü belirterek müsait gün ve saatten randevu alın. Tekrarlayan
            temizlikte %10–15 tasarruf.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {TRUST_FEATURES.map((feature) => (
            <span
              key={feature}
              className="rounded-full border border-border/70 bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
