"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface EBookPaginationProps {
  currentPage: number;
  pageSize: number;
  effectiveTotal: number;
  effectiveTotalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function EBookPagination({
  currentPage,
  pageSize,
  effectiveTotal,
  effectiveTotalPages,
  isLoading,
  onPageChange,
}: EBookPaginationProps) {
  if (isLoading || (effectiveTotalPages <= 1 && effectiveTotal <= 10)) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-200">
      <div className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-800">
          {(currentPage - 1) * pageSize + 1}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-slate-800">
          {Math.min(currentPage * pageSize, effectiveTotal)}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-800">
          {effectiveTotal}
        </span>{" "}
        e-books
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {/* Page Numbers with Ellipsis */}
        <div className="flex items-center gap-1">
          {Array.from({ length: effectiveTotalPages }, (_, i) => i + 1)
            .filter((p) => {
              if (effectiveTotalPages <= 7) return true;
              if (p === 1 || p === effectiveTotalPages) return true;
              if (Math.abs(p - currentPage) <= 1) return true;
              return false;
            })
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev && p - prev > 1;

              return (
                <React.Fragment key={p}>
                  {showEllipsis && (
                    <span className="px-1.5 text-slate-400 text-xs font-semibold">
                      ...
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onPageChange(p)}
                    disabled={isLoading}
                    className={`min-w-[32px] h-8 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center ${
                      currentPage === p
                        ? "bg-indigo-600 text-white shadow-2xs font-bold"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= effectiveTotalPages || isLoading}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
