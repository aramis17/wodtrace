"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function TeamTabs({ teamId }: { teamId: string }) {
  const pathname = usePathname();
  const base = `/coach/${teamId}`;
  const tabs = [
    { href: base, label: "Programación" },
    { href: `${base}/members`, label: "Alumnos" },
    { href: `${base}/results`, label: "Resultados" },
  ];

  return (
    <nav aria-label="Secciones del equipo">
      <ul className="grid grid-cols-3 gap-1 rounded-xl bg-surface p-1">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center justify-center rounded-lg text-sm font-semibold transition-colors",
                  active
                    ? "bg-card text-text-primary"
                    : "text-text-muted hover:text-text-primary",
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
