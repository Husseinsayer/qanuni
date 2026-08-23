"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Megaphone, ExternalLink, X } from "lucide-react";
import {
  getAdminData,
  recordAdImpression,
  recordAdClick,
  deviceMatches,
  isAdActive,
  type AdminAd,
  type AdminAdPlacement,
  type AdminData,
  type AdSize,
} from "@/lib/admin-data";

const SIZE_CLASSES: Record<AdSize, { wrapper: string; inner: string }> = {
  responsive:          { wrapper: "w-full max-w-[970px]", inner: "min-h-[100px] sm:min-h-[120px]" },
  leaderboard:         { wrapper: "w-full max-w-[728px]", inner: "min-h-[90px]" },
  "large-leaderboard": { wrapper: "w-full max-w-[970px]", inner: "min-h-[90px]" },
  billboard:           { wrapper: "w-full max-w-[970px]", inner: "min-h-[250px]" },
  "medium-rectangle":  { wrapper: "w-full max-w-[300px]", inner: "min-h-[250px]" },
  "large-rectangle":   { wrapper: "w-full max-w-[336px]", inner: "min-h-[280px]" },
  skyscraper:          { wrapper: "w-[160px]", inner: "min-h-[600px]" },
  "wide-skyscraper":   { wrapper: "w-[300px]", inner: "min-h-[600px]" },
  "mobile-banner":     { wrapper: "w-full max-w-[320px]", inner: "min-h-[50px]" },
  inline:              { wrapper: "w-full max-w-[468px]", inner: "min-h-[60px]" },
  "full-page":         { wrapper: "w-full h-full", inner: "h-screen" },
  "sticky-bottom":     { wrapper: "w-full max-w-[320px]", inner: "min-h-[50px]" },
  native:              { wrapper: "w-full max-w-[400px]", inner: "min-h-[200px]" },
};

function pickAd(ads: AdminAd[], placement: AdminAdPlacement, ua: string): AdminAd | null {
  const eligible = ads.filter((a) => {
    if (!isAdActive(a)) return false;
    if (!deviceMatches(a.devices, ua)) return false;
    if (a.targeting.pageTypes.length > 0 && !a.targeting.pageTypes.includes(placement.page.toLowerCase())) return false;
    return true;
  });
  if (eligible.length === 0) return null;
  const totalWeight = eligible.reduce((s, a) => s + (a.weight || 1), 0);
  let r = Math.random() * totalWeight;
  for (const ad of eligible) {
    r -= ad.weight || 1;
    if (r <= 0) return ad;
  }
  return eligible[eligible.length - 1];
}

