import type { Metadata, Viewport } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteChrome } from "@/components/site-chrome";
import { AdSenseLoader } from "@/components/adsense-loader";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { AnalyticsJsonLd } from "@/components/analytics-json-ld";
import { NotificationProvider, ToastContainer } from "@/components/notifications";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://iqlegal.example"),
  title: {
    default: "دليلك الذكي للقوانين العراقية والمحامين | منصة قانوني",
    template: "%s | منصة قانوني",
  },
  description:
    "ابحث في آلاف المواد القانونية العراقية، اعثر على أفضل المحامين، واقرأ أحدث المقالات القانونية في مكان واحد. منصة قانونية عراقية موثوقة وسريعة.",
  keywords: [
    "القوانين العراقية",
    "دليل المحامين",
    "استشارة قانونية",
    "قانون مدني",
    "قانون عقوبات",
    "الأحوال الشخصية",
    "محامي عراقي",
  ],
  authors: [{ name: "منصة قانوني" }],
  openGraph: {
    title: "دليلك الذكي للقوانين العراقية والمحامين",
    description:
      "ابحث في آلاف المواد القانونية، اعثر على أفضل المحامين، واقرأ أحدث المقالات القانونية في مكان واحد.",
    type: "website",
    locale: "ar_IQ",
  },
  alternates: {
    languages: {
      "ar-IQ": "/",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${cairo.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
        >
          تخطّي إلى المحتوى الرئيسي
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NotificationProvider>
            <SiteChrome>{children}</SiteChrome>
            <ToastContainer />
          </NotificationProvider>
        </ThemeProvider>
        <AdSenseLoader />
        <AnalyticsTracker />
        <AnalyticsJsonLd />
      </body>
    </html>
  );
}
