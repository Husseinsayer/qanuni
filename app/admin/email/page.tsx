"use client";

import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail, Settings, Shield, Inbox,
  Save, RotateCcw, Send, Eye, EyeOff, Lock,
  CheckCircle2, AlertTriangle, Download, Upload,
  Bell, Zap, Globe, Server, Key,
  Activity, RotateCw, Database,
} from "lucide-react";
import {
  getEmailSettings, saveEmailSettings, sendTestEmail,
  exportEmailSettings, importEmailSettings, resetEmailSettings,
  defaultSettings, type EmailSettings, type GeneralEmailSettings,
  type SmtpSettings, type AuthSettings, type SecuritySettings,
  type QueueSettings, type AdvancedSettings, type NotificationSettings,
  type CaptchaSettings, type RateLimitSettings,
} from "@/lib/email-settings";
import { toast } from "@/lib/admin-toast";
import { cn } from "@/lib/utils";

type Tab = "general" | "smtp" | "security" | "queue" | "captcha" | "advanced" | "notifications" | "backup";

const tabs: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "general", label: "عام", icon: Settings },
  { key: "smtp", label: "SMTP", icon: Server },
  { key: "security", label: "الأمان", icon: Shield },
  { key: "queue", label: "القائمة", icon: Inbox },
  { key: "captcha", label: "CAPTCHA", icon: Lock },
  { key: "advanced", label: "متقدم", icon: Zap },
  { key: "notifications", label: "الإشعارات", icon: Bell },
  { key: "backup", label: "النسخ الاحتياطي", icon: Database },
];

function Toggle({ label, desc, on, onToggle }: { label: string; desc?: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex-1">
        <p className="font-semibold text-sm">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <button type="button" role="switch" aria-checked={on} onClick={onToggle}
        className={cn("relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors", on ? "bg-accent" : "bg-muted")}>
        <span className={cn("pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform", on ? "translate-x-0" : "-translate-x-5")} />
      </button>
    </div>
  );
}

function Field({ label, children, tooltip }: { label: string; children: React.ReactNode; tooltip?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <label className="mb-1.5 block text-sm font-semibold">{label}</label>
        {tooltip && <span className="group relative">
          <span className="cursor-help text-muted-foreground text-xs">ⓘ</span>
          <span className="absolute bottom-full right-0 mb-2 hidden w-56 rounded-lg border bg-popover p-2 text-xs text-popover-foreground shadow-md group-hover:block z-50">{tooltip}</span>
        </span>}
      </div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", dir }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; dir?: "ltr" | "rtl" }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} dir={dir}
    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />;
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)}
    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent">
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>;
}

/* ═══════════════════════════
   GENERAL TAB
   ═══════════════════════════ */
