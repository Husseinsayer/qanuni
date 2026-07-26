"use client";

import { useEffect, useState } from "react";
import { loadEvents, summarize, analyticsToJsonLd, analyticsDefaults } from "@/lib/analytics";
import { getAdminData } from "@/lib/admin-data";

export function AnalyticsJsonLd() {
  const [json, setJson] = useState<string | null>(null);

  useEffect(() => {
    try {
      const settings = getAdminData().analytics || analyticsDefaults;
      if (!settings.exposeSchema) return;
      const siteName = getAdminData().seo?.general?.siteName || "منصة قانوني";
      const summary = summarize(loadEvents(), 30);
      setJson(JSON.stringify(analyticsToJsonLd(summary, siteName)));
    } catch {
      /* ignore */
    }
  }, []);

  if (!json) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
