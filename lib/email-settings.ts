"use client";

/* ─── Types ─── */

export type MailDriver =
  | "smtp" | "sendmail" | "mailgun" | "ses" | "postmark"
  | "resend" | "brevo" | "custom";

export type EncryptionType = "none" | "ssl" | "tls" | "starttls";
export type QueueDriver = "sync" | "database" | "redis" | "database_retry";

export interface GeneralEmailSettings {
  enabled: boolean;
  mailDriver: MailDriver;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  replyToName: string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: EncryptionType;
  timeout: number;
  keepAlive: boolean;
  maxConnections: number;
  maxEmailsPerMinute: number;
  maxEmailsPerHour: number;
  retryCount: number;
  retryDelay: number;
}

export interface AuthSettings {
  smtpAuth: boolean;
  useOAuth2: boolean;
  allowSelfSigned: boolean;
  verifySsl: boolean;
  verifyHostname: boolean;
}

export interface SecuritySettings {
  dkimEnabled: boolean;
  dkimSelector: string;
  dkimPrivateKey: string;
  spfValidation: boolean;
  dmarcEnabled: boolean;
  bounceHandling: boolean;
}

export interface QueueSettings {
  enabled: boolean;
  driver: QueueDriver;
  retryFailed: boolean;
  maxRetries: number;
  retryDelay: number;
  backgroundSend: boolean;
}

export interface CaptchaSettings {
  enabled: boolean;
  provider: "recaptcha_v2" | "recaptcha_v3" | "turnstile" | "hcaptcha";
  siteKey: string;
  secretKey: string;
  minScore: number;
  invisibleMode: boolean;
  enableOn: {
    login: boolean;
    register: boolean;
    forgotPassword: boolean;
    contactForm: boolean;
    comments: boolean;
    adminLogin: boolean;
  };
}

export interface RateLimitSettings {
  maxPerUser: number;
  maxPerIp: number;
  dailyLimit: number;
  hourlyLimit: number;
  cooldownTime: number;
}

export interface NotificationSettings {
  adminOnFail: boolean;
  notifyUser: boolean;
  slackWebhook: string;
  discordWebhook: string;
  telegramBotToken: string;
  telegramChatId: string;
}

export interface AdvancedSettings {
  customHeaders: string;
  charset: string;
  encoding: string;
  priority: "low" | "normal" | "high";
  enableHtml: boolean;
  enablePlainText: boolean;
  trackOpens: boolean;
  trackClicks: boolean;
}

export interface TestEmailResult {
  timestamp: string;
  success: boolean;
  recipient: string;
  subject: string;
  smtpLog: string[];
  response: string;
  error: string;
  deliveryTime: number;
}

export interface EmailSettings {
  general: GeneralEmailSettings;
  smtp: SmtpSettings;
  auth: AuthSettings;
  security: SecuritySettings;
  queue: QueueSettings;
  captcha: CaptchaSettings;
  rateLimit: RateLimitSettings;
  notifications: NotificationSettings;
  advanced: AdvancedSettings;
}

export interface EmailLog {
  id: string;
  timestamp: string;
  recipient: string;
  sender: string;
  subject: string;
  status: "sent" | "failed" | "queued" | "bounced" | "pending";
  error: string;
  smtpResponse: string;
  deliveryTime: number;
}

export interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  description: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[];
  enabled: boolean;
  isSystem: boolean;
  version: number;
  versions: { version: number; date: string; htmlBody: string; textBody: string; subject: string }[];
  lastEdited: string;
}

/* ─── Storage Keys ─── */

const SETTINGS_KEY = "email_settings";
const LOGS_KEY = "email_logs";
const TEMPLATES_KEY = "email_templates";

/* ─── Default Settings ─── */

