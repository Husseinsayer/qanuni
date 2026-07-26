"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "../admin-context";
import { type LawFirm, cities } from "@/lib/data";
import { Plus, Pencil, Trash2, X, Phone, Mail, Search, ChevronRight, ChevronLeft } from "lucide-react";
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

const specOptions = [
  "القانون المدني",
  "قانون العقوبات",
  "الأحوال الشخصية",
  "قانون العمل",
  "القانون التجاري",
  "القانون الإداري",
  "العقارات",
  "القانون الجنائي",
];

const emptyFirm: Omit<LawFirm, "id"> = {
  name: "",
  city: "بغداد",
  address: "",
  phones: [],
  email: "",
  lawyers: [],
  hue: hueOptions[0],
};

export default function LawFirmsAdminPage() {
  const { data, update } = useAdminContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<LawFirm, "id">>(emptyFirm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const checkDuplicate = (name: string, city: string, excludeId?: string) => {
    return data.lawFirms.find(
      (f) => f.id !== excludeId && f.name.trim() === name.trim() && f.city === city
    );
  };

  const openAdd = () => {
    setForm(emptyFirm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (firm: LawFirm) => {
    const { id, ...rest } = firm;
    setForm(rest);
    setEditingId(id);
    setModalOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return;

    const duplicate = checkDuplicate(form.name, form.city, editingId || undefined);
    if (duplicate) {
      setDuplicateWarning(`يوجد مكتب بنفس الاسم والمدينة: "${duplicate.name}"`);
      return;
    }

    if (editingId) {
      update(
        "lawFirms",
        data.lawFirms.map((f) => (f.id === editingId ? { ...form, id: editingId } : f))
      );
      toast.success("تم الحفظ بنجاح");
    } else {
      const newId = `f-${Date.now()}`;
      update("lawFirms", [...data.lawFirms, { ...form, id: newId }]);
      toast.success("تم الحفظ بنجاح", `تمت إضافة المكتب "${form.name}"`);
    }
    setModalOpen(false);
    setDuplicateWarning(null);
  };

  const remove = (id: string) => {
    const firm = data.lawFirms.find((f) => f.id === id);
    update("lawFirms", data.lawFirms.filter((f) => f.id !== id));
    toast.success("تم الحذف", `تم حذف المكتب "${firm?.name || ""}"`);
    setDeleteConfirm(null);
  };

  const { search, setSearch, page, setPage, pageSize, setPageSize, paged, totalPages, total } = useAdminTable(data.lawFirms, ["name", "city"]);

  const addPhone = () => setForm({ ...form, phones: [...form.phones, ""] });
  const removePhone = (idx: number) => setForm({ ...form, phones: form.phones.filter((_, i) => i !== idx) });
  const updatePhone = (idx: number, value: string) => {
    setForm({ ...form, phones: form.phones.map((p, i) => (i === idx ? value : p)) });
  };

  const addFirmLawyer = () =>
    setForm({
      ...form,
      lawyers: [...form.lawyers, { name: "", specialization: specOptions[0], hue: hueOptions[0] }],
    });
  const removeFirmLawyer = (idx: number) =>
    setForm({ ...form, lawyers: form.lawyers.filter((_, i) => i !== idx) });
  const updateFirmLawyer = (idx: number, field: keyof LawFirm["lawyers"][0], value: string) => {
    setForm({
      ...form,
      lawyers: form.lawyers.map((l, i) => (i === idx ? { ...l, [field]: value } : l)),
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة مكاتب المحامين</h1>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4" />
          إضافة جديد
        </Button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">عرض {paged.length} من {total} مكتب</p>
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
                  <th className="px-4 py-3 text-right font-semibold">الاسم</th>
                  <th className="px-4 py-3 text-right font-semibold">المدينة</th>
                  <th className="px-4 py-3 text-right font-semibold">العنوان</th>
                  <th className="px-4 py-3 text-right font-semibold">عدد المحامين</th>
                  <th className="px-4 py-3 text-right font-semibold">الهواتف</th>
                  <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((firm) => (
                  <tr key={firm.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/admin/law-firms/${firm.id}`} className="text-accent hover:underline">{firm.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{firm.city}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{firm.address}</td>
                    <td className="px-4 py-3">{firm.lawyers.length}</td>
                    <td className="px-4 py-3 text-muted-foreground">{firm.phones.length}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(firm)} className="rounded-lg p-1.5 hover:bg-muted/60">
                          <Pencil className="h-3.5 w-3.5 text-accent" />
                        </button>
                        <button onClick={() => setDeleteConfirm(firm.id)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20">
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
        message="هل أنت متأكد من حذف هذا المكتب؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={() => remove(deleteConfirm!)}
        onCancel={() => setDeleteConfirm(null)}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <Card className="my-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? "تعديل مكتب" : "إضافة مكتب جديد"}</CardTitle>
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
                <label className="mb-1 block text-sm font-medium">البريد الإلكتروني</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">العنوان</label>
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
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
                <div className="mb-2 flex items-center justify-between">
                  <label className="flex items-center gap-1 text-sm font-medium"><Phone className="h-3.5 w-3.5" /> أرقام الهاتف</label>
                  <Button variant="outline" size="sm" onClick={addPhone}>
                    <Plus className="h-3.5 w-3.5" />
                    إضافة رقم
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.phones.map((phone, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                        value={phone}
                        onChange={(e) => updatePhone(idx, e.target.value)}
                        placeholder="+964 7XX XXX XXXX"
                      />
                      {phone && (
                        <a href={`tel:${phone}`} className="text-xs text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                          معاينة
                        </a>
                      )}
                      <button onClick={() => removePhone(idx)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20">
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium">المحامون في المكتب</label>
                  <Button variant="outline" size="sm" onClick={addFirmLawyer}>
                    <Plus className="h-3.5 w-3.5" />
                    إضافة محامٍ
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.lawyers.map((lawyer, idx) => (
                    <div key={idx} className="rounded-xl border border-border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">محامٍ {idx + 1}</span>
                        <button onClick={() => removeFirmLawyer(idx)} className="rounded p-0.5 hover:bg-red-50 dark:hover:bg-red-950/20">
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                          placeholder="الاسم"
                          value={lawyer.name}
                          onChange={(e) => updateFirmLawyer(idx, "name", e.target.value)}
                        />
                        <select
                          className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                          value={lawyer.specialization}
                          onChange={(e) => updateFirmLawyer(idx, "specialization", e.target.value)}
                        >
                          {specOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="flex items-center gap-1">
                          {hueOptions.slice(0, 5).map((h) => (
                            <button
                              key={h}
                              onClick={() => updateFirmLawyer(idx, "hue", h)}
                              className={`h-6 w-6 rounded-full bg-gradient-to-br ${h} ${lawyer.hue === h ? "ring-2 ring-accent ring-offset-1" : ""}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
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
