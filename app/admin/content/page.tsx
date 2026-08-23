"use client";

import * as React from "react";
import {
  Star,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Save,
  X,
  Check,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminData, getAdminData } from "@/lib/admin-data";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/admin-toast";
import { iconMap, iconNames } from "@/lib/icons";

const hueOptions = [
  "from-blue-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-fuchsia-600",
  "from-rose-500 to-pink-600",
  "from-blue-600 to-indigo-700",
  "from-slate-700 to-slate-900",
  "from-cyan-500 to-blue-600",
];

type Tab = "hero" | "nav" | "features" | "testimonials" | "faq" | "stats" | "footer" | "partners" | "contact";

const tabs: { id: Tab; label: string }[] = [
  { id: "hero", label: "الهيرو" },
  { id: "nav", label: "التنقل" },
  { id: "features", label: "لماذا نحن" },
  { id: "testimonials", label: "آراء العملاء" },
  { id: "faq", label: "الأسئلة الشائعة" },
  { id: "stats", label: "الإحصائيات" },
  { id: "footer", label: "التذييل" },
  { id: "partners", label: "الشركاء" },
  { id: "contact", label: "التواصل" },
];

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:ring-2 focus:ring-accent/40"
        dir="rtl"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed outline-none transition focus:ring-2 focus:ring-accent/40"
        dir="rtl"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:ring-2 focus:ring-accent/40"
        dir="rtl"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-foreground">الأيقونة</label>
      <div className="flex flex-wrap gap-2">
        {iconNames.map((name) => {
          const Icon = iconMap[name];
          const active = value === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className={`grid size-10 place-items-center rounded-xl border transition ${
                active
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
              }`}
              title={name}
            >
              <Icon className="size-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-foreground">التقييم</label>
      <div className="flex gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="transition hover:scale-110"
          >
            <Star
              className={`size-6 ${
                n <= value ? "fill-gold text-gold" : "text-muted-foreground/40"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function HeroTab() {
  const { data, update } = useAdminData();
  const hero = data.hero;

  const patch = (field: string, value: string) => {
    update("hero", { ...hero, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>محتوى الهيرو</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Input label="الشارة العلوية" value={hero.badge} onChange={(v) => patch("badge", v)} />
        <Input label="العنوان الرئيسي" value={hero.title} onChange={(v) => patch("title", v)} />
        <Input label="العنوان المتدرج" value={hero.titleGradient} onChange={(v) => patch("titleGradient", v)} />
        <div className="sm:col-span-2">
          <Textarea label="النص الفرعي" value={hero.subtitle} onChange={(v) => patch("subtitle", v)} />
        </div>
        <Input label="زر رئيسي" value={hero.btnPrimary} onChange={(v) => patch("btnPrimary", v)} />
        <Input label="زر ثانوي" value={hero.btnSecondary} onChange={(v) => patch("btnSecondary", v)} />
      </CardContent>
    </Card>
  );
}

function NavTab() {
  const { data, update } = useAdminData();
  const links = data.navLinks;
  const [newLabel, setNewLabel] = React.useState("");
  const [newHref, setNewHref] = React.useState("");
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [editLabel, setEditLabel] = React.useState("");
  const [editHref, setEditHref] = React.useState("");
  const [confirmDel, setConfirmDel] = React.useState<number | null>(null);

  const add = () => {
    if (!newLabel.trim() || !newHref.trim()) return;
    update("navLinks", [...links, { label: newLabel.trim(), href: newHref.trim() }]);
    setNewLabel("");
    setNewHref("");
  };

  const startEdit = (i: number) => {
    setEditIdx(i);
    setEditLabel(links[i].label);
    setEditHref(links[i].href);
  };

  const saveEdit = () => {
    if (editIdx === null) return;
    const next = links.map((l, i) =>
      i === editIdx ? { label: editLabel.trim(), href: editHref.trim() } : l
    );
    update("navLinks", next);
    setEditIdx(null);
  };

  const del = (i: number) => {
    update("navLinks", links.filter((_, idx) => idx !== i));
    setConfirmDel(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>روابط التنقل</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {links.map((link, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-3"
            >
              {editIdx === i ? (
                <>
                  <input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none"
                    dir="rtl"
                  />
                  <input
                    value={editHref}
                    onChange={(e) => setEditHref(e.target.value)}
                    className="h-9 w-32 rounded-lg border border-border bg-background px-3 text-sm outline-none"
                    dir="ltr"
                  />
                  <Button variant="accent" size="sm" onClick={saveEdit}>
                    <Check className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditIdx(null)}>
                    <X className="size-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-semibold">{link.label}</span>
                  <span className="text-xs text-muted-foreground" dir="ltr">
                    {link.href}
                  </span>
                  {confirmDel === i ? (
                    <>
                      <span className="text-xs text-red-500">حذف؟</span>
                      <Button variant="accent" size="sm" onClick={() => del(i)}>
                        <Check className="size-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDel(null)}>
                        <X className="size-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => startEdit(i)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDel(i)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-end gap-2 rounded-xl border border-dashed border-border p-3">
          <div className="flex-1">
            <Input label="العنوان" value={newLabel} onChange={setNewLabel} placeholder="الرئيسية" />
          </div>
          <div className="flex-1">
            <Input label="الرابط" value={newHref} onChange={setNewHref} placeholder="/" type="text" />
          </div>
          <Button variant="accent" size="md" onClick={add}>
            <Plus className="size-4" /> إضافة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FeaturesTab() {
  const { data, update } = useAdminData();
  const features = data.features;
  const [showForm, setShowForm] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [icon, setIcon] = React.useState("ShieldCheck");

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setIcon("ShieldCheck");
    setShowForm(false);
    setEditIdx(null);
  };

  const add = () => {
    if (!title.trim() || !desc.trim()) return;
    const id = `f${Date.now()}`;
    update("features", [...features, { id, title: title.trim(), desc: desc.trim(), icon }]);
    resetForm();
  };

  const startEdit = (i: number) => {
    setEditIdx(i);
    setTitle(features[i].title);
    setDesc(features[i].desc);
    setIcon(features[i].icon);
    setShowForm(true);
  };

  const saveEdit = () => {
    if (editIdx === null) return;
    const next = features.map((f, i) =>
      i === editIdx ? { ...f, title: title.trim(), desc: desc.trim(), icon } : f
    );
    update("features", next);
    resetForm();
  };

  const del = (i: number) => {
    update("features", features.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="accent" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="size-4" /> إضافة ميزة
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editIdx !== null ? "تعديل ميزة" : "ميزة جديدة"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="العنوان" value={title} onChange={setTitle} placeholder="محامون موثوقون" />
            <Textarea label="الوصف" value={desc} onChange={setDesc} placeholder="وصف الميزة..." />
            <IconPicker value={icon} onChange={setIcon} />
            <div className="flex gap-2">
              <Button variant="accent" onClick={editIdx !== null ? saveEdit : add}>
                <Save className="size-4" /> {editIdx !== null ? "حفظ" : "إضافة"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => {
          const Icon = iconMap[f.icon] || ShieldCheck;
          return (
            <Card key={f.id}>
              <CardContent className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-secondary/10 text-secondary">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(i)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => del(i)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <h4 className="text-sm font-bold">{f.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function TestimonialsTab() {
  const { data, update } = useAdminData();
  const items = data.testimonials;
  const [showForm, setShowForm] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [text, setText] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [initials, setInitials] = React.useState("");
  const [hue, setHue] = React.useState(hueOptions[0]);

  const resetForm = () => {
    setName("");
    setRole("");
    setText("");
    setRating(5);
    setInitials("");
    setHue(hueOptions[0]);
    setShowForm(false);
    setEditIdx(null);
  };

  const add = () => {
    if (!name.trim() || !text.trim()) return;
    const id = `t${Date.now()}`;
    update("testimonials", [
      ...items,
      { id, name: name.trim(), role: role.trim(), rating, text: text.trim(), initials: initials.trim() || name.trim().slice(0, 2), hue },
    ]);
    resetForm();
  };

  const startEdit = (i: number) => {
    setEditIdx(i);
    setName(items[i].name);
    setRole(items[i].role);
    setText(items[i].text);
    setRating(items[i].rating);
    setInitials(items[i].initials);
    setHue(items[i].hue);
    setShowForm(true);
  };

  const saveEdit = () => {
    if (editIdx === null) return;
    const next = items.map((t, i) =>
      i === editIdx
        ? { ...t, name: name.trim(), role: role.trim(), rating, text: text.trim(), initials: initials.trim() || name.trim().slice(0, 2), hue }
        : t
    );
    update("testimonials", next);
    resetForm();
  };

  const del = (i: number) => {
    update("testimonials", items.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="accent" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="size-4" /> إضافة شهادة
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editIdx !== null ? "تعديل شهادة" : "شهادة جديدة"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="الاسم" value={name} onChange={setName} placeholder="أحمد الراشد" />
              <Input label="الصفة" value={role} onChange={setRole} placeholder="رائد أعمال" />
            </div>
            <Textarea label="النص" value={text} onChange={setText} placeholder="نص الشهادة..." />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="الحروف المختصرة" value={initials} onChange={setInitials} placeholder="أر" />
              <StarRating value={rating} onChange={setRating} />
              <Select
                label="اللون"
                value={hue}
                onChange={setHue}
                options={hueOptions.map((h) => ({ value: h, label: h }))}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="accent" onClick={editIdx !== null ? saveEdit : add}>
                <Save className="size-4" /> {editIdx !== null ? "حفظ" : "إضافة"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t, i) => (
          <Card key={t.id}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <div
                  className={`grid size-10 place-items-center rounded-full bg-gradient-to-br ${t.hue} text-sm font-bold text-white`}
                >
                  {t.initials}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(i)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => del(i)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <h4 className="text-sm font-bold">{t.name}</h4>
              <p className="text-xs text-muted-foreground">{t.role}</p>
              <div className="my-2 flex gap-0.5" dir="ltr">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`size-3.5 ${n <= t.rating ? "fill-gold text-gold" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{t.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FaqTab() {
  const { data, update } = useAdminData();
  const faqs = data.faqs;
  const [showForm, setShowForm] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [q, setQ] = React.useState("");
  const [a, setA] = React.useState("");

  const resetForm = () => {
    setQ("");
    setA("");
    setShowForm(false);
    setEditIdx(null);
  };

  const add = () => {
    if (!q.trim() || !a.trim()) return;
    update("faqs", [...faqs, { q: q.trim(), a: a.trim() }]);
    resetForm();
  };

  const startEdit = (i: number) => {
    setEditIdx(i);
    setQ(faqs[i].q);
    setA(faqs[i].a);
    setShowForm(true);
  };

  const saveEdit = () => {
    if (editIdx === null) return;
    const next = faqs.map((f, i) => (i === editIdx ? { q: q.trim(), a: a.trim() } : f));
    update("faqs", next);
    resetForm();
  };

  const del = (i: number) => {
    update("faqs", faqs.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="accent" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="size-4" /> إضافة سؤال
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editIdx !== null ? "تعديل سؤال" : "سؤال جديد"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea label="السؤال" value={q} onChange={setQ} rows={2} placeholder="نص السؤال..." />
            <Textarea label="الإجابة" value={a} onChange={setA} rows={4} placeholder="نص الإجابة..." />
            <div className="flex gap-2">
              <Button variant="accent" onClick={editIdx !== null ? saveEdit : add}>
                <Save className="size-4" /> {editIdx !== null ? "حفظ" : "إضافة"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {faqs.map((f, i) => (
          <Card key={i}>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex-1">
                <h4 className="text-sm font-bold">{f.q}</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" onClick={() => startEdit(i)}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => del(i)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PartnersTab() {
  const { data, update } = useAdminData();
  const partners = data.partners;
  const [showForm, setShowForm] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [name, setName] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [icon, setIcon] = React.useState("Building2");
  const [url, setUrl] = React.useState("");

  const resetForm = () => {
    setName("");
    setTitle("");
    setIcon("Building2");
    setUrl("");
    setShowForm(false);
    setEditIdx(null);
  };

  const add = () => {
    if (!name.trim()) return;
    update("partners", [...partners, { id: `p${Date.now()}`, name: name.trim(), title: title.trim(), icon, url: url.trim() }]);
    resetForm();
  };

  const startEdit = (i: number) => {
    setEditIdx(i);
    setName(partners[i].name);
    setTitle(partners[i].title);
    setIcon(partners[i].icon);
    setUrl(partners[i].url);
    setShowForm(true);
  };

  const saveEdit = () => {
    if (editIdx === null) return;
    const next = partners.map((p, i) => (i === editIdx ? { ...p, name: name.trim(), title: title.trim(), icon, url: url.trim() } : p));
    update("partners", next);
    resetForm();
  };

  const del = (i: number) => {
    update("partners", partners.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="accent" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="size-4" /> إضافة شريك
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editIdx !== null ? "تعديل شريك" : "شريك جديد"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="اسم الجهة" value={name} onChange={setName} placeholder="مثال: وزارة العدل العراقية" />
            <Input label="نوع الشراكة" value={title} onChange={setTitle} placeholder="مثال: شريك استراتيجي" />
            <IconPicker value={icon} onChange={setIcon} />
            <Input label="رابط الموقع (اختياري)" value={url} onChange={setUrl} placeholder="https://..." />
            <div className="flex gap-2">
              <Button variant="accent" onClick={editIdx !== null ? saveEdit : add}>
                <Save className="size-4" /> {editIdx !== null ? "حفظ" : "إضافة"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {partners.map((p, i) => (
          <Card key={p.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                {React.createElement(
                  (iconMap as Record<string, React.ComponentType<{ className?: string }>>)[p.icon] ?? Building2,
                  { className: "size-5" }
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold">{p.name}</h4>
                <p className="text-xs text-muted-foreground">{p.title}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" onClick={() => startEdit(i)}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => del(i)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatsTab() {
  const { data, update } = useAdminData();
  const stats = data.stats;
  const [showForm, setShowForm] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [value, setValue] = React.useState(0);
  const [suffix, setSuffix] = React.useState("+");
  const [label, setLabel] = React.useState("");

  const resetForm = () => {
    setValue(0);
    setSuffix("+");
    setLabel("");
    setShowForm(false);
    setEditIdx(null);
  };

  const add = () => {
    if (!label.trim()) return;
    update("stats", [...stats, { value, suffix, label: label.trim() }]);
    resetForm();
  };

  const startEdit = (i: number) => {
    setEditIdx(i);
    setValue(stats[i].value);
    setSuffix(stats[i].suffix);
    setLabel(stats[i].label);
    setShowForm(true);
  };

  const saveEdit = () => {
    if (editIdx === null) return;
    const next = stats.map((s, i) =>
      i === editIdx ? { value, suffix, label: label.trim() } : s
    );
    update("stats", next);
    resetForm();
  };

  const del = (i: number) => {
    update("stats", stats.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="accent" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="size-4" /> إضافة إحصائية
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editIdx !== null ? "تعديل إحصائية" : "إحصائية جديدة"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="القيمة"
                value={String(value)}
                onChange={(v) => setValue(Number(v) || 0)}
                type="number"
              />
              <Input label="اللاحقة" value={suffix} onChange={setSuffix} placeholder="+" />
              <Input label="التسمية" value={label} onChange={setLabel} placeholder="مادة قانونية" />
            </div>
            <div className="flex gap-2">
              <Button variant="accent" onClick={editIdx !== null ? saveEdit : add}>
                <Save className="size-4" /> {editIdx !== null ? "حفظ" : "إضافة"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-between">
                <div />
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(i)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => del(i)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-2xl font-extrabold">
                {s.value.toLocaleString("en-US")}
                <span className="text-accent">{s.suffix}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ContactTab() {
  const { data, update } = useAdminData();
  const contact = data.contact;

  const patch = (field: string, value: string) => {
    update("contact", { ...contact, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>معلومات التواصل</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Input label="الهاتف" value={contact.phone} onChange={(v) => patch("phone", v)} placeholder="+964 770 000 0000" />
        <Input label="البريد الإلكتروني" value={contact.email} onChange={(v) => patch("email", v)} placeholder="info@qanuni.iq" />
        <div className="sm:col-span-2">
          <Input label="العنوان" value={contact.address} onChange={(v) => patch("address", v)} />
        </div>
        <Input label="ساعات العمل" value={contact.workingHours} onChange={(v) => patch("workingHours", v)} />
      </CardContent>
    </Card>
  );
}

function FooterTab() {
  const { data, update } = useAdminData();
  const footer = data.footer;

  const patch = (field: string, value: unknown) => {
    update("footer", { ...footer, [field]: value });
  };

  const patchSocial = (field: string, value: string) => {
    update("footer", { ...footer, socials: { ...footer.socials, [field]: value } });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>محتوى التذييل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            label="الوصف"
            value={footer.description}
            onChange={(v) => patch("description", v)}
            rows={3}
          />
          <Input
            label="نص النشرة البريدية"
            value={footer.newsletterText}
            onChange={(v) => patch("newsletterText", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>روابط التواصل الاجتماعي</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Input
            label="فيسبوك"
            value={footer.socials.facebook}
            onChange={(v) => patchSocial("facebook", v)}
            placeholder="https://facebook.com/..."
          />
          <Input
            label="إكس (تويتر)"
            value={footer.socials.twitter}
            onChange={(v) => patchSocial("twitter", v)}
            placeholder="https://twitter.com/..."
          />
          <Input
            label="إنستغرام"
            value={footer.socials.instagram}
            onChange={(v) => patchSocial("instagram", v)}
            placeholder="https://instagram.com/..."
          />
          <Input
            label="لينكدإن"
            value={footer.socials.linkedin}
            onChange={(v) => patchSocial("linkedin", v)}
            placeholder="https://linkedin.com/..."
          />
          <Input
            label="يوتيوب"
            value={footer.socials.youtube}
            onChange={(v) => patchSocial("youtube", v)}
            placeholder="https://youtube.com/..."
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ContentPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>("hero");
  const { reset } = useAdminData();
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const handleReset = () => {
    if (confirmReset) {
      reset();
      toast.warning("تم إعادة التعيين", "تمت إعادة جميع المحتويات إلى الوضع الافتراضي");
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  const handleSaveToDb = async () => {
    setSaving(true);
    try {
      // Read fresh data from localStorage to avoid stale state
      // (tab components each have their own useAdminData() instance)
      const freshData = getAdminData();
      const res = await fetch("/api/site-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero: freshData.hero,
          footer: {
            ...freshData.footer,
            socials: freshData.footer.socials,
            legalLinks: freshData.footer.legalLinks,
          },
          stats: freshData.stats,
          features: freshData.features,
          testimonials: freshData.testimonials.map((t) => ({
            name: t.name,
            role: t.role,
            rating: t.rating,
            text: t.text,
            initials: t.initials,
            hue: t.hue,
          })),
          faqs: freshData.faqs,
          partners: freshData.partners,
          config: {
            contact: JSON.stringify(freshData.contact),
            seo_basics: JSON.stringify({
              siteName: freshData.seo.general.siteName,
              shortName: freshData.seo.general.shortName,
              tagline: freshData.seo.general.tagline,
              companyName: freshData.seo.general.companyName,
              email: freshData.seo.general.email,
              phone: freshData.seo.general.phone,
              themeColor: freshData.seo.meta.themeColor,
              metadataBase: freshData.seo.meta.metadataBase,
              defaultTitle: freshData.seo.meta.defaultTitle,
              defaultDescription: freshData.seo.meta.defaultDescription,
            }),
          },
        }),
      });
      if (res.ok) {
        toast.success("تم الحفظ", "تم حفظ جميع التغييرات في قاعدة البيانات بنجاح");
      } else {
        const err = await res.json();
        toast.error("خطأ", err.error || "فشل الحفظ");
      }
    } catch {
      toast.error("خطأ", "فشل الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case "hero":
        return <HeroTab />;
      case "nav":
        return <NavTab />;
      case "features":
        return <FeaturesTab />;
      case "testimonials":
        return <TestimonialsTab />;
      case "faq":
        return <FaqTab />;
      case "stats":
        return <StatsTab />;
      case "footer":
        return <FooterTab />;
      case "partners":
        return <PartnersTab />;
      case "contact":
        return <ContactTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">إدارة المحتوى</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              تعديل جميع محتويات الموقع من مكان واحد
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveToDb}
              disabled={saving}
              className="gap-2 bg-accent text-white hover:bg-accent/90"
            >
              <Save className="size-4" />
              {saving ? "جارٍ الحفظ..." : "حفظ في قاعدة البيانات"}
            </Button>
            <Button
              variant={confirmReset ? "accent" : "outline"}
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="size-4" />
              {confirmReset ? "تأكيد إعادة التعيين؟" : "إعادة تعيين"}
            </Button>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-accent text-white shadow-soft"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {renderTab()}

        <ConfirmDialog
          open={confirmReset}
          title="تأكيد إعادة التعيين"
          message="هل أنت متأكد من إعادة تعيين جميع المحتويات؟ سيتم فقدان جميع التغييرات."
          confirmLabel="إعادة تعيين"
          variant="warning"
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      </div>
    </div>
  );
}
