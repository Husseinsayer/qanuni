import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleTouchIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #3B82F6 100%)",
          borderRadius: 40,
          color: "white",
        }}
      >
        <svg width="100" height="100" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#F8FAFC" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M32 16 L14 24 L32 32 L50 24 Z" />
            <path d="M20 28 V40" />
            <path d="M44 28 V40" />
            <path d="M14 24 V38 L32 46 L50 38 V24" />
          </g>
        </svg>
      </div>
    ),
    { ...size }
  );
}
