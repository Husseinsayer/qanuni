"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/admin-toast";
import { Plus, Trash2, Link2, Loader2 } from "lucide-react";

interface RuleArticleLink {
  id: string;
  ruleId: string;
  lawId: string;
  articleNum: number;
  note: string;
  rule?: { name: string };
}

interface LawOption { id: string; name: string; }

export default function InheritanceLinkingPage() {
  const [links, setLinks] = useState<RuleArticleLink[]>([]);
  const [rules, setRules] = useState<{ id: string; name: string }[]>([]);
  const [laws, setLaws] = useState<LawOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ruleId: "", lawId: "", articleNum: 0, note: "" });

  const fetchData = useCallback(async () => {
    try {
      const [linksRes, rulesRes, lawsRes] = await Promise.all([
        fetch("/api/inheritance/linking"),
        fetch("/api/inheritance/rules"),
        fetch("/api/site-data"),
      ]);
      if (linksRes.ok) setLinks(await linksRes.json());
      if (rulesRes.ok) setRules(await rulesRes.json());
      if (lawsRes.ok) {
        const d = await lawsRes.json();
        setLaws((d.laws || []).map((l: { id: string; name: string }) => ({ id: l.id, name: l.name })));
      }
    } catch {
      toast.error("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async () => {
    if (!form.ruleId || !form.lawId) { toast.error("يجب اختيار القاعدة والقانون"); return; }
    try {
      const res = await fetch("/api/inheritance/linking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("تم ربط المادة بالقاعدة");
        setModalOpen(false);
        setForm({ ruleId: "", lawId: "", articleNum: 0, note: "" });
        fetchData();
      }
    } catch {
      toast.error("فشل الاتصال بالخادم");
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/inheritance/linking/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("تم إلغاء الربط");
        fetchData();
      }
    } catch {
      toast.error("فشل الحذف");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ربط القوانين بالحاسبة</h1>
          <p className="text-sm text-muted-foreground">ربط المواد القانونية بالقواعد المستخدمة في الحاسبة</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus className="ml-2 size-4" /> ربط مادة</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-right text-xs text-muted-foreground">
                <th className="p-3">القاعدة</th>
                <th className="p-3">رقم المادة</th>
                <th className="p-3">ملاحظة</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="p-3 font-medium">{link.rule?.name || link.ruleId}</td>
                  <td className="p-3 text-center font-bold">{link.articleNum}</td>
                  <td className="max-w-[250px] truncate p-3 text-xs text-muted-foreground">{link.note}</td>
                  <td className="p-3">
                    <button onClick={() => remove(link.id)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="size-4" /></button>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">لا توجد روابط بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-background shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold">ربط مادة قانونية</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 hover:bg-muted">✕</button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium">القاعدة</label>
                <select value={form.ruleId} onChange={(e) => setForm({ ...form, ruleId: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
                  <option value="">اختر القاعدة...</option>
                  {rules.map((r) => (<option key={r.id} value={r.id}>{r.name}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">القانون</label>
                <select value={form.lawId} onChange={(e) => setForm({ ...form, lawId: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
                  <option value="">اختر القانون...</option>
                  {laws.map((l) => (<option key={l.id} value={l.id}>{l.name}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">رقم المادة</label>
                <input type="number" min={1} value={form.articleNum || ""} onChange={(e) => setForm({ ...form, articleNum: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">ملاحظة</label>
                <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full rounded-xl border border-border bg-background p-3 text-sm" rows={2} />
              </div>
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
                <Button onClick={save}><Link2 className="ml-2 size-4" /> ربط</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
