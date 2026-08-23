import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Protect test-data page in production
    if (req.nextUrl.pathname === "/test-data" && process.env.NODE_ENV === "production") {
      return NextResponse.redirect(new URL("/404", req.url));
    }

    // Add security headers
    const response = NextResponse.next();
    
    // Prevent clickjacking
    response.headers.set("X-Frame-Options", "DENY");
    
    // Prevent MIME type sniffing
    response.headers.set("X-Content-Type-Options", "nosniff");
    
    // Enable XSS protection
    response.headers.set("X-XSS-Protection", "1; mode=block");
    
    // Referrer policy
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // Permissions policy
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    
    // Content Security Policy (basic)
    if (process.env.NODE_ENV === "production") {
      response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self';"
      );
    }

    return response;
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const pathname = req.nextUrl.pathname;

        // Admin routes require admin role (skip login page)
        if (pathname.startsWith("/admin")) {
          if (pathname === "/admin/login") return true;
          return token?.role === "admin";
        }

        // Protected user routes require any authenticated session
        if (pathname.startsWith("/client") || pathname.startsWith("/lawyer")) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/client/:path*",
    "/lawyer/:path*",
    "/test-data",
  ],
};
