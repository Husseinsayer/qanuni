"use client";

import { useEffect } from "react";
import { recordVisit, finalizeSession, analyticsDefaults } from "@/lib/analytics";
import { getAdminData } from "@/lib/admin-data";

export function AnalyticsTracker() {
  useEffect(() => {
    try {
      const settings = getAdminData().analytics || analyticsDefaults;
      recordVisit({ settings });
    } catch {
      recordVisit();
    }

    // Finalize the session when the tab is hidden or closed so duration/bounce
    // are written even though the page is static (no backend). Use pagehide for
    // reliability and visibilitychange as a fallback.
    const onHide = () => {
      if (document.visibilityState === "hidden") finalizeSession();
    };
    window.addEventListener("pagehide", finalizeSession);
    document.addEventListener("visibilitychange", onHide);

    return () => {
      window.removeEventListener("pagehide", finalizeSession);
      document.removeEventListener("visibilitychange", onHide);
      finalizeSession();
    };
  }, []);
  return null;
}
