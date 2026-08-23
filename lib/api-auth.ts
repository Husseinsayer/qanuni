import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";

/**
 * Check if the current user is authenticated and has admin role.
 * Returns null if authorized, or a NextResponse with error if not.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "غير مصرح - يرجى تسجيل الدخول" },
      { status: 401 }
    );
  }

  if ((session.user as any).role !== "admin") {
    return NextResponse.json(
      { error: "غير مصرح - صلاحيات المدير مطلوبة" },
      { status: 403 }
    );
  }

  return null; // Authorized
}

/**
 * Check if the current user is authenticated (any role).
 * Returns null if authorized, or a NextResponse with error if not.
 */
export async function requireAuth(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "غير مصرح - يرجى تسجيل الدخول" },
      { status: 401 }
    );
  }

  return null; // Authorized
}

/**
 * Sanitize a string input by removing potentially dangerous characters.
 * Prevents XSS and injection attacks.
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim()
    .slice(0, 10000); // Limit length
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate password strength.
 */
export function isValidPassword(password: string): boolean {
  return typeof password === "string" && password.length >= 6 && password.length <= 128;
}
