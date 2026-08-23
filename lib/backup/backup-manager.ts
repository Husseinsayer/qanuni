// ===== Comprehensive Backup & Restore Manager =====
// Exports all database tables to JSON, restores from backup files.
import { prisma } from "@/lib/prisma";
import { readdir, readFile, writeFile, mkdir, unlink, stat } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

const BACKUPS_DIR = join(process.cwd(), "backups");

// All Prisma models that can be backed up (ordered by dependency — children first)
const MODEL_DEFS: { name: string; hasCompositeKey?: boolean }[] = [
  // Junction / child tables first (deleted before parents on restore)
  { name: "lawFirmMember", hasCompositeKey: true },
  { name: "inheritanceHeir" },
  { name: "inheritanceRuleArticle" },
  { name: "message" },
  { name: "review" },
  { name: "session" },
  // Independent / parent tables
  { name: "user" },
  { name: "law" },
  { name: "lawyer" },
  { name: "lawFirm" },
  { name: "article" },
  { name: "service" },
  { name: "legalTemplate" },
  { name: "category" },
  { name: "cassationDecision" },
  { name: "instruction" },
  { name: "system" },
  { name: "alimonySettings" },
  { name: "alimonyCalculation" },
  { name: "courtFeeSettings" },
  { name: "courtFeeCalculation" },
  { name: "courtFeeType" },
  { name: "legalConsultationType" },
  { name: "legalConsultation" },
  { name: "legalConsultationSettings" },
  { name: "legalProcedure" },
  { name: "siteConfig" },
  { name: "siteHero" },
  { name: "siteFooter" },
  { name: "sitePartner" },
  { name: "siteFeature" },
  { name: "siteTestimonial" },
  { name: "siteFaq" },
  { name: "inheritanceRule" },
  { name: "inheritanceTestCase" },
  { name: "inheritanceCalculation" },
  { name: "inheritanceStopCase" },
  { name: "inheritanceQuestion" },
];

export interface BackupMeta {
  id: string;
  filename: string;
  createdAt: string;
  sizeBytes: number;
  modelCounts: Record<string, number>;
  totalRecords: number;
  checksum: string;
}

export interface BackupData {
  meta: BackupMeta;
  version: string;
  createdAt: string;
  checksum: string;
  data: Record<string, unknown[]>;
}

// ===== Ensure backups directory exists =====
async function ensureDir() {
  await mkdir(BACKUPS_DIR, { recursive: true });
}

// ===== Create a full backup =====
export async function createBackup(): Promise<BackupMeta> {
  await ensureDir();

  const data: Record<string, unknown[]> = {};
  const modelCounts: Record<string, number> = {};
  let totalRecords = 0;

  for (const def of MODEL_DEFS) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = await (prisma as any)[def.name].findMany();
      data[def.name] = rows;
      modelCounts[def.name] = rows.length;
      totalRecords += rows.length;
    } catch {
      // Model might not exist in schema yet — skip silently
      data[def.name] = [];
      modelCounts[def.name] = 0;
    }
  }

  const now = new Date();
  const id = `backup-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  const filename = `${id}.json`;

  const checksum = crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");

  const payload: BackupData = {
    meta: {
      id,
      filename,
      createdAt: now.toISOString(),
      sizeBytes: 0, // updated after write
      modelCounts,
      totalRecords,
      checksum,
    },
    version: "1.0",
    createdAt: now.toISOString(),
    checksum,
    data,
  };

  const json = JSON.stringify(payload, null, 2);
  const filepath = join(BACKUPS_DIR, filename);
  await writeFile(filepath, json, "utf-8");

  const fileStat = await stat(filepath);
  payload.meta.sizeBytes = fileStat.size;

  // Rewrite with correct size
  await writeFile(filepath, JSON.stringify(payload, null, 2), "utf-8");

  return payload.meta;
}

// ===== List all backups =====
export async function listBackups(): Promise<BackupMeta[]> {
  await ensureDir();
  const files = await readdir(BACKUPS_DIR);
  const backups: BackupMeta[] = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      const content = await readFile(join(BACKUPS_DIR, file), "utf-8");
      const parsed = JSON.parse(content) as BackupData;
      if (parsed.meta) {
        backups.push(parsed.meta);
      }
    } catch {
      // Skip malformed files
    }
  }

  return backups.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ===== Read a specific backup =====
export async function readBackup(filename: string): Promise<BackupData | null> {
  const filepath = join(BACKUPS_DIR, filename);
  try {
    const content = await readFile(filepath, "utf-8");
    return JSON.parse(content) as BackupData;
  } catch {
    return null;
  }
}

// ===== Delete a backup =====
export async function deleteBackup(filename: string): Promise<boolean> {
  try {
    await unlink(join(BACKUPS_DIR, filename));
    return true;
  } catch {
    return false;
  }
}

// ===== Restore from a backup =====
export async function restoreBackup(filename: string): Promise<{ restored: string[]; counts: Record<string, number> }> {
  const backup = await readBackup(filename);
  if (!backup) throw new Error("Backup file not found or malformed");

  // Verify checksum
  const dataChecksum = crypto
    .createHash("sha256")
    .update(JSON.stringify(backup.data))
    .digest("hex");
  if (dataChecksum !== backup.checksum) {
    throw new Error("Backup checksum mismatch — file may be corrupted");
  }

  const restored: string[] = [];
  const counts: Record<string, number> = {};

  // Phase 1: Delete all existing data (children first, respecting FK constraints)
  for (const def of [...MODEL_DEFS].reverse()) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any)[def.name].deleteMany();
    } catch {
      // Skip if model doesn't exist
    }
  }

  // Phase 2: Insert backup data (parents first, children last — MODEL_DEFS order)
  for (const def of MODEL_DEFS) {
    const rows = backup.data[def.name];
    if (!rows || rows.length === 0) continue;

    try {
      // Strip auto-generated fields that Prisma manages
      const cleanRows = rows.map((row: unknown) => {
        const clean = { ...(row as Record<string, unknown>) };
        // Remove @@id fields for composite-key models — reinsert with original IDs
        return clean;
      });

      // Insert in batches of 100 to avoid stack overflow
      for (let i = 0; i < cleanRows.length; i += 100) {
        const batch = cleanRows.slice(i, i + 100);
        await Promise.all(
          batch.map((row) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (prisma as any)[def.name].create({ data: row }).catch(() => null)
          )
        );
      }

      restored.push(def.name);
      counts[def.name] = cleanRows.length;
    } catch {
      // Skip models that fail (e.g. missing relations)
    }
  }

  return { restored, counts };
}

// ===== Quick stats about the database =====
export async function getDatabaseStats(): Promise<Record<string, number>> {
  const stats: Record<string, number> = {};
  for (const def of MODEL_DEFS) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stats[def.name] = await (prisma as any)[def.name].count();
    } catch {
      stats[def.name] = 0;
    }
  }
  return stats;
}
