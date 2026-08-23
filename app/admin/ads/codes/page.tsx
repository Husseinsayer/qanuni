"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Code2,
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
  Globe,
  Shield,
  Copy,
} from "lucide-react";
import {
  getAdminData,
  saveAdminData,
  type AdminAdSenseConfig,
  type AdminHtmlCode,
  pushActivityLog,
} from "@/lib/admin-data";

export default function AdCodesPage() {
  const [data, setData] = useState(getAdminData);
  const [tab, setTab] = useState<"adsense" | "html" | "scripts">("adsense");
  const [editingCode, setEditingCode] = useState<AdminHtmlCode | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const saveAdSense = useCallback((config: Partial<AdminAdSenseConfig>) => {
    const updated = { ...data.adsense, ...config };
    saveAdminData({ ...data, adsense: updated });
    setData({ ...data, adsense: updated });
  }, [data]);

  const saveHtmlCode = useCallback((code: AdminHtmlCode) => {
    const exists = data.htmlCodes.find((c) => c.id === code.id);
    const htmlCodes = exists ? data.htmlCodes.map((c) => (c.id === code.id ? code : c)) : [...data.htmlCodes, code];
    saveAdminData({ ...data, htmlCodes });
    setData({ ...data, htmlCodes });
    setShowModal(false);
    setEditingCode(null);
    pushActivityLog({ entity: "html", entityId: code.id, actor: "المشرف", action: exists ? "update" : "create", newValues: code });
  }, [data]);

  const deleteCode = useCallback((id: string) => {
    const code = data.htmlCodes.find((c) => c.id === id);
    if (code) pushActivityLog({ entity: "html", entityId: id, actor: "المشرف", action: "delete", oldValues: code });
    const htmlCodes = data.htmlCodes.filter((c) => c.id !== id);
    saveAdminData({ ...data, htmlCodes });
    setData({ ...data, htmlCodes });
  }, [data]);

  const toggleCode = useCallback((id: string) => {
    const htmlCodes = data.htmlCodes.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c));
    saveAdminData({ ...data, htmlCodes });
    setData({ ...data, htmlCodes });
  }, [data]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">أكواد الإعلانات</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة AdSense وأكواد HTML وأكواد الجهات الخارجية</p>
        </div>
        <Link href="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />العودة
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {([
          { key: "adsense" as const, label: "AdSense", icon: Shield },
          { key: "html" as const, label: "أكواد HTML", icon: Code2 },
          { key: "scripts" as const, label: "أكواد الجهات الخارجية", icon: Globe },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* AdSense Config */}
      {tab === "adsense" && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">إعدادات AdSense</h2>
              <button
                onClick={() => saveAdSense({ enabled: !data.adsense.enabled })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  data.adsense.enabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                }`}
              >
                {data.adsense.enabled ? <><Check className="w-4 h-4" />مفعّل</> : <><X className="w-4 h-4" />معطّل</>}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">رقم الناشر (Publisher ID)</label>
                <input
                  value={data.adsense.publisherId}
                  onChange={(e) => saveAdSense({ publisherId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-mono"
                  placeholder="pub-XXXXXXXXXXXXXXXX"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Auto Ads</label>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => saveAdSense({ autoAdsEnabled: !data.adsense.autoAdsEnabled })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${data.adsense.autoAdsEnabled ? "bg-primary" : "bg-muted"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${data.adsense.autoAdsEnabled ? "right-0.5" : "right-[22px]"}`} />
                  </button>
                  <span className="text-sm">{data.adsense.autoAdsEnabled ? "مفعّل" : "معطّل"}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">كود التحقق</label>
              <textarea
                value={data.adsense.verificationCode}
                onChange={(e) => saveAdSense({ verificationCode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-mono min-h-[80px]"
                dir="ltr"
                placeholder='<meta name="google-site-verification" content="..." />'
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">كود Auto Ads الكامل</label>
              <textarea
                value={data.adsense.autoAdsCode}
                onChange={(e) => saveAdSense({ autoAdsCode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-mono min-h-[120px]"
                dir="ltr"
                placeholder='<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX"></script>'
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الصفحات المفعّلة</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(data.adsense.pages).map(([page, enabled]) => (
                  <label key={page} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${enabled ? "border-primary bg-primary/5" : "border-border"}`}>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => saveAdSense({ pages: { ...data.adsense.pages, [page]: e.target.checked } })}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {({ home: "الرئيسية", articles: "المقالات", categories: "التصنيفات", search: "البحث", lawyers: "المحامون", laws: "القوانين", services: "الخدمات", contact: "اتصل بنا" } as Record<string, string>)[page]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HTML Codes */}
      {tab === "html" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{data.htmlCodes.length} أكواد مسجلة</p>
            <button
              onClick={() => { setEditingCode({ id: `code-${Date.now()}`, name: "", code: "", enabled: true, location: "" }); setShowModal(true); }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />كود جديد
            </button>
          </div>

          {data.htmlCodes.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
              <Code2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>لا توجد أكواد HTML بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.htmlCodes.map((code) => (
                <div key={code.id} className={`rounded-xl border bg-card p-4 ${code.enabled ? "" : "opacity-60"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{code.name}</h3>
                        {!code.enabled && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">معطّل</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{code.location}</p>
                      <div className="mt-2 relative">
                        <pre className="bg-muted/50 rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-32" dir="ltr">{code.code}</pre>
                        <button
                          onClick={() => copyToClipboard(code.code, code.id)}
                          className="absolute top-2 left-2 p-1.5 rounded-md bg-background/80 hover:bg-background border text-xs"
                        >
                          {copied === code.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => { setEditingCode(code); setShowModal(true); }} className="p-1.5 rounded-md hover:bg-muted" title="تعديل"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => toggleCode(code.id)} className="p-1.5 rounded-md hover:bg-muted" title={code.enabled ? "تعطيل" : "تفعيل"}>
                        {code.enabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => deleteCode(code.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive" title="حذف"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Third-party Scripts */}
      {tab === "scripts" && (
        <div className="space-y-4">
          {[
            { name: "Media.net", desc: "شبكة إعلانية بديلة لـ AdSense", url: "www.media.net" },
            { name: "Ezoic", desc: "منصة تحسين الإيرادات بالإعلانات", url: "www.ezoic.com" },
            { name: "Amazon Associates", desc: "برنامج تسويق بالعمولة من أمازون", url: "affiliate-program.amazon.com" },
            { name: "Carbon Ads", desc: "إعلانات للمطورين والمتخصصين", url: "carbonads.net" },
            { name: "EthicalAds", desc: "إعلانات للمطورين والمكتبات المفتوحة", url: "ethicalads.io" },
          ].map((svc) => {
            const existing = data.htmlCodes.find((c) => c.name === svc.name);
            return (
              <div key={svc.name} className="rounded-xl border bg-card p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-sm">{svc.name}</h3>
                  <p className="text-xs text-muted-foreground">{svc.desc}</p>
                </div>
                {existing ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" />مضاف</span>
                    <button onClick={() => deleteCode(existing.id)} className="text-xs text-destructive hover:underline">إزالة</button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const newCode: AdminHtmlCode = {
                        id: `code-${Date.now()}`,
                        name: svc.name,
                        code: `<!-- ${svc.name} Script -->\n<script src="https://${svc.url}/script.js"></script>`,
                        enabled: false,
                        location: `أكواد ${svc.name}`,
                      };
                      saveHtmlCode(newCode);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    + إضافة
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* HTML Code Modal */}
      {showModal && editingCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setShowModal(false); setEditingCode(null); }}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingCode.name ? `تعديل: ${editingCode.name}` : "كود جديد"}</h2>
              <button onClick={() => { setShowModal(false); setEditingCode(null); }} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">الاسم</label>
                  <input value={editingCode.name} onChange={(e) => setEditingCode({ ...editingCode, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الموقع</label>
                  <input value={editingCode.location} onChange={(e) => setEditingCode({ ...editingCode, location: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background text-sm" placeholder="مثال: الفوتر" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الكود</label>
                <textarea
                  value={editingCode.code}
                  onChange={(e) => setEditingCode({ ...editingCode, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-mono min-h-[200px]"
                  dir="ltr"
                />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editingCode.enabled} onChange={(e) => setEditingCode({ ...editingCode, enabled: e.target.checked })} className="rounded" />
                <span className="text-sm">مفعّل</span>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowModal(false); setEditingCode(null); }} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">إلغاء</button>
              <button onClick={() => saveHtmlCode(editingCode)} disabled={!editingCode.name.trim() || !editingCode.code.trim()} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
