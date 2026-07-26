"use client";

import { createContext, useContext } from "react";
import { useAdminData, type AdminData } from "@/lib/admin-data";

type AdminContextType = {
  data: AdminData;
  update: <K extends keyof AdminData>(field: K, value: AdminData[K]) => void;
  reset: () => void;
};

export const AdminContext = createContext<AdminContextType | null>(null);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const adminData = useAdminData();
  return (
    <AdminContext.Provider value={adminData}>{children}</AdminContext.Provider>
  );
}

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminContext must be used within AdminDataProvider");
  return ctx;
}

export function useAdminContextSafe() {
  return useContext(AdminContext);
}
