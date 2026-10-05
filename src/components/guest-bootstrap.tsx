"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/** Ensures guest cookie exists via route handler, then refreshes RSC tree. */
export function GuestBootstrap({ needsBootstrap }: { needsBootstrap: boolean }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (!needsBootstrap || ran.current) return;
    ran.current = true;
    void fetch("/api/guest/bootstrap", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok) router.refresh();
      })
      .catch(() => {
        /* ignore */
      });
  }, [needsBootstrap, router]);

  return null;
}
