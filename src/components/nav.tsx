"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Dumbbell,
  Home,
  MoreHorizontal,
  Timer,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/activity", label: "Actividad", icon: Activity },
  { href: "/wods", label: "WODs", icon: Dumbbell },
  { href: "/timers", label: "Timers", icon: Timer },
  { href: "/prs", label: "PRs", icon: Trophy },
  { href: "/settings", label: "Más", icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur md:hidden"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                  active ? "text-ember" : "text-text-muted",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-surface md:block">
      <div className="sticky top-0 flex h-screen flex-col p-4">
        <Link href="/" className="mb-8">
          <span className="font-display text-2xl uppercase tracking-wider text-text-primary">
            Wod<span className="text-ember">Trace</span>
          </span>
        </Link>
        <nav aria-label="Navegación lateral">
          <ul className="space-y-1">
            {items.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-ember/15 text-ember"
                        : "text-text-secondary hover:bg-card hover:text-text-primary",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
