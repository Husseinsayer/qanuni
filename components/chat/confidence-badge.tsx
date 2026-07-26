// ===== Iraqi Legal Assistant - Confidence Badge =====
"use client";

import type { ConfidenceScore } from "@/lib/ai/types";
import { getConfidenceColor } from "@/lib/ai/scoring/confidence";
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle } from "lucide-react";

type ConfidenceBadgeProps = {
  confidence: ConfidenceScore;
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const colorClass = getConfidenceColor(confidence.level);

  const icons = {
    high: <ShieldCheck className="w-4 h-4" />,
    medium: <ShieldAlert className="w-4 h-4" />,
    low: <AlertTriangle className="w-4 h-4" />,
    very_low: <ShieldX className="w-4 h-4" />,
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
    >
      {icons[confidence.level]}
      <span>الثقة: {confidence.overall}%</span>
    </div>
  );
}
