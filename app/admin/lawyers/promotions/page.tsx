"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { useAdminContext } from "../../admin-context";
import { getPendingPromotions, getPromotedLawyers, approvePromotion, rejectPromotion, removePromotion } from "@/lib/lawyer-profiles";
import { ArrowRight, Check, X, Megaphone, Clock, Star, MapPin, Award, ShieldCheck, Trash2 } from "lucide-react";
import { toArabicDigits } from "@/lib/utils";
import { toast } from "@/lib/admin-toast";
import type { Lawyer } from "@/lib/data";

export default function PromotionsPage() {
  const { data, update } = useAdminContext();
  const [pendingLawyers, setPendingLawyers] = useState<Lawyer[]>([]);
  const [promotedLawyers, setPromotedLawyers] = useState<Lawyer[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "promoted">("pending");

  const loadPromotions = () => {
    // Get pending promotions from localStorage
    const pending = getPendingPromotions();
    setPendingLawyers(pending);
    
    // Get promoted lawyers from localStorage
    const promoted = getPromotedLawyers();
    setPromotedLawyers(promoted);
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const handleApprove = (lawyerId: string) => {
    if (approvePromotion(lawyerId)) {
      // Update the lawyer in admin data
      const lawyer = data.lawyers.find((l) => l.id === lawyerId);
      if (lawyer) {
        update("lawyers", data.lawyers.map((l) => 
          l.id === lawyerId ? { ...l, promoted: true, promotionStatus: "approved" as const } : l
        ));
      }
      loadPromotions();
      toast.success("تمت الموافقة على طلب الترويج");
    }
  };

  const handleReject = (lawyerId: string) => {
    if (rejectPromotion(lawyerId)) {
      const lawyer = data.lawyers.find((l) => l.id === lawyerId);
      if (lawyer) {
        update("lawyers", data.lawyers.map((l) => 
          l.id === lawyerId ? { ...l, promotionStatus: "rejected" as const } : l
        ));
      }
      loadPromotions();
      toast.success("تم رفض طلب الترويج");
    }
  };

  const handleRemovePromotion = (lawyerId: string) => {
    if (removePromotion(lawyerId)) {
      const lawyer = data.lawyers.find((l) => l.id === lawyerId);
      if (lawyer) {
        update("lawyers", data.lawyers.map((l) => 
          l.id === lawyerId ? { ...l, promoted: false, promotionStatus: "none" as const } : l
        ));
      }
      loadPromotions();
      toast.success("تم إزالة الترويج");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Megaphone className="size-8 text-accent" />
            طلبات الترويج
          </h1>
          <p className="mt-1 text-muted-foreground">إدارة طلبات ترويج المحامين والظهور في المحامين المميزين</p>
        </div>
        <Link href="/admin/lawyers" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-4 w-4" />
          العودة إلى المحامين
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
            activeTab === "pending" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" />
          الطلبات المعلقة ({pendingLawyers.length})
        </button>
        <button
          onClick={() => setActiveTab("promoted")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
            activeTab === "promoted" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Megaphone className="h-4 w-4" />
          المحامون المروجون ({promotedLawyers.length})
        </button>
      </div>

      {/* Pending Requests */}
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

      {/* Promoted Lawyers */}
      {activeTab === "promoted" && (
        <Card className="border-0 shadow-soft">
          <CardContent className="p-0">
            {promotedLawyers.length === 0 ? (
              <div className="py-16 text-center">
                <Megaphone className="mx-auto mb-4 size-16 text-muted-foreground/20" />
                <p className="text-lg font-semibold">لا يوجد محامون مروجون</p>
                <p className="text-sm text-muted-foreground">لم يتم الترويج لأي محامي بعد</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {promotedLawyers.map((lawyer) => (
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
                            <span>المحافظة: {lawyer.promotionPlan.city}</span>
                            <span>الخطة: {lawyer.promotionPlan.type === "monthly" ? "شهرية" : "سنوية"}</span>
                            {lawyer.promotionPlan.expiryDate && (
                              <span>ينتهي: {new Date(lawyer.promotionPlan.expiryDate).toLocaleDateString("ar-IQ")}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => handleRemovePromotion(lawyer.id)} variant="outline" size="sm" className="gap-1 text-red-600 border-red-200 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" /> إزالة الترويج
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
