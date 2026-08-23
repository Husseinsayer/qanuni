"use client";

import * as React from "react";
import Script from "next/script";
import { getAdminData } from "@/lib/admin-data";

export function AdSenseLoader() {
  const [clientId, setClientId] = React.useState<string | null>(null);
  const injected = React.useRef(false);

  React.useEffect(() => {
    if (injected.current) return;
    try {
      const data = getAdminData();
      const adsense = data.adsense;
      if (!adsense?.enabled || !adsense.publisherId) return;

      setClientId(adsense.publisherId);
      injected.current = true;

      // Verification meta tag
      if (adsense.verificationCode) {
        const wrapper = document.createElement("div");
        wrapper.id = "adsense-verification";
        wrapper.style.display = "none";
        wrapper.innerHTML = adsense.verificationCode;
        document.head.appendChild(wrapper);
      }

      // Auto Ads
      if (adsense.autoAdsEnabled) {
        if (adsense.autoAdsCode) {
          // Custom Auto Ads code provided by admin
          const wrapper = document.createElement("div");
          wrapper.id = "adsense-auto-ads";
          wrapper.style.display = "none";
          wrapper.innerHTML = adsense.autoAdsCode;
          document.head.appendChild(wrapper);
        } else {
          // Fallback: standard auto-ads script
          const s = document.createElement("script");
          s.async = true;
          s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.publisherId}`;
          s.crossOrigin = "anonymous";
          document.head.appendChild(s);
        }
      }
    } catch {
      // silent
    }
  }, []);

  // Always load the adsbygoogle client script for manual placements
  if (!clientId) return null;

  return (
    <Script
      id="adsbygoogle-client"
      strategy="afterInteractive"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      onError={() => { /* silent — admin will see no ads */ }}
    />
  );
}