export function AdBanner({
  placementKey,
  label,
  className,
  sticky,
}: {
  placementKey: string;
  label?: string;
  className?: string;
  sticky?: boolean;
}) {
  const [data, setData] = React.useState<AdminData | null>(null);
  const [ready, setReady] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const [ad, setAd] = React.useState<AdminAd | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const impressionRecorded = React.useRef(false);

  // Load data from localStorage on mount + refresh on focus
  React.useEffect(() => {
    const load = () => {
      try {
        const d = getAdminData();
        setData(d);
        setReady(true);
      } catch { setReady(true); }
    };
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  const placement = data?.adPlacements?.find((p) => p.key === placementKey);

  // Show immediately if loadOnScroll is off, otherwise use IntersectionObserver
  React.useEffect(() => {
    if (!ready) return;
    if (!placement || placement.type === "none") return;
    const loadOnScroll = data?.performance?.loadOnScroll ?? false;
    if (!loadOnScroll) {
      setVisible(true);
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }); },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ready, placement, data?.performance?.loadOnScroll]);

  // Pick ad
  React.useEffect(() => {
    if (!data || !placement) return;
    if (placement.type === "none") { setAd(null); return; }
    if (placement.type === "adsense") { setAd(null); return; }

    const ua = window.navigator.userAgent;

    // If placement has a specific adId, find that ad
    if (placement.adId) {
      const found = data.ads.find((a) => a.id === placement.adId);
      if (found && isAdActive(found)) {
        setAd(found);
        return;
      }
    }

    // Otherwise pick a random eligible ad
    const chosen = pickAd(data.ads, placement, ua);
    setAd(chosen);
  }, [data, placement]);

  // Record impression
  React.useEffect(() => {
    if (!visible || dismissed || impressionRecorded.current) return;
    if (ad?.id) {
      recordAdImpression(ad.id);
      impressionRecorded.current = true;
    }
  }, [visible, dismissed, ad]);

  // Don't render if no data, no placement, placement disabled, or dismissed
  if (!ready || !data || !placement || placement.type === "none" || dismissed) return null;
  if (!visible) {
    return <div ref={containerRef} className={cn("my-6 flex justify-center min-h-[1px]", className)} />;
  }
  if (!ad && placement.type !== "adsense") return null;

  const sizeDef = SIZE_CLASSES[placement.recommendedSize] || SIZE_CLASSES.responsive;
  const badgeLabel = label ?? placement.label ?? "إعلان";
  const lazy = data.performance?.lazyLoad ?? true;

  // ── Sticky Mobile ──
  if (sticky || placementKey === "sticky-mobile") {
    if (!ad && placement.type !== "adsense") return null;
    return (
      <StickyBanner
        ad={ad}
        placement={placement}
        adsense={placement.type === "adsense" ? data.adsense : undefined}
        badgeLabel={badgeLabel}
        lazy={lazy}
        onDismiss={() => setDismissed(true)}
        onClick={() => ad && recordAdClick(ad.id)}
      />
    );
  }

  // ── AdSense ──
  if (placement.type === "adsense" && data.adsense.enabled && data.adsense.publisherId) {
    return (
      <div ref={containerRef} className={cn("my-6 flex justify-center", className)}>
        <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-card/50 shadow-soft", sizeDef.wrapper, sizeDef.inner)}>
          <AdBadge label={`${badgeLabel} · AdSense`} />
          <AdSenseUnit
            publisherId={data.adsense.publisherId}
            slotId={ad?.slotId}
            format={ad?.format || "auto"}
            adSizeOptimization={data.adsense.adSizeOptimization}
          />
        </div>
      </div>
    );
  }

  // ── HTML Code ──
  if (placement.type === "html" && ad?.htmlCode) {
    return (
      <div ref={containerRef} className={cn("my-6 flex justify-center", className)}>
        <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-card/50 shadow-soft", sizeDef.wrapper, sizeDef.inner)}>
          <AdBadge label={`${badgeLabel} · HTML`} onDismiss={() => setDismissed(true)} />
          <div className="h-full w-full overflow-auto" dangerouslySetInnerHTML={{ __html: ad.htmlCode }} />
        </div>
      </div>
    );
  }

  // ── Custom Banner (gradient / image) ──
  if (ad) {
    return (
      <div ref={containerRef} className={cn("my-6 flex justify-center", className)}>
        <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-card/50 shadow-soft hover:shadow-premium transition-all", sizeDef.wrapper, sizeDef.inner)}>
          <AdBadge label={`${badgeLabel} · إعلان`} onDismiss={() => setDismissed(true)} />
          {ad.image ? (
            <a
              href={ad.linkUrl || "#"}
              target={ad.openInNew ? "_blank" : "_self"}
              rel={ad.openInNew ? "noopener noreferrer" : undefined}
              onClick={() => recordAdClick(ad.id)}
              className="block h-full w-full"
            >
              <img
                src={ad.image}
                alt={ad.name}
                loading={lazy ? "lazy" : "eager"}
                className="h-full w-full object-cover"
              />
            </a>
          ) : ad.htmlCode ? (
            <div className="h-full w-full overflow-auto" dangerouslySetInnerHTML={{ __html: ad.htmlCode }} />
          ) : (
            <GradientBanner ad={ad} placement={placement} />
          )}
        </div>
      </div>
    );
  }

  return null;
}

/* ─── Sub-components ─── */

