"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "../admin-context";
import type { Lawyer } from "@/lib/data";
import { Plus, Pencil, Trash2, X, Star, ShieldCheck, Eye, EyeOff, MessageCircle, Search, ChevronRight, ChevronLeft } from "lucide-react";
import { useAdminTable } from "@/lib/use-admin-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/admin-toast";

const hueOptions = [
  "from-blue-600 to-indigo-700",
  "from-amber-500 to-orange-600",
  "from-slate-700 to-slate-900",
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-cyan-600",
  "from-purple-500 to-fuchsia-600",
  "from-indigo-600 to-blue-700",
  "from-rose-500 to-pink-600",
  "from-red-500 to-rose-600",
  "from-teal-500 to-emerald-600",
];

export default function LawyersAdminPage() {
  const { data, update } = useAdminContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Lawyer, "id">>({
    name: "",
    slug: "",
    city: "بغداد",
    specialization: "القانون المدني",
    experience: 5,
    rating: 4.5,
    reviews: 0,
    verified: false,
    price: 30,
    online: true,
    gender: "male",
    languages: ["العربية"],
    bio: "",
    initials: "",
    hue: hueOptions[0],
    whatsapp: "",
    telegram: "",
    facebook: "",
    instagram: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const checkDuplicate = (name: string, city: string, spec: string, excludeId?: string) => {
    return data.lawyers.find(
      (l) => l.id !== excludeId && l.name.trim() === name.trim() && l.city === city && l.specialization === spec
    );
  };

  const openAdd = () => {
    setForm({
      name: "",
      slug: "",
      city: data.cities[0] || "بغداد",
      specialization: data.specializations[0] || "القانون المدني",
      experience: 5,
      rating: 4.5,
      reviews: 0,
      verified: false,
      price: 30,
      online: true,
      gender: "male",
      languages: ["العربية"],
      bio: "",
      initials: "",
      hue: hueOptions[0],
      whatsapp: "",
      telegram: "",
      facebook: "",
      instagram: "",
    });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (lawyer: Lawyer) => {
    const { id, ...rest } = lawyer;
    setForm(rest);
    setEditingId(id);
    setModalOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    
    // Check for duplicate
    const duplicate = checkDuplicate(form.name, form.city, form.specialization, editingId || undefined);
    if (duplicate) {
      setDuplicateWarning(`يوجد محامٍ بنفس الاسم والمدينة والتخصص: "${duplicate.name}"`);
      return;
    }
    
    if (editingId) {
      update(
        "lawyers",
        data.lawyers.map((l) => (l.id === editingId ? { ...form, id: editingId } : l))
      );
      toast.success("تم الحفظ بنجاح");
    } else {
      const newId = `l${Date.now()}`;
      update("lawyers", [...data.lawyers, { ...form, id: newId }]);
      toast.success("تم الحفظ بنجاح", `تمت إضافة المحامي "${form.name}"`);
    }
    setModalOpen(false);
    setDuplicateWarning(null);
  };

  const remove = (id: string) => {
    const lawyer = data.lawyers.find((l) => l.id === id);
    update("lawyers", data.lawyers.filter((l) => l.id !== id));
    toast.success("تم الحذف", `تم حذف المحامي "${lawyer?.name || ""}"`);
    setDeleteConfirm(null);
  };

  const toggleOnline = (id: string) => {
    update(
      "lawyers",
      data.lawyers.map((l) => (l.id === id ? { ...l, online: !l.online } : l))
    );
  };

  const toggleVerified = (id: string) => {
    update(
      "lawyers",
      data.lawyers.map((l) => (l.id === id ? { ...l, verified: !l.verified } : l))
    );
  };

  const { search, setSearch, page, setPage, pageSize, setPageSize, paged, totalPages, total } = useAdminTable(data.lawyers, ["name", "specialization", "city"]);

  const articleCount = (lawyerId: string) =>
    data.articles.filter((a) => a.lawyerId === lawyerId).length;

  const toggleLang = (lang: string) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة المحامين</h1>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4" />
          إضافة جديد
        </Button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">عرض {paged.length} من {total} محامٍ</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full rounded-xl border border-border bg-muted/40 pr-10 pl-10 h-11 text-sm outline-none focus:border-accent"
          placeholder="بحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold">الصورة</th>
                  <th className="px-4 py-3 text-right font-semibold">الاسم</th>
                  <th className="px-4 py-3 text-right font-semibold">المدينة</th>
                  <th className="px-4 py-3 text-right font-semibold">التخصص</th>
                  <th className="px-4 py-3 text-right font-semibold">الخبرة</th>
                  <th className="px-4 py-3 text-right font-semibold">السعر</th>
                  <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                  <th className="px-4 py-3 text-right font-semibold">موثق</th>
                  <th className="px-4 py-3 text-right font-semibold">المقالات</th>
                  <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((lawyer) => (
                  <tr key={lawyer.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${lawyer.hue} text-xs font-bold text-white`}>
                        {lawyer.initials}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/admin/lawyers/${lawyer.id}`} className="text-accent hover:underline">{lawyer.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{lawyer.city}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lawyer.specialization}</td>
                    <td className="px-4 py-3">{lawyer.experience} سنة</td>
                    <td className="px-4 py-3">${lawyer.price}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleOnline(lawyer.id)} className="text-muted-foreground hover:text-foreground">
                        {lawyer.online ? <Eye className="h-4 w-4 text-success" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleVerified(lawyer.id)}>
                        {lawyer.verified ? (
                          <ShieldCheck className="h-4 w-4 text-gold" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-muted-foreground/30" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{articleCount(lawyer.id)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(lawyer)} className="rounded-lg p-1.5 hover:bg-muted/60">
                          <Pencil className="h-3.5 w-3.5 text-accent" />
                        </button>
                        <button onClick={() => setDeleteConfirm(lawyer.id)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20">
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-sm font-medium ${p === page ? "bg-accent text-white" : "hover:bg-muted/60"}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <span className="text-sm text-muted-foreground">صفحة {page} من {totalPages}</span>
        <select
          className="rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none"
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
        >
          {[5, 10, 25, 50].map((s) => <option key={s} value={s}>{s} / صفحة</option>)}
        </select>
      </div>

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا المحامي؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={() => remove(deleteConfirm!)}
        onCancel={() => setDeleteConfirm(null)}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <Card className="my-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? "تعديل محامٍ" : "إضافة محامٍ جديد"}</CardTitle>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 hover:bg-muted/60">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {duplicateWarning && (
                <div className="col-span-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  ⚠️ {duplicateWarning}
                </div>
              )}
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">الاسم</label>
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">الرابط الإنجليزي (Slug)</label>
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  placeholder="مثال: sara-nasser"
                  value={form.slug || ""}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                />
                <p className="mt-1 text-xs text-muted-foreground">سيظهر في الرابط مثل: /lawyers/{form.slug || "sara-nasser"}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">المدينة</label>
                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                >
                  {data.cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">التخصص</label>
                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                >
                  {data.specializations.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">الخبرة (سنة)</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">التقييم (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  step={0.1}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">عدد المراجعات</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={form.reviews}
                  onChange={(e) => setForm({ ...form, reviews: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">السعر ($)</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">الجنس</label>
                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" })}
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">الأحرف (2)</label>
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={form.initials}
                  maxLength={2}
                  onChange={(e) => setForm({ ...form, initials: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">اللون</label>
                <div className="flex flex-wrap gap-2">
                  {hueOptions.map((h) => (
                    <button
                      key={h}
                      onClick={() => setForm({ ...form, hue: h })}
                      className={`h-8 w-8 rounded-full bg-gradient-to-br ${h} ${form.hue === h ? "ring-2 ring-accent ring-offset-2" : ""}`}
                    />
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">اللغات</label>
                <div className="flex flex-wrap gap-2">
                  {["العربية", "الكردية", "الإنجليزية", "الفرنسية"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => toggleLang(lang)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        form.languages.includes(lang)
                          ? "bg-accent text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">النبذة</label>
                <textarea
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.online} onChange={(e) => setForm({ ...form, online: e.target.checked })} className="rounded" />
                  متصل
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} className="rounded" />
                  موثق
                </label>
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 flex items-center gap-1 text-sm font-medium"><MessageCircle className="h-3.5 w-3.5 text-green-500" /> واتساب</label>
                  <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.whatsapp || ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">تيليجرام</label>
                  <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.telegram || ""} onChange={(e) => setForm({ ...form, telegram: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">فيسبوك</label>
                  <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.facebook || ""} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">انستجرام</label>
                  <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.instagram || ""} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
                </div>
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
                <Button onClick={save}>{editingId ? "حفظ التعديلات" : "إضافة"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
