import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #3B82F6 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
          color: "white",
        }}
      >
        {/* Top: Logo + Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="50" height="50" viewBox="0 0 64 64" fill="none">
              <g stroke="#F8FAFC" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M32 16 L14 24 L32 32 L50 24 Z" />
                <path d="M20 28 V40" />
                <path d="M44 28 V40" />
                <path d="M14 24 V38 L32 46 L50 38 V24" />
              </g>
            </svg>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              padding: "8px 20px",
              borderRadius: "20px",
              fontSize: "18px",
              fontWeight: 500,
            }}
          >
            qanuni.iq
          </div>
        </div>

        {/* Middle: Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "64px", fontWeight: 800, lineHeight: 1.1 }}>
            الدليل القانوني العراقي
          </div>
          <div style={{ fontSize: "30px", color: "rgba(255,255,255,0.8)", lineHeight: 1.4, maxWidth: "900px" }}>
            ابحث في آلاف المواد القانونية، اعثر على أفضل المحامين، واقرأ أحدث المقالات القانونية
          </div>
        </div>

        {/* Bottom: Stats */}
        <div style={{ display: "flex", gap: "60px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "40px", fontWeight: 800 }}>100,000+</div>
            <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.7)" }}>مادة قانونية</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "40px", fontWeight: 800 }}>50+</div>
            <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.7)" }}>محامٍ معتمد</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "40px", fontWeight: 800 }}>50,000+</div>
            <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.7)" }}>مستخدم</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
