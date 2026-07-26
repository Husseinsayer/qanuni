/**
 * Generic CSV export utility with Arabic BOM support.
 * Usage: exportCsv({ filename: "my_data", headers: [...], rows: [[...], ...] })
 */

interface CsvExportOptions {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  /** Automatically set to today's date if omitted */
  dateSuffix?: string;
}

export function exportCsv({ filename, headers, rows, dateSuffix }: CsvExportOptions) {
  const date = dateSuffix || new Date().toISOString().slice(0, 10);
  const bom = "\uFEFF";
  const escape = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
  const csvContent =
    bom +
    [
      headers.map(escape).join(","),
      ...rows.map((row) => row.map(escape).join(",")),
    ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${date}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
