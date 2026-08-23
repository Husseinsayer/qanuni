"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { fadeUp, staggerContainer } from "@/components/reveal";
import { FileText, Search, Clock, ArrowLeft, Filter, X } from "lucide-react";

interface ApiTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  variables: string;
  keywords: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LegalTemplatesPage() {
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data: ApiTemplate[]) => {
        setTemplates(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(templates.map((t) => t.category));
    return Array.from(cats).sort();
  }, [templates]);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchQuery, selectedCategory]);

  return (
    <>
      <section className="container py-8 md:py-12">
        {/* Search + Filter */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن نموذج..."
              className="w-full rounded-xl border border-border bg-background py-3 pr-10 pl-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none rounded-xl border border-border bg-background py-3 pr-10 pl-8 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent min-w-[160px]"
            >
              <option value="">كل التصنيفات</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="mt-4 text-sm text-muted-foreground">
            {filtered.length === 0
              ? "لا توجد نماذج تطابق بحثك"
              : `${filtered.length} ${
                  filtered.length === 1 ? "نموذج قانوني" : "نموذجاً قانونياً"
                }`}
          </p>
        )}

        {/* Loading */}
        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border/50 bg-muted/30 p-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="mt-2 h-3 w-20 rounded bg-muted" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-3/4 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-border py-16 text-center">
            <FileText className="mx-auto mb-4 size-12 text-muted-foreground/30" />
            <p className="text-lg font-semibold">لا توجد نماذج قانونية بعد</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedCategory
                ? "حاول تغيير معايير البحث أو التصفية"
                : "سيتم إضافة النماذج قريباً من إدارة المحتوى"}
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((tmpl) => (
              <motion.div key={tmpl.id} variants={fadeUp}>
                <Link href={`/legal-templates/${tmpl.id}`} className="block h-full group">
                  <Card className="card-hover h-full border border-border/50 p-6 transition-all duration-300 hover:shadow-lg hover:border-accent/30 hover:-translate-y-1">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/20">
                        <FileText className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm md:text-base">{tmpl.name}</h3>
                        <span className="text-xs text-muted-foreground">{tmpl.category}</span>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {tmpl.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {new Date(tmpl.updatedAt).toLocaleDateString("ar-IQ")}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-accent opacity-0 transition-all group-hover:opacity-100">
                        <span>فتح النموذج</span>
                        <ArrowLeft className="size-3" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </>
  );
}
