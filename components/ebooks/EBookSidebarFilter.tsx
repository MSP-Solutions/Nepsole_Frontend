"use client";

import { Bookmark, Building2, Check, Filter, Loader2, X } from "lucide-react";
import React, { useState } from "react";

export interface OptionItem {
  id: number | string;
  name: string;
  englishName?: string;
  publicationLogoUrl?: string;
  [key: string]: any;
}

interface EBookSidebarFilterProps {
  selectedPlan: string;
  onSelectPlan: (plan: string) => void;
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  genres: OptionItem[];
  selectedPublisher: string;
  onSelectPublisher: (pub: string) => void;
  publishers: OptionItem[];
  totalEBooks: number;
  isLoadingFilters: boolean;
  activeFiltersCount: number;
  onResetFilters: () => void;
}

export default function EBookSidebarFilter({
  selectedPlan,
  onSelectPlan,
  selectedGenre,
  onSelectGenre,
  genres,
  selectedPublisher,
  onSelectPublisher,
  publishers,
  totalEBooks,
  isLoadingFilters,
  activeFiltersCount,
  onResetFilters,
}: EBookSidebarFilterProps) {
  const [genreSearch, setGenreSearch] = useState<string>("");
  const [publisherSearch, setPublisherSearch] = useState<string>("");

  const filteredGenreOptions = genres.filter((g) => {
    if (!genreSearch.trim()) return true;
    const name = (g.name || g.englishName || "").toLowerCase();
    return name.includes(genreSearch.toLowerCase());
  });

  const filteredPublisherOptions = publishers.filter((p) => {
    if (!publisherSearch.trim()) return true;
    const name = (p.name || p.englishName || "").toLowerCase();
    return name.includes(publisherSearch.toLowerCase());
  });

  return (
    <aside className="hidden lg:block lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-5 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          Filter E-Books
        </h2>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Access Plan Filter */}
      <div className="space-y-1.5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Access Plan
        </h3>
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => onSelectPlan("all")}
            className={`py-1 rounded-md transition text-center cursor-pointer ${
              selectedPlan === "all"
                ? "bg-white text-indigo-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onSelectPlan("FREE")}
            className={`py-1 rounded-md transition text-center cursor-pointer ${
              selectedPlan === "FREE"
                ? "bg-white text-emerald-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Free
          </button>
          <button
            type="button"
            onClick={() => onSelectPlan("PAID")}
            className={`py-1 rounded-md transition text-center cursor-pointer ${
              selectedPlan === "PAID"
                ? "bg-white text-indigo-700 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Paid
          </button>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Genres / Categories Filter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-indigo-500" /> Genres
          </h3>
          {genres.length > 5 && (
            <span className="text-[10px] text-slate-400">
              {genres.length} total
            </span>
          )}
        </div>

        {genres.length > 6 && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search genres..."
              value={genreSearch}
              onChange={(e) => setGenreSearch(e.target.value)}
              className="w-full pl-2 pr-6 py-1 text-[11px] rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400"
            />
            {genreSearch && (
              <button
                type="button"
                onClick={() => setGenreSearch("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
          <button
            type="button"
            onClick={() => onSelectGenre("all")}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
              selectedGenre === "all"
                ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>All Genres</span>
            <span
              className={`text-[10px] ${
                selectedGenre === "all" ? "text-indigo-100" : "text-slate-400"
              }`}
            >
              {totalEBooks}
            </span>
          </button>

          {isLoadingFilters ? (
            <div className="py-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
              Loading...
            </div>
          ) : (
            filteredGenreOptions.map((gen) => {
              const genName = gen.name || gen.englishName || "";
              const isSelected = selectedGenre === genName;
              return (
                <button
                  key={gen.id || genName}
                  type="button"
                  onClick={() => onSelectGenre(genName)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">
                    {gen.name || gen.englishName}
                  </span>
                  {isSelected && <Check className="w-3 h-3 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Publishers Filter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-emerald-600" /> Publishers
          </h3>
          {publishers.length > 5 && (
            <span className="text-[10px] text-slate-400">
              {publishers.length} total
            </span>
          )}
        </div>

        {publishers.length > 6 && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search publishers..."
              value={publisherSearch}
              onChange={(e) => setPublisherSearch(e.target.value)}
              className="w-full pl-2 pr-6 py-1 text-[11px] rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400"
            />
            {publisherSearch && (
              <button
                type="button"
                onClick={() => setPublisherSearch("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
          <button
            type="button"
            onClick={() => onSelectPublisher("all")}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
              selectedPublisher === "all"
                ? "bg-emerald-600 text-white font-semibold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>All Publishers</span>
          </button>

          {isLoadingFilters ? (
            <div className="py-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
              Loading...
            </div>
          ) : (
            filteredPublisherOptions.map((pub) => {
              const pubName = pub.name || pub.englishName || "";
              const isSelected = selectedPublisher === pubName;
              return (
                <button
                  key={pub.id || pubName}
                  type="button"
                  onClick={() => onSelectPublisher(pubName)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white font-semibold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">
                    {pub.name || pub.englishName}
                  </span>
                  {isSelected && <Check className="w-3 h-3 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
