"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "../admin-context";
import type { AdminUser, AdminRole } from "@/lib/admin-data";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  ChevronRight,
  ChevronLeft,
  Users,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";
import { useAdminTable } from "@/lib/use-admin-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/admin-toast";

const allPermissions: { key: string; label: string }[] = [
  { key: "manage_lawyers", label: "إدارة المحامين" },
  { key: "manage_articles", label: "إدارة المقالات" },
  { key: "manage_laws", label: "إدارة القوانين" },
  { key: "manage_content", label: "إدارة المحتوى" },
  { key: "manage_ads", label: "إدارة الإعلانات" },
  { key: "manage_users", label: "إدارة المستخدمين" },
  { key: "view_stats", label: "عرض الإحصائيات" },
];

const defaultRoleIds = ["admin", "editor", "viewer"];

export default function UsersAdminPage() {
  const { data, update } = useAdminContext();
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "",
    active: true,
  });
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<string | null>(null);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState({ name: "", permissions: [] as string[] });
  const [deleteRoleConfirm, setDeleteRoleConfirm] = useState<string | null>(null);

  const { search, setSearch, page, setPage, pageSize, setPageSize, paged, totalPages, total } =
    useAdminTable(data.users, ["name", "email"]);

  const getRoleName = (roleId: string) => data.roles.find((r) => r.id === roleId)?.name || roleId;

  const getRoleBadgeColor = (roleId: string) => {
    if (roleId === "admin") return "bg-red-500/10 text-red-600 dark:text-red-400";
    if (roleId === "editor") return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    return "bg-muted text-muted-foreground";
  };

  const openAddUser = () => {
    setUserForm({ name: "", email: "", role: data.roles[0]?.id || "", active: true });
    setEditingUserId(null);
    setUserModalOpen(true);
  };

  const openEditUser = (user: AdminUser) => {
    setUserForm({ name: user.name, email: user.email, role: user.role, active: user.active });
    setEditingUserId(user.id);
    setUserModalOpen(true);
  };

  const saveUser = () => {
    if (!userForm.name.trim() || !userForm.email.trim()) return;
    if (editingUserId) {
      update(
        "users",
        data.users.map((u) => (u.id === editingUserId ? { ...u, ...userForm } : u))
      );
      toast.success("تم الحفظ بنجاح");
    } else {
      const newUser: AdminUser = {
        id: `u${Date.now()}`,
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        active: userForm.active,
        createdAt: new Date().toISOString().split("T")[0],
      };
      update("users", [...data.users, newUser]);
      toast.success("تم الحفظ بنجاح", `تمت إضافة المستخدم "${userForm.name}"`);
    }
    setUserModalOpen(false);
  };

  const removeUser = (id: string) => {
    const user = data.users.find((u) => u.id === id);
    update("users", data.users.filter((u) => u.id !== id));
    toast.success("تم الحذف", `تم حذف المستخدم "${user?.name || ""}"`);
    setDeleteUserConfirm(null);
  };

  const toggleUserActive = (id: string) => {
    update(
      "users",
      data.users.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
  };

  const openAddRole = () => {
    setRoleForm({ name: "", permissions: [] });
    setEditingRoleId(null);
    setRoleModalOpen(true);
  };

  const openEditRole = (role: AdminRole) => {
    setRoleForm({ name: role.name, permissions: [...role.permissions] });
    setEditingRoleId(role.id);
    setRoleModalOpen(true);
  };

  const saveRole = () => {
    if (!roleForm.name.trim()) return;
    if (editingRoleId) {
      update(
        "roles",
        data.roles.map((r) => (r.id === editingRoleId ? { ...r, ...roleForm } : r))
      );
      toast.success("تم حفظ الدور بنجاح");
    } else {
      const newRole: AdminRole = {
        id: `role_${Date.now()}`,
        name: roleForm.name,
        permissions: roleForm.permissions,
      };
      update("roles", [...data.roles, newRole]);
      toast.success("تم الحفظ بنجاح", `تمت إضافة الدور "${roleForm.name}"`);
    }
    setRoleModalOpen(false);
  };

  const removeRole = (id: string) => {
    const role = data.roles.find((r) => r.id === id);
    update("roles", data.roles.filter((r) => r.id !== id));
    toast.success("تم الحذف", `تم حذف الدور "${role?.name || ""}"`);
    setDeleteRoleConfirm(null);
  };

  const toggleRolePermission = (perm: string) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <Button onClick={activeTab === "users" ? openAddUser : openAddRole} size="sm">
          <Plus className="h-4 w-4" />
          {activeTab === "users" ? "إضافة مستخدم" : "إضافة دور"}
        </Button>
      </div>

      <div className="mb-6 flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "users"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          المستخدمون
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "roles"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield className="h-4 w-4" />
          الأدوار والصلاحيات
        </button>
      </div>

      {activeTab === "users" && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              عرض {paged.length} من {total} مستخدم
            </p>
          </div>

          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full rounded-xl border border-border bg-muted/40 pr-10 pl-10 h-11 text-sm outline-none focus:border-accent"
              placeholder="بحث بالاسم أو البريد..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted"
              >
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
                      <th className="px-4 py-3 text-right font-semibold">الاسم</th>
                      <th className="px-4 py-3 text-right font-semibold">البريد الإلكتروني</th>
                      <th className="px-4 py-3 text-right font-semibold">الدور</th>
                      <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                      <th className="px-4 py-3 text-right font-semibold">تاريخ الإنشاء</th>
                      <th className="px-4 py-3 text-right font-semibold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{user.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {getRoleName(user.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleUserActive(user.id)} className="text-muted-foreground hover:text-foreground">
                            {user.active ? (
                              <UserCheck className="h-4 w-4 text-success" />
                            ) : (
                              <UserX className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{user.createdAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEditUser(user)} className="rounded-lg p-1.5 hover:bg-muted/60">
                              <Pencil className="h-3.5 w-3.5 text-accent" />
                            </button>
                            <button
                              onClick={() => setDeleteUserConfirm(user.id)}
                              className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
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
            <span className="text-sm text-muted-foreground">
              صفحة {page} من {totalPages}
            </span>
            <select
              className="rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[5, 10, 25, 50].map((s) => (
                <option key={s} value={s}>
                  {s} / صفحة
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {activeTab === "roles" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.roles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{role.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditRole(role)} className="rounded-lg p-1.5 hover:bg-muted/60">
                    <Pencil className="h-3.5 w-3.5 text-accent" />
                  </button>
                  {!defaultRoleIds.includes(role.id) && (
                    <button
                      onClick={() => setDeleteRoleConfirm(role.id)}
                      className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map((perm) => {
                    const permLabel = allPermissions.find((p) => p.key === perm)?.label || perm;
                    return (
                      <Badge key={perm} variant="outline" className="text-xs">
                        {permLabel}
                      </Badge>
                    );
                  })}
                  {role.permissions.length === 0 && (
                    <span className="text-xs text-muted-foreground">لا توجد صلاحيات</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteUserConfirm !== null}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={() => removeUser(deleteUserConfirm!)}
        onCancel={() => setDeleteUserConfirm(null)}
      />

      <ConfirmDialog
        open={deleteRoleConfirm !== null}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا الدور؟ سيتم إزالة الصلاحيات من المستخدمين المرتبطين."
        onConfirm={() => removeRole(deleteRoleConfirm!)}
        onCancel={() => setDeleteRoleConfirm(null)}
      />

      {userModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
          onClick={() => setUserModalOpen(false)}
        >
          <Card className="my-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingUserId ? "تعديل مستخدم" : "إضافة مستخدم جديد"}</CardTitle>
              <button onClick={() => setUserModalOpen(false)} className="rounded-lg p-1 hover:bg-muted/60">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">الاسم</label>
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">البريد الإلكتروني</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">الدور</label>
                <select
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  {data.roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={userForm.active}
                  onChange={(e) => setUserForm({ ...userForm, active: e.target.checked })}
                  className="rounded"
                />
                مفعل
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setUserModalOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={saveUser}>{editingUserId ? "حفظ التعديلات" : "إضافة"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {roleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
          onClick={() => setRoleModalOpen(false)}
        >
          <Card className="my-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingRoleId ? "تعديل دور" : "إضافة دور جديد"}</CardTitle>
              <button onClick={() => setRoleModalOpen(false)} className="rounded-lg p-1 hover:bg-muted/60">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">اسم الدور</label>
                <input
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">الصلاحيات</label>
                <div className="flex flex-col gap-2">
                  {allPermissions.map((perm) => (
                    <label key={perm.key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={roleForm.permissions.includes(perm.key)}
                        onChange={() => toggleRolePermission(perm.key)}
                        className="rounded"
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setRoleModalOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={saveRole}>{editingRoleId ? "حفظ التعديلات" : "إضافة"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
