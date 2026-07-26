"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getSectionStats,
  getAuditLog,
} from "@/lib/knowledge-center/store";
import {
  exportAllToJSON,
  importFromJSON,
  readFileAsText,
} from "@/lib/knowledge-center/import-export";
import {
  ClipboardList,
  FileText,
  ExternalLink,
  HelpCircle,
  BookOpen,
  Building,
  FileStack,
  Tag,
  History,
  ChevronLeft,
  Download,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { toast } from "@/lib/admin-toast";

const sectionCards: {
  key: keyof ReturnType<typeof getSectionStats>;
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
}[] = [
  { key: "procedures", label: "الإجراءات القانونية", href: "/admin/knowledge-center/procedures", icon: ClipboardList, color: "bg-blue-500" },
  { key: "templates", label: "النماذج القانونية", href: "/admin/knowledge-center/templates", icon: FileText, color: "bg-emerald-500" },
  { key: "services", label: "الخدمات والروابط", href: "/admin/knowledge-center/services", icon: ExternalLink, color: "bg-amber-500" },
  { key: "qa", label: "الأسئلة والأجوبة", href: "/admin/knowledge-center/qa", icon: HelpCircle, color: "bg-purple-500" },
  { key: "terms", label: "كتب ومؤلفات", href: "/admin/knowledge-center/terms", icon: BookOpen, color: "bg-indigo-500" },
  { key: "governments", label: "الجهات الحكومية", href: "/admin/knowledge-center/governments", icon: Building, color: "bg-rose-500" },
  { key: "documents", label: "المستندات المطلوبة", href: "/admin/knowledge-center/documents", icon: FileStack, color: "bg-teal-500" },
  { key: "keywords", label: "الكلمات المفتاحية", href: "/admin/knowledge-center/keywords", icon: Tag, color: "bg-cyan-500" },
];

const actionLabels: Record<string, string> = {
  create: "إضافة",
  update: "تعديل",
  delete: "حذف",
  restore: "استعادة",
};

export default function KnowledgeCenterPage() {
  const [stats, setStats] = useState<ReturnType<typeof getSectionStats> | null>(null);
  const [audit, setAudit] = useState<Awaited<ReturnType<typeof getAuditLog>>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStats(getSectionStats());
    setAudit(getAuditLog(20));
  }, []);

  const handleExport = () => {
    exportAllToJSON();
    toast.success("تم التصدير بنجاح");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const result = importFromJSON(content);
      if (result.success) {
        toast.success(result.message);
        setStats(getSectionStats());
        setAudit(getAuditLog(20));
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("فشل استيراد الملف");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مركز المعرفة القانونية</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            قاعدة المعلومات الخاصة بالمساعد القانوني الذكي
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            تصدير JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            استيراد JSON
          </Button>
        </div>
      </div>

      {/* Section Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sectionCards.map((card) => {
          const Icon = card.icon;
          const count = stats ? stats[card.key] : 0;
          return (
            <Link key={card.key} href={card.href}>
              <Card className="card-hover group cursor-pointer transition-all hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`grid size-12 shrink-0 place-items-center rounded-xl text-white ${card.color}`}>
                    <Icon className="size-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold group-hover:text-accent">{card.label}</div>
                    <div className="text-2xl font-extrabold">{count}</div>
                  </div>
                  <ChevronLeft className="size-4 text-muted-foreground transition group-hover:text-accent" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Audit Log */}
      <Card>
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <History className="size-4 text-muted-foreground" />
          <h2 className="text-lg font-bold">سجل التعديلات</h2>
        </div>
        <CardContent className="p-0">
          {audit.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">لا توجد تعديلات بعد</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-right font-semibold">التاريخ</th>
                    <th className="px-4 py-3 text-right font-semibold">القسم</th>
                    <th className="px-4 py-3 text-right font-semibold">العملية</th>
                    <th className="px-4 py-3 text-right font-semibold">العنصر</th>
                    <th className="px-4 py-3 text-right font-semibold">التفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString("ar-IQ")}
                      </td>
                      <td className="px-4 py-3 font-medium">{entry.section}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                          {actionLabels[entry.action] || entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">{entry.entityName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{entry.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
