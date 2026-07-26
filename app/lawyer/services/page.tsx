"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Save, Check, Edit3, DollarSign, Clock, Globe, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getMyServices, addService, removeService, updateService,
  seedLawyerDemoData, type LawyerService,
} from "@/lib/lawyer-profiles";
import { getUserSession } from "@/lib/user-auth";

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<LawyerService[]>([]);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", price: 0, duration: "", online: false });
  const [newForm, setNewForm] = useState({ name: "", description: "", price: 50, duration: "30 دقيقة", online: true });

  useEffect(() => {
    const s = getUserSession();
    if (!s || s.role !== "lawyer") { router.push("/auth/login"); return; }
    seedLawyerDemoData();
    setServices(getMyServices());
  }, [router]);

  const handleDelete = (id: string) => {
    removeService(id);
    setServices(getMyServices());
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const handleEdit = (svc: LawyerService) => {
    setEditingId(svc.id);
    setEditForm({ name: svc.name, description: svc.description, price: svc.price, duration: svc.duration ?? "", online: svc.online ?? false });
  };

  const handleSaveEdit = (id: string) => {
    updateService(id, editForm);
    setEditingId(null);
    setServices(getMyServices());
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const handleAdd = () => {
    if (!newForm.name.trim()) return;
    addService(newForm);
    setNewForm({ name: "", description: "", price: 50, duration: "30 دقيقة", online: true });
    setServices(getMyServices());
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">الخدمات والأسعار</h1>
          <p className="mt-1 text-muted-foreground">حدد الخدمات التي تقدمها وأسعارها</p>
        </div>
      </div>

      {saved && (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success flex items-center gap-2">
          <Check className="size-4" /> تم الحفظ ✓
        </div>
      )}

      {/* Services List */}
      <div className="space-y-4">
        {services.length === 0 && (
          <Card className="border-0 shadow-soft">
            <CardContent className="py-10 text-center">
              <DollarSign className="mx-auto mb-3 size-10 text-muted-foreground/30" />
              <p className="text-lg font-semibold">لا توجد خدمات بعد</p>
              <p className="text-sm text-muted-foreground">أضف خدماتك لتنشيط ملفك وجذب العملاء</p>
            </CardContent>
          </Card>
        )}
        {services.map((svc) => (
          <Card key={svc.id} className="border-0 shadow-soft">
            <CardContent className="p-5">
              {editingId === svc.id ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold">اسم الخدمة</label>
                      <input type="text" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm outline-none focus:border-accent" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold">السعر ($)</label>
                      <input type="number" min={0} value={editForm.price} onChange={(e) => setEditForm((p) => ({ ...p, price: Number(e.target.value) }))}
                        className="h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm outline-none focus:border-accent" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">الوصف</label>
                    <input type="text" value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm outline-none focus:border-accent" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold">المدة</label>
                      <input type="text" value={editForm.duration} onChange={(e) => setEditForm((p) => ({ ...p, duration: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm outline-none focus:border-accent" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold">استشارة أونلاين</label>
                      <label className="flex items-center gap-3 pt-1 cursor-pointer">
                        <div className={cn("relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors", editForm.online ? "bg-accent" : "bg-muted-foreground/30")}
                          onClick={() => setEditForm((p) => ({ ...p, online: !p.online }))}>
                          <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white transition-transform", editForm.online ? "translate-x-6" : "translate-x-1")} />
                        </div>
                        <span className="text-sm text-muted-foreground">{editForm.online ? "متاح" : "غير متاح"}</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSaveEdit(svc.id)} variant="accent" size="sm" className="gap-2"><Save className="size-4" /> حفظ</Button>
                    <Button onClick={() => setEditingId(null)} variant="outline" size="sm">إلغاء</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">{svc.name}</h3>
                      {svc.online && (
                        <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
                          <Globe className="size-3" /> أونلاين
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{svc.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5 font-bold text-accent">
                        <DollarSign className="size-4" />{svc.price}
                      </span>
                      {svc.duration && (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="size-4" />{svc.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 mr-4 shrink-0">
                    <button onClick={() => handleEdit(svc)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted/60 hover:text-accent" title="تعديل">
                      <Edit3 className="size-4" />
                    </button>
                    <button onClick={() => handleDelete(svc.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-danger/10 hover:text-danger" title="حذف">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New */}
      <Card className="border-0 shadow-soft">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Plus className="size-5 text-accent" /> إضافة خدمة جديدة</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">اسم الخدمة</label>
              <input type="text" value={newForm.name} onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))}
                className="h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm outline-none focus:border-accent" placeholder="مثال: استشارة قانونية" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">السعر ($)</label>
              <input type="number" min={0} value={newForm.price} onChange={(e) => setNewForm((p) => ({ ...p, price: Number(e.target.value) }))}
                className="h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm outline-none focus:border-accent" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">الوصف</label>
            <input type="text" value={newForm.description} onChange={(e) => setNewForm((p) => ({ ...p, description: e.target.value }))}
              className="h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm outline-none focus:border-accent" placeholder="وصف مختصر للخدمة" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">المدة</label>
              <input type="text" value={newForm.duration} onChange={(e) => setNewForm((p) => ({ ...p, duration: e.target.value }))}
                className="h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm outline-none focus:border-accent" placeholder="30 دقيقة" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">استشارة أونلاين</label>
              <label className="flex items-center gap-3 pt-1 cursor-pointer">
                <div className={cn("relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors", newForm.online ? "bg-accent" : "bg-muted-foreground/30")}
                  onClick={() => setNewForm((p) => ({ ...p, online: !p.online }))}>
                  <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white transition-transform", newForm.online ? "translate-x-6" : "translate-x-1")} />
                </div>
                <span className="text-sm text-muted-foreground">{newForm.online ? "متاح" : "غير متاح"}</span>
              </label>
            </div>
          </div>
          <Button onClick={handleAdd} variant="accent" className="gap-2"><Plus className="size-4" /> إضافة الخدمة</Button>
        </CardContent>
      </Card>
    </div>
  );
}