export const defaultSettings: EmailSettings = {
  general: {
    enabled: true,
    mailDriver: "smtp",
    fromName: "قانوني",
    fromEmail: "noreply@iqlegal.example",
    replyToEmail: "support@iqlegal.example",
    replyToName: "فريق الدعم",
  },
  smtp: {
    host: "smtp.example.com",
    port: 587,
    username: "",
    password: "",
    encryption: "tls",
    timeout: 30,
    keepAlive: false,
    maxConnections: 5,
    maxEmailsPerMinute: 60,
    maxEmailsPerHour: 1000,
    retryCount: 3,
    retryDelay: 60,
  },
  auth: {
    smtpAuth: true,
    useOAuth2: false,
    allowSelfSigned: false,
    verifySsl: true,
    verifyHostname: true,
  },
  security: {
    dkimEnabled: false,
    dkimSelector: "default",
    dkimPrivateKey: "",
    spfValidation: false,
    dmarcEnabled: false,
    bounceHandling: false,
  },
  queue: {
    enabled: false,
    driver: "sync",
    retryFailed: true,
    maxRetries: 3,
    retryDelay: 60,
    backgroundSend: false,
  },
  captcha: {
    enabled: false,
    provider: "recaptcha_v2",
    siteKey: "",
    secretKey: "",
    minScore: 0.5,
    invisibleMode: false,
    enableOn: {
      login: true,
      register: true,
      forgotPassword: true,
      contactForm: false,
      comments: false,
      adminLogin: true,
    },
  },
  rateLimit: {
    maxPerUser: 50,
    maxPerIp: 100,
    dailyLimit: 5000,
    hourlyLimit: 500,
    cooldownTime: 60,
  },
  notifications: {
    adminOnFail: true,
    notifyUser: true,
    slackWebhook: "",
    discordWebhook: "",
    telegramBotToken: "",
    telegramChatId: "",
  },
  advanced: {
    customHeaders: "",
    charset: "UTF-8",
    encoding: "7bit",
    priority: "normal",
    enableHtml: true,
    enablePlainText: true,
    trackOpens: false,
    trackClicks: false,
  },
};

/* ─── Default Templates ─── */

