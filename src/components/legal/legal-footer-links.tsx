import Link from "next/link";
import { LEGAL_LABELS, LEGAL_PATHS } from "@/lib/legal/constants";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function LegalFooterLinks({ className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <Link href={LEGAL_PATHS.terms} className="hover:text-foreground">
        {LEGAL_LABELS.terms}
      </Link>
      <Link href={LEGAL_PATHS.privacy} className="hover:text-foreground">
        {LEGAL_LABELS.privacy}
      </Link>
      <Link href={LEGAL_PATHS.disclaimer} className="hover:text-foreground">
        {LEGAL_LABELS.disclaimer}
      </Link>
    </div>
  );
}
