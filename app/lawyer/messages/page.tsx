"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail, MailOpen, Send, Archive, Ban, Trash2, Reply,
  ChevronLeft, Check, X, Search, AlertCircle, User as UserIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getMyMessages, sendReply, archiveMessage,
  markMessageRead, blockUser, seedLawyerDemoData,
  type Message,
} from "@/lib/lawyer-profiles";
import { getUserSession } from "@/lib/user-auth";

type Filter = "all" | "unread" | "archived";

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saved, setSaved] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  useEffect(() => {
    const s = getUserSession();
    if (!s || s.role !== "lawyer") { router.push("/auth/login"); return; }
    seedLawyerDemoData();
    refreshMessages();
  }, [router]);

  const refreshMessages = () => {
    const msgs = getMyMessages();
    setMessages(msgs);
    const blocked = [...new Set(msgs.filter((m) => m.blocked).map((m) => m.fromEmail))];
    setBlockedUsers(blocked);
  };

  const filteredMessages = messages.filter((m) => {
    if (filter === "unread") return !m.read && !m.archived;
    if (filter === "archived") return m.archived;
    return !m.archived;
  });

  const unreadCount = messages.filter((m) => !m.read && !m.archived).length;

  const handleSelect = (msg: Message) => {
    setSelectedMsg(msg);
    if (!msg.read) {
      markMessageRead(msg.id);
      refreshMessages();
    }
    setReplyText(msg.replied && msg.replyBody ? msg.replyBody : "");
  };

  const handleSendReply = () => {
    if (!selectedMsg || !replyText.trim()) return;
    sendReply(selectedMsg.id, replyText.trim());
    refreshMessages();
    setSaved("تم إرسال الرد بنجاح ✓");
    setTimeout(() => setSaved(""), 2500);
  };

  const handleArchive = (id: string) => {
    archiveMessage(id);
    refreshMessages();
    if (selectedMsg?.id === id) setSelectedMsg(null);
    setSaved("تم أرشفة الرسالة ✓");
    setTimeout(() => setSaved(""), 2000);
  };

  const handleBlock = (id: string) => {
    blockUser(id);
    refreshMessages();
    const wasBlocked = messages.find((m) => m.id === id)?.blocked;
    setSaved(wasBlocked ? "تم إلغاء حظر المستخدم ✓" : "تم حظر المستخدم ✓");
    setTimeout(() => setSaved(""), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">الرسائل</h1>
          <p className="mt-1 text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} رسالة غير مقروءة` : "لا توجد رسائل غير مقروءة"}
          </p>
        </div>
      </div>

      {saved && (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success flex items-center gap-2">
          <Check className="size-4" /> {saved}
        </div>
      )}

      {showBlocked && blockedUsers.length > 0 && (
        <Card className="border-0 shadow-soft border border-danger/20 bg-danger/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Ban className="size-4 text-danger" />
              <span className="font-medium">المستخدمون المحظورون:</span>
              {blockedUsers.map((email) => (
                <span key={email} dir="ltr" className="rounded-lg bg-danger/10 px-2.5 py-1 text-xs text-danger">{email}</span>
              ))}
            </div>
            <button onClick={() => setShowBlocked(false)} className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Inbox */}
        <div className="space-y-3">
          {/* Filter Tabs */}
          <div className="flex gap-1 rounded-xl bg-muted/40 p-1">
            {([["all", "الكل"], ["unread", "غير مقروءة"], ["archived", "مؤرشفة"]] as [Filter, string][]).map(([key, label]) => (
              <button key={key} onClick={() => { setFilter(key); setSelectedMsg(null); }}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  filter === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>
                {label}
                {key === "unread" && unreadCount > 0 && (
                  <span className="mr-1.5 rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <Card className="border-0 shadow-soft">
                <CardContent className="py-10 text-center">
                  <Mail className="mx-auto mb-3 size-10 text-muted-foreground/30" />
                  <p className="text-lg font-semibold">لا توجد رسائل</p>
                  <p className="text-sm text-muted-foreground">
                    {filter === "unread" ? "كل الرسائل مقروءة" : filter === "archived" ? "لا توجد رسائل مؤرشفة" : "صندوق الوارد فارغ"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredMessages.map((msg) => (
                <button key={msg.id} onClick={() => handleSelect(msg)}
                  className={cn(
                    "w-full rounded-xl border border-border p-4 text-right transition-all hover:border-accent/30 text-right",
                    selectedMsg?.id === msg.id ? "border-accent bg-accent/5" : "bg-card",
                    !msg.read && "border-r-4 border-r-accent"
                  )}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        msg.read ? "bg-muted text-muted-foreground" : "bg-accent/10 text-accent"
                      )}>
                        {msg.fromName.charAt(0)}
                      </div>
                      <div className="min-w-0 text-right">
                        <p className={cn("truncate text-sm", !msg.read && "font-bold")}>{msg.fromName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(msg.date).toLocaleDateString("ar-IQ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {msg.blocked && <Ban className="size-3.5 text-danger" />}
                      {msg.archived && <Archive className="size-3.5 text-muted-foreground" />}
                      {msg.replied && <Reply className="size-3.5 text-success" />}
                    </div>
                  </div>
                  <p className={cn("mt-2 truncate text-sm", !msg.read ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    {msg.subject}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{msg.body}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div>
          {selectedMsg ? (
            <Card className="border-0 shadow-soft h-full">
              <CardContent className="p-5 space-y-5">
                {/* Actions Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex gap-2">
                    <Button onClick={() => handleArchive(selectedMsg.id)} variant="ghost" size="sm" className="gap-1.5 text-xs">
                      <Archive className="size-3.5" />
                      {selectedMsg.archived ? "إلغاء الأرشفة" : "أرشفة"}
                    </Button>
                    <Button onClick={() => handleBlock(selectedMsg.id)} variant="ghost" size="sm" className="gap-1.5 text-xs">
                      <Ban className="size-3.5" />
                      {selectedMsg.blocked ? "إلغاء الحظر" : "حظر المستخدم"}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs"
                      onClick={() => { setSaved("تم حذف الرسالة"); setTimeout(() => setSaved(""), 2000); }}>
                      <Trash2 className="size-3.5" />
                      حذف
                    </Button>
                  </div>
                  <button onClick={() => setSelectedMsg(null)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60">
                    <X className="size-4" />
                  </button>
                </div>

                {/* Sender Info */}
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent font-bold text-lg">
                    {selectedMsg.fromName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{selectedMsg.fromName}</p>
                    <p className="text-sm text-muted-foreground" dir="ltr">{selectedMsg.fromEmail}</p>
                    {selectedMsg.fromPhone && (
                      <p className="text-sm text-muted-foreground" dir="ltr">{selectedMsg.fromPhone}</p>
                    )}
                  </div>
                  {selectedMsg.blocked && (
                    <span className="mr-auto rounded-lg bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger flex items-center gap-1">
                      <Ban className="size-3" /> محظور
                    </span>
                  )}
                </div>

                {/* Subject & Body */}
                <div>
                  <h3 className="text-lg font-bold">{selectedMsg.subject}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(selectedMsg.date).toLocaleString("ar-IQ")}
                  </p>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedMsg.body}</p>

                {/* Reply Section */}
                <div className="border-t border-border pt-4 space-y-3">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Send className="size-4 text-accent" />
                    {selectedMsg.replied ? "إعادة الرد" : "الرد على الرسالة"}
                  </p>
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={5}
                    className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-y"
                    placeholder="اكتب ردك هنا..." />
                  <div className="flex gap-2">
                    <Button onClick={handleSendReply} variant="accent" className="gap-2">
                      <Send className="size-4" /> إرسال الرد
                    </Button>
                    <Button onClick={() => { handleArchive(selectedMsg.id); }}
                      variant="outline" className="gap-2">
                      <Archive className="size-4" /> أرشفة بدون رد
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-soft h-full">
              <CardContent className="py-16 text-center">
                <Mail className="mx-auto mb-4 size-14 text-muted-foreground/20" />
                <p className="text-xl font-semibold">اختر رسالة للعرض</p>
                <p className="mt-1 text-sm text-muted-foreground">اضغط على أي رسالة من القائمة لعرض تفاصيلها والرد عليها</p>

                {blockedUsers.length > 0 && (
                  <div className="mt-8">
                    <button onClick={() => setShowBlocked(!showBlocked)}
                      className="inline-flex items-center gap-2 rounded-lg bg-danger/10 px-4 py-2 text-sm text-danger hover:bg-danger/20 transition-colors">
                      <Ban className="size-4" />
                      عرض المستخدمين المحظورين ({blockedUsers.length})
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
