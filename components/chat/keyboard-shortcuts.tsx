// ===== Iraqi Legal Assistant - Keyboard Shortcuts =====
"use client";

import { useEffect } from "react";

type ShortcutConfig = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
};

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : true;
        const shiftMatch = shortcut.shift ? e.shiftKey : true;
        const altMatch = shortcut.alt ? e.altKey : true;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

// === Shortcuts Help Modal ===
import { useState } from "react";
import { Keyboard, X } from "lucide-react";

const defaultShortcuts = [
  { keys: "Enter", description: "إرسال الرسالة" },
  { keys: "Shift + Enter", description: "سطر جديد" },
  { keys: "Ctrl + N", description: "محادثة جديدة" },
  { keys: "Ctrl + K", description: "بحث" },
  { keys: "Ctrl + /", description: "اختصارات لوحة المفاتيح" },
  { keys: "Escape", description: "إغلاق القوائم" },
];

export function ShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
        title="اختصارات لوحة المفاتيح (Ctrl + /)"
      >
        <Keyboard className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-bold">اختصارات لوحة المفاتيح</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {defaultShortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm text-muted-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.split(" + ").map((key, i) => (
                        <kbd
                          key={i}
                          className="px-2 py-1 rounded bg-muted border border-border text-xs font-mono"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
