"use client";

import { Filter, X } from "lucide-react";
import React from "react";

interface EBookActiveFiltersProps {
  selectedGenre: string;
  onClearGenre: () => void;
  selectedPublisher: string;
  onClearPublisher: () => void;
  selectedPlan: string;
  onClearPlan: () => void;
  searchQuery: string;
  onClearSearch: () => void;
  activeFiltersCount: number;
  onResetAll: () => void;
}

export default function EBookActiveFilters({
  selectedGenre,
  onClearGenre,
  selectedPublisher,
  onClearPublisher,
  selectedPlan,
  onClearPlan,
  searchQuery,
  onClearSearch,
  activeFiltersCount,
  onResetAll,
}: EBookActiveFiltersProps) {
  if (activeFiltersCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-3">
      <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
        <Filter className="w-2.5 h-2.5 text-indigo-500" /> Active:
      </span>

      {selectedGenre !== "all" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/80 text-indigo-800 text-[11px] font-medium">
          <span>Genre: {selectedGenre}</span>
          <X
            className="w-3 h-3 cursor-pointer hover:text-indigo-950"
            onClick={onClearGenre}
          />
        </span>
      )}

      {selectedPublisher !== "all" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-medium">
          <span>Publisher: {selectedPublisher}</span>
          <X
            className="w-3 h-3 cursor-pointer hover:text-emerald-950"
            onClick={onClearPublisher}
          />
        </span>
      )}

      {selectedPlan !== "all" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-medium">
          <span>Plan: {selectedPlan}</span>
          <X
            className="w-3 h-3 cursor-pointer hover:text-amber-950"
            onClick={onClearPlan}
          />
        </span>
      )}

      {searchQuery.trim() && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
          <span>&quot;{searchQuery}&quot;</span>
          <X
            className="w-3 h-3 cursor-pointer hover:text-slate-950"
            onClick={onClearSearch}
          />
        </span>
      )}

      <button
        type="button"
        onClick={onResetAll}
        className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold ml-1 cursor-pointer hover:underline"
      >
        Reset All
      </button>
    </div>
  );
}
