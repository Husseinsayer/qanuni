import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "منصة قانوني",
    short_name: "قانوني",
    description: "دليلك الذكي للقوانين العراقية والمحامين",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3B82F6",
    orientation: "portrait",
    lang: "ar",
    dir: "rtl",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/icon?size=192", sizes: "192x192", type: "image/png" },
      { src: "/icon?size=512", sizes: "512x512", type: "image/png" },
    ],
  };
}
