import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect test-data page in production
  if (pathname === "/test-data" && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/404", request.url));
  }

  // Note: Admin auth is handled client-side in app/admin/layout.tsx
  // via isAdminLoggedIn() — no server-side middleware check needed
  // because sessions are stored in localStorage.

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect test-data in production
    "/test-data",
  ],
};
