// ===== Iraqi Legal Assistant - Analytics Page =====
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConversations } from "@/lib/ai/settings-store";
import type { Conversation } from "@/lib/ai/types";
import {
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  Scale,
} from "lucide-react";

export default function AnalyticsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    setConversations(getConversations());
  }, []);

  // Calculate analytics
  const totalConversations = conversations.length;
  const totalMessages = conversations.reduce(
    (sum, c) => sum + c.messages.length,
    0
  );
  const avgMessages =
    totalConversations > 0
      ? Math.round(totalMessages / totalConversations)
      : 0;

  // Case type distribution
  const caseTypeCounts: Record<string, number> = {};
  conversations.forEach((c) => {
    if (c.caseType) {
      caseTypeCounts[c.caseType] = (caseTypeCounts[c.caseType] || 0) + 1;
    }
  });

  // Top case types
  const topCaseTypes = Object.entries(caseTypeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Rating distribution
  const ratedConversations = conversations.filter((c) => c.rating);
  const avgRating =
    ratedConversations.length > 0
      ? (
          ratedConversations.reduce((sum, c) => sum + (c.rating || 0), 0) /
          ratedConversations.length
        ).toFixed(1)
      : "0";

  // Daily stats (last 7 days)
  const dailyStats = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const count = conversations.filter(
      (c) => new Date(c.createdAt).toISOString().split("T")[0] === dateStr
    ).length;
    return {
      date: dateStr,
      label: date.toLocaleDateString("ar-IQ", { weekday: "short" }),
      count,
    };
  }).reverse();

  const maxDaily = Math.max(...dailyStats.map((d) => d.count), 1);

  const caseTypeLabels: Record<string, string> = {
    personal: "الأحوال الشخصية",
    real_estate: "العقارات",
    criminal: "الجنائية",
    labor: "قانون العمل",
    civil: "المدني",
    commercial: "التجاري",
    traffic: "المرور",
    companies: "الشركات",
    investment: "الاستثمار",
    unknown: "غير محدد",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">التحليلات</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalConversations}</div>
                <div className="text-sm text-muted-foreground">محادثة</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalMessages}</div>
                <div className="text-sm text-muted-foreground">رسالة</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{avgMessages}</div>
                <div className="text-sm text-muted-foreground">متوسط الرسائل</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Scale className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{avgRating}</div>
                <div className="text-sm text-muted-foreground">متوسط التقييم</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              النشاط اليومي (آخر 7 أيام)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {dailyStats.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-accent rounded-t"
                    style={{
                      height: `${(day.count / maxDaily) * 100}%`,
                      minHeight: day.count > 0 ? "8px" : "0",
                    }}
                  />
                  <div className="text-xs text-muted-foreground">{day.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Case Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع أنواع القضايا</CardTitle>
          </CardHeader>
          <CardContent>
            {topCaseTypes.length > 0 ? (
              <div className="space-y-3">
                {topCaseTypes.map(([type, count]) => {
                  const percentage = Math.round(
                    (count / totalConversations) * 100
                  );
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{caseTypeLabels[type] || type}</span>
                        <span className="text-muted-foreground">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد بيانات كافية
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card>
        <CardHeader>
          <CardTitle>آخر المحادثات</CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.slice(0, 10).map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{conv.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(conv.updatedAt).toLocaleDateString("ar-IQ")}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {conv.messages.length} رسالة
                    </span>
                    {conv.caseType && (
                      <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs">
                        {caseTypeLabels[conv.caseType]}
                      </span>
                    )}
                    {conv.rating && (
                      <span className="text-yellow-500">★ {conv.rating}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد محادثات بعد
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
