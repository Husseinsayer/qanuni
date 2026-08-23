"use client";

import { useEffect, useState, useRef } from "react";
import { Mail, Send, Archive, Trash2, Check, X, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MU = { id: string; name: string | null; email: string; image: string | null };
type Msg = {
  id: string; senderId: string; receiverId: string; subject: string;
  content: string; read: boolean; archived: boolean; createdAt: string;
  sender: MU; receiver: MU;
};
type Conv = {
  participantId: string; participantName: string; participantEmail: string;
  participantImage: string | null; lastMessage: Msg; unreadCount: number; messages: Msg[];
};
type Filter = "all" | "unread" | "archived";

export default function MessagesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || "";
  const [convs, setConvs] = useState<Conv[]>([]);
  const [sel, setSel] = useState<Conv | null>(null);
  const [thread, setThread] = useState<Msg[]>([]);
  const [reply, setReply] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState("");
  const [search, setSearch] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchConvs(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread]);

  const fetchConvs = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/messages");
      if (r.ok) { const d = await r.json(); setConvs(d.conversations || []); }
    } catch {}
    setLoading(false);
  };

  const selectConv = async (c: Conv) => {
    setSel(c);
    try {
      const r = await fetch(`/api/messages/conversation?userId=${c.participantId}`);
      if (r.ok) {
        const d = await r.json();
        setThread(d.messages || []);
        if (c.unreadCount > 0) setConvs((p) => p.map((x) => x.participantId === c.participantId ? { ...x, unreadCount: 0 } : x));
      }
    } catch {}
  };

  const sendMsg = async () => {
    if (!sel || !reply.trim() || sending) return;
    setSending(true);
    try {
      const r = await fetch("/api/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: sel.participantId, content: reply.trim() }),
      });
      if (r.ok) { const d = await r.json(); setThread((p) => [...p, d.message]); setReply(""); fetchConvs(); toast("تم إرسال الرد بنجاح"); }
    } catch {}
    setSending(false);
  };

  const archiveConv = async (participantId: string) => {
    if (!sel || sel.participantId !== participantId) return;
    // Archive last message in conversation
    const lastMsg = thread.filter((m) => m.receiverId === userId).pop();
    if (lastMsg) {
      await fetch(`/api/messages/${lastMsg.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
    }
    setSel(null);
    setThread([]);
    fetchConvs();
    toast("تم أرشفة المحادثة");
  };

  const deleteLastMsg = async () => {
    if (!sel || thread.length === 0) return;
    const lastMsg = thread[thread.length - 1];
    if (lastMsg.senderId === userId || lastMsg.receiverId === userId) {
      await fetch(`/api/messages/${lastMsg.id}`, { method: "DELETE" });
    }
    setSel(null);
    setThread([]);
    fetchConvs();
    toast("تم حذف الرسالة");
  };

  const toast = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(""), 2500); };

  const filtered = convs.filter((c) => {
    if (filter === "unread") return c.unreadCount > 0;
    return true;
  }).filter((c) => !search || c.participantName.includes(search) || c.lastMessage.content.includes(search));

  const totalUnread = convs.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">الرسائل</h1>
          <p className="mt-1 text-muted-foreground">{totalUnread > 0 ? `${totalUnread} رسالة غير مقروءة` : "لا توجد رسائل غير مقروءة"}</p>
        </div>
      </div>

      {saved && (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success flex items-center gap-2">
          <Check className="size-4" /> {saved}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..."
              className="w-full rounded-xl border border-border bg-card py-2.5 pr-10 pl-4 text-sm outline-none focus:border-accent" />
          </div>
          <div className="flex gap-1 rounded-xl bg-muted/40 p-1">
            {([["all", "الكل"], ["unread", "غير مقروءة"]] as [Filter, string][]).map(([key, label]) => (
              <button key={key} onClick={() => { setFilter(key); setSel(null); setThread([]); }}
                className={cn("flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  filter === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {label}
                {key === "unread" && totalUnread > 0 && <span className="mr-1.5 rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">{totalUnread}</span>}
              </button>
            ))}
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {loading ? (
              <Card className="border-0 shadow-soft"><CardContent className="py-10 text-center text-muted-foreground">جاري التحميل...</CardContent></Card>
            ) : filtered.length === 0 ? (
              <Card className="border-0 shadow-soft"><CardContent className="py-10 text-center">
                <Mail className="mx-auto mb-3 size-10 text-muted-foreground/30" />
                <p className="font-semibold">لا توجد رسائل</p>
              </CardContent></Card>
            ) : filtered.map((c) => (
              <button key={c.participantId} onClick={() => selectConv(c)}
                className={cn("w-full rounded-xl border border-border p-4 text-right transition-all hover:border-accent/30",
                  sel?.participantId === c.participantId ? "border-accent bg-accent/5" : "bg-card",
                  c.unreadCount > 0 && "border-r-4 border-r-accent")}>
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    c.unreadCount > 0 ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground")}>
                    {c.participantName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm", c.unreadCount > 0 && "font-bold")}>{c.participantName}</p>
                      <span className="text-[10px] text-muted-foreground">{new Date(c.lastMessage.createdAt).toLocaleDateString("ar-IQ")}</span>
                    </div>
                    <p className={cn("mt-0.5 truncate text-xs", c.unreadCount > 0 ? "font-semibold" : "text-muted-foreground")}>{c.lastMessage.content}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          {sel ? (
            <Card className="border-0 shadow-soft h-full flex flex-col">
              <CardContent className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-bold">{sel.participantName.charAt(0)}</div>
                  <div><p className="font-bold">{sel.participantName}</p><p className="text-xs text-muted-foreground">{sel.participantEmail}</p></div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => archiveConv(sel.participantId)} variant="ghost" size="sm" className="gap-1.5 text-xs">
                    <Archive className="size-3.5" /> أرشفة
                  </Button>
                  <Button onClick={deleteLastMsg} variant="ghost" size="sm" className="gap-1.5 text-xs text-danger hover:text-danger">
                    <Trash2 className="size-3.5" /> حذف
                  </Button>
                  <button onClick={() => { setSel(null); setThread([]); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60"><X className="size-4" /></button>
                </div>
              </CardContent>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]">
                {thread.map((m) => {
                  const mine = m.senderId === userId;
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-start" : "justify-end")}>
                      <div className={cn("max-w-[75%] rounded-2xl px-4 py-3", mine ? "bg-muted text-foreground rounded-br-sm" : "bg-accent text-white rounded-bl-sm")}>
                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                        <p className={cn("mt-1 text-[10px]", mine ? "text-muted-foreground" : "text-white/60")}>
                          {new Date(m.createdAt).toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" })}
                          {m.read && mine && <span className="mr-1">&#10003;&#10003;</span>}
                          {!m.read && mine && <span className="mr-1">&#10003;</span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <input value={reply} onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMsg()}
                    placeholder="اكتب ردك هنا..." disabled={sending}
                    className="flex-1 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm outline-none focus:border-accent" />
                  <Button onClick={sendMsg} disabled={sending || !reply.trim()} variant="accent" className="gap-2">
                    <Send className="size-4" /> {sending ? "جاري..." : "إرسال"}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-0 shadow-soft h-full"><CardContent className="py-16 text-center">
              <Mail className="mx-auto mb-4 size-14 text-muted-foreground/20" />
              <p className="text-xl font-semibold">اختر رسالة للعرض</p>
              <p className="mt-1 text-sm text-muted-foreground">اضغط على أي محادثة لعرضها والرد عليها</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