const defaultTemplates: EmailTemplate[] = [
  {
    id: "tpl-welcome", key: "welcome", name: "البريد الترحيبي", description: "يُرسل عند تسجيل حساب جديد",
    subject: "مرحباً {{name}} — أهلاً بك في منصة قانوني",
    htmlBody: "<h1>مرحباً {{name}}!</h1><p>أهلاً بك في منصة <strong>قانوني</strong>.</p><p>نحن سعداء بانضمامك إلينا.</p>",
    textBody: "مرحباً {{name}}! أهلاً بك في منصة قانوني.",
    variables: ["name", "email", "date"], enabled: true, isSystem: true, version: 1, versions: [], lastEdited: new Date().toISOString(),
  },
  {
    id: "tpl-password-reset", key: "password_reset", name: "إعادة تعيين كلمة المرور", description: "يُرسل عند طلب إعادة تعيين كلمة المرور",
    subject: "إعادة تعيين كلمة المرور — قانوني",
    htmlBody: "<h1>إعادة تعيين كلمة المرور</h1><p>مرحباً {{name}}،</p><p>تلقينا طلباً لإعادة تعيين كلمة المرور.</p><p>رابط إعادة التعيين: <a href=\"{{resetUrl}}\">اضغط هنا</a></p><p>هذا الرابط صالح لمدة 24 ساعة.</p>",
    textBody: "مرحباً {{name}}،\nرابط إعادة التعيين: {{resetUrl}}\nصالح لمدة 24 ساعة.",
    variables: ["name", "resetUrl", "expiry"], enabled: true, isSystem: true, version: 1, versions: [], lastEdited: new Date().toISOString(),
  },
  {
    id: "tpl-verify-email", key: "verify_email", name: "تأكيد البريد الإلكتروني", description: "يُرسل للتحقق من البريد الإلكتروني",
    subject: "تأكيد بريدك الإلكتروني — قانوني",
    htmlBody: "<h1>تأكيد البريد الإلكتروني</h1><p>مرحباً {{name}}،</p><p>يرجى التحقق من بريدك الإلكتروني بالضغط على الرابط:</p><p><a href=\"{{verifyUrl}}\">تأكيد البريد</a></p>",
    textBody: "مرحباً {{name}}،\nرابط التأكيد: {{verifyUrl}}",
    variables: ["name", "verifyUrl"], enabled: true, isSystem: true, version: 1, versions: [], lastEdited: new Date().toISOString(),
  },
  {
    id: "tpl-2fa", key: "two_factor", name: "المصادقة الثنائية", description: "يُرسل عند تفعيل المصادقة الثنائية",
    subject: "رمز التحقق — المصادقة الثنائية",
    htmlBody: "<h1>رمز التحقق</h1><p>رمز التحقق الخاص بك: <strong>{{code}}</strong></p><p>هذا الرمز صالح لمدة 10 دقائق.</p>",
    textBody: "رمز التحقق: {{code}}\nصالح لمدة 10 دقائق.",
    variables: ["code", "expiry"], enabled: true, isSystem: true, version: 1, versions: [], lastEdited: new Date().toISOString(),
  },
  {
    id: "tpl-new-user", key: "new_user", name: "مستخدم جديد", description: "إشعار لإدارة النظام بتسجيل مستخدم جديد",
    subject: "مستخدم جديد — {{name}}",
    htmlBody: "<h1>مستخدم جديد</h1><p>الاسم: {{name}}</p><p>البريد: {{email}}</p><p>النوع: {{role}}</p>",
    textBody: "مستخدم جديد: {{name}} ({{email}}) — {{role}}",
    variables: ["name", "email", "role", "date"], enabled: true, isSystem: true, version: 1, versions: [], lastEdited: new Date().toISOString(),
  },
  {
    id: "tpl-order", key: "order_confirmation", name: "تأكيد الطلب", description: "يُرسل عند تأكيد طلب خدمة",
    subject: "تأكيد طلبك — قانوني",
    htmlBody: "<h1>تأكيد الطلب #{{orderId}}</h1><p>مرحباً {{name}}،</p><p>تم تأكيد طلبك بنجاح.</p><p>الخدمة: {{service}}</p><p>المبلغ: {{amount}}</p>",
    textBody: "تأكيد طلب #{{orderId}}\nالخدمة: {{service}}\nالمبلغ: {{amount}}",
    variables: ["orderId", "name", "service", "amount", "date"], enabled: true, isSystem: true, version: 1, versions: [], lastEdited: new Date().toISOString(),
  },
  {
    id: "tpl-notification", key: "notification", name: "إشعار عام", description: "يُستخدم للإشعارات العامة",
    subject: "{{title}} — قانوني",
    htmlBody: "<h1>{{title}}</h1><p>{{message}}</p>",
    textBody: "{{title}}\n{{message}}",
    variables: ["title", "message", "name"], enabled: true, isSystem: true, version: 1, versions: [], lastEdited: new Date().toISOString(),
  },
  {
    id: "tpl-custom", key: "custom", name: "قالب مخصص", description: "قالب فارغ لإنشاء قالب مخصص",
    subject: "رسالة من قانوني",
    htmlBody: "<h1>{{title}}</h1><p>{{body}}</p>",
    textBody: "{{title}}\n{{body}}",
    variables: ["title", "body", "name"], enabled: true, isSystem: false, version: 1, versions: [], lastEdited: new Date().toISOString(),
  },
];

/* ─── Settings CRUD ─── */

export function getEmailSettings(): EmailSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveEmailSettings(settings: EmailSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function updateEmailSettings<K extends keyof EmailSettings>(section: K, data: EmailSettings[K]): void {
  const settings = getEmailSettings();
  settings[section] = data;
  saveEmailSettings(settings);
}

/* ─── Email Logs ─── */

function getAllLogs(): EmailLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAllLogs(logs: EmailLog[]): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function addEmailLog(log: Omit<EmailLog, "id" | "timestamp">): EmailLog {
  const logs = getAllLogs();
  const newLog: EmailLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog);
  if (logs.length > 500) logs.length = 500;
  saveAllLogs(logs);
  return newLog;
}

