"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const bgMap = {
  success: "bg-success",
  error: "bg-danger",
  warning: "bg-gold",
  info: "bg-accent",
};

const progressMap = {
  success: "bg-success/40",
  error: "bg-danger/40",
  warning: "bg-gold/40",
  info: "bg-accent/40",
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(Date.now());
  const remainingRef = useRef(toast.duration);
  const rafRef = useRef<number>();

  useEffect(() => {
    const tick = () => {
      if (!paused) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = remainingRef.current - elapsed;
        if (remaining <= 0) {
          onRemove(toast.id);
          return;
        }
        setProgress((remaining / toast.duration) * 100);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [toast.id, toast.duration, onRemove]);

  useEffect(() => {
    if (paused) {
      remainingRef.current -= Date.now() - startTimeRef.current;
    } else {
      startTimeRef.current = Date.now();
    }
  }, [paused]);

  const Icon = iconMap[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -60, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn(
        "relative max-w-sm overflow-hidden rounded-xl shadow-premium",
        bgMap[toast.type]
      )}
    >
      <div className="flex items-start gap-3 p-4 text-white">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1 text-right">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.message && (
            <p className="mt-1 text-xs text-white/80">{toast.message}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="shrink-0 rounded-lg p-1 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="h-1 w-full bg-black/20">
        <motion.div
          className={cn("h-full", progressMap[toast.type])}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToastContext();

  return (
    <div className="fixed left-4 top-4 z-[60] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function useToast() {
  return useToastContext();
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration?: number) => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((prev) => [
        ...prev,
        { id, type, title, message, duration: duration ?? 4000 },
      ]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}
