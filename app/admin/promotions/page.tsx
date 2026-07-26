"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { useAdminContext } from "../admin-context";
import {
  getPendingPromotions,
  getPromotedLawyers,
  approvePromotion,
  rejectPromotion,
  removePromotion,
} from "@/lib/lawyer-profiles";
import {
  ArrowRight,
  Check,
  X,
  Megaphone,
  Clock,
  Star,
  MapPin,
  Award,
  ShieldCheck,
  Trash2,
  Settings,
  Plus,
  Edit,
  Save,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  Filter,
  Eye,
  Search,
} from "lucide-react";
import { GOVERNORATES } from "@/lib/knowledge-center/types";
import { toast } from "@/lib/admin-toast";
import type { Lawyer } from "@/lib/data";

// ===== Types =====
interface PromotionPlan {
  id: string;
  name: string;
  type: "monthly" | "yearly";
  price: number;
  features: string[];
  isActive: boolean;
}

interface PromotionSettings {
  enabledPlans: string[];
  maxPromotedPerCity: number;
  requireApproval: boolean;
  showOnHomepage: boolean;
  showOnLawyersPage: boolean;
  featuredSectionTitle: string;
}

// ===== Default Plans =====
const DEFAULT_PLANS: PromotionPlan[] = [
  {
    id: "plan-monthly",
    name: "الخطة الشهرية",
    type: "monthly",
    price: 50000,
    features: ["ظهور في المحامين المميزين", "الأولوية في نتائج البحث", "شارة مميزة"],
    isActive: true,
  },
  {
    id: "plan-yearly",
    name: "الخطة السنوية",
    type: "yearly",
    price: 500000,
    features: ["ظهور في المحامين المميزين", "الأولوية في نتائج البحث", "شارة مميزة", "خصم 17%"],
    isActive: true,
  },
];

const DEFAULT_SETTINGS: PromotionSettings = {
  enabledPlans: ["plan-monthly", "plan-yearly"],
  maxPromotedPerCity: 5,
  requireApproval: true,
  showOnHomepage: true,
  showOnLawyersPage: true,
  featuredSectionTitle: "المحامون المميزون",
};

const STORAGE_KEY_PLANS = "promotion_plans";
const STORAGE_KEY_SETTINGS = "promotion_settings";