export function getEmailLogs(params?: {
  search?: string;
  status?: string;
  page?: number;
  perPage?: number;
}): { logs: EmailLog[]; total: number; page: number; totalPages: number } {
  let logs = getAllLogs();
  if (params?.search) {
    const s = params.search.toLowerCase();
    logs = logs.filter(
      (l) =>
        l.recipient.toLowerCase().includes(s) ||
        l.subject.toLowerCase().includes(s) ||
        l.sender.toLowerCase().includes(s)
    );
  }
  if (params?.status && params.status !== "all") {
    logs = logs.filter((l) => l.status === params.status);
  }
  const total = logs.length;
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 20;
  const start = (page - 1) * perPage;
  const paged = logs.slice(start, start + perPage);
  return { logs: paged, total, page, totalPages: Math.ceil(total / perPage) };
}

export function clearEmailLogs(): void {
  localStorage.removeItem(LOGS_KEY);
}

/* ─── Email Templates ─── */

function getAllTemplatesRaw(): EmailTemplate[] {
  if (typeof window === "undefined") return defaultTemplates;
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(defaultTemplates));
      return defaultTemplates;
    }
    return JSON.parse(raw);
  } catch {
    return defaultTemplates;
  }
}

function saveAllTemplates(templates: EmailTemplate[]): void {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function getEmailTemplates(): EmailTemplate[] {
  return getAllTemplatesRaw();
}

export function getEmailTemplate(id: string): EmailTemplate | undefined {
  return getAllTemplatesRaw().find((t) => t.id === id);
}

export function updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): boolean {
  const templates = getAllTemplatesRaw();
  const idx = templates.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  const old = templates[idx];
  const newVersion = old.version + 1;
  templates[idx] = {
    ...old,
    ...updates,
    version: newVersion,
    lastEdited: new Date().toISOString(),
    versions: [
      ...old.versions,
      {
        version: old.version,
        date: old.lastEdited,
        htmlBody: old.htmlBody,
        textBody: old.textBody,
        subject: old.subject,
      },
    ],
  };
  saveAllTemplates(templates);
  return true;
}

export function addEmailTemplate(template: Omit<EmailTemplate, "id" | "version" | "versions" | "lastEdited">): EmailTemplate {
  const templates = getAllTemplatesRaw();
  const newTpl: EmailTemplate = {
    ...template,
    id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    version: 1,
    versions: [],
    lastEdited: new Date().toISOString(),
  };
  templates.push(newTpl);
  saveAllTemplates(templates);
  return newTpl;
}

export function deleteEmailTemplate(id: string): boolean {
  const templates = getAllTemplatesRaw();
  const filtered = templates.filter((t) => t.id !== id);
  if (filtered.length === templates.length) return false;
  saveAllTemplates(filtered);
  return true;
}

export function duplicateEmailTemplate(id: string): EmailTemplate | null {
  const tpl = getEmailTemplate(id);
  if (!tpl) return null;
  return addEmailTemplate({
    key: tpl.key + "_copy",
    name: tpl.name + " (نسخة)",
    description: tpl.description,
    subject: tpl.subject,
    htmlBody: tpl.htmlBody,
    textBody: tpl.textBody,
    variables: [...tpl.variables],
    enabled: tpl.enabled,
    isSystem: false,
  });
}

/* ─── Test Email ─── */