function GeneralTab({ settings, update }: { settings: EmailSettings; update: <K extends keyof EmailSettings>(s: K, d: EmailSettings[K]) => void }) {
  const g = settings.general;
  const set = (k: keyof GeneralEmailSettings, v: any) => update("general", { ...g, [k]: v });
  return (
    <div className="space-y-6">
      <Toggle label="تفعيل نظام البريد الإلكتروني" desc="تشغيل/إيقاف جميع عمليات إرسال البريد" on={g.enabled} onToggle={() => set("enabled", !g.enabled)} />
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="size-4 text-accent" /> الإعدادات العامة</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="البريد الإلكتروني (Mail Driver)" tooltip="نظام إرسال البريد المستخدم">
            <Select value={g.mailDriver} onChange={(v) => set("mailDriver", v)} options={[
              { value: "smtp", label: "SMTP" }, { value: "sendmail", label: "Sendmail" },
              { value: "mailgun", label: "Mailgun" }, { value: "ses", label: "Amazon SES" },
              { value: "postmark", label: "Postmark" }, { value: "resend", label: "Resend" },
              { value: "brevo", label: "Brevo (Sendinblue)" }, { value: "custom", label: "SMTP مخصص" },
            ]} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="اسم المُرسل الافتراضي (From Name)">
              <Input value={g.fromName} onChange={(v) => set("fromName", v)} placeholder="قانوني" />
            </Field>
            <Field label="بريد المُرسل الافتراضي (From Email)">
              <Input value={g.fromEmail} onChange={(v) => set("fromEmail", v)} placeholder="noreply@iqlegal.example" dir="ltr" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="بريد الرد (Reply-To Email)">
              <Input value={g.replyToEmail} onChange={(v) => set("replyToEmail", v)} placeholder="support@iqlegal.example" dir="ltr" />
            </Field>
            <Field label="اسم الرد (Reply-To Name)">
              <Input value={g.replyToName} onChange={(v) => set("replyToName", v)} placeholder="فريق الدعم" />
            </Field>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════
   SMTP TAB
   ═══════════════════════════ */
function SmtpTab({ settings, update }: { settings: EmailSettings; update: <K extends keyof EmailSettings>(s: K, d: EmailSettings[K]) => void }) {
  const s = settings.smtp;
  const set = (k: keyof SmtpSettings, v: any) => update("smtp", { ...s, [k]: v });
  const [showPass, setShowPass] = useState(false);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Server className="size-4 text-accent" /> إعدادات SMTP</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SMTP Host" tooltip="عنوان خادم البريد الإلكتروني">
              <Input value={s.host} onChange={(v) => set("host", v)} placeholder="smtp.gmail.com" dir="ltr" />
            </Field>
            <Field label="SMTP Port" tooltip="منفذ الاتصال (عادة 587 أو 465)">
              <input type="number" value={s.port} onChange={(e) => set("port", +e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="اسم المستخدم (Username)">
              <Input value={s.username} onChange={(v) => set("username", v)} dir="ltr" />
            </Field>
            <Field label="كلمة المرور (Password)">
              <div className="relative">
                <Input value={s.password} onChange={(v) => set("password", v)} type={showPass ? "text" : "password"} dir="ltr" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
          </div>
          <Field label="نوع التشفير (Encryption)">
            <Select value={s.encryption} onChange={(v) => set("encryption", v)} options={[
              { value: "none", label: "بدون" }, { value: "ssl", label: "SSL" },
              { value: "tls", label: "TLS" }, { value: "starttls", label: "STARTTLS" },
            ]} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="مهلة الاتصال (ثانية)">
              <input type="number" value={s.timeout} onChange={(e) => set("timeout", +e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
            </Field>
            <Field label="الحد الأقصى للاتصالات">
              <input type="number" value={s.maxConnections} onChange={(e) => set("maxConnections", +e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
            </Field>
            <Field label="الحد الأقصى/دقيقة">
              <input type="number" value={s.maxEmailsPerMinute} onChange={(e) => set("maxEmailsPerMinute", +e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="الحد الأقصى/ساعة">
              <input type="number" value={s.maxEmailsPerHour} onChange={(e) => set("maxEmailsPerHour", +e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
            </Field>
            <Field label="عدد المحاولات">
              <input type="number" value={s.retryCount} onChange={(e) => set("retryCount", +e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
            </Field>
            <Field label="تأخير إعادة المحاولة (ثانية)">
              <input type="number" value={s.retryDelay} onChange={(e) => set("retryDelay", +e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
            </Field>
          </div>
          <Toggle label="الحفاظ على الاتصال (Keep Alive)" on={s.keepAlive} onToggle={() => set("keepAlive", !s.keepAlive)} />
        </CardContent>
      </Card>

      {/* Test Email */}
      <TestEmailSection />
    </div>
  );
}

/* ═══════════════════════════
   AUTH TAB
   ═══════════════════════════ */
function SecurityTab({ settings, update }: { settings: EmailSettings; update: <K extends keyof EmailSettings>(s: K, d: EmailSettings[K]) => void }) {
  const auth = settings.auth;
  const sec = settings.security;
  const setAuth = (k: keyof AuthSettings, v: any) => update("auth", { ...auth, [k]: v });
  const setSec = (k: keyof SecuritySettings, v: any) => update("security", { ...sec, [k]: v });
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Key className="size-4 text-accent" /> المصادقة</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Toggle label="مصادقة SMTP" desc="استخدام اسم مستخدم وكلمة مرور SMTP" on={auth.smtpAuth} onToggle={() => setAuth("smtpAuth", !auth.smtpAuth)} />
          <Toggle label="استخدام OAuth2" desc="المصادقة عبر OAuth2 بدلاً من كلمة المرور" on={auth.useOAuth2} onToggle={() => setAuth("useOAuth2", !auth.useOAuth2)} />
          <Toggle label="السماح بشهادات SSL ذاتية التوقيع" on={auth.allowSelfSigned} onToggle={() => setAuth("allowSelfSigned", !auth.allowSelfSigned)} />
          <Toggle label="التحقق من شهادة SSL" on={auth.verifySsl} onToggle={() => setAuth("verifySsl", !auth.verifySsl)} />
          <Toggle label="التحقق من اسم المضيف" on={auth.verifyHostname} onToggle={() => setAuth("verifyHostname", !auth.verifyHostname)} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="size-4 text-accent" /> أمان البريد الإلكتروني</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Toggle label="تفعيل DKIM" desc="توقيع البريد الإلكتروني رقمياً" on={sec.dkimEnabled} onToggle={() => setSec("dkimEnabled", !sec.dkimEnabled)} />
          {sec.dkimEnabled && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="DKIM Selector">
                <Input value={sec.dkimSelector} onChange={(v) => setSec("dkimSelector", v)} />
              </Field>
              <Field label="DKIM Private Key">
                <textarea value={sec.dkimPrivateKey} onChange={(e) => setSec("dkimPrivateKey", e.target.value)} rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono outline-none focus:border-accent" dir="ltr" />
              </Field>
            </div>
          )}
          <Toggle label="التحقق من SPF" on={sec.spfValidation} onToggle={() => setSec("spfValidation", !sec.spfValidation)} />
          <Toggle label="تفعيل DMARC" on={sec.dmarcEnabled} onToggle={() => setSec("dmarcEnabled", !sec.dmarcEnabled)} />
          <Toggle label="معالجة الرسائل المرتدّة (Bounce Handling)" on={sec.bounceHandling} onToggle={() => setSec("bounceHandling", !sec.bounceHandling)} />
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════
   QUEUE TAB
   ═══════════════════════════ */
function QueueTab({ settings, update }: { settings: EmailSettings; update: <K extends keyof EmailSettings>(s: K, d: EmailSettings[K]) => void }) {
  const q = settings.queue;
  const r = settings.rateLimit;
  const setQ = (k: keyof QueueSettings, v: any) => update("queue", { ...q, [k]: v });
  const setR = (k: keyof RateLimitSettings, v: any) => update("rateLimit", { ...r, [k]: v });
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Inbox className="size-4 text-accent" /> إعدادات القائمة</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Toggle label="تفعيل قائمة البريد" desc="إرسال البريد عبر قائمة انتظار" on={q.enabled} onToggle={() => setQ("enabled", !q.enabled)} />
          {q.enabled && (
            <>
              <Field label="محرك القائمة">
                <Select value={q.driver} onChange={(v) => setQ("driver", v)} options={[
                  { value: "sync", label: "مباشر (Sync)" }, { value: "database", label: "قاعدة البيانات" },
                  { value: "redis", label: "Redis" },
                ]} />
              </Field>
              <Toggle label="إعادة محاولة الإرسال الفاشل" on={q.retryFailed} onToggle={() => setQ("retryFailed", !q.retryFailed)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="الحد الأقصى للمحاولات">
                  <input type="number" value={q.maxRetries} onChange={(e) => setQ("maxRetries", +e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
                </Field>
                <Field label="تأخير إعادة المحاولة (ثانية)">
                  <input type="number" value={q.retryDelay} onChange={(e) => setQ("retryDelay", +e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
                </Field>
              </div>
              <Toggle label="إرسال في الخلفية" on={q.backgroundSend} onToggle={() => setQ("backgroundSend", !q.backgroundSend)} />
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="size-4 text-accent" /> حدود المعدل (Rate Limit)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الحد الأقصى لكل مستخدم">
              <input type="number" value={r.maxPerUser} onChange={(e) => setR("maxPerUser", +e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
            </Field>
            <Field label="الحد الأقصى لكل IP">
              <input type="number" value={r.maxPerIp} onChange={(e) => setR("maxPerIp", +e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="الحد اليومي">
              <input type="number" value={r.dailyLimit} onChange={(e) => setR("dailyLimit", +e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
            </Field>
            <Field label="الحد hourly">
              <input type="number" value={r.hourlyLimit} onChange={(e) => setR("hourlyLimit", +e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
            </Field>
            <Field label="وقت التهدئة (ثانية)">
              <input type="number" value={r.cooldownTime} onChange={(e) => setR("cooldownTime", +e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
            </Field>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════
   CAPTCHA TAB
   ═══════════════════════════ */
function CaptchaTab({ settings, update }: { settings: EmailSettings; update: <K extends keyof EmailSettings>(s: K, d: EmailSettings[K]) => void }) {
  const c = settings.captcha;
  const set = (k: keyof CaptchaSettings, v: any) => update("captcha", { ...c, [k]: v });
  const setOn = (k: keyof CaptchaSettings["enableOn"], v: boolean) => set("enableOn", { ...c.enableOn, [k]: v });
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="size-4 text-accent" /> إعدادات CAPTCHA</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Toggle label="تفعيل CAPTCHA" on={c.enabled} onToggle={() => set("enabled", !c.enabled)} />
          {c.enabled && (
            <>
              <Field label="مزود CAPTCHA">
                <Select value={c.provider} onChange={(v) => set("provider", v)} options={[
                  { value: "recaptcha_v2", label: "Google reCAPTCHA v2" },
                  { value: "recaptcha_v3", label: "Google reCAPTCHA v3" },
                  { value: "turnstile", label: "Cloudflare Turnstile" },
                  { value: "hcaptcha", label: "hCaptcha" },
                ]} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Site Key">
                  <Input value={c.siteKey} onChange={(v) => set("siteKey", v)} dir="ltr" />
                </Field>
                <Field label="Secret Key">
                  <Input value={c.secretKey} onChange={(v) => set("secretKey", v)} dir="ltr" type="password" />
                </Field>
              </div>
              {c.provider === "recaptcha_v3" && (
                <Field label="الحد الأدنى للنقاط (Minimum Score)">
                  <input type="number" min={0} max={1} step={0.1} value={c.minScore}
                    onChange={(e) => set("minScore", +e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" dir="ltr" />
                </Field>
              )}
              <Toggle label="الوضع غير المرئي (Invisible Mode)" on={c.invisibleMode} onToggle={() => set("invisibleMode", !c.invisibleMode)} />
              <div>
                <p className="text-sm font-semibold mb-2">تفعيل على:</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {([
                    ["login", "تسجيل الدخول"], ["register", "التسجيل"],
                    ["forgotPassword", "نسيان كلمة المرور"], ["contactForm", "نموذج التواصل"],
                    ["comments", "التعليقات"], ["adminLogin", "دخول الإدارة"],
                  ] as [keyof CaptchaSettings["enableOn"], string][]).map(([k, label]) => (
                    <Toggle key={k} label={label} on={c.enableOn[k]} onToggle={() => setOn(k, !c.enableOn[k])} />
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════
   ADVANCED TAB
   ═══════════════════════════ */
function AdvancedTab({ settings, update }: { settings: EmailSettings; update: <K extends keyof EmailSettings>(s: K, d: EmailSettings[K]) => void }) {
  const a = settings.advanced;
  const set = (k: keyof AdvancedSettings, v: any) => update("advanced", { ...a, [k]: v });
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="size-4 text-accent" /> إعدادات متقدمة</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="ترويسات مخصصة (Custom Headers)">
            <textarea value={a.customHeaders} onChange={(e) => set("customHeaders", e.target.value)} rows={3}
              placeholder="X-Custom: value&#10;X-Another: value"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono outline-none focus:border-accent" dir="ltr" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Charset">
              <Select value={a.charset} onChange={(v) => set("charset", v)} options={[
                { value: "UTF-8", label: "UTF-8" }, { value: "ISO-8859-1", label: "ISO-8859-1" },
                { value: "Windows-1252", label: "Windows-1252" },
              ]} />
            </Field>
            <Field label="الترميز (Encoding)">
              <Select value={a.encoding} onChange={(v) => set("encoding", v)} options={[
                { value: "7bit", label: "7bit" }, { value: "8bit", label: "8bit" },
                { value: "base64", label: "Base64" }, { value: "quoted-printable", label: "Quoted-Printable" },
              ]} />
            </Field>
            <Field label="الأولوية (Priority)">
              <Select value={a.priority} onChange={(v) => set("priority", v)} options={[
                { value: "low", label: "منخفضة" }, { value: "normal", label: "عادية" },
                { value: "high", label: "عالية" },
              ]} />
            </Field>
          </div>
          <Toggle label="تفعيل رسائل HTML" on={a.enableHtml} onToggle={() => set("enableHtml", !a.enableHtml)} />
          <Toggle label="تفعيل النص العادي (Plain Text Fallback)" on={a.enablePlainText} onToggle={() => set("enablePlainText", !a.enablePlainText)} />
          <Toggle label="تتبع فتح الرسائل (Track Opens)" on={a.trackOpens} onToggle={() => set("trackOpens", !a.trackOpens)} />
          <Toggle label="تتبع النقرات (Track Clicks)" on={a.trackClicks} onToggle={() => set("trackClicks", !a.trackClicks)} />
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════
   NOTIFICATIONS TAB
   ═══════════════════════════ */
function NotificationsTab({ settings, update }: { settings: EmailSettings; update: <K extends keyof EmailSettings>(s: K, d: EmailSettings[K]) => void }) {
  const n = settings.notifications;
  const set = (k: keyof NotificationSettings, v: any) => update("notifications", { ...n, [k]: v });
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="size-4 text-accent" /> إعدادات الإشعارات</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Toggle label="إشعار الإدارة عند فشل البريد" on={n.adminOnFail} onToggle={() => set("adminOnFail", !n.adminOnFail)} />
          <Toggle label="إشعار المستخدم عند نجاح الإرسال" on={n.notifyUser} onToggle={() => set("notifyUser", !n.notifyUser)} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="size-4 text-accent" /> روابط الويب هوك</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Slack Webhook URL">
            <Input value={n.slackWebhook} onChange={(v) => set("slackWebhook", v)} placeholder="https://hooks.slack.com/..." dir="ltr" />
          </Field>
          <Field label="Discord Webhook URL">
            <Input value={n.discordWebhook} onChange={(v) => set("discordWebhook", v)} placeholder="https://discord.com/api/webhooks/..." dir="ltr" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telegram Bot Token">
              <Input value={n.telegramBotToken} onChange={(v) => set("telegramBotToken", v)} dir="ltr" type="password" />
            </Field>
            <Field label="Telegram Chat ID">
              <Input value={n.telegramChatId} onChange={(v) => set("telegramChatId", v)} dir="ltr" />
            </Field>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════
   TEST EMAIL SECTION
   ═══════════════════════════ */
function TestEmailSection() {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("اختبار — قانوني");
  const [message, setMessage] = useState("هذه رسالة اختبار من منصة قانوني.");
  const [result, setResult] = useState<ReturnType<typeof sendTestEmail> | null>(null);
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!recipient) { toast.error("خطأ", "أدخل بريد المستلم"); return; }
    setSending(true);
    setTimeout(() => {
      const r = sendTestEmail(recipient, subject, message);
      setResult(r);
      setSending(false);
      if (r.success) toast.success("تم", "تم إرسال رسالة الاختبار بنجاح");
      else toast.error("فشل", r.error);
    }, 800);
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Send className="size-4 text-accent" /> اختبار البريد الإلكتروني</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="بريد المستلم">
            <Input value={recipient} onChange={setRecipient} placeholder="test@example.com" dir="ltr" />
          </Field>
          <Field label="العنوان">
            <Input value={subject} onChange={setSubject} />
          </Field>
        </div>
        <Field label="الرسالة">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
        </Field>
        <Button onClick={handleSend} variant="accent" disabled={sending}>
          {sending ? <RotateCw className="ml-1 size-4 animate-spin" /> : <Send className="ml-1 size-4" />}
          {sending ? "جاري الإرسال..." : "إرسال رسالة اختبار"}
        </Button>
        {result && (
          <div className={cn("rounded-xl border p-4 space-y-2", result.success ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950")}>
            <p className="text-sm font-bold">{result.success ? "✓ تم الإرسال بنجاح" : "✗ فشل الإرسال"}</p>
            {result.error && <p className="text-xs text-red-600">{result.error}</p>}
            {result.response && <p className="text-xs text-green-600">{result.response}</p>}
            <p className="text-xs text-muted-foreground">وقت التسليم: {result.deliveryTime}ms</p>
            <div className="mt-2">
              <p className="text-xs font-semibold mb-1">سجل SMTP:</p>
              <div className="max-h-40 overflow-auto rounded-lg bg-black/5 dark:bg-white/5 p-2">
                {result.smtpLog.map((line, i) => <p key={i} className="text-[10px] font-mono text-muted-foreground">{line}</p>)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════
   BACKUP TAB
   ═══════════════════════════ */
function BackupTab() {
  const [showReset, setShowReset] = useState(false);

  const handleExport = () => {
    const data = exportEmailSettings();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم", "تم تصدير الإعدادات بنجاح");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = importEmailSettings(reader.result as string);
        if (result.success) toast.success("تم", "تم استيراد الإعدادات بنجاح");
        else toast.error("خطأ", result.error ?? "فشل الاستيراد");
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Download className="size-4 text-accent" /> النسخ الاحتياطي</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExport} variant="accent" className="gap-2">
              <Download className="size-4" /> تصدير الإعدادات
            </Button>
            <Button onClick={handleImport} variant="outline" className="gap-2">
              <Upload className="size-4" /> استيراد الإعدادات
            </Button>
            <Button onClick={() => setShowReset(true)} variant="outline" className="gap-2 text-destructive hover:text-destructive">
              <RotateCcw className="size-4" /> إعادة تعيين إلى الافتراضي
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">التصدير يشمل جميع إعدادات البريد الإلكتروني والقوالب. كلمات المرور والأسرار مشفرة.</p>
        </CardContent>
      </Card>
      {showReset && (
        <Card className="border-destructive">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5 text-destructive" />
              <p className="font-bold">هل أنت متأكد؟</p>
            </div>
            <p className="text-sm text-muted-foreground">سيتم حذف جميع الإعدادات والقوالب وسجلات البريد ويعود كل شيء إلى الوضع الافتراضي.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { resetEmailSettings(); setShowReset(false); toast.warning("تم", "تمت إعادة التعيين"); }}>
                نعم، إعادة تعيين
              </Button>
              <Button variant="outline" onClick={() => setShowReset(false)}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════
   MAIN PAGE
   ═══════════════════════════ */
export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>(defaultSettings);
  const [tab, setTab] = useState<Tab>("general");
  const [saved, setSaved] = useState(false);

  useEffect(() => { setSettings(getEmailSettings()); }, []);

  const update = <K extends keyof EmailSettings>(section: K, data: EmailSettings[K]) => {
    setSettings((prev) => ({ ...prev, [section]: data }));
  };

  const handleSave = () => {
    saveEmailSettings(settings);
    setSaved(true);
    toast.success("تم الحفظ", "تم حفظ إعدادات البريد الإلكتروني");
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    saveEmailSettings(defaultSettings);
    toast.warning("تم", "تمت إعادة الإعدادات إلى الوضع الافتراضي");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">إعدادات البريد الإلكتروني</h1>
            <p className="text-sm text-muted-foreground">إعدادات الإرسال والأمان والقوالب</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" className="gap-1.5">
            <RotateCcw className="size-4" /> إعادة تعيين
          </Button>
          <Button onClick={handleSave} variant="accent" className="gap-1.5">
            {saved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
            {saved ? "تم الحفظ" : "حفظ"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-0">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("flex items-center gap-1.5 rounded-t-lg px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap border-b-2",
              tab === t.key ? "border-accent text-accent bg-accent/5" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {tab === "general" && <GeneralTab settings={settings} update={update} />}
        {tab === "smtp" && <SmtpTab settings={settings} update={update} />}
        {tab === "security" && <SecurityTab settings={settings} update={update} />}
        {tab === "queue" && <QueueTab settings={settings} update={update} />}
        {tab === "captcha" && <CaptchaTab settings={settings} update={update} />}
        {tab === "advanced" && <AdvancedTab settings={settings} update={update} />}
        {tab === "notifications" && <NotificationsTab settings={settings} update={update} />}
        {tab === "backup" && <BackupTab />}
      </div>
    </div>
  );
}
