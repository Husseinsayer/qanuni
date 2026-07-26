// ===== Iraqi Legal Assistant - Questions Admin Page =====
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getQuestions, setQuestions } from "@/lib/ai/settings-store";
import type { Question, CaseType } from "@/lib/ai/types";
import { Plus, Save, Trash2, Edit } from "lucide-react";
import { toast } from "@/lib/admin-toast";

const caseTypes: { value: CaseType; label: string }[] = [
  { value: "personal", label: "الأحوال الشخصية" },
  { value: "real_estate", label: "العقارات" },
  { value: "criminal", label: "الجنائية" },
  { value: "labor", label: "قانون العمل" },
  { value: "civil", label: "المدني" },
  { value: "commercial", label: "التجاري" },
  { value: "traffic", label: "المرور" },
  { value: "companies", label: "الشركات" },
  { value: "investment", label: "الاستثمار" },
];

export default function QuestionsPage() {
  const [questions, setQuestionsState] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Question>>({});

  useEffect(() => {
    setQuestionsState(getQuestions());
  }, []);

  const handleSave = () => {
    setQuestions(questions);
    toast.success("تم الحفظ", "تم حفظ الأسئلة بنجاح");
  };

  const handleAdd = () => {
    const newQuestion: Question = {
      id: `question_${Date.now()}`,
      text: "سؤال جديد",
      caseType: "personal",
      category: "عام",
      required: true,
      priority: questions.length + 1,
    };
    setQuestionsState([...questions, newQuestion]);
    setEditingId(newQuestion.id);
    setEditData(newQuestion);
  };

  const handleDelete = (id: string) => {
    setQuestionsState(questions.filter((q) => q.id !== id));
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditData(question);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editData) return;
    setQuestionsState(
      questions.map((q) => (q.id === editingId ? { ...q, ...editData } : q))
    );
    setEditingId(null);
    setEditData({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة الأسئلة</h1>
        <div className="flex gap-2">
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة سؤال
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 ml-2" />
            حفظ
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{question.text}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(question)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(question.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingId === question.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">السؤال</label>
                    <input
                      type="text"
                      value={editData.text || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, text: e.target.value })
                      }
                      className="w-full rounded-xl border border-border bg-background px-4 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        نوع القضية
                      </label>
                      <select
                        value={editData.caseType || "personal"}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            caseType: e.target.value as CaseType,
                          })
                        }
                        className="w-full rounded-xl border border-border bg-background px-4 py-2"
                      >
                        {caseTypes.map((ct) => (
                          <option key={ct.value} value={ct.value}>
                            {ct.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        الفئة
                      </label>
                      <input
                        type="text"
                        value={editData.category || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, category: e.target.value })
                        }
                        className="w-full rounded-xl border border-border bg-background px-4 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editData.required || false}
                        onChange={(e) =>
                          setEditData({ ...editData, required: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="text-sm">إلزامي</span>
                    </label>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        الأولوية
                      </label>
                      <input
                        type="number"
                        value={editData.priority || 1}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            priority: parseInt(e.target.value),
                          })
                        }
                        className="w-20 rounded-xl border border-border bg-background px-4 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit}>حفظ</Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="px-2 py-0.5 rounded bg-accent/10 text-accent">
                    {caseTypes.find((ct) => ct.value === question.caseType)?.label}
                  </span>
                  <span>{question.category}</span>
                  {question.required && (
                    <span className="text-red-500">إلزامي</span>
                  )}
                  <span>الأولوية: {question.priority}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
