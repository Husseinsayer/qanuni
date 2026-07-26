"use client";

import { useState, useEffect } from "react";
import { getAdminData } from "@/lib/admin-data";
import { type Law, type SampleArticle } from "@/lib/data";
import { resolveIcon, type IconName } from "@/lib/icons";

// Convert admin data law format to site law format
function deserializeIcon(iconName: string) {
  return resolveIcon(iconName);
}

export function useSiteData() {
  const [laws, setLaws] = useState<Law[]>([]);
  const [sampleArticles, setSampleArticles] = useState<Record<string, SampleArticle[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Load data from localStorage (admin data)
      const adminData = getAdminData();
      
      // Convert admin laws to site laws format
      const siteLaws: Law[] = (adminData.laws || []).map((law) => ({
        id: law.id,
        name: law.name,
        articles: law.articles,
        updated: law.updated,
        icon: deserializeIcon(law.icon),
        color: law.color,
        category: law.category,
        source: law.source,
      }));
      
      setLaws(siteLaws);
      setSampleArticles(adminData.sampleArticles || {});
    } catch {
      // Data loading failed silently
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { laws, sampleArticles, isLoading };
}
