// ===== Iraqi Legal Assistant - Conversations History =====
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConversations, deleteConversation } from "@/lib/ai/settings-store";
import type { Conversation } from "@/lib/ai/types";
import { Search, Trash2, MessageSquare, Star } from "lucide-react";
import { toast } from "@/lib/admin-toast";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  useEffect(() => {
    setConversations(getConversations());
  }, []);

  const filtered = conversations.filter(
    (c) =>
      c.title.includes(search) ||
      c.messages.some((m) => m.content.includes(search))
  );

  const handleDelete = (id: string) => {
    deleteConversation(id);
    setConversations(getConversations());
    toast.success("تم الحذف", "تم حذف المحادثة بنجاح");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">سجل المحادثات</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{conversations.length}</div>
            <div className="text-sm text-muted-foreground">إجمالي المحادثات</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {conversations.reduce((sum, c) => sum + c.messages.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">إجمالي الرسائل</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {conversations.filter((c) => c.rating).length}
            </div>
            <div className="text-sm text-muted-foreground">محادثات مقيّمة</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {conversations.filter((c) => c.status === "active").length}
            </div>
            <div className="text-sm text-muted-foreground">محادثات نشطة</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث في المحادثات..."
          className="w-full rounded-xl border border-border bg-background pr-10 pl-4 py-2"
        />
      </div>

      {/* Conversations List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {filtered.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                selectedConv?.id === conv.id
                  ? "border-accent bg-accent/5"
                  : "border-border hover:bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{conv.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(conv.updatedAt)}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <MessageSquare className="w-3 h-3" />
                    {conv.messages.length} رسالة
                    {conv.rating && (
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3" fill="currentColor" />
                        {conv.rating}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(conv.id);
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد محادثات
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selectedConv ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedConv.title}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {formatDate(selectedConv.createdAt)} -{" "}
                  {selectedConv.messages.length} رسالة
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {selectedConv.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-xl ${
                          msg.role === "user"
                            ? "bg-accent text-white rounded-tr-sm"
                            : "bg-muted border border-border rounded-tl-sm"
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">
                          {msg.content}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {formatDate(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>اختر محادثة لعرض التفاصيل</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
