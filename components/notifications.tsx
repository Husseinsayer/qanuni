"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

// ===== Types =====
export type NotificationType = "success" | "error" | "info" | "promotion";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (type: NotificationType, title: string, message: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

// ===== Context =====
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

// ===== Provider =====
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((type: NotificationType, title: string, message: string) => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ===== Toast Component =====
const iconMap: Record<NotificationType, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  promotion: Megaphone,
};

const colorMap: Record<NotificationType, string> = {
  success: "bg-success/10 text-success border-success/20",
  error: "bg-danger/10 text-danger border-danger/20",
  info: "bg-accent/10 text-accent border-accent/20",
  promotion: "bg-gold/10 text-gold border-gold/20",
};

export function ToastContainer() {
  const { notifications, removeNotification } = useNotifications();
  const recentNotifications = notifications.filter(
    (n) => Date.now() - n.timestamp < 5000 // Show last 5 seconds
  );

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-96">
      {recentNotifications.map((notif) => {
        const Icon = iconMap[notif.type];
        return (
          <div
            key={notif.id}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 shadow-lg animate-in slide-in-from-bottom-5",
              colorMap[notif.type]
            )}
          >
            <Icon className="size-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{notif.title}</p>
              <p className="text-xs opacity-80 mt-0.5">{notif.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notif.id)}
              className="shrink-0 rounded-lg p-1 hover:bg-black/5"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ===== Notification Bell Component =====
export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative grid size-10 place-items-center rounded-xl border border-border text-foreground transition hover:bg-muted/60"
      >
        <Megaphone className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-80 origin-top-left overflow-hidden rounded-2xl border border-border bg-card shadow-premium z-50">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-bold text-sm">الإشعارات</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-accent hover:underline"
                  >
                    قراءة الكل
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    حذف الكل
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  لا توجد إشعارات
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = iconMap[notif.type];
                  return (
                    <div
                      key={notif.id}
                      className={cn(
                        "flex items-start gap-3 border-b border-border px-4 py-3 transition hover:bg-muted/30",
                        !notif.read && "bg-accent/5"
                      )}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <Icon className={cn("size-5 shrink-0 mt-0.5", colorMap[notif.type].split(" ")[1])} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{getRelativeTime(notif.timestamp)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notif.id);
                        }}
                        className="shrink-0 rounded-lg p-1 hover:bg-muted/50"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
