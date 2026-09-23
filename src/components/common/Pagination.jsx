import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3 border-t border-[#00373A]/10 text-xs text-[#00373A]/70">
      <div className="flex items-center gap-2">
        <span>
          Showing <strong className="text-[#00373A]">{startItem}</strong> to{" "}
          <strong className="text-[#00373A]">{endItem}</strong> of{" "}
          <strong className="text-[#00373A]">{totalItems}</strong> entries
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-4">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-[#00373A]/20 bg-white px-2 py-1 text-xs text-[#00373A] focus:outline-none"
            >
              {pageSizeOptions.map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#00373A]/15 bg-white text-[#00373A] transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((p, idx, arr) => {
            const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
            return (
              <React.Fragment key={p}>
                {showEllipsis && <span className="px-1 text-[#00373A]/40">...</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`flex h-8 min-w-[32px] px-2 items-center justify-center rounded-lg font-semibold transition-colors ${
                    currentPage === p
                      ? "bg-[#00373A] text-white shadow-sm"
                      : "border border-[#00373A]/15 bg-white text-[#00373A] hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            );
          })}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#00373A]/15 bg-white text-[#00373A] transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
