"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Printer,
  Copy,
  CheckCircle,
  ArrowLeft,
  Eye,
  Edit3,
  Wrench,
} from "lucide-react";

interface TemplateVariable {
  id: string;
  name: string;
  placeholder: string;
  defaultValue: string;
  required: boolean;
}

interface ApiTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  variables: string; // JSON string
  keywords: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<ApiTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Parsed variables from JSON string
  const variables = useMemo<TemplateVariable[]>(() => {
    if (!template) return [];
    try {
      return JSON.parse(template.variables);
    } catch {
      return [];
    }
  }, [template]);

  // Form field values
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // Initialize field values when variables change
  useEffect(() => {
    const initial: Record<string, string> = {};
    variables.forEach((v) => {
      initial[v.id] = v.defaultValue || "";
    });
    setFieldValues((prev) => {
      // Only set if empty (first load)
      if (Object.keys(prev).length === 0) return initial;
      return prev;
    });
  }, [variables]);

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;
    fetch(`/api/templates/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((tmpl: ApiTemplate) => {
        setTemplate(tmpl);
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [params?.id]);

  // Replace variables in content with actual values
  const filledContent = useMemo(() => {
    if (!template) return "";
    let content = template.content;
    variables.forEach((v) => {
      const value = fieldValues[v.id] || `[${v.placeholder}]`;
      // Replace both {{name}} and [name] patterns
      content = content
        .replace(new RegExp(`\\{\\{${v.name}\\}\\}`, "g"), value)
        .replace(new RegExp(`\\[${v.name}\\]`, "g"), value);
    });
    return content;
  }, [template, fieldValues]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const sanitize = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    const safeName = sanitize(template?.name || "");
    const safeContent = sanitize(filledContent);
    w.document.write(
      `<html dir="rtl"><head><title>${safeName}</title><style>
        body{font-family:sans-serif;padding:40px;line-height:2;font-size:14px}
        h1{text-align:center;margin-bottom:30px}
        .field-label{color:#666;font-size:12px}
      </style></head><body>
        <h1>${safeName}</h1>
        <div>${safeContent.replace(/\n/g, "<br>")}</div>
      </body></html>`
    );
    w.document.close();
    w.print();
  };

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="mx-auto h-6 w-48 rounded bg-muted" />
          <div className="mx-auto h-4 w-72 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (notFound || !template) {
    return (
      <div className="container py-20 text-center">
        <FileText className="mx-auto mb-4 size-16 text-muted-foreground/30" />
        <h1 className="text-2xl font-bold">النموذج غير موجود</h1>
        <p className="mt-2 text-muted-foreground">
          النموذج الذي تبحث عنه غير متوفر أو تم حذفه
        </p>
        <Button
          variant="accent"
          className="mt-6"
          onClick={() => router.push("/legal-templates")}
        >
          <ArrowLeft className="size-4" />
          العودة إلى النماذج
        </Button>
      </div>
    );
  }

  return (
    <>
      <section className="container py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ===== Variables / Input Form ===== */}
          {variables.length > 0 && (
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold">
                    <Edit3 className="size-4 text-accent" />
                    تعبئة البيانات
                  </h3>

                  <div className="space-y-4">
                    {variables.map((v) => (
                      <div key={v.id}>
                        <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                          {v.placeholder || v.name}
                          {v.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        <input
                          value={fieldValues[v.id] || ""}
                          onChange={(e) =>
                            setFieldValues((prev) => ({
                              ...prev,
                              [v.id]: e.target.value,
                            }))
                          }
                          placeholder={v.placeholder || "أدخل القيمة..."}
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <Button
                      variant="accent"
                      onClick={() => setShowPreview(true)}
                      className="w-full gap-2"
                    >
                      <Eye className="size-4" />
                      معاينة النموذج
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(filledContent)}
                      className="w-full gap-2"
                    >
                      {copied ? (
                        <CheckCircle className="size-4 text-green-600" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                      {copied ? "تم النسخ" : "نسخ النموذج"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handlePrint}
                      className="w-full gap-2"
                    >
                      <Printer className="size-4" />
                      طباعة
                    </Button>
                  </div>
                </div>

                {/* Variables legend */}
                {variables.length > 0 && (
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <h4 className="mb-2 flex items-center gap-2 text-xs font-bold">
                      <Wrench className="size-3 text-accent" />
                      الحقول المتاحة
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {variables.map((v) => (
                        <span
                          key={v.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-accent/10 px-2.5 py-1 text-[10px] font-semibold text-accent"
                        >
                          {v.placeholder || v.name}
                          {v.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== Template Content / Preview ===== */}
          <div
            className={
              variables.length > 0
                ? "lg:col-span-2"
                : "lg:col-span-3"
            }
          >
            {!showPreview ? (
              <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <FileText className="size-5 text-accent" />
                  {showPreview ? "معاينة النموذج" : "نص النموذج"}
                </h3>
                <div className="prose prose-slate max-w-none whitespace-pre-wrap text-sm leading-8">
                  {template.content}
                </div>

                {variables.length === 0 && (
                  <div className="mt-6 flex gap-2">
                    <Button
                      variant="accent"
                      onClick={() => handleCopy(filledContent)}
                      className="gap-2"
                    >
                      {copied ? (
                        <CheckCircle className="size-4" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                      {copied ? "تم النسخ" : "نسخ"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handlePrint}
                      className="gap-2"
                    >
                      <Printer className="size-4" />
                      طباعة
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-8 shadow-soft"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    <Eye className="size-5 text-accent" />
                    معاينة النموذج بعد التعبئة
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(false)}
                    className="gap-1 text-sm"
                  >
                    <Edit3 className="size-3.5" />
                    تعديل
                  </Button>
                </div>

                {/* Show filled values summary */}
                {variables.filter((v) => fieldValues[v.id]?.trim())
                  .length > 0 && (
                  <div className="mb-6 rounded-xl bg-accent/5 border border-accent/10 p-4">
                    <h4 className="mb-2 text-xs font-bold text-accent">
                      البيانات المدخلة
                    </h4>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {variables
                        .filter((v) => fieldValues[v.id]?.trim())
                        .map((v) => (
                          <div key={v.id} className="text-xs">
                            <span className="text-muted-foreground">
                              {v.placeholder || v.name}:{" "}
                            </span>
                            <span className="font-semibold">
                              {fieldValues[v.id]}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="prose prose-slate max-w-none whitespace-pre-wrap rounded-xl border border-border/50 bg-white/50 p-6 text-sm leading-8">
                  {filledContent}
                </div>

                <div className="mt-6 flex gap-2">
                  <Button
                    variant="accent"
                    onClick={() => handleCopy(filledContent)}
                    className="gap-2"
                  >
                    {copied ? (
                      <CheckCircle className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    {copied ? "تم النسخ" : "نسخ"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="gap-2"
                  >
                    <Printer className="size-4" />
                    طباعة
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
