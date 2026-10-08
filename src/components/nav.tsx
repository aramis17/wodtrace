"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ClipboardList,
  Dumbbell,
  Home,
  MoreHorizontal,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/activity", label: "Actividad", icon: Activity },
  { href: "/wods", label: "WODs", icon: Dumbbell },
  { href: "/box", label: "Box", icon: Users },
  { href: "/timers", label: "Timers", icon: Timer },
  { href: "/prs", label: "PRs", icon: Trophy },
  { href: "/settings", label: "Más", icon: MoreHorizontal },
];

const coachItem = { href: "/coach", label: "Coach", icon: ClipboardList };

// Six slots fit a phone; Actividad stays reachable from Inicio ("Ver todo").
const bottomItems = items.filter((i) => i.href !== "/activity");

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur md:hidden"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {bottomItems.map(({ href, label, icon: Icon }) => {
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
                  active ? "text-primary" : "text-text-muted",
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

export function SideNav({ showCoach = false }: { showCoach?: boolean }) {
  const pathname = usePathname();
  const sideItems = showCoach ? [...items.slice(0, 4), coachItem, ...items.slice(4)] : items;

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-surface md:block">
      <div className="sticky top-0 flex h-screen flex-col p-4">
        <Link href="/" className="mb-8">
          <span className="font-display text-2xl uppercase tracking-wider text-text-primary">
            Wod<span className="text-primary">Trace</span>
          </span>
        </Link>
        <nav aria-label="Navegación lateral">
          <ul className="space-y-1">
            {sideItems.map(({ href, label, icon: Icon }) => {
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
                        ? "bg-primary/15 text-primary"
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
