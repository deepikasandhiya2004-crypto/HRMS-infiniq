import React, { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Pagination from "./Pagination.jsx";
import EmptyState from "./EmptyState.jsx";

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  keyField = "id",
  pagination = true,
  defaultPageSize = 10,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or filters to find what you are looking for.",
  onRowClick,
  className = "",
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc"); // 'asc' | 'desc'

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortDirection === "asc") setSortDirection("desc");
      else {
        setSortKey(null);
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;
      const comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pagination, currentPage, pageSize]);

  return (
    <div className={`overflow-hidden rounded-2xl bg-white border border-[#00373A]/10 shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#00373A]">
          <thead className="bg-[#00373A]/[0.03] border-b border-[#00373A]/10 text-xs font-bold uppercase tracking-wider text-[#00373A]/60">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3.5 ${col.className || ""} ${
                    col.sortable ? "cursor-pointer select-none hover:text-[#00373A]" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-[#00373A]/40">
                        {sortKey === col.key ? (
                          sortDirection === "asc" ? (
                            <ArrowUp size={13} className="text-[#00373A]" />
                          ) : (
                            <ArrowDown size={13} className="text-[#00373A]" />
                          )
                        ) : (
                          <ArrowUpDown size={13} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#00373A]/5">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-sm text-[#00373A]/50">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00373A] border-t-transparent" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row[keyField] || idx}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors hover:bg-[#00373A]/[0.02] ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-5 py-3.5 ${col.className || ""}`}>
                      {col.render ? col.render(row[col.key], row, idx) : row[col.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && !loading && sortedData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}