function AdSenseUnit({
  publisherId,
  slotId,
  format,
  adSizeOptimization,
}: {
  publisherId: string;
  slotId?: string;
  format: string;
  adSizeOptimization: boolean;
}) {
  React.useEffect(() => {
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch { /* ignore */ }
  }, [publisherId, slotId]);

  return (
    <ins
      className="adsbygoogle block w-full h-full"
      style={{ display: "block" }}
      data-ad-client={publisherId}
      data-ad-slot={slotId || ""}
      data-ad-format={format}
      data-full-width-responsive={adSizeOptimization ? "true" : "false"}
    />
  );
}

function StickyBanner({
  ad,
  placement,
  adsense,
  badgeLabel,
  lazy,
  onDismiss,
  onClick,
}: {
  ad: AdminAd | null;
  placement: AdminAdPlacement;
  adsense?: { enabled: boolean; publisherId: string };
  badgeLabel: string;
  lazy: boolean;
  onDismiss: () => void;
  onClick: () => void;
}) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-background/95 backdrop-blur-sm border-t shadow-lg">
      <div className="relative w-full max-w-[320px] min-h-[50px]">
        <AdBadge label={badgeLabel} />
        <button
          onClick={onDismiss}
          className="absolute left-1 top-1 z-20 p-1 rounded-full bg-background/80 hover:bg-background"
        >
          <X className="w-3 h-3" />
        </button>
        {ad?.image ? (
          <a href={ad.linkUrl || "#"} target={ad.openInNew ? "_blank" : "_self"} rel="noopener noreferrer" onClick={onClick} className="block">
            <img src={ad.image} alt={ad.name} loading={lazy ? "lazy" : "eager"} className="w-full h-[50px] object-cover" />
          </a>
        ) : ad ? (
          <GradientBanner ad={ad} placement={placement} compact />
        ) : adsense?.publisherId ? (
          <AdSenseUnit publisherId={adsense.publisherId} format="auto" adSizeOptimization />
        ) : null}
      </div>
    </div>
  );
}

function AdBadge({ label, onDismiss }: { label: string; onDismiss?: () => void }) {
  return (
    <div className="pointer-events-none absolute left-2 top-2 z-10 flex items-center gap-2">
      <span className="rounded-md bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
        {label}
      </span>
      {onDismiss && (
        <button onClick={(e) => { e.stopPropagation(); onDismiss(); }} className="pointer-events-auto p-0.5 rounded bg-muted/60 hover:bg-muted">
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

function GradientBanner({ ad, placement, compact }: { ad: AdminAd; placement: AdminAdPlacement; compact?: boolean }) {
  const isVertical = ["skyscraper", "wide-skyscraper", "medium-rectangle", "large-rectangle", "native", "mobile-banner"].includes(placement.recommendedSize);

  return (
    <a
      href={ad.linkUrl || "#"}
      target={ad.openInNew ? "_blank" : "_self"}
      rel={ad.openInNew ? "noopener noreferrer" : undefined}
      onClick={() => recordAdClick(ad.id)}
      className={cn(
        "flex h-full w-full items-center gap-4 bg-gradient-to-l text-white transition hover:brightness-110",
        ad.gradient || "from-blue-600 to-indigo-700",
        compact ? "p-2" : "p-5",
        isVertical && "flex-col text-center"
      )}
    >
      <div className={cn("min-w-0 flex-1", isVertical && "w-full")}>
        <p className={cn(
          "font-extrabold",
          compact ? "text-xs" : isVertical ? "text-sm" : "text-base md:text-lg"
        )}>
          {ad.title || ad.name}
        </p>
        {ad.subtitle && (
          <p className={cn(
            "mt-1 text-white/80",
            compact ? "text-[10px]" : isVertical ? "text-[11px]" : "text-xs md:text-sm"
          )}>
            {ad.subtitle}
          </p>
        )}
        {ad.cta && (
          <span className={cn(
            "mt-2 inline-flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm",
            compact && "mt-1 px-2 py-0.5 text-[10px]"
          )}>
            {ad.cta}
            <ExternalLink className="w-3 h-3" />
          </span>
        )}
      </div>
      {!compact && !isVertical && (
        <Megaphone className="size-8 shrink-0 opacity-40" />
      )}
    </a>
  );
}
