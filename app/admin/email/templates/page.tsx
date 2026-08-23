"use client";

import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText, Eye, Copy, Trash2, Save,
  ToggleLeft, ToggleRight, Code, Type,
} from "lucide-react";
import {
  getEmailTemplates, updateEmailTemplate,
  deleteEmailTemplate, duplicateEmailTemplate, type EmailTemplate,
} from "@/lib/email-settings";
import { toast } from "@/lib/admin-toast";
import { cn } from "@/lib/utils";

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [preview, setPreview] = useState<EmailTemplate | null>(null);
  const [tab, setTab] = useState<"html" | "text">("html");

  useEffect(() => { setTemplates(getEmailTemplates()); }, []);

  const refresh = () => setTemplates(getEmailTemplates());

  const handleToggle = (id: string, enabled: boolean) => {
    updateEmailTemplate(id, { enabled });
    refresh();
  };

  const handleDuplicate = (id: string) => {
    const result = duplicateEmailTemplate(id);
    if (result) { refresh(); toast.success("تم", "تمت نسخ القالب"); }
  };

  const handleDelete = (id: string) => {
    if (templates.find((t) => t.id === id)?.isSystem) {
      toast.error("خطأ", "لا يمكن حذف القوالب النظامية");
      return;
    }
    deleteEmailTemplate(id);
    refresh();
    if (editing?.id === id) setEditing(null);
    toast.warning("تم", "تم حذف القالب");
  };

  const handleSave = () => {
    if (!editing) return;
    updateEmailTemplate(editing.id, editing);
    refresh();
    setEditing(null);
    toast.success("تم", "تم حفظ القالب");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">قوالب البريد الإلكتروني</h1>
            <p className="text-sm text-muted-foreground">{templates.length} قالب</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Templates Grid */}
        <div className="lg:col-span-2 space-y-3">
          {templates.map((tpl) => (
            <Card key={tpl.id} className={cn("transition-all hover:shadow-md cursor-pointer",
              editing?.id === tpl.id && "ring-2 ring-accent"
            )} onClick={() => { setEditing(tpl); setTab("html"); }}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                  {tpl.isSystem ? <FileText className="size-5" /> : <Type className="size-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold truncate">{tpl.name}</p>
                    {tpl.isSystem && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">نظامي</span>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{tpl.description}</p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>v{tpl.version}</span>
                    <span>{tpl.variables.length} متغيرات</span>
                    <span>{new Date(tpl.lastEdited).toLocaleDateString("ar-IQ")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleToggle(tpl.id, !tpl.enabled)}
                    className={cn("rounded-lg p-1.5 transition-colors", tpl.enabled ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted")}>
                    {tpl.enabled ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
                  </button>
                  <button onClick={() => setPreview(tpl)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Eye className="size-4" />
                  </button>
                  <button onClick={() => handleDuplicate(tpl.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Copy className="size-4" />
                  </button>
                  {!tpl.isSystem && (
                    <button onClick={() => handleDelete(tpl.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Editor Panel */}
        <div className="lg:col-span-1">
          {editing ? (
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>تعديل القالب</span>
                  <Button size="sm" variant="accent" onClick={handleSave} className="gap-1">
                    <Save className="size-3.5" /> حفظ
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold">الاسم</label>
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">العنوان (Subject)</label>
                  <input value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">المتغيرات</label>
                  <div className="flex flex-wrap gap-1">
                    {editing.variables.map((v) => (
                      <span key={v} className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-mono text-accent">{`{{${v}}}`}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 border-b border-border">
                  <button onClick={() => setTab("html")}
                    className={cn("flex items-center gap-1 px-3 py-2 text-xs font-semibold border-b-2 -mb-px",
                      tab === "html" ? "border-accent text-accent" : "border-transparent text-muted-foreground"
                    )}>
                    <Code className="size-3" /> HTML
                  </button>
                  <button onClick={() => setTab("text")}
                    className={cn("flex items-center gap-1 px-3 py-2 text-xs font-semibold border-b-2 -mb-px",
                      tab === "text" ? "border-accent text-accent" : "border-transparent text-muted-foreground"
                    )}>
                    <Type className="size-3" /> نص عادي
                  </button>
                </div>
                {tab === "html" ? (
                  <textarea value={editing.htmlBody} onChange={(e) => setEditing({ ...editing, htmlBody: e.target.value })} rows={12}
                    className="w-full rounded-lg border border-border bg-background p-2 text-xs font-mono outline-none focus:border-accent resize-y" dir="ltr" />
                ) : (
                  <textarea value={editing.textBody} onChange={(e) => setEditing({ ...editing, textBody: e.target.value })} rows={12}
                    className="w-full rounded-lg border border-border bg-background p-2 text-xs font-mono outline-none focus:border-accent resize-y" dir="ltr" />
                )}
                <div>
                  <label className="mb-1 block text-xs font-semibold">إضافة متغير</label>
                  <AddVariable onAdd={(v) => {
                    if (!editing.variables.includes(v)) {
                      setEditing({ ...editing, variables: [...editing.variables, v] });
                    }
                  }} />
                </div>
                <Button size="sm" variant="outline" onClick={() => setEditing(null)} className="w-full">إغلاق</Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-24">
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="mx-auto mb-3 size-8 opacity-30" />
                <p className="text-sm">اختر قالباً للتعديل</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreview(null)}>
          <div className="w-full max-w-2xl max-h-[80vh] overflow-auto rounded-2xl bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-bold">{preview.name}</h3>
              <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">العنوان:</p>
                <p className="text-sm">{preview.subject}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">المتغيرات:</p>
                <div className="flex flex-wrap gap-1">
                  {preview.variables.map((v) => (
                    <span key={v} className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-mono text-accent">{`{{${v}}}`}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">معاينة HTML:</p>
                <div className="rounded-lg border border-border bg-white p-4 text-sm" dangerouslySetInnerHTML={{ __html: preview.htmlBody }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">النص العادي:</p>
                <pre className="rounded-lg border border-border bg-muted/30 p-3 text-xs whitespace-pre-wrap">{preview.textBody}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddVariable({ onAdd }: { onAdd: (v: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <input value={val} onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); } }}
        placeholder="اسم المتغير..."
        className="h-8 flex-1 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-accent" />
      <Button size="sm" variant="outline" onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }}>+</Button>
    </div>
  );
}
