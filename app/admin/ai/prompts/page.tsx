// ===== Iraqi Legal Assistant - Prompts Admin Page =====
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getSystemPrompts,
  setSystemPrompts,
} from "@/lib/ai/settings-store";
import type { SystemPrompt } from "@/lib/ai/types";
import { Plus, Save, Trash2, Edit } from "lucide-react";
import { toast } from "@/lib/admin-toast";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    setPrompts(getSystemPrompts());
  }, []);

  const handleSave = () => {
    setSystemPrompts(prompts);
    toast.success("تم الحفظ", "تم حفظ البرومبتات بنجاح");
  };

  const handleAdd = () => {
    const newPrompt: SystemPrompt = {
      id: `prompt_${Date.now()}`,
      name: "برومبت جديد",
      content: "",
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setPrompts([...prompts, newPrompt]);
    setEditingId(newPrompt.id);
    setEditContent(newPrompt.content);
  };

  const handleDelete = (id: string) => {
    if (prompts.find((p) => p.id === id)?.isDefault) {
      toast.error("خطأ", "لا يمكن حذف البرومبت الافتراضي");
      return;
    }
    setPrompts(prompts.filter((p) => p.id !== id));
  };

  const handleEdit = (prompt: SystemPrompt) => {
    setEditingId(prompt.id);
    setEditContent(prompt.content);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    setPrompts(
      prompts.map((p) =>
        p.id === editingId
          ? { ...p, content: editContent, updatedAt: Date.now() }
          : p
      )
    );
    setEditingId(null);
    setEditContent("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة البرومبت</h1>
        <div className="flex gap-2">
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة برومبت
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 ml-2" />
            حفظ
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {prompts.map((prompt) => (
          <Card key={prompt.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {prompt.name}
                  {prompt.isDefault && (
                    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">
                      افتراضي
                    </span>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(prompt)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!prompt.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(prompt.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingId === prompt.id ? (
                <div className="space-y-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-64 rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm"
                    dir="ltr"
                  />
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
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground max-h-40 overflow-y-auto">
                  {prompt.content}
                </pre>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
