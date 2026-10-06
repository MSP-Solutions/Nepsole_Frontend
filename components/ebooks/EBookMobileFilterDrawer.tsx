"use client";

import {
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
  Layers,
  Loader2,
  X,
} from "lucide-react";
import React from "react";
import { OptionItem, useEBookGenreSubGenres } from "./EBookSidebarFilter";

interface EBookMobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: string;
  onSelectPlan: (plan: string) => void;
  selectedGenre: string;
  selectedSubGenre?: string;
  onSelectGenre: (genre: string) => void;
  onSelectSubGenre?: (subGenre: string) => void;
  genres: OptionItem[];
  selectedPublisher: string;
  onSelectPublisher: (pub: string) => void;
  publishers: OptionItem[];
  totalEBooks: number;
  onResetFilters: () => void;
}

export default function EBookMobileFilterDrawer({
  isOpen,
  onClose,
  selectedPlan,
  onSelectPlan,
  selectedGenre,
  selectedSubGenre = "all",
  onSelectGenre,
  onSelectSubGenre,
  genres,
  selectedPublisher,
  onSelectPublisher,
  publishers,
  totalEBooks,
  onResetFilters,
}: EBookMobileFilterDrawerProps) {
  const { subGenresByGenre, loadingGenres, expandedGenres, toggleExpand } =
    useEBookGenreSubGenres(genres, selectedGenre);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Content */}
      <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto z-10 animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-indigo-600" />
            Filter E-Books
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 py-3 space-y-4">
          {/* Access Plan */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-2">
              Access Plan
            </h4>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => onSelectPlan("all")}
                className={`py-1.5 rounded-md text-center cursor-pointer ${
                  selectedPlan === "all"
                    ? "bg-white text-indigo-700 font-bold shadow-2xs"
                    : "text-slate-600"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => onSelectPlan("FREE")}
                className={`py-1.5 rounded-md text-center cursor-pointer ${
                  selectedPlan === "FREE"
                    ? "bg-white text-emerald-700 font-bold shadow-2xs"
                    : "text-slate-600"
                }`}
              >
                Free
              </button>
              <button
                type="button"
                onClick={() => onSelectPlan("PAID")}
                className={`py-1.5 rounded-md text-center cursor-pointer ${
                  selectedPlan === "PAID"
                    ? "bg-white text-indigo-700 font-bold shadow-2xs"
                    : "text-slate-600"
                }`}
              >
                Paid
              </button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Categories and sub-category */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                Categories and sub-category
              </h4>
              {selectedSubGenre && selectedSubGenre !== "all" && (
                <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5">
                  <Layers className="w-2.5 h-2.5" /> 1 active
                </span>
              )}
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => {
                  onSelectGenre("all");
                  onSelectSubGenre?.("all");
                }}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                  selectedGenre === "all"
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>All Categories</span>
                <span>{totalEBooks}</span>
              </button>
              {genres.map((gen) => {
                const genName = gen.name || gen.englishName || "";
                const isGenreSelected =
                  selectedGenre.toLowerCase() === genName.toLowerCase() ||
                  (gen.id && String(gen.id) === selectedGenre);

                const isExpanded = gen.id
                  ? Boolean(expandedGenres[gen.id])
                  : false;
                const subGenres = gen.id ? subGenresByGenre[gen.id] || [] : [];
                const isLoadingSubs = gen.id
                  ? Boolean(loadingGenres[gen.id])
                  : false;
                const hasActiveSub =
                  isGenreSelected &&
                  selectedSubGenre &&
                  selectedSubGenre !== "all";

                return (
                  <div key={gen.id || genName} className="space-y-0.5">
                    <div
                      className={`w-full rounded-lg transition-all flex items-center justify-between ${
                        isGenreSelected
                          ? hasActiveSub
                            ? "bg-indigo-100/90 text-indigo-900 font-bold border border-indigo-300/80 shadow-2xs"
                            : "bg-indigo-600 text-white font-semibold shadow-2xs"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectGenre(genName);
                          if (gen.id && !expandedGenres[gen.id]) {
                            toggleExpand(gen.id);
                          }
                        }}
                        className="flex-1 text-left text-xs px-2.5 py-1.5 flex items-center gap-1.5 truncate cursor-pointer"
                      >
                        <span className="truncate">
                          {gen.name || gen.englishName}
                        </span>
                        {isGenreSelected && !hasActiveSub && (
                          <Check className="w-3 h-3 shrink-0 ml-auto mr-1" />
                        )}
                        {hasActiveSub && (
                          <span className="ml-auto mr-1 text-[9px] px-1.5 py-0.5 rounded bg-indigo-200/80 text-indigo-800 font-semibold uppercase">
                            sub
                          </span>
                        )}
                      </button>

                      {gen.id && (
                        <button
                          type="button"
                          onClick={(e) => toggleExpand(gen.id, e)}
                          className={`p-1.5 mr-1 rounded-md transition cursor-pointer ${
                            isGenreSelected
                              ? hasActiveSub
                                ? "text-indigo-800 hover:bg-indigo-200/70"
                                : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                              : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                          }`}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Nested Subgenres */}
                    {isExpanded && (
                      <div className="ml-3 pl-2.5 border-l-2 border-indigo-200/90 my-1 space-y-0.5 animate-in fade-in-50 duration-150">
                        {isLoadingSubs ? (
                          <div className="py-1 px-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                            <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                            <span>Loading sub-categories...</span>
                          </div>
                        ) : subGenres.length === 0 ? (
                          <div className="py-1 px-2 text-[10px] text-slate-400 italic">
                            No sub-categories available
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (!isGenreSelected) onSelectGenre(genName);
                                onSelectSubGenre?.("all");
                              }}
                              className={`w-full text-left text-[11px] px-2 py-1 rounded-md transition-all flex items-center justify-between cursor-pointer ${
                                isGenreSelected &&
                                (!selectedSubGenre ||
                                  selectedSubGenre === "all")
                                  ? "bg-indigo-600 text-white font-semibold"
                                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/70"
                              }`}
                            >
                              <span>All {genName}</span>
                              {isGenreSelected &&
                                (!selectedSubGenre ||
                                  selectedSubGenre === "all") && (
                                  <Check className="w-2.5 h-2.5 shrink-0" />
                                )}
                            </button>

                            {subGenres.map((sub) => {
                              const subName = sub.name || sub.englishName || "";
                              const isSubSelected =
                                isGenreSelected &&
                                (selectedSubGenre?.toLowerCase() ===
                                  subName.toLowerCase() ||
                                  (sub.id &&
                                    String(sub.id) === selectedSubGenre));

                              return (
                                <button
                                  key={sub.id || subName}
                                  type="button"
                                  onClick={() => {
                                    if (!isGenreSelected) {
                                      onSelectGenre(genName);
                                    }
                                    if (isSubSelected) {
                                      onSelectSubGenre?.("all");
                                    } else {
                                      onSelectSubGenre?.(subName);
                                    }
                                  }}
                                  className={`w-full text-left text-[11px] px-2 py-1 rounded-md transition-all flex items-center justify-between cursor-pointer ${
                                    isSubSelected
                                      ? "bg-indigo-600 text-white font-semibold"
                                      : "text-slate-600 hover:bg-indigo-50/70 hover:text-indigo-800"
                                  }`}
                                >
                                  <span className="truncate">{subName}</span>
                                  {isSubSelected && (
                                    <Check className="w-2.5 h-2.5 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Publishers */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-2">
              Publishers
            </h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => onSelectPublisher("all")}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                  selectedPublisher === "all"
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>All Publishers</span>
              </button>
              {publishers.map((pub) => {
                const pubName = pub.name || pub.englishName || "";
                const isSelected = selectedPublisher === pubName;
                return (
                  <button
                    key={pub.id || pubName}
                    type="button"
                    onClick={() => onSelectPublisher(pubName)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">
                      {pub.name || pub.englishName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