export function sendTestEmail(recipient: string, subject: string, _message: string): TestEmailResult {
  const settings = getEmailSettings();
  const logs: string[] = [];
  const start = Date.now();

  logs.push(`[${new Date().toISOString()}] بدء إرسال البريد الإلكتروني`);
  logs.push(`[${new Date().toISOString()}] المُرسل: ${settings.general.fromName} <${settings.general.fromEmail}>`);
  logs.push(`[${new Date().toISOString()}] المستلم: ${recipient}`);
  logs.push(`[${new Date().toISOString()}] العنوان: ${subject}`);
  logs.push(`[${new Date().toISOString()}] السائق: ${settings.general.mailDriver}`);

  if (settings.general.mailDriver === "smtp") {
    logs.push(`[${new Date().toISOString()}] SMTP Host: ${settings.smtp.host}:${settings.smtp.port}`);
    logs.push(`[${new Date().toISOString()}] التشفير: ${settings.smtp.encryption}`);
    logs.push(`[${new Date().toISOString()}] المصادقة: ${settings.auth.smtpAuth ? "مفعّلة" : "معطّلة"}`);
    logs.push(`[${new Date().toISOString()}] التحقق من SSL: ${settings.auth.verifySsl ? "نعم" : "لا"}`);
  }

  if (!recipient || !recipient.includes("@")) {
    logs.push(`[${new Date().toISOString()}] خطأ: عنوان البريد الإلكتروني غير صالح`);
    return {
      timestamp: new Date().toISOString(),
      success: false,
      recipient,
      subject,
      smtpLog: logs,
      response: "",
      error: "عنوان البريد الإلكتروني غير صالح",
      deliveryTime: Date.now() - start,
    };
  }

  if (!settings.general.enabled) {
    logs.push(`[${new Date().toISOString()}] خطأ: نظام البريد الإلكتروني معطّل`);
    return {
      timestamp: new Date().toISOString(),
      success: false,
      recipient,
      subject,
      smtpLog: logs,
      response: "",
      error: "نظام البريد الإلكتروني معطّل",
      deliveryTime: Date.now() - start,
    };
  }

  if (settings.general.mailDriver === "smtp" && !settings.smtp.host) {
    logs.push(`[${new Date().toISOString()}] خطأ: SMTP Host غير مُعرّف`);
    return {
      timestamp: new Date().toISOString(),
      success: false,
      recipient,
      subject,
      smtpLog: logs,
      response: "",
      error: "SMTP Host غير مُعرّف",
      deliveryTime: Date.now() - start,
    };
  }

  logs.push(`[${new Date().toISOString()}] بناء الاتصال...`);
  logs.push(`[${new Date().toISOString()}] الاتصال ناجح (محاكاة)`);
  logs.push(`[${new Date().toISOString()}] إرسال الرسالة...`);
  logs.push(`[${new Date().toISOString()}] تم الإرسال بنجاح (محاكاة)`);

  const deliveryTime = Date.now() - start;

  addEmailLog({
    recipient,
    sender: `${settings.general.fromName} <${settings.general.fromEmail}>`,
    subject,
    status: "sent",
    error: "",
    smtpResponse: "250 OK: Message queued for delivery",
    deliveryTime,
  });

  return {
    timestamp: new Date().toISOString(),
    success: true,
    recipient,
    subject,
    smtpLog: logs,
    response: "250 OK: Message queued for delivery",
    error: "",
    deliveryTime,
  };
}

/* ─── Export / Import ─── */

export function exportEmailSettings(): string {
  const data = {
    settings: getEmailSettings(),
    templates: getEmailTemplates(),
    exportedAt: new Date().toISOString(),
    version: "1.0",
  };
  return JSON.stringify(data, null, 2);
}

export function importEmailSettings(json: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(json);
    if (data.settings) saveEmailSettings(data.settings);
    if (data.templates) localStorage.setItem(TEMPLATES_KEY, JSON.stringify(data.templates));
    return { success: true };
  } catch {
    return { success: false, error: "تنسيق JSON غير صالح" };
  }
}

export function resetEmailSettings(): void {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(LOGS_KEY);
  localStorage.removeItem(TEMPLATES_KEY);
}
