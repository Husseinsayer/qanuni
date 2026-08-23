import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

type HandlerContext = {
  params: Record<string, string>;
};

type MethodHandlers = {
  GET?: (req: Request, ctx: HandlerContext) => Promise<Response>;
  POST?: (req: Request, ctx: HandlerContext) => Promise<Response>;
  PUT?: (req: Request, ctx: HandlerContext) => Promise<Response>;
  DELETE?: (req: Request, ctx: HandlerContext) => Promise<Response>;
};

/**
 * Wrap route handlers with error handling and optional auth.
 */
export function createRoute(handlers: MethodHandlers, options?: { auth?: boolean }) {
  const handler = async (req: Request, { params }: { params: Promise<Record<string, string>> }) => {
    try {
      // Auth check
      if (options?.auth) {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
          return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }
      }

      const resolvedParams = await params;
      const method = req.method as keyof MethodHandlers;
      const handlerFn = handlers[method];

      if (!handlerFn) {
        return NextResponse.json(
          { error: `الطريقة ${method} غير مدعومة` },
          { status: 405 }
        );
      }

      return await handlerFn(req, { params: resolvedParams });
    } catch (error: any) {
      console.error(`API Error [${req.method} ${req.url}]:`, error);
      return NextResponse.json(
        { error: error?.message || "حدث خطأ في الخادم" },
        { status: 500 }
      );
    }
  };

  return handler;
}
