"use client";

interface JsonLdProps {
  /** Override: custom JSON-LD object(s) to render */
  data?: Record<string, any> | Record<string, any>[];
  /** Page type for auto-generation */
  page?: "home" | "laws" | "lawyers" | "blog" | "law-firms" | "services";
  /** Extra context for the schema */
  context?: Record<string, any>;
}

export function JsonLd({ data, page, context }: JsonLdProps) {
  if (data) {
    const items = Array.isArray(data) ? data : [data];
    return (
      <>
        {items.map((item, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
          />
        ))}
      </>
    );
  }

  if (!page) return null;

  const siteName = "منصة قانوني";
  const baseUrl = "https://qanuni.iq";
  const description = "منصة قانوني هي دليلك الشامل للقوانين العراقية والمحامين المعتمدين في جميع المحافظات.";

  const schemas: Record<string, any[]> = {};

  // Organization + WebSite on all pages
  schemas.global = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: baseUrl,
      logo: baseUrl + "/logo.png",
      sameAs: [
        "https://facebook.com/qanuni",
        "https://twitter.com/qanuni",
        "https://instagram.com/qanuni",
        "https://linkedin.com/company/qanuni",
        "https://youtube.com/@qanuni",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+964 770 000 0000",
        email: "info@qanuni.iq",
        contactType: "customer service",
        areaServed: "IQ",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: baseUrl,
      inLanguage: "ar",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: baseUrl + "/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];

  // Homepage
  if (page === "home") {
    schemas.home = [
      ...schemas.global,
      {
        "@context": "https://schema.org",
        "@type": "LegalService",
        name: siteName,
        description,
        url: baseUrl,
        image: baseUrl + "/og-default.png",
        areaServed: ["بغداد", "البصرة", "أربيل", "نينوى", "النجف", "كربلاء"],
        provider: { "@type": "Organization", name: siteName },
        availableChannel: {
          "@type": "ServiceChannel",
          serviceLocation: {
            "@type": "Place",
            address: { "@type": "PostalAddress", addressCountry: "IQ", streetAddress: "بغداد، العراق — شارع الرشيد" },
            geo: { "@type": "GeoCoordinates", latitude: "33.3152", longitude: "44.3661" },
          },
        },
      },
    ];
  }

  // Blog / Article page
  if (page === "blog" && context) {
    schemas.blog = [
      ...schemas.global,
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "المدونة القانونية — منصة قانوني",
        url: baseUrl + "/blog",
      },
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: context.title,
        description: context.description || context.excerpt,
        datePublished: context.date || undefined,
        dateModified: context.updatedAt || undefined,
        author: { "@type": "Person", name: context.author || "منصة قانوني" },
        publisher: {
          "@type": "Organization",
          name: siteName,
          logo: { "@type": "ImageObject", url: baseUrl + "/logo.png" },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": baseUrl + "/blog/" + context.id },
      },
    ];
  }

  // Lawyer profile
  if (page === "lawyers" && context) {
    schemas.lawyers = [
      ...schemas.global,
      {
        "@context": "https://schema.org",
        "@type": "Attorney",
        name: context.name,
        jobTitle: context.specialization,
        url: baseUrl + "/lawyers/" + (context.slug || context.id),
        email: context.email || undefined,
        address: { "@type": "PostalAddress", addressLocality: context.city, addressCountry: "IQ" },
        areaServed: context.city || "العراق",
      },
    ];
  }

  // Law firms listing
  if (page === "law-firms") {
    schemas.lawFirms = [
      ...schemas.global,
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "مكاتب المحامين — منصة قانوني",
        description: "قائمة بجميع مكاتب المحامين المعتمدة على منصة قانوني",
        numberOfItems: context?.count || 0,
        itemListElement: (context?.firms || []).slice(0, 20).map((f: any, i: number) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "LegalService",
            name: f.name,
            url: baseUrl + "/law-firms/" + f.id,
          },
        })),
      },
    ];
  }

  // Laws listing
  if (page === "laws") {
    schemas.laws = [
      ...schemas.global,
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "القوانين العراقية — منصة قانوني",
        description: "تصفح جميع القوانين العراقية النافذة والتشريعات والأنظمة.",
        url: baseUrl + "/laws",
      },
    ];
  }

  // Services
  if (page === "services") {
    schemas.services = [
      ...schemas.global,
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "خدمات قانونية — منصة قانوني",
        description: "استشارات قانونية وتوثيق عقود وتمثيل قضائي من أفضل المحامين العراقيين.",
        url: baseUrl + "/services",
        provider: { "@type": "Organization", name: siteName },
        areaServed: { "@type": "Country", name: "Iraq" },
      },
    ];
  }

  const finalSchemas = schemas[page] || schemas.global;

  return (
    <>
      {finalSchemas.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
