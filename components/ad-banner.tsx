"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, Megaphone, Sparkles } from "lucide-react";
import { getAdminData, buildDefaults, recordAdImpression, recordAdClick, deviceMatches } from "@/lib/admin-data";
import type { AdminAd, AdminAdPlacement, AdminAdSenseConfig, AdminData } from "@/lib/admin-data";
import { useAdminContextSafe } from "@/app/admin/admin-context";

type AdSize = "leaderboard" | "rectangle" | "skyscraper" | "inline" | "banner";

const adSizes: Record<AdSize, { cls: string; height: string }> = {
  leaderboard: { cls: "w-full max-w-[728px]", height: "min-h-[90px]" },
  rectangle: { cls: "w-full max-w-[336px]", height: "min-h-[280px]" },
  skyscraper: { cls: "w-[160px]", height: "min-h-[600px]" },
  inline: { cls: "w-full max-w-[468px]", height: "min-h-[60px]" },
  banner: { cls: "w-full max-w-[970px]", height: "min-h-[90px]" },
};

function resolveAd(
  placement: AdminAdPlacement,
  ads: AdminAd[]
): AdminAd | undefined {
  const matching = ads.filter(
    (a) => a.enabled && a.adType === placement.type
  );
  if (matching.length === 0) return undefined;
  return matching.find((a) => a.id === placement.adId) || matching[0];
}

function resolveAdsense(
  cfg: AdminAdSenseConfig | undefined,
  placement: AdminAdPlacement,
  ads: AdminAd[]
): { publisherId: string; slotId?: string; format?: string } | undefined {
  if (!cfg || !cfg.enabled || !cfg.publisherId) return undefined;
  const adsenseAds = ads.filter((a) => a.enabled && a.adType === "adsense");
  if (adsenseAds.length === 0) return undefined;
  const chosen = adsenseAds.find((a) => a.id === placement.adId) || adsenseAds[0];
  return {
    publisherId: cfg.publisherId,
    slotId: chosen.slotId,
    format: chosen.format || "auto",
  };
}

