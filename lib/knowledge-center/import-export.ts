// ===== Knowledge Center - Import/Export Utilities =====

import type { KnowledgeSection } from "./types";
import { getKnowledgeData, saveKnowledgeData } from "./store";

// === Export to JSON ===
export function exportToJSON(section?: KnowledgeSection): string {
  const data = getKnowledgeData();
  if (section) {
    return JSON.stringify({ [section]: data[section] }, null, 2);
  }
  return JSON.stringify(data, null, 2);
}

// === Export to CSV ===
export function exportToCSV(section: KnowledgeSection): string {
  const data = getKnowledgeData();
  const items = data[section] as unknown as Record<string, unknown>[];

  if (items.length === 0) return "";

  // Get all unique keys
  const keys = new Set<string>();
  items.forEach((item) => {
    Object.keys(item).forEach((key) => keys.add(key));
  });

  const headers = Array.from(keys);
  const csvRows: string[] = [headers.join(",")];

  for (const item of items) {
    const row = headers.map((key) => {
      const value = item[key];
      if (value === null || value === undefined) return "";
      if (Array.isArray(value)) return `"${value.join("; ")}"`;
      if (typeof value === "object") return `"${JSON.stringify(value)}"`;
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(row.join(","));
  }

  return csvRows.join("\n");
}

// === Download as file ===
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// === Export functions ===
export function exportSectionToJSON(section: KnowledgeSection): void {
  const content = exportToJSON(section);
  const timestamp = new Date().toISOString().split("T")[0];
  downloadFile(content, `knowledge-center-${section}-${timestamp}.json`, "application/json");
}

export function exportSectionToCSV(section: KnowledgeSection): void {
  const content = exportToCSV(section);
  const timestamp = new Date().toISOString().split("T")[0];
  downloadFile(content, `knowledge-center-${section}-${timestamp}.csv`, "text/csv");
}

export function exportAllToJSON(): void {
  const content = exportToJSON();
  const timestamp = new Date().toISOString().split("T")[0];
  downloadFile(content, `knowledge-center-full-${timestamp}.json`, "application/json");
}

// === Import from JSON ===
export function importFromJSON(jsonContent: string, section?: KnowledgeSection): {
  success: boolean;
  message: string;
  count?: number;
} {
  try {
    const parsed = JSON.parse(jsonContent);
    const data = getKnowledgeData();

    if (section) {
      if (!parsed[section]) {
        return { success: false, message: `القسم "${section}" غير موجود في الملف` };
      }
      const items = parsed[section];
      if (!Array.isArray(items)) {
        return { success: false, message: "البيانات ليست في تنسيق مصفوفة" };
      }

      // Merge items (avoid duplicates by ID)
      const existingIds = new Set((data[section] as { id: string }[]).map((item) => item.id));
      const newItems = items.filter((item: { id: string }) => !existingIds.has(item.id));

      (data[section] as unknown[]) = [...(data[section] as unknown[]), ...newItems];
      saveKnowledgeData(data);

      return { success: true, message: `تم استيراد ${newItems.length} عنصر بنجاح`, count: newItems.length };
    } else {
      // Import all sections
      for (const key of Object.keys(parsed) as KnowledgeSection[]) {
        if (data[key] !== undefined && Array.isArray(parsed[key])) {
          const existingIds = new Set((data[key] as { id: string }[]).map((item) => item.id));
          const newItems = (parsed[key] as { id: string }[]).filter((item) => !existingIds.has(item.id));
          (data[key] as unknown[]) = [...(data[key] as unknown[]), ...newItems];
        }
      }
      saveKnowledgeData(data);
      return { success: true, message: "تم استيراد البيانات بنجاح" };
    }
  } catch (error) {
    return { success: false, message: `خطأ في قراءة الملف: ${error instanceof Error ? error.message : "غير معروف"}` };
  }
}

// === Import from CSV ===
export function importFromCSV(csvContent: string, section: KnowledgeSection): {
  success: boolean;
  message: string;
  count?: number;
} {
  try {
    const lines = csvContent.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      return { success: false, message: "الملف فارغ أو لا يحتوي على بيانات" };
    }

    const headers = lines[0].split(",").map((h) => h.trim());
    const data = getKnowledgeData();
    const items: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;

      const item: Record<string, unknown> = {};
      headers.forEach((header, idx) => {
        let value = values[idx];
        // Try to parse arrays (semicolon-separated)
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
          if (value.includes("; ")) {
            item[header] = value.split("; ");
          } else {
            item[header] = value;
          }
        } else {
          item[header] = value;
        }
      });
      items.push(item);
    }

    // Merge items (avoid duplicates by ID)
    const existingIds = new Set((data[section] as { id: string }[]).map((item) => item.id));
    const newItems = items.filter((item) => !existingIds.has(item.id as string));

    (data[section] as unknown[]) = [...(data[section] as unknown[]), ...newItems];
    saveKnowledgeData(data);

    return { success: true, message: `تم استيراد ${newItems.length} عنصر بنجاح`, count: newItems.length };
  } catch (error) {
    return { success: false, message: `خطأ في قراءة الملف: ${error instanceof Error ? error.message : "غير معروف"}` };
  }
}

// === Parse CSV line (handles quoted values) ===
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// === File input helper ===
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("فشل قراءة الملف"));
    reader.readAsText(file);
  });
}
