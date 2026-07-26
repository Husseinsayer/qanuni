"use client";
import { useState, useMemo } from "react";

export type SortDirection = "asc" | "desc" | null;

export function useAdminTable<T>(
  items: T[],
  searchFields: (keyof T)[],
  defaultPageSize = 10,
) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const toggleSort = (field: keyof T) => {
    if (sortField === field) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortField(null); setSortDir(null); }
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let result = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const val = item[field];
          return typeof val === "string" && val.toLowerCase().includes(q);
        })
      );
    }
    if (sortField && sortDir) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDir === "asc" ? aVal.localeCompare(bVal, "ar") : bVal.localeCompare(aVal, "ar");
        }
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }
    return result;
  }, [items, search, searchFields, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return {
    search,
    setSearch: handleSearch,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    sortField,
    sortDir,
    toggleSort,
    filtered,
    paged,
    totalPages,
    total: filtered.length,
  };
}
