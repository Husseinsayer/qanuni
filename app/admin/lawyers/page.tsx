"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "../admin-context";
import type { Lawyer } from "@/lib/data";
import { Plus, Pencil, Trash2, X, ShieldCheck, Eye, EyeOff, MessageCircle, Search, ChevronRight, ChevronLeft, CheckCircle, XCircle, Clock, RefreshCw, Mail, ArrowUpDown, ArrowUp, ArrowDown, Download, Star } from "lucide-react";
import { useAdminTable } from "@/lib/use-admin-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/admin-toast";
type Tab = "all" | "pending" | "rejected";

interface PendingUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
  lawyer: {
    id?: string;
    name?: string;
    slug?: string;
    specialization?: string;
    city?: string;
    experience?: number;
    bio?: string;
    price?: number;
    gender?: string;
    languages?: string;
    initials?: string;
    hue?: string;
    rating?: number;
    reviewCount?: number;
    verified?: boolean;
    online?: boolean;
    whatsapp?: string;
    telegram?: string;
    facebook?: string;
    instagram?: string;
    avatar?: string;
    photoUrl?: string;
    promoted?: boolean;
    points?: number;
    createdAt?: string;
  } | null;
}

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
  const [tab, setTab] = useState<Tab>("all");

  // Pending applications state
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [actingUser, setActingUser] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<PendingUser | null>(null);

  // Lawyers from the database (approved self-registered lawyers)
  const [dbLawyers, setDbLawyers] = useState<Lawyer[]>([]);

  // Existing state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Lawyer, "id">>({
    name: "", slug: "", city: "بغداد", specialization: "القانون المدني",
    experience: 5, rating: 4.5, reviews: 0, verified: false, price: 30,
    online: true, gender: "male", languages: ["العربية"], bio: "", initials: "",
    hue: hueOptions[0], whatsapp: "", telegram: "", facebook: "", instagram: "",
    email: "", password: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoadingPending(true);
    try {
      const res = await fetch("/api/admin/lawyers");
      if (res.ok) {
        const users = await res.json();
        setPendingUsers(users);

        // Build Lawyer objects from ALL database users with lawyer profile
        const allDbLawyers: Lawyer[] = users
          .filter((u: PendingUser) => u.lawyer)
          .map((u: PendingUser) => {
            const l = u.lawyer!;
            return {
              id: l.id || `db-${u.id}`,
              name: l.name || u.name,
              slug: l.slug || "",
              city: l.city || "",
              specialization: l.specialization || "",
              experience: l.experience || 0,
              rating: l.rating || 0,
              reviews: l.reviewCount || 0,
              verified: l.verified || false,
              price: l.price || 0,
              online: l.online || false,
              gender: (l.gender as "male" | "female") || "male",
              languages: (() => { try { return JSON.parse(l.languages || "[]"); } catch { return ["العربية"]; } })(),
              bio: l.bio || "",
              initials: l.initials || "",
              hue: l.hue || "from-blue-600 to-indigo-700",
              whatsapp: l.whatsapp || "",
              telegram: l.telegram || "",
              facebook: l.facebook || "",
              instagram: l.instagram || "",
              photoUrl: l.photoUrl || "",
              points: l.points || 0,
              email: u.email,
            };
          });
        setDbLawyers(allDbLawyers);
      }
    } catch { /* ignore */ }
    setLoadingPending(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (userId: string, action: "approve" | "reject") => {
    setActingUser(userId);
    try {
      const res = await fetch("/api/admin/lawyers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) {
        toast.success(action === "approve" ? "تم قبول الطلب" : "تم رفض الطلب");
        await fetchPending();
      } else {
        const err = await res.json();
        toast.error("فشل", err.error || "حدث خطأ");
      }
    } catch {
      toast.error("فشل", "تعذر الاتصال بالخادم");
    }
    setActingUser(null);
  };

  // Existing handlers
  const checkDuplicate = (name: string, city: string, spec: string, excludeId?: string) =>
    allLawyers.find((l) => l.id !== excludeId && l.name.trim() === name.trim() && l.city === city && l.specialization === spec);

  const openAdd = () => {
    setForm({ name: "", slug: "", city: data.cities[0] || "بغداد", specialization: data.specializations[0] || "القانون المدني", experience: 5, rating: 4.5, reviews: 0, verified: false, price: 30, online: true, gender: "male", languages: ["العربية"], bio: "", initials: "", hue: hueOptions[0], whatsapp: "", telegram: "", facebook: "", instagram: "", email: "", password: "" });
    setEditingId(null);
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    const duplicate = checkDuplicate(form.name, form.city, form.specialization, editingId || undefined);
    if (duplicate) { setDuplicateWarning(`يوجد محامٍ بنفس الاسم والمدينة والتخصص: "${duplicate.name}"`); return; }
    if (editingId) {
      update("lawyers", data.lawyers.map((l) => (l.id === editingId ? { ...form, id: editingId } : l)));
      toast.success("تم الحفظ بنجاح");
    } else {
      const newId = `l${Date.now()}`;
      update("lawyers", [...data.lawyers, { ...form, id: newId }]);
      toast.success("تم الحفظ بنجاح", `تمت إضافة المحامي "${form.name}"`);
    }
    setModalOpen(false);
    setDuplicateWarning(null);
  };

  const remove = async (id: string) => {
    const lawyer = data.lawyers.find((l) => l.id === id);
    update("lawyers", data.lawyers.filter((l) => l.id !== id));
    toast.success("تم الحذف", `تم حذف المحامي "${lawyer?.name || ""}"`);
    setDeleteConfirm(null);
  };

  const toggleOnline = (id: string) => update("lawyers", data.lawyers.map((l) => (l.id === id ? { ...l, online: !l.online } : l)));
  const toggleVerified = (id: string) => update("lawyers", data.lawyers.map((l) => (l.id === id ? { ...l, verified: !l.verified } : l)));

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDir("asc");
    }
  };

  // Filter state
  const [filterCity, setFilterCity] = useState<string>("");
  const [filterSpec, setFilterSpec] = useState<string>("");
  const [filterVerified, setFilterVerified] = useState<string>("");

  // Merge adminData lawyers with database lawyers (deduplicate by id)
  const allLawyers = (() => {
    const merged = [...data.lawyers];
    const existingIds = new Set(data.lawyers.map((l) => l.id));
    for (const dbLawyer of dbLawyers) {
      if (!existingIds.has(dbLawyer.id)) {
        merged.push(dbLawyer);
      }
    }
    return merged;
  })();

  // Apply filters + sort
  let filteredLawyers = allLawyers;
  if (filterCity) filteredLawyers = filteredLawyers.filter((l) => l.city === filterCity);
  if (filterSpec) filteredLawyers = filteredLawyers.filter((l) => l.specialization === filterSpec);
  if (filterVerified) filteredLawyers = filteredLawyers.filter((l) => String(l.verified) === filterVerified);
  if (sortColumn) {
    filteredLawyers = [...filteredLawyers].sort((a, b) => {
      const aVal = String((a as any)[sortColumn] ?? "");
      const bVal = String((b as any)[sortColumn] ?? "");
      const cmp = aVal.localeCompare(bVal, "ar", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  const { search, setSearch, page, setPage, pageSize, setPageSize, paged, totalPages, total } = useAdminTable(filteredLawyers, ["name", "specialization", "city"]);

  // CSV Export
  const exportCSV = () => {
    const headers = ["الاسم", "المدينة", "التخصص", "الخبرة", "السعر", "متصل", "موثق", "التقييم"];
    const rows = allLawyers.map((l) => [
      l.name, l.city, l.specialization, String(l.experience), String(l.price),
      l.online ? "نعم" : "لا", l.verified ? "نعم" : "لا", String(l.rating),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `lawyers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const articleCount = (lawyerId: string) => data.articles.filter((a) => a.lawyerId === lawyerId).length;

  const toggleLang = (lang: string) => setForm((prev) => ({ ...prev, languages: prev.languages.includes(lang) ? prev.languages.filter((l) => l !== lang) : [...prev.languages, lang] }));

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "جميع المحامين", icon: <ShieldCheck className="h-4 w-4" /> },
    { key: "pending", label: "قيد الانتظار", icon: <Clock className="h-4 w-4" /> },
    { key: "rejected", label: "مرفوض", icon: <XCircle className="h-4 w-4" /> },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة المحامين</h1>
        {tab === "all" && (
          <Button onClick={openAdd} size="sm">
            <Plus className="h-4 w-4" />
            إضافة جديد
          </Button>
        )}
      </div>

      {/* Status Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-amber-200/50 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">قيد الانتظار</p>
              <p className="mt-0.5 text-2xl font-bold">{pendingUsers.filter((u) => u.status === "pending").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200/50 bg-green-50/50 dark:border-green-800/30 dark:bg-green-950/20">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المحامون المعتمدون</p>
              <p className="mt-0.5 text-2xl font-bold">{allLawyers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200/50 bg-red-50/50 dark:border-red-800/30 dark:bg-red-950/20">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">مرفوض</p>
              <p className="mt-0.5 text-2xl font-bold">{pendingUsers.filter((u) => u.status === "rejected").length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-muted/40 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
            {t.key === "pending" && pendingUsers.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {pendingUsers.filter((u) => u.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pending Applications Tab */}
      {tab !== "all" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {tab === "pending" ? "طلبات تسجيل جديدة تنتظر المراجعة" : "الطلبات المرفوضة"}
            </p>
            <Button variant="outline" size="sm" onClick={fetchPending} disabled={loadingPending}>
              <RefreshCw className={`h-4 w-4 ${loadingPending ? "animate-spin" : ""}`} />
              تحديث
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-right font-semibold">الاسم</th>
                      <th className="px-4 py-3 text-right font-semibold">البريد</th>
                      <th className="px-4 py-3 text-right font-semibold">التخصص</th>
                      <th className="px-4 py-3 text-right font-semibold">المدينة</th>
                      <th className="px-4 py-3 text-right font-semibold">تاريخ التسجيل</th>
                      <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                      <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPending ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">جارٍ التحميل...</td>
                      </tr>
                    ) : pendingUsers.filter((u) => tab === "pending" ? u.status === "pending" : u.status === tab).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">لا توجد طلبات</td>
                      </tr>
                    ) : (
                      pendingUsers
                        .filter((u) => tab === "pending" ? u.status === "pending" : u.status === tab)
                        .map((user) => (
                          <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="px-4 py-3 font-medium">{user.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{user.lawyer?.specialization || "-"}</td>
                            <td className="px-4 py-3 text-muted-foreground">{user.lawyer?.city || "-"}</td>
                            <td className="px-4 py-3 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("ar-IQ")}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                user.status === "approved" ? "bg-green-100 text-green-700" :
                                user.status === "rejected" ? "bg-red-100 text-red-700" :
                                "bg-amber-100 text-amber-700"
                              }`}>
                                {user.status === "pending" ? "قيد الانتظار" : user.status === "approved" ? "مقبول" : "مرفوض"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setViewingUser(user)}
                                  className="flex items-center gap-1 rounded-lg bg-blue-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  عرض
                                </button>
                                {user.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleAction(user.id, "approve")}
                                      disabled={actingUser === user.id}
                                      className="flex items-center gap-1 rounded-lg bg-green-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50"
                                    >
                                      <CheckCircle className="h-3.5 w-3.5" />
                                      قبول
                                    </button>
                                    <button
                                      onClick={() => handleAction(user.id, "reject")}
                                      disabled={actingUser === user.id}
                                      className="flex items-center gap-1 rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                      رفض
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Lawyers Tab (existing content) */}
      {tab === "all" && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">عرض {paged.length} من {total} محامٍ</p>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4" />
              تصدير CSV
            </Button>
          </div>

          {/* Filter row */}
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input className="w-full rounded-xl border border-border bg-muted/40 pr-10 pl-10 h-11 text-sm outline-none focus:border-accent" placeholder="بحث..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
            </div>
            <select value={filterCity} onChange={(e) => { setFilterCity(e.target.value); setPage(1); }} className="min-w-[130px] rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:border-accent">
              <option value="">كل المدن</option>
              {data.cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterSpec} onChange={(e) => { setFilterSpec(e.target.value); setPage(1); }} className="min-w-[160px] rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:border-accent">
              <option value="">كل التخصصات</option>
              {data.specializations.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterVerified} onChange={(e) => { setFilterVerified(e.target.value); setPage(1); }} className="min-w-[110px] rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:border-accent">
              <option value="">الكل</option>
              <option value="true">موثق</option>
              <option value="false">غير موثق</option>
            </select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-right font-semibold">الصورة</th>
                      {[
                        { key: "name", label: "الاسم" },
                        { key: "city", label: "المدينة" },
                        { key: "specialization", label: "التخصص" },
                        { key: "experience", label: "الخبرة" },
                        { key: "price", label: "السعر" },
                      ].map(({ key, label }) => (
                        <th key={key} className="px-4 py-3 text-right font-semibold">
                          <button onClick={() => handleSort(key)} className="flex items-center gap-1 hover:text-accent transition-colors">
                            {label}
                            {sortColumn === key ? (
                              sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                            )}
                          </button>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                      <th className="px-4 py-3 text-right font-semibold">موثق</th>
                      <th className="px-4 py-3 text-right font-semibold">المقالات</th>
                      <th className="px-4 py-3 text-right font-semibold">النقاط</th>
                      <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((lawyer) => {
                      // Find the user status for this lawyer
                      const dbUser = pendingUsers.find((u) => u.lawyer?.id === lawyer.id);
                      const userStatus = dbUser?.status;
                      return (
                      <tr key={lawyer.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-4 py-3">
                          {lawyer.photoUrl ? (
                            <img src={lawyer.photoUrl} alt={lawyer.name} className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${lawyer.hue} text-xs font-bold text-white`}>{lawyer.initials}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <Link href={`/admin/lawyers/${lawyer.id}`} className="text-accent hover:underline">{lawyer.name}</Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{lawyer.city}</td>
                        <td className="px-4 py-3 text-muted-foreground">{lawyer.specialization}</td>
                        <td className="px-4 py-3">{lawyer.experience} سنة</td>
                        <td className="px-4 py-3">{lawyer.price} ألف د.ع</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            userStatus === "approved" || userStatus === "active" ? "bg-green-100 text-green-700" :
                            userStatus === "rejected" ? "bg-red-100 text-red-700" :
                            userStatus === "pending" ? "bg-amber-100 text-amber-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {userStatus === "approved" || userStatus === "active" ? "معتمد" :
                             userStatus === "rejected" ? "مرفوض" :
                             userStatus === "pending" ? "قيد الانتظار" :
                             "محامي"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleOnline(lawyer.id)} className="text-muted-foreground hover:text-foreground">
                            {lawyer.online ? <Eye className="h-4 w-4 text-success" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleVerified(lawyer.id)}>
                            {lawyer.verified ? <ShieldCheck className="h-4 w-4 text-gold" /> : <ShieldCheck className="h-4 w-4 text-muted-foreground/30" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center rounded-full border border-border px-2 py-0.5 text-xs">{articleCount(lawyer.id)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-sm font-bold">{lawyer.points || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/admin/lawyers/${lawyer.id}/edit`} className="rounded-lg p-1.5 hover:bg-muted/60">
                              <Pencil className="h-3.5 w-3.5 text-accent" />
                            </Link>
                            <button onClick={() => setDeleteConfirm(lawyer.id)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20">
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none">
                <ChevronRight className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg text-sm font-medium ${p === page ? "bg-accent text-white" : "hover:bg-muted/60"}`}>{p}</button>
              ))}
              <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none">
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            <span className="text-sm text-muted-foreground">صفحة {page} من {totalPages}</span>
            <select className="rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {[5, 10, 25, 50].map((s) => <option key={s} value={s}>{s} / صفحة</option>)}
            </select>
          </div>

          <ConfirmDialog open={deleteConfirm !== null} title="تأكيد الحذف" message="هل أنت متأكد من حذف هذا المحامي؟ لا يمكن التراجع عن هذا الإجراء." onConfirm={() => remove(deleteConfirm!)} onCancel={() => setDeleteConfirm(null)} />

          {/* View Lawyer Details Modal */}
          {viewingUser && (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setViewingUser(null)}>
              <Card className="my-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-accent" />
                    معلومات المحامي — جميع بيانات التسجيل
                  </CardTitle>
                  <button onClick={() => setViewingUser(null)} className="rounded-lg p-1 hover:bg-muted/60"><X className="h-5 w-5" /></button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/20 p-4">
                    {viewingUser.lawyer?.photoUrl ? (
                      <img src={viewingUser.lawyer.photoUrl} alt={viewingUser.name} className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${viewingUser.lawyer?.hue || "from-blue-600 to-indigo-700"} text-lg font-bold text-white`}>
                        {viewingUser.lawyer?.initials || viewingUser.name.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-bold">{viewingUser.name}</p>
                      <p className="text-sm text-muted-foreground">{viewingUser.email}</p>
                      {viewingUser.phone && <p className="text-sm text-muted-foreground">{viewingUser.phone}</p>}
                      <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        viewingUser.status === "approved" ? "bg-green-100 text-green-700" :
                        viewingUser.status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {viewingUser.status === "pending" ? "قيد الانتظار" : viewingUser.status === "approved" ? "مقبول" : "مرفوض"}
                      </span>
                    </div>
                  </div>

                  {/* معلومات الحساب */}
                  <div className="rounded-xl border border-border p-4">
                    <h4 className="mb-3 text-sm font-bold text-accent">معلومات الحساب</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">اسم المستخدم: </span><span className="font-medium">{viewingUser.name}</span></div>
                      <div><span className="text-muted-foreground">البريد الإلكتروني: </span><span className="font-medium ltr" dir="ltr">{viewingUser.email}</span></div>
                      <div><span className="text-muted-foreground">رقم الهاتف: </span><span className="font-medium" dir="ltr">{viewingUser.phone || "غير محدد"}</span></div>
                      <div><span className="text-muted-foreground">تاريخ التسجيل: </span><span className="font-medium">{new Date(viewingUser.createdAt).toLocaleDateString("ar-IQ", { year: "numeric", month: "long", day: "numeric" })}</span></div>
                    </div>
                  </div>

                  {/* المعلومات المهنية */}
                  {viewingUser.lawyer && (
                    <div className="rounded-xl border border-border p-4">
                      <h4 className="mb-3 text-sm font-bold text-accent">المعلومات المهنية</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">التخصص: </span><span className="font-bold">{viewingUser.lawyer.specialization || "-"}</span></div>
                        <div><span className="text-muted-foreground">المدينة: </span><span className="font-bold">{viewingUser.lawyer.city || "-"}</span></div>
                        <div><span className="text-muted-foreground">الخبرة: </span><span className="font-bold">{viewingUser.lawyer.experience || 0} سنة</span></div>
                        <div><span className="text-muted-foreground">الجنس: </span><span className="font-bold">{viewingUser.lawyer.gender === "female" ? "أنثى" : "ذكر"}</span></div>
                        <div><span className="text-muted-foreground">سعر الجلسة: </span><span className="font-bold">{viewingUser.lawyer.price || 0} ألف د.ع</span></div>
                        <div><span className="text-muted-foreground">الحالة: </span><span className="font-bold">{viewingUser.lawyer.online ? "متصل" : "غير متصل"}</span></div>
                        <div><span className="text-muted-foreground">التوثيق: </span><span className="font-bold">{viewingUser.lawyer.verified ? "موثق" : "غير موثق"}</span></div>
                        <div><span className="text-muted-foreground">الرابط الإنجليزي: </span><span className="font-bold ltr" dir="ltr">{viewingUser.lawyer.slug || "-"}</span></div>
                      </div>
                    </div>
                  )}

                  {/* النبذة */}
                  {viewingUser.lawyer?.bio && (
                    <div className="rounded-xl border border-border p-4">
                      <h4 className="mb-2 text-sm font-bold text-accent">النبذة الشخصية</h4>
                      <p className="text-sm leading-relaxed">{viewingUser.lawyer.bio}</p>
                    </div>
                  )}

                  {/* اللغات */}
                  {viewingUser.lawyer?.languages && (() => {
                    let langs: string[] = [];
                    try { langs = JSON.parse(viewingUser.lawyer.languages); } catch { langs = [viewingUser.lawyer.languages]; }
                    return langs.length > 0 ? (
                      <div className="rounded-xl border border-border p-4">
                        <h4 className="mb-2 text-sm font-bold text-accent">اللغات</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {langs.map((l) => (
                            <span key={l} className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">{l}</span>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* وسائل التواصل */}
                  {viewingUser.lawyer && (viewingUser.lawyer.whatsapp || viewingUser.lawyer.telegram || viewingUser.lawyer.facebook || viewingUser.lawyer.instagram) && (
                    <div className="rounded-xl border border-border p-4">
                      <h4 className="mb-3 text-sm font-bold text-accent">وسائل التواصل الاجتماعي</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {viewingUser.lawyer.whatsapp && <div><span className="text-muted-foreground">واتساب: </span><span className="font-medium" dir="ltr">{viewingUser.lawyer.whatsapp}</span></div>}
                        {viewingUser.lawyer.telegram && <div><span className="text-muted-foreground">تيليجرام: </span><span className="font-medium" dir="ltr">{viewingUser.lawyer.telegram}</span></div>}
                        {viewingUser.lawyer.facebook && <div><span className="text-muted-foreground">فيسبوك: </span><span className="font-medium ltr" dir="ltr">{viewingUser.lawyer.facebook}</span></div>}
                        {viewingUser.lawyer.instagram && <div><span className="text-muted-foreground">انستجرام: </span><span className="font-medium ltr" dir="ltr">{viewingUser.lawyer.instagram}</span></div>}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {viewingUser.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => { handleAction(viewingUser.id, "approve"); setViewingUser(null); }}
                        disabled={actingUser === viewingUser.id}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        قبول المحامي
                      </button>
                      <button
                        onClick={() => { handleAction(viewingUser.id, "reject"); setViewingUser(null); }}
                        disabled={actingUser === viewingUser.id}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        رفض الطلب
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setModalOpen(false)}>
              <Card className="my-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{editingId ? "تعديل محامٍ" : "إضافة محامٍ جديد"}</CardTitle>
                  <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 hover:bg-muted/60"><X className="h-5 w-5" /></button>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {duplicateWarning && <div className="col-span-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">⚠️ {duplicateWarning}</div>}
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium">الاسم</label>
                    <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium">الرابط الإنجليزي (Slug)</label>
                    <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" placeholder="مثال: sara-nasser" value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })} />
                    <p className="mt-1 text-xs text-muted-foreground">سيظهر في الرابط مثل: /lawyers/{form.slug || "sara-nasser"}</p>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">البريد الإلكتروني</label>
                      <input type="email" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" dir="ltr" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">كلمة المرور</label>
                      <input type="password" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" dir="ltr" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">المدينة</label>
                    <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                      {data.cities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">التخصص</label>
                    <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}>
                      {data.specializations.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">الخبرة (سنة)</label>
                    <input type="number" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.experience} onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">التقييم (1-5)</label>
                    <input type="number" min={1} max={5} step={0.1} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">عدد المراجعات</label>
                    <input type="number" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.reviews} onChange={(e) => setForm({ ...form, reviews: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">السعر (ألف د.ع)</label>
                    <input type="number" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">الجنس</label>
                    <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" })}>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">الأحرف (2)</label>
                    <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.initials} maxLength={2} onChange={(e) => setForm({ ...form, initials: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium">اللون</label>
                    <div className="flex flex-wrap gap-2">
                      {hueOptions.map((h) => (
                        <button key={h} onClick={() => setForm({ ...form, hue: h })} className={`h-8 w-8 rounded-full bg-gradient-to-br ${h} ${form.hue === h ? "ring-2 ring-accent ring-offset-2" : ""}`} />
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium">اللغات</label>
                    <div className="flex flex-wrap gap-2">
                      {["العربية", "الكردية", "الإنجليزية", "الفرنسية"].map((lang) => (
                        <button key={lang} onClick={() => toggleLang(lang)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${form.languages.includes(lang) ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{lang}</button>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium">النبذة</label>
                    <textarea className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.online} onChange={(e) => setForm({ ...form, online: e.target.checked })} className="rounded" /> متصل</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} className="rounded" /> موثق</label>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div><label className="mb-1 flex items-center gap-1 text-sm font-medium"><MessageCircle className="h-3.5 w-3.5 text-green-500" /> واتساب</label><input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.whatsapp || ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
                    <div><label className="mb-1 block text-sm font-medium">تيليجرام</label><input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.telegram || ""} onChange={(e) => setForm({ ...form, telegram: e.target.value })} /></div>
                    <div><label className="mb-1 block text-sm font-medium">فيسبوك</label><input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.facebook || ""} onChange={(e) => setForm({ ...form, facebook: e.target.value })} /></div>
                    <div><label className="mb-1 block text-sm font-medium">انستجرام</label><input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" value={form.instagram || ""} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></div>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
                    <Button onClick={save}>{editingId ? "حفظ التعديلات" : "إضافة"}</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
