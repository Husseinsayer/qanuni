// ===== Iraqi Legal Assistant - Suggested Questions =====
"use client";

import { Lightbulb } from "lucide-react";

type SuggestedQuestionsProps = {
  questions: string[];
  onSelect: (question: string) => void;
};

export function SuggestedQuestions({
  questions,
  onSelect,
}: SuggestedQuestionsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lightbulb className="w-4 h-4" />
        <span>أسئلة مقترحة:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(question)}
            className="text-sm px-3 py-1.5 rounded-full border border-border hover:bg-accent/10 hover:border-accent transition-colors"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
