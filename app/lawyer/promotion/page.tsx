"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import {
  getMyPromotionStatus,
  requestPromotion,
  cancelPromotionRequest,
} from "@/lib/lawyer-profiles";
import { GOVERNORATES } from "@/lib/knowledge-center/types";
import {
  Megaphone,
  Check,
  X,
  Clock,
  MapPin,
  Calendar,
  Star,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/lib/admin-toast";

interface PromotionPlan {
  id: string;
  name: string;
  type: "monthly" | "yearly";
  price: number;
  features: string[];
  isActive: boolean;
}

const STORAGE_KEY_PLANS = "promotion_plans";

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

export default function LawyerPromotionPage() {
  const [plans, setPlans] = useState<PromotionPlan[]>(DEFAULT_PLANS);
  const [promotionStatus, setPromotionStatus] = useState<{
    status: string;
    plan: any;
  }>({ status: "none", plan: undefined });
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load plans
    try {
      const savedPlans = localStorage.getItem(STORAGE_KEY_PLANS);
      if (savedPlans) setPlans(JSON.parse(savedPlans));
    } catch {}

    // Load promotion status
    const status = getMyPromotionStatus();
    setPromotionStatus(status);
    if (status.plan?.city) setSelectedCity(status.plan.city);
    if (status.plan?.type) {
      const planType = status.plan.type === "monthly" ? "plan-monthly" : "plan-yearly";
      setSelectedPlan(planType);
    }
  }, []);

  const handleRequestPromotion = () => {
    if (!selectedCity) {
      toast.error("يرجى اختيار المحافظة");
      return;
    }
    if (!selectedPlan) {
      toast.error("يرجى اختيار الخطة");
      return;
    }

    setLoading(true);
    const planType = selectedPlan === "plan-monthly" ? "monthly" : "yearly";
    const success = requestPromotion(selectedCity, planType);
    setLoading(false);

    if (success) {
      toast.success("تم إرسال طلب الترويج بنجاح");
      setPromotionStatus(getMyPromotionStatus());
    } else {
      toast.error("حدث خطأ أثناء إرسال الطلب");
    }
  };

  const handleCancelRequest = () => {
    setLoading(true);
    const success = cancelPromotionRequest();
    setLoading(false);

    if (success) {
      toast.success("تم إلغاء طلب الترويج");
      setPromotionStatus(getMyPromotionStatus());
    } else {
      toast.error("حدث خطأ أثناء الإلغاء");
    }
  };

  const getStatusBadge = () => {
    switch (promotionStatus.status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="size-3 ml-1" />
            قيد المراجعة
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="size-3 ml-1" />
            مفعل
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <X className="size-3 ml-1" />
            مرفوض
          </Badge>
        );
      default:
        return null;
    }
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Megaphone className="size-8 text-accent" />
          الترويج
        </h1>
        <p className="mt-1 text-muted-foreground">اظهر في قائمة المحامين المميزين واحصل على المزيد من العملاء</p>
      </div>

      {/* Current Status */}
      {promotionStatus.status !== "none" && (
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">حالة الترويج الحالية</h3>
                <div className="mt-2 flex items-center gap-3">
                  {getStatusBadge()}
                  {promotionStatus.plan?.city && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-4" />
                      {promotionStatus.plan.city}
                    </span>
                  )}
                  {promotionStatus.plan?.type && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="size-4" />
                      {promotionStatus.plan.type === "monthly" ? "خطة شهرية" : "خطة سنوية"}
                    </span>
                  )}
                </div>
              </div>
              {promotionStatus.status === "pending" && (
                <Button
                  onClick={handleCancelRequest}
                  variant="outline"
                  size="sm"
                  className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                  disabled={loading}
                >
                  <X className="size-4" />
                  إلغاء الطلب
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Request */}
      {promotionStatus.status === "none" && (
        <>
          {/* City Selection */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5" />
                اختر المحافظة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
                {GOVERNORATES.map((gov) => (
                  <button
                    key={gov}
                    onClick={() => setSelectedCity(gov)}
                    className={`rounded-lg border p-3 text-center text-sm font-semibold transition ${
                      selectedCity === gov
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border hover:border-accent/50 hover:bg-muted/50"
                    }`}
                  >
                    {gov}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Plan Selection */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="size-5" />
                اختر الخطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {plans
                  .filter((p) => p.isActive)
                  .map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`cursor-pointer rounded-xl border-2 p-6 transition ${
                        selectedPlan === plan.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold">{plan.name}</h3>
                          <p className="text-2xl font-extrabold text-accent mt-1">
                            {plan.price.toLocaleString("ar-IQ")} د.ع
                            <span className="text-sm font-normal text-muted-foreground">
                              /{plan.type === "monthly" ? "شهرياً" : "سنوياً"}
                            </span>
                          </p>
                        </div>
                        {selectedPlan === plan.id && (
                          <div className="grid size-6 place-items-center rounded-full bg-accent text-white">
                            <Check className="size-4" />
                          </div>
                        )}
                      </div>
                      <ul className="mt-4 space-y-2">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="size-4 text-green-600" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary & Submit */}
          {selectedCity && selectedPlanData && (
            <Card className="border-0 shadow-soft">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">ملخص الطلب</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المحافظة:</span>
                    <span className="font-semibold">{selectedCity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الخطة:</span>
                    <span className="font-semibold">{selectedPlanData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المدة:</span>
                    <span className="font-semibold">
                      {selectedPlanData.type === "monthly" ? "شهر واحد" : "سنة كاملة"}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="text-muted-foreground">الإجمالي:</span>
                    <span className="font-bold text-accent text-lg">
                      {selectedPlanData.price.toLocaleString("ar-IQ")} د.ع
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-xl bg-yellow-500/10 p-4 text-sm text-yellow-700">
                  <AlertCircle className="size-5 shrink-0" />
                  <p>سيتم مراجعة طلبك من قبل الإدارة. سيتم إشعارك عند الموافقة أو الرفض.</p>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleRequestPromotion}
                    variant="primary"
                    className="gap-2"
                    disabled={loading}
                  >
                    <Megaphone className="size-4" />
                    {loading ? "جاري الإرسال..." : "إرسال طلب الترويج"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
