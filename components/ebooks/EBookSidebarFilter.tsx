"use client";

import {
  Bookmark,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
  Layers,
  Loader2,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { axiosInstance } from "@/utils/axiosInstances";

export interface OptionItem {
  id: number | string;
  name: string;
  englishName?: string;
  publicationLogoUrl?: string;
  [key: string]: any;
}

export interface EBookSidebarFilterProps {
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
  isLoadingFilters: boolean;
  activeFiltersCount: number;
  onResetFilters: () => void;
}

/**
 * Fetch subgenres for an eBook genre from /v1/subgenre/by-genre/:genreId
 * with automatic fallback to /api/v1/subgenre/by-genre/:genreId
 */
export const fetchSubGenresByGenre = async (
  genreId: number | string,
): Promise<OptionItem[]> => {
  try {
    let res;
    try {
      res = await axiosInstance.get(`/v1/subgenre/by-genre/${genreId}`);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        res = await axiosInstance.get(`/api/v1/subgenre/by-genre/${genreId}`);
      } else {
        throw err;
      }
    }
    const data = res.data?.data || res.data;
    const list: OptionItem[] = Array.isArray(data)
      ? data
      : data?.subgenres || data?.subGenres || [];
    return list;
  } catch (error) {
    console.error(`Failed to load subgenres for genre ${genreId}:`, error);
    return [];
  }
};

/**
 * Hook to manage subgenres cache, loading states, and expanding/collapsing per genre
 */
export function useEBookGenreSubGenres(
  genres: OptionItem[],
  selectedGenre: string,
) {
  const [subGenresByGenre, setSubGenresByGenre] = useState<
    Record<string | number, OptionItem[]>
  >({});
  const [loadingGenres, setLoadingGenres] = useState<
    Record<string | number, boolean>
  >({});
  const [expandedGenres, setExpandedGenres] = useState<
    Record<string | number, boolean>
  >({});

  // Auto-expand and fetch subgenres for currently selected genre
  useEffect(() => {
    if (!selectedGenre || selectedGenre === "all") return;

    const matchedGen = genres.find(
      (g) =>
        (g.name && g.name.toLowerCase() === selectedGenre.toLowerCase()) ||
        (g.englishName &&
          g.englishName.toLowerCase() === selectedGenre.toLowerCase()) ||
        (g.id && String(g.id) === selectedGenre),
    );

    if (matchedGen?.id) {
      const gid = matchedGen.id;
      setExpandedGenres((prev) => ({ ...prev, [gid]: true }));

      if (!subGenresByGenre[gid] && !loadingGenres[gid]) {
        setLoadingGenres((prev) => ({ ...prev, [gid]: true }));
        fetchSubGenresByGenre(gid).then((list) => {
          setSubGenresByGenre((prev) => ({ ...prev, [gid]: list }));
          setLoadingGenres((prev) => ({ ...prev, [gid]: false }));
        });
      }
    }
  }, [selectedGenre, genres, subGenresByGenre, loadingGenres]);

  const toggleExpand = (genreId: number | string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const willExpand = !expandedGenres[genreId];
    setExpandedGenres((prev) => ({ ...prev, [genreId]: willExpand }));

    if (willExpand && !subGenresByGenre[genreId] && !loadingGenres[genreId]) {
      setLoadingGenres((prev) => ({ ...prev, [genreId]: true }));
      fetchSubGenresByGenre(genreId).then((list) => {
        setSubGenresByGenre((prev) => ({ ...prev, [genreId]: list }));
        setLoadingGenres((prev) => ({ ...prev, [genreId]: false }));
      });
    }
  };

  return {
    subGenresByGenre,
    loadingGenres,
    expandedGenres,
    toggleExpand,
  };
}

export default function EBookSidebarFilter({
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
  isLoadingFilters,
  activeFiltersCount,
  onResetFilters,
}: EBookSidebarFilterProps) {
  const [genreSearch, setGenreSearch] = useState<string>("");
  const [publisherSearch, setPublisherSearch] = useState<string>("");

  const { subGenresByGenre, loadingGenres, expandedGenres, toggleExpand } =
    useEBookGenreSubGenres(genres, selectedGenre);

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

      {/* Categories Filter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-indigo-500" /> Categories and
            sub-category
          </h3>
          {selectedSubGenre && selectedSubGenre !== "all" && (
            <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5">
              <Layers className="w-2.5 h-2.5" /> 1 active
            </span>
          )}
        </div>

        {genres.length > 6 && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
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

        <div className="max-h-64 sm:max-h-80 overflow-y-auto space-y-1 pr-1">
          <button
            type="button"
            onClick={() => {
              onSelectGenre("all");
              onSelectSubGenre?.("all");
            }}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
              selectedGenre === "all"
                ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>All Categories</span>
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
                    className={`w-full rounded-lg transition-all flex items-center justify-between group ${
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
                          sub-filter
                        </span>
                      )}
                    </button>

                    {/* Expand / Collapse Chevron */}
                    {gen.id && (
                      <button
                        type="button"
                        title={
                          isExpanded
                            ? "Collapse sub-categories"
                            : "Expand sub-categories"
                        }
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
                          {/* Option to clear subgenre and view all eBooks in this genre */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!isGenreSelected) onSelectGenre(genName);
                              onSelectSubGenre?.("all");
                            }}
                            className={`w-full text-left text-[11px] px-2 py-1 rounded-md transition-all flex items-center justify-between cursor-pointer ${
                              isGenreSelected &&
                              (!selectedSubGenre || selectedSubGenre === "all")
                                ? "bg-indigo-600 text-white font-semibold shadow-2xs"
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

                          {/* Subgenre items */}
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
                                    ? "bg-indigo-600 text-white font-semibold shadow-2xs"
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