export function AdBanner({
  placementKey,
  size = "leaderboard",
  label,
  className,
}: {
  placementKey: string;
  size?: AdSize;
  label?: string;
  className?: string;
}) {
  // Initialize data synchronously: try admin context first, fall back to localStorage
  const adminCtx = useAdminContextSafe();
  const [data, setData] = React.useState<AdminData | null>(() =>
    adminCtx?.data ?? (typeof window !== "undefined" ? getAdminData() : null)
  );
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const [adsenseLoaded, setAdsenseLoaded] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const impressionRecorded = React.useRef(false);

  // Re-fetch data if admin context updates
  React.useEffect(() => {
    if (!adminCtx) setData(typeof window !== "undefined" ? getAdminData() : null);
  }, [adminCtx]);

  const placement = data?.adPlacements.find((p) => p.key === placementKey);
  const performance = data?.performance;

  const boundAd =
    placement && placement.type !== "none" && placement.type !== "adsense"
      ? resolveAd(placement, data?.ads ?? [])
      : undefined;
  const adsenseCfg =
    placement && placement.type === "adsense"
      ? resolveAdsense(data?.adsense, placement, data?.ads ?? [])
      : undefined;

  // Scroll-delay via IntersectionObserver
  React.useEffect(() => {
    if (!placement || placement.type === "none") return;
    const loadOnScroll = performance?.loadOnScroll ?? true;
    if (!loadOnScroll) {
      setVisible(true);
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [placement, performance?.loadOnScroll]);

  // Record impression
  React.useEffect(() => {
    if (!visible || dismissed || impressionRecorded.current) return;
    const adId = boundAd?.id ?? undefined;
    if (adId) {
      recordAdImpression(adId);
      impressionRecorded.current = true;
    }
  }, [visible, dismissed, boundAd]);

  // Push AdSense
  React.useEffect(() => {
    if (adsenseCfg?.publisherId && adsenseCfg.slotId && visible) {
      try {
        const w = window as unknown as { adsbygoogle?: unknown[] };
        w.adsbygoogle = w.adsbygoogle || [];
        w.adsbygoogle.push({});
        setAdsenseLoaded(true);
      } catch { /* ignore */ }
    }
  }, [adsenseCfg?.publisherId, adsenseCfg?.slotId, visible]);

  if (!data || !placement || placement.type === "none" || dismissed) return null;

  const ua = typeof window !== "undefined" ? window.navigator.userAgent : "desktop";
  if (boundAd && !deviceMatches(boundAd.devices, ua)) return null;

  const badgeLabel = label ?? placement.label ?? "إعلان";
  const lazy = performance?.lazyLoad ?? true;
  const sizeDef = adSizes[size];

  const wrapper = cn("my-6 flex justify-center", className);
  const innerCls = cn(
    "relative overflow-hidden rounded-2xl border border-border bg-card/50 shadow-soft transition-all duration-300",
    sizeDef.cls,
    sizeDef.height,
    "hover:shadow-premium"
  );

  // ── AdSense ──
  if (adsenseCfg?.publisherId && adsenseCfg.slotId) {
    return (
      <div ref={containerRef} className={wrapper}>
        <div className={cn(innerCls, "flex items-center justify-center")}>
          <AdBadge label={`${badgeLabel} · AdSense`} />
          {visible ? (
            <ins
              className="adsbygoogle block w-full h-full"
              style={{ display: "block" }}
              data-ad-client={adsenseCfg.publisherId}
              data-ad-slot={adsenseCfg.slotId}
              data-ad-format={adsenseCfg.format || "auto"}
              data-full-width-responsive="true"
            />
          ) : (
            <LoadingPlaceholder />
          )}
        </div>
      </div>
    );
  }

  // ── HTML code ──
  if (placement.type === "html" && boundAd?.htmlCode) {
    return (
      <div ref={containerRef} className={wrapper}>
        <div className={innerCls}>
          <AdBadge label={`${badgeLabel} · HTML`} onDismiss={() => setDismissed(true)} />
          {visible ? (
            <div className="h-full w-full overflow-auto" dangerouslySetInnerHTML={{ __html: boundAd.htmlCode }} />
          ) : (
            <LoadingPlaceholder />
          )}
        </div>
      </div>
    );
  }

  // ── Custom banner ──
  if (placement.type === "banner" && boundAd) {
    const hasImage = !!boundAd.image;
    return (
      <div ref={containerRef} className={wrapper}>
        <div className={innerCls}>
          <AdBadge label={`${badgeLabel} · إعلان`} onDismiss={() => setDismissed(true)} />
          {!visible ? (
            <LoadingPlaceholder />
          ) : hasImage ? (
            <a
              href={boundAd.linkUrl || "#"}
              target={boundAd.openInNew ? "_blank" : "_self"}
              rel={boundAd.openInNew ? "noopener noreferrer" : undefined}
              onClick={() => recordAdClick(boundAd.id)}
              className="block h-full w-full"
            >
              <img
                src={boundAd.image}
                alt={boundAd.name}
                loading={lazy ? "lazy" : "eager"}
                className="h-full w-full object-cover"
              />
            </a>
          ) : (
            <GradientBanner ad={boundAd} size={size} />
          )}
        </div>
      </div>
    );
  }

  return null;
}

/* ─── Internal sub-components ─── */

function AdBadge({ label, onDismiss }: { label: string; onDismiss?: () => void }) {
  return (
    <div className="pointer-events-none absolute left-2 top-2 z-10 flex items-center gap-2">
      <span className="rounded-md bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="absolute inset-0 flex animate-pulse items-center justify-center gap-3 bg-muted/30">
      <Sparkles className="size-5 text-muted-foreground/40" />
      <span className="text-sm text-muted-foreground/50">إعلان</span>
    </div>
  );
}

function GradientBanner({ ad, size }: { ad: AdminAd; size: AdSize }) {
  return (
    <a
      href={ad.linkUrl || "#"}
      target={ad.openInNew ? "_blank" : "_self"}
      rel={ad.openInNew ? "noopener noreferrer" : undefined}
      onClick={() => recordAdClick(ad.id)}
      className={cn(
        "flex h-full w-full items-center gap-4 bg-gradient-to-l p-5 text-white transition hover:brightness-110",
        ad.gradient || "from-blue-600 to-indigo-700",
        (size === "skyscraper" || size === "rectangle") && "flex-col text-center"
      )}
    >
      <div className={cn("min-w-0 flex-1", size === "skyscraper" && "w-full")}>
        <p className={cn("text-base font-extrabold md:text-lg", size === "skyscraper" && "text-sm")}>
          {ad.title || ad.name}
        </p>
        {ad.subtitle && (
          <p className={cn("mt-1 text-xs text-white/80 md:text-sm", size === "skyscraper" && "text-[11px]")}>
            {ad.subtitle}
          </p>
        )}
        {ad.cta && (
          <span className={cn(
            "mt-3 inline-block rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm",
            size === "skyscraper" && "mt-2"
          )}>
            {ad.cta} ←
          </span>
        )}
      </div>
      {(size === "leaderboard" || size === "banner") && (
        <Megaphone className="size-8 shrink-0 opacity-40" />
      )}
    </a>
  );
}
