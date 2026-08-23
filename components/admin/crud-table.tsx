"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAdminTable } from "@/lib/use-admin-table";
import { Plus, Pencil, Trash2, X, Search, ChevronRight, ChevronLeft, Archive, RotateCcw } from "lucide-react";
import { toast } from "@/lib/admin-toast";

// ── Shared CRUD Table Component ──────────────────
export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface CrudConfig<T> {
  title: string;
  addLabel?: string;
  columns: Column<T>[];
  searchFields: string[];
  renderItemModal: (item: T | null, onChange: (item: T) => void, onClose: () => void) => React.ReactNode;
  validate: (item: T) => string | null;
  toItem: (form: Record<string, unknown>) => T;
  fromItem: (item: T) => Record<string, unknown>;
}

export function CrudTable<T extends { id: string; deletedAt: string | null; isActive: boolean; createdAt: string; updatedAt: string }>({
  config,
  items,
  onAdd,
  onUpdate,
  onDelete,
  onRestore,
}: {
  config: CrudConfig<T>;
  items: T[];
  onAdd: (item: T) => void;
  onUpdate: (id: string, updates: Partial<T>) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const activeItems = useMemo(
    () => (showArchived ? items : items.filter((i) => !i.deletedAt)),
    [items, showArchived]
  );

  const { search, setSearch, page, setPage, paged, totalPages, total } =
    useAdminTable(activeItems, config.searchFields as (keyof T)[]);

  const openAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEdit = (item: T) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = (item: T) => {
    if (editingItem) {
      onUpdate(editingItem.id, item);
      toast.success("تم التعديل بنجاح");
    } else {
      onAdd(item);
      toast.success("تمت الإضافة بنجاح");
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm);
      toast.success("تم الحذف");
      setDeleteConfirm(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{config.title}</h1>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4" />
          {config.addLabel || "إضافة جديد"}
        </Button>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          عرض {paged.length} من {total} عنصر
        </p>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            showArchived ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Archive className="h-3.5 w-3.5" />
          {showArchived ? "إظهار النشطة" : "إظهار المؤرشفة"}
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full rounded-xl border border-border bg-muted/40 pr-10 pl-10 h-11 text-sm outline-none focus:border-accent"
          placeholder="بحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {config.columns.map((col) => (
                    <th key={col.key} className={`px-4 py-3 text-right font-semibold ${col.className || ""}`}>
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((item) => (
                  <tr key={item.id} className={`border-b border-border/50 hover:bg-muted/20 ${item.deletedAt ? "opacity-50" : ""}`}>
                    {config.columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3 ${col.className || ""}`}>
                        {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? "")}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {item.deletedAt ? (
                          <button
                            onClick={() => onRestore(item.id)}
                            className="rounded-lg p-1.5 hover:bg-green-50 dark:hover:bg-green-950/20"
                            title="استعادة"
                          >
                            <RotateCcw className="h-3.5 w-3.5 text-green-500" />
                          </button>
                        ) : (
                          <>
                            <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 hover:bg-muted/60">
                              <Pencil className="h-3.5 w-3.5 text-accent" />
                            </button>
                            <button onClick={() => setDeleteConfirm(item.id)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20">
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={config.columns.length + 1} className="py-12 text-center text-muted-foreground">
                      لا توجد بيانات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-8 w-8 rounded-lg text-sm font-medium ${p === page ? "bg-accent text-white" : "hover:bg-muted/60"}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="rounded-lg p-2 hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm text-muted-foreground">صفحة {page} من {totalPages}</span>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا العنصر؟ يمكن استعادته من الأرشيف."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      {modalOpen && config.renderItemModal(editingItem, (item) => handleSave(item), () => setModalOpen(false))}
    </div>
  );
}
