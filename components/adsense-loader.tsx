"use client";

import * as React from "react";
import Script from "next/script";
import { getAdminData } from "@/lib/admin-data";

export function AdSenseLoader() {
  const [state, setState] = React.useState<{
    clientId: string;
    verification: string;
    autoAds: string;
    autoAdsEnabled: boolean;
  } | null>(null);
  const injected = React.useRef(false);

  React.useEffect(() => {
    if (injected.current) return;
    try {
      const data = getAdminData();
      const adsense = data.adsense;
      if (adsense?.enabled && adsense.publisherId) {
        setState({
          clientId: adsense.publisherId,
          verification: adsense.verificationCode || "",
          autoAds: adsense.autoAdsCode || "",
          autoAdsEnabled: adsense.autoAdsEnabled,
        });
        injected.current = true;
        // Inject raw HTML codes into head
        if (adsense.verificationCode) {
          const el = document.createElement("div");
          el.id = "adsense-verification";
          el.style.display = "none";
          el.innerHTML = adsense.verificationCode;
          document.head.appendChild(el);
        }
        if (adsense.autoAdsEnabled && adsense.autoAdsCode) {
          const el = document.createElement("div");
          el.id = "adsense-auto-ads";
          el.style.display = "none";
          el.innerHTML = adsense.autoAdsCode;
          document.head.appendChild(el);
        } else if (adsense.autoAdsEnabled) {
          // Fallback: standard auto-ads script
          const s = document.createElement("script");
          s.async = true;
          s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.publisherId}`;
          s.crossOrigin = "anonymous";
          document.head.appendChild(s);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  if (!state?.clientId) return null;

  return (
    <Script
      id="adsbygoogle-client"
      strategy="afterInteractive"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${state.clientId}`}
      crossOrigin="anonymous"
      onError={() => {
        // Silently fail — admin will see no ads
      }}
    />
  );
}
