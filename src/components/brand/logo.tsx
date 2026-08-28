import { cn } from "@/lib/utils";

type Props = {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
};

const iconSizes = {
  sm: 32,
  md: 36,
  lg: 44,
  xl: 56,
} as const;

function HouseIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="24" cy="24" r="24" className="fill-primary" />
      <path
        d="M24 12L14 20.5V34.5H20V27.5H28V34.5H34V20.5L24 12Z"
        fill="white"
      />
    </svg>
  );
}

export function BrandLogo({
  size = "md",
  showWordmark = true,
  className,
  wordmarkClassName,
}: Props) {
  const iconSize = iconSizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <HouseIcon size={iconSize} />
      {showWordmark ? (
        <span
          className={cn(
            "font-heading text-xl font-semibold tracking-tight",
            wordmarkClassName,
          )}
        >
          mismis
        </span>
      ) : null}
    </div>
  );
}

export function BrandIcon({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  return (
    <div className={cn("shrink-0", className)}>
      <HouseIcon size={iconSizes[size]} />
    </div>
  );
}
