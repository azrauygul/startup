import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions";
import type { Profile } from "@/lib/types";

type Props = {
  profile: Profile | null;
};

export function SiteHeader({ profile }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link href="/home" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-heading text-xl font-semibold tracking-tight">
            mismis
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {profile ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-sm text-muted-foreground sm:inline">
                {profile.full_name}
              </span>
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm" className="rounded-full">
                  Çıkış
                </Button>
              </form>
            </>
          ) : (
            <Button
              render={<Link href="/login" />}
              size="sm"
              className="rounded-full"
            >
              Giriş
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
