import Link from "next/link";
import { LEGAL_LABELS, LEGAL_PATHS } from "@/lib/legal/constants";
import { cn } from "@/lib/utils";

type Variant = "register" | "booking";

type Props = {
  variant: Variant;
  className?: string;
};

export function LegalConsentText({ variant, className }: Props) {
  if (variant === "booking") {
    return (
      <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
        Randevuyu onaylayarak{" "}
        <Link
          href={LEGAL_PATHS.terms}
          target="_blank"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {LEGAL_LABELS.terms}
        </Link>
        {" "}ve{" "}
        <Link
          href={LEGAL_PATHS.disclaimer}
          target="_blank"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {LEGAL_LABELS.disclaimer}
        </Link>
        &apos;nı okuduğunuzu kabul etmiş olursunuz.
      </p>
    );
  }

  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      Devam ederek{" "}
      <Link
        href={LEGAL_PATHS.terms}
        target="_blank"
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        {LEGAL_LABELS.terms}
      </Link>
      ,{" "}
      <Link
        href={LEGAL_PATHS.privacy}
        target="_blank"
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        {LEGAL_LABELS.privacy}
      </Link>
      {" "}ve{" "}
      <Link
        href={LEGAL_PATHS.disclaimer}
        target="_blank"
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        {LEGAL_LABELS.disclaimer}
      </Link>
      &apos;nı kabul etmiş olursunuz.
    </p>
  );
}
