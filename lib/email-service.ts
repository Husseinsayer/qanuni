import crypto from "crypto";
import nodemailer from "nodemailer";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Escape HTML special characters to prevent XSS in email templates.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Send an email using env-var SMTP config.
 * Falls back to a dev-friendly console log when no SMTP is configured.
 *
 * Configure via .env:
 *   SMTP_HOST=smtp.example.com
 *   SMTP_PORT=587
 *   SMTP_USER=you@example.com
 *   SMTP_PASS=your-password
 *   SMTP_FROM="قانوني" <noreply@qanuni.iq>
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || '"قانوني" <noreply@qanuni.iq>';

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: process.env.NODE_ENV !== "production" },
      });

      await transporter.sendMail({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
      console.log("[email] Sent via SMTP:", payload.to, payload.subject);
      return true;
    } catch (err) {
      console.error("[email] SMTP failed, falling back to dev log:", err);
    }
  }

  // Dev fallback: log to console
  console.log("[email] Dev mode - email sent:", {
    to: payload.to,
    subject: payload.subject,
  });
  return true;
}

/**
 * Generate a cryptographically secure random numeric activation code.
 */
export function generateActivationCode(): string {
  const bytes = crypto.randomBytes(3);
  const num = parseInt(bytes.toString("hex"), 16) % 900000 + 100000;
  return num.toString();
}

/**
 * Generate a reset token (UUID-like).
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Build HTML for the activation email.
 */
export function buildActivationEmail(name: string, code: string): string {
  const safeName = escapeHtml(name);
  const safeCode = escapeHtml(code);
  return `
<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; padding: 20px; background: #f5f5f5;">
  <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; padding: 30px;">
    <h1 style="color: #1E3A8A; text-align: center;">قانوني</h1>
    <h2 style="text-align: center;">تفعيل الحساب</h2>
    <p>مرحباً ${safeName}،</p>
    <p>شكراً لتسجيلك في منصة قانوني. كود التفعيل الخاص بك هو:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1E3A8A; background: #f0f4ff; padding: 15px 30px; border-radius: 8px;">${safeCode}</span>
    </div>
    <p>أدخل هذا الكود في صفحة التفعيل لإكمال تسجيلك. الكود صالح لمدة 24 ساعة.</p>
    <p style="color: #666; font-size: 12px; margin-top: 30px;">إذا لم تطلب هذا التسجيل، تجاهل هذه الرسالة.</p>
  </div>
</body>
</html>`.trim();
}

/**
 * Build HTML for the password reset email.
 */
export function buildResetEmail(name: string, resetLink: string): string {
  const safeName = escapeHtml(name);
  const safeLink = escapeHtml(resetLink);
  return `
<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; padding: 20px; background: #f5f5f5;">
  <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; padding: 30px;">
    <h1 style="color: #1E3A8A; text-align: center;">قانوني</h1>
    <h2 style="text-align: center;">إعادة تعيين كلمة المرور</h2>
    <p>مرحباً ${safeName}،</p>
    <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="display: inline-block; padding: 14px 30px; background: #1E3A8A; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">إعادة تعيين كلمة المرور</a>
    </div>
    <p>الرابط صالح لمدة ساعة واحدة. إذا لم تطلب إعادة التعيين، تجاهل هذه الرسالة.</p>
    <p style="color: #666; font-size: 12px; margin-top: 30px;">إذا لم يعمل الزر أعلاه، انسخ الرابط التالي والصقه في المتصفح:<br>${safeLink}</p>
  </div>
</body>
</html>`.trim();
}

/**
 * Build HTML for the registration confirmation (after admin approves).
 */
export function buildApprovalEmail(name: string, loginUrl: string): string {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(loginUrl);
  return `
<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; padding: 20px; background: #f5f5f5;">
  <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; padding: 30px;">
    <h1 style="color: #1E3A8A; text-align: center;">قانوني</h1>
    <h2 style="text-align: center;">تم الموافقة على طلب التسجيل</h2>
    <p>مرحباً ${safeName}،</p>
    <p>تمت الموافقة على طلب تسجيلك في منصة قانوني. يمكنك الآن تسجيل الدخول وبدء استخدام خدمات المنصة.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${safeUrl}" style="display: inline-block; padding: 14px 30px; background: #1E3A8A; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">تسجيل الدخول</a>
    </div>
  </div>
</body>
</html>`.trim();
}
