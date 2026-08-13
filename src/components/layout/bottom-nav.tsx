"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Sparkles, UserCog } from "lucide-react";
import type { Profile } from "@/lib/types";

type Props = {
  profile: Profile | null;
};

const items = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/dashboard", label: "Keşfet", icon: Sparkles },
  { href: "/bookings", label: "Randevular", icon: CalendarDays },
] as const;

export function BottomNav({ profile }: Props) {
  const pathname = usePathname();

  const navItems = [
    ...items,
    ...(profile?.role === "cleaner"
      ? ([{ href: "/panel", label: "Operasyon", icon: UserCog }] as const)
      : []),
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/home" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium transition ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className={`size-5 ${active ? "stroke-[2.25px]" : ""}`}
              />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
