// ===== Iraqi Legal Assistant - Debug Page =====
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CaseType, ConfidenceScore, LawReference, DebugTrace } from "@/lib/ai/types";
import { Search, Bot, FileText, Shield, Clock, Send } from "lucide-react";

type DebugResult = {
  query: string;
  caseType: CaseType;
  confidence: ConfidenceScore;
  lawReferences: LawReference[];
  trace: DebugTrace[];
  answer: string;
  totalDuration: number;
};

export default function DebugPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DebugResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, debug: true }),
      });

      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      setResult({
        query,
        caseType: data.caseType,
        confidence: data.confidence,
        lawReferences: data.lawReferences || [],
        trace: data.debug?.trace || [],
        answer: data.answer,
        totalDuration: data.debug?.totalDuration || 0,
      });
    } catch {
      // Debug test failed silently
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">اختبار البوت</h1>

      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            إدخال السؤال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اكتب سؤالاً لاختبار البوت..."
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2"
              onKeyDown={(e) => e.key === "Enter" && handleTest()}
            />
            <Button onClick={handleTest} disabled={isLoading || !query.trim()}>
              <Send className="w-4 h-4 ml-2" />
              {isLoading ? "جاري الاختبار..." : "اختبار"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Case Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                نوع القضية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {getCaseTypeLabel(result.caseType)}
              </div>
            </CardContent>
          </Card>

          {/* Confidence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                درجة الثقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {result.confidence.overall}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {result.confidence.message}
                </div>
                <div className="space-y-1">
                  {result.confidence.factors.map((factor, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span>{factor.name}</span>
                      <span>{factor.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Law References */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                المواد القانونية ({result.lawReferences.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {result.lawReferences.map((ref, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-muted/50 text-sm"
                  >
                    <div className="font-medium">
                      المادة {ref.articleNumber} - {ref.lawName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {ref.articleText}
                    </div>
                    <div className="text-xs text-accent mt-1">
                      الصلة: {Math.round(ref.relevance * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trace */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                سجل التنفيذ ({result.totalDuration}ms)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {result.trace.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm p-2 rounded bg-muted/30"
                  >
                    <span>{step.step}</span>
                    <span className="text-muted-foreground">{step.duration}ms</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Answer */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>الإجابة النهائية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {result.answer}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function getCaseTypeLabel(caseType: CaseType): string {
  const labels: Record<CaseType, string> = {
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
  return labels[caseType] || "غير محدد";
}
