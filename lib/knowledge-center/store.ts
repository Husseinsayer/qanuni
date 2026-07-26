// ===== Legal Knowledge Center - localStorage Store =====

import {
  type KnowledgeCenterData,
  type LegalProcedure,
  type LegalTemplate,
  type GovService,
  type KnowledgeQA,
  type LegalTerm,
  type GovernmentBody,
  type RequiredDocument,
  type Keyword,
  type KnowledgeAuditEntry,
  type KnowledgeSection,
} from "./types";

const STORAGE_KEY = "knowledge_center_data";

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
  return new Date().toISOString();
}

function buildDefaults(): KnowledgeCenterData {
  return {
    procedures: [],
    templates: [],
    services: [],
    qa: [],
    terms: [],
    governments: [],
    documents: [],
    keywords: [],
    auditLog: [],
  };
}

export function getKnowledgeData(): KnowledgeCenterData {
  if (typeof window === "undefined") return buildDefaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaults();
    const parsed = JSON.parse(raw) as KnowledgeCenterData;
    return { ...buildDefaults(), ...parsed };
  } catch {
    return buildDefaults();
  }
}

export function saveKnowledgeData(data: KnowledgeCenterData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function pushAudit(
  data: KnowledgeCenterData,
  section: string,
  entityId: string,
  entityName: string,
  action: KnowledgeAuditEntry["action"],
  details: string
): KnowledgeCenterData {
  const entry: KnowledgeAuditEntry = {
    id: generateId("audit"),
    timestamp: now(),
    section,
    entityId,
    entityName,
    action,
    details,
  };
  return { ...data, auditLog: [entry, ...data.auditLog].slice(0, 500) };
}

// ─── Generic CRUD helpers ──────────────────────────

type EntityMap = {
  procedures: LegalProcedure;
  templates: LegalTemplate;
  services: GovService;
  qa: KnowledgeQA;
  terms: LegalTerm;
  governments: GovernmentBody;
  documents: RequiredDocument;
  keywords: Keyword;
};

type EntityInput<K extends KnowledgeSection> = Omit<EntityMap[K], "id" | "createdAt" | "updatedAt" | "deletedAt">;

export function addItem<K extends KnowledgeSection>(
  section: K,
  item: EntityInput<K>
): EntityMap[K] {
  const data = getKnowledgeData();
  const ts = now();
  const newItem = {
    ...item,
    id: generateId(section.slice(0, 3)),
    createdAt: ts,
    updatedAt: ts,
    deletedAt: null,
  } as EntityMap[K];

  const arr = (data[section] as EntityMap[K][]).filter((e) => e.id !== newItem.id);
  arr.push(newItem);
  const updated = pushAudit(
    { ...data, [section]: arr },
    section,
    newItem.id,
    (newItem as unknown as Record<string, unknown>).name as string || newItem.id,
    "create",
    "تمت الإضافة"
  );
  saveKnowledgeData(updated);
  return newItem;
}

export function updateItem<K extends KnowledgeSection>(
  section: K,
  id: string,
  updates: Partial<EntityInput<K>>
): void {
  const data = getKnowledgeData();
  const arr = data[section] as EntityMap[K][];
  const idx = arr.findIndex((e) => e.id === id);
  if (idx === -1) return;

  const updatedItem = {
    ...arr[idx],
    ...updates,
    updatedAt: now(),
  };

  arr[idx] = updatedItem;
  const updated = pushAudit(
    { ...data, [section]: [...arr] },
    section,
    id,
    (updatedItem as unknown as Record<string, unknown>).name as string || id,
    "update",
    "تم التعديل"
  );
  saveKnowledgeData(updated);
}

export function softDeleteItem<K extends KnowledgeSection>(
  section: K,
  id: string
): void {
  const data = getKnowledgeData();
  const arr = data[section] as EntityMap[K][];
  const idx = arr.findIndex((e) => e.id === id);
  if (idx === -1) return;

  const item = arr[idx];
  arr[idx] = { ...item, deletedAt: now(), isActive: false } as EntityMap[K];
  const updated = pushAudit(
    { ...data, [section]: [...arr] },
    section,
    id,
    (item as unknown as Record<string, unknown>).name as string || id,
    "delete",
    "تم الحذف الناعم"
  );
  saveKnowledgeData(updated);
}

export function restoreItem<K extends KnowledgeSection>(
  section: K,
  id: string
): void {
  const data = getKnowledgeData();
  const arr = data[section] as EntityMap[K][];
  const idx = arr.findIndex((e) => e.id === id);
  if (idx === -1) return;

  const item = arr[idx];
  arr[idx] = { ...item, deletedAt: null, isActive: true } as EntityMap[K];
  const updated = pushAudit(
    { ...data, [section]: [...arr] },
    section,
    id,
    (item as unknown as Record<string, unknown>).name as string || id,
    "restore",
    "تمت الاستعادة"
  );
  saveKnowledgeData(updated);
}

export function hardDeleteItem<K extends KnowledgeSection>(
  section: K,
  id: string
): void {
  const data = getKnowledgeData();
  const arr = (data[section] as EntityMap[K][]).filter((e) => e.id !== id);
  const item = (data[section] as EntityMap[K][]).find((e) => e.id === id);
  const updated = pushAudit(
    { ...data, [section]: arr },
    section,
    id,
    (item as unknown as Record<string, unknown>)?.name as string || id,
    "delete",
    "تم الحذف نهائيًا"
  );
  saveKnowledgeData(updated);
}

export function getItems<K extends KnowledgeSection>(
  section: K,
  includeArchived = false
): EntityMap[K][] {
  const data = getKnowledgeData();
  const items = data[section] as EntityMap[K][];
  if (includeArchived) return items;
  return items.filter((e) => !e.deletedAt);
}

export function getActiveItems<K extends KnowledgeSection>(section: K): EntityMap[K][] {
  const data = getKnowledgeData();
  const items = data[section] as EntityMap[K][];
  return items.filter((e) => !e.deletedAt && e.isActive);
}

export function getItemById<K extends KnowledgeSection>(
  section: K,
  id: string
): EntityMap[K] | undefined {
  const data = getKnowledgeData();
  return (data[section] as EntityMap[K][]).find((e) => e.id === id);
}

export function getAuditLog(limit = 100): KnowledgeAuditEntry[] {
  return getKnowledgeData().auditLog.slice(0, limit);
}

export function getSectionStats() {
  const data = getKnowledgeData();
  return {
    procedures: data.procedures.filter((e) => !e.deletedAt).length,
    templates: data.templates.filter((e) => !e.deletedAt).length,
    services: data.services.filter((e) => !e.deletedAt).length,
    qa: data.qa.filter((e) => !e.deletedAt).length,
    terms: data.terms.filter((e) => !e.deletedAt).length,
    governments: data.governments.filter((e) => !e.deletedAt).length,
    documents: data.documents.filter((e) => !e.deletedAt).length,
    keywords: data.keywords.filter((e) => !e.deletedAt).length,
  };
}
