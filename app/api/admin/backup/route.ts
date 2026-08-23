// ===== Admin Backup/Restore API =====
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import {
  createBackup,
  listBackups,
  readBackup,
  deleteBackup,
  restoreBackup,
  getDatabaseStats,
} from "@/lib/backup/backup-manager";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

// GET — list backups or get DB stats
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "stats") {
    const stats = await getDatabaseStats();
    return NextResponse.json({ stats });
  }

  if (action === "read") {
    const file = searchParams.get("file");
    if (!file) return NextResponse.json({ error: "Missing file param" }, { status: 400 });
    const backup = await readBackup(file);
    if (!backup) return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    // Return meta + data summary (not full data to avoid huge payloads)
    return NextResponse.json({
      meta: backup.meta,
      version: backup.version,
      modelNames: Object.keys(backup.data),
    });
  }

  const backups = await listBackups();
  return NextResponse.json({ backups });
}

// POST — create backup
export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const meta = await createBackup();
    return NextResponse.json({ ok: true, meta });
  } catch (err) {
    console.error("Backup failed:", err);
    return NextResponse.json({ error: "Backup failed" }, { status: 500 });
  }
}

// PUT — restore from backup
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { filename } = body;
  if (!filename) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }

  try {
    const result = await restoreBackup(filename);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Restore failed:", err);
    const message = err instanceof Error ? err.message : "Restore failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — delete a backup
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("file");
  if (!filename) {
    return NextResponse.json({ error: "Missing file param" }, { status: 400 });
  }

  const ok = await deleteBackup(filename);
  if (!ok) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