export default function PromotionsAdminPage() {
  const { data, update } = useAdminContext();

  // State
  const [activeTab, setActiveTab] = useState<"pending" | "promoted" | "plans" | "settings">("pending");
  const [pendingLawyers, setPendingLawyers] = useState<Lawyer[]>([]);
  const [promotedLawyers, setPromotedLawyers] = useState<Lawyer[]>([]);
  const [plans, setPlans] = useState<PromotionPlan[]>(DEFAULT_PLANS);
  const [settings, setSettings] = useState<PromotionSettings>(DEFAULT_SETTINGS);
  const [editingPlan, setEditingPlan] = useState<PromotionPlan | null>(null);
  const [filterCity, setFilterCity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPlan, setShowNewPlan] = useState(false);

  // Load data
  const loadData = useCallback(() => {
    setPendingLawyers(getPendingPromotions());
    setPromotedLawyers(getPromotedLawyers());

    // Load plans from localStorage
    try {
      const savedPlans = localStorage.getItem(STORAGE_KEY_PLANS);
      if (savedPlans) setPlans(JSON.parse(savedPlans));
    } catch {}

    // Load settings from localStorage
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch {}
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save plans
  const savePlans = (newPlans: PromotionPlan[]) => {
    setPlans(newPlans);
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(newPlans));
    toast.success("تم حفظ الخطط");
  };

  // Save settings
  const saveSettings = (newSettings: PromotionSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
    toast.success("تم حفظ الإعدادات");
  };

  // Handle approve
  const handleApprove = (lawyerId: string) => {
    if (approvePromotion(lawyerId)) {
      const lawyer = data.lawyers.find((l) => l.id === lawyerId);
      if (lawyer) {
        update(
          "lawyers",
          data.lawyers.map((l) =>
            l.id === lawyerId ? { ...l, promoted: true, promotionStatus: "approved" as const } : l
          )
        );
      }
      loadData();
      toast.success("تمت الموافقة على طلب الترويج");
    }
  };

  // Handle reject
  const handleReject = (lawyerId: string) => {
    if (rejectPromotion(lawyerId)) {
      const lawyer = data.lawyers.find((l) => l.id === lawyerId);
      if (lawyer) {
        update(
          "lawyers",
          data.lawyers.map((l) =>
            l.id === lawyerId ? { ...l, promotionStatus: "rejected" as const } : l
          )
        );
      }
      loadData();
      toast.success("تم رفض طلب الترويج");
    }
  };

  // Handle remove promotion
  const handleRemovePromotion = (lawyerId: string) => {
    if (removePromotion(lawyerId)) {
      const lawyer = data.lawyers.find((l) => l.id === lawyerId);
      if (lawyer) {
        update(
          "lawyers",
          data.lawyers.map((l) =>
            l.id === lawyerId ? { ...l, promoted: false, promotionStatus: "none" as const } : l
          )
        );
      }
      loadData();
      toast.success("تم إزالة الترويج");
    }
  };

  // Filter promoted by city and search
  const filteredPromoted = promotedLawyers.filter((l) => {
    const matchesCity = filterCity === "all" || l.city === filterCity;
    const matchesSearch = searchQuery === "" || l.name.includes(searchQuery) || l.specialization.includes(searchQuery);
    return matchesCity && matchesSearch;
  });

  // Get city counts
  const cityCounts = promotedLawyers.reduce((acc, l) => {
    acc[l.city] = (acc[l.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Megaphone className="size-8 text-accent" />
            إدارة الترويج
          </h1>
          <p className="mt-1 text-muted-foreground">إدارة ترويج المحامين وخطط الترويج والإعدادات</p>
        </div>
        <Link
          href="/admin/lawyers"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى المحامين
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-yellow-500/10 text-yellow-600">
                <Clock className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingLawyers.length}</p>
                <p className="text-xs text-muted-foreground">طلبات معلقة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-green-500/10 text-green-600">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{promotedLawyers.length}</p>
                <p className="text-xs text-muted-foreground">محامي مروج</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <MapPin className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Object.keys(cityCounts).length}</p>
                <p className="text-xs text-muted-foreground">محافظة نشطة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
                <BarChart3 className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{plans.filter((p) => p.isActive).length}</p>
                <p className="text-xs text-muted-foreground">خطة نشطة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-0">
        {[
          { id: "pending" as const, label: "الطلبات المعلقة", icon: Clock, count: pendingLawyers.length },
          { id: "promoted" as const, label: "المروجون", icon: Megaphone, count: promotedLawyers.length },
          { id: "plans" as const, label: "الخطط", icon: DollarSign, count: plans.length },
          { id: "settings" as const, label: "الإعدادات", icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count !== undefined && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ===== Pending Requests ===== */}
      {activeTab === "pending" && (
        <Card className="border-0 shadow-soft">
          <CardContent className="p-0">
            {pendingLawyers.length === 0 ? (
              <div className="py-16 text-center">
                <Megaphone className="mx-auto mb-4 size-16 text-muted-foreground/20" />
                <p className="text-lg font-semibold">لا توجد طلبات معلقة</p>
                <p className="text-sm text-muted-foreground">لم يطلب أي محامي الترويج بعد</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingLawyers.map((lawyer) => (
                  <div key={lawyer.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${lawyer.hue} text-sm font-bold text-white`}>
                        {lawyer.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/lawyers/${lawyer.id}`} className="font-semibold text-accent hover:underline">
                            {lawyer.name}
                          </Link>
                          {lawyer.verified && <ShieldCheck className="h-4 w-4 text-gold" />}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{lawyer.city}</span>
                          <span className="flex items-center gap-1"><Award className="h-3 w-3" />{lawyer.specialization}</span>
                          <span className="flex items-center gap-1"><Star className="h-3 w-3" />{lawyer.rating}</span>
                        </div>
                        {lawyer.promotionPlan && (
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>المحافظة: {lawyer.promotionPlan.city}</span>
                            <span>الخطة: {lawyer.promotionPlan.type === "monthly" ? "شهرية" : "سنوية"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleApprove(lawyer.id)} variant="primary" size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                        <Check className="h-4 w-4" /> موافقة
                      </Button>
                      <Button onClick={() => handleReject(lawyer.id)} variant="outline" size="sm" className="gap-1 text-red-600 border-red-200 hover:bg-red-50">
                        <X className="h-4 w-4" /> رفض
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ===== Promoted Lawyers ===== */}
      {activeTab === "promoted" && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث بالاسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pr-3 pl-10 py-2 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <Filter className="size-4 text-muted-foreground" />
            <button
              onClick={() => setFilterCity("all")}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                filterCity === "all" ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              الكل ({promotedLawyers.length})
            </button>
            {Object.entries(cityCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([city, count]) => (
                <button
                  key={city}
                  onClick={() => setFilterCity(city)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    filterCity === city ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {city} ({count})
                </button>
              ))}
          </div>

          {/* Promoted list */}
          <Card className="border-0 shadow-soft">
            <CardContent className="p-0">
              {filteredPromoted.length === 0 ? (
                <div className="py-16 text-center">
                  <Megaphone className="mx-auto mb-4 size-16 text-muted-foreground/20" />
                  <p className="text-lg font-semibold">لا يوجد محامون مروجون في هذه المحافظة</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredPromoted.map((lawyer) => (
                    <div key={lawyer.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${lawyer.hue} text-sm font-bold text-white`}>
                          {lawyer.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/lawyers/${lawyer.id}`} className="font-semibold text-accent hover:underline">
                              {lawyer.name}
                            </Link>
                            {lawyer.verified && <ShieldCheck className="h-4 w-4 text-gold" />}
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">مروج</Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{lawyer.city}</span>
                            <span className="flex items-center gap-1"><Award className="h-3 w-3" />{lawyer.specialization}</span>
                            <span className="flex items-center gap-1"><Star className="h-3 w-3" />{lawyer.rating}</span>
                          </div>
                          {lawyer.promotionPlan && (
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                              <span>الخطة: {lawyer.promotionPlan.type === "monthly" ? "شهرية" : "سنوية"}</span>
                              {lawyer.promotionPlan.startDate && (
                                <span>من: {new Date(lawyer.promotionPlan.startDate).toLocaleDateString("ar-IQ")}</span>
                              )}
                              {lawyer.promotionPlan.expiryDate && (
                                <span>إلى: {new Date(lawyer.promotionPlan.expiryDate).toLocaleDateString("ar-IQ")}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/lawyers/${lawyer.slug || lawyer.id}`}
                          target="_blank"
                          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted/50"
                        >
                          <Eye className="size-3" />
                          عرض
                        </Link>
                        <Button onClick={() => {
                          if (window.confirm(`هل أنت متأكد من إزالة الترويج من ${lawyer.name}؟`)) {
                            handleRemovePromotion(lawyer.id);
                          }
                        }} variant="outline" size="sm" className="gap-1 text-red-600 border-red-200 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" /> إزالة
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== Plans Management ===== */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">خطط الترويج</h2>
            <Button onClick={() => setShowNewPlan(true)} variant="primary" size="sm" className="gap-1">
              <Plus className="size-4" /> إضافة خطة
            </Button>
          </div>

          {/* New Plan Form */}
          {showNewPlan && (
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle>خطة جديدة</CardTitle>
              </CardHeader>
              <CardContent>
                <PlanForm
                  plan={null}
                  onSave={(plan) => {
                    savePlans([...plans, plan]);
                    setShowNewPlan(false);
                  }}
                  onCancel={() => setShowNewPlan(false)}
                />
              </CardContent>
            </Card>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <Card key={plan.id} className="border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      <p className="text-2xl font-extrabold text-accent mt-1">
                        {plan.price.toLocaleString("ar-IQ")} د.ع
                        <span className="text-sm font-normal text-muted-foreground">/{plan.type === "monthly" ? "شهرياً" : "سنوياً"}</span>
                      </p>
                    </div>
                    <Badge variant={plan.isActive ? "default" : "outline"}>
                      {plan.isActive ? "نشط" : "معطل"}
                    </Badge>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="size-4 text-green-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      onClick={() => setEditingPlan(plan)}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <Edit className="size-4" /> تعديل
                    </Button>
                    <Button
                      onClick={() => {
                        savePlans(plans.map((p) => (p.id === plan.id ? { ...p, isActive: !p.isActive } : p)));
                      }}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      {plan.isActive ? "تعطيل" : "تفعيل"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Edit Plan Modal */}
          {editingPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <Card className="w-full max-w-lg border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle>تعديل الخطة</CardTitle>
                </CardHeader>
                <CardContent>
                  <PlanForm
                    plan={editingPlan}
                    onSave={(updated) => {
                      savePlans(plans.map((p) => (p.id === updated.id ? updated : p)));
                      setEditingPlan(null);
                    }}
                    onCancel={() => setEditingPlan(null)}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ===== Settings ===== */}
      {activeTab === "settings" && (
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-5" />
              إعدادات الترويج
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* General Settings */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-muted-foreground">الإعدادات العامة</h3>

              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="font-semibold">تفعيل نظام الترويج</p>
                  <p className="text-sm text-muted-foreground">تشغيل أو إيقاف نظام الترويج بالكامل</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, enabledPlans: settings.enabledPlans.length > 0 ? [] : DEFAULT_PLANS.map((p) => p.id) })}
                  className={`relative h-6 w-11 rounded-full transition ${settings.enabledPlans.length > 0 ? "bg-accent" : "bg-muted"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      settings.enabledPlans.length > 0 ? "translate-x-5.5 left-0.5" : "translate-x-0.5 left-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="font-semibold">تتطلب موافقة الإدارة</p>
                  <p className="text-sm text-muted-foreground">يجب موافقة الإدارة قبل تفعيل الترويج</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, requireApproval: !settings.requireApproval })}
                  className={`relative h-6 w-11 rounded-full transition ${settings.requireApproval ? "bg-accent" : "bg-muted"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      settings.requireApproval ? "translate-x-5.5 left-0.5" : "translate-x-0.5 left-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="font-semibold">الظهور في الصفحة الرئيسية</p>
                  <p className="text-sm text-muted-foreground">عرض المحامين المميزين في الصفحة الرئيسية</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, showOnHomepage: !settings.showOnHomepage })}
                  className={`relative h-6 w-11 rounded-full transition ${settings.showOnHomepage ? "bg-accent" : "bg-muted"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      settings.showOnHomepage ? "translate-x-5.5 left-0.5" : "translate-x-0.5 left-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="font-semibold">الظهور في صفحة المحامين</p>
                  <p className="text-sm text-muted-foreground">عرض المحامين المميزين في صفحة دليل المحامين</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, showOnLawyersPage: !settings.showOnLawyersPage })}
                  className={`relative h-6 w-11 rounded-full transition ${settings.showOnLawyersPage ? "bg-accent" : "bg-muted"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      settings.showOnLawyersPage ? "translate-x-5.5 left-0.5" : "translate-x-0.5 left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Limits */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-muted-foreground">الحدود</h3>

              <div className="rounded-xl border border-border p-4">
                <label className="font-semibold">الحد الأقصى للمروجين لكل محافظة</label>
                <input
                  type="number"
                  value={settings.maxPromotedPerCity}
                  onChange={(e) => setSettings({ ...settings, maxPromotedPerCity: parseInt(e.target.value) || 5 })}
                  min={1}
                  max={20}
                  className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-border p-4">
                <label className="font-semibold">عنوان قسم المحامين المميزين</label>
                <input
                  type="text"
                  value={settings.featuredSectionTitle}
                  onChange={(e) => setSettings({ ...settings, featuredSectionTitle: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {/* City Limits */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-muted-foreground">الحدود حسب المحافظة</h3>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
                {GOVERNORATES.map((gov) => (
                  <div key={gov} className="rounded-lg border border-border p-3 text-center">
                    <p className="text-sm font-semibold">{gov}</p>
                    <p className="text-lg font-bold text-accent">{cityCounts[gov] || 0}</p>
                    <p className="text-xs text-muted-foreground">مروج</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-border">
              <Button onClick={() => saveSettings(settings)} variant="primary" className="gap-2">
                <Save className="size-4" />
                حفظ الإعدادات
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ===== Plan Form Component =====
function PlanForm({
  plan,
  onSave,
  onCancel,
}: {
  plan: PromotionPlan | null;
  onSave: (plan: PromotionPlan) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(plan?.name || "");
  const [type, setType] = useState<"monthly" | "yearly">(plan?.type || "monthly");
  const [price, setPrice] = useState(plan?.price || 50000);
  const [features, setFeatures] = useState(plan?.features.join("\n") || "");
  const [isActive, setIsActive] = useState(plan?.isActive ?? true);

  const handleSubmit = () => {
    onSave({
      id: plan?.id || `plan-${Date.now()}`,
      name,
      type,
      price,
      features: features.split("\n").filter((f) => f.trim()),
      isActive,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold">اسم الخطة</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
          placeholder="مثال: الخطة الشهرية"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">النوع</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "monthly" | "yearly")}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
          >
            <option value="monthly">شهري</option>
            <option value="yearly">سنوي</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">السعر (د.ع)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold">المميزات (كل ميزة في سطر)</label>
        <textarea
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
          placeholder="ظهور في المحامين المميزين&#10;prioritized في نتائج البحث&#10;شارة مميزة"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="plan-active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="size-4 rounded border-border accent-accent"
        />
        <label htmlFor="plan-active" className="text-sm font-semibold">خطة نشطة</label>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4">
        <Button onClick={onCancel} variant="outline" size="sm">
          إلغاء
        </Button>
        <Button onClick={handleSubmit} variant="primary" size="sm" className="gap-1">
          <Save className="size-4" /> حفظ
        </Button>
      </div>
    </div>
  );
}
