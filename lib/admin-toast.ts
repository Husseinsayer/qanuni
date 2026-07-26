import { ToastType } from "@/components/ui/toast";

type ToastListener = (type: ToastType, title: string, message?: string) => void;
let listeners: ToastListener[] = [];

export function subscribeToast(listener: ToastListener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function showToast(type: ToastType, title: string, message?: string) {
  listeners.forEach((l) => l(type, title, message));
}

export const toast = {
  success: (title: string, message?: string) => showToast("success", title, message),
  error: (title: string, message?: string) => showToast("error", title, message),
  warning: (title: string, message?: string) => showToast("warning", title, message),
  info: (title: string, message?: string) => showToast("info", title, message),
};
