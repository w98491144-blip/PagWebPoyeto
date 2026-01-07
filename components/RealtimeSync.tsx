"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

const tables = ["products", "categories", "site_settings"];

const RealtimeSync = () => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const refreshTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/libro-reclamaciones")) {
      return;
    }

    const scheduleRefresh = () => {
      if (refreshTimeout.current !== null) return;
      refreshTimeout.current = window.setTimeout(() => {
        refreshTimeout.current = null;
        router.refresh();
      }, 300);
    };

    const channel = supabase.channel("realtime:public-content");

    tables.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          scheduleRefresh();
        }
      );
    });

    channel.subscribe();

    return () => {
      if (refreshTimeout.current !== null) {
        window.clearTimeout(refreshTimeout.current);
        refreshTimeout.current = null;
      }
      supabase.removeChannel(channel);
    };
  }, [pathname, router, supabase]);

  return null;
};

export default RealtimeSync;
