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
import { useEffect, useState } from "react";
import { axiosInstance } from "@/utils/axiosInstances";

export interface OptionItem {
  id: number | string;
  name: string;
  englishName?: string;
  [key: string]: any;
}

export interface BooksFilterSidebarProps {
  genres: OptionItem[];
  publishers: OptionItem[];
  isLoadingFilters: boolean;
  selectedGenre: string;
  selectedSubGenre?: string;
  selectedPublisher: string;
  totalBooks: number;
  activeFiltersCount: number;
  onGenreChange: (genre: string) => void;
  onSubGenreChange?: (subGenre: string) => void;
  onPublisherChange: (publisher: string) => void;
  onReset: () => void;
}

/**
 * Fetch subgenres for a specific genre by calling /v1/subgenre/by-genre/:genreId
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
export function useGenreSubGenres(genres: OptionItem[], selectedGenre: string) {
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

export function BooksFilterSidebar({
  genres,
  publishers,
  isLoadingFilters,
  selectedGenre,
  selectedSubGenre = "all",
  selectedPublisher,
  totalBooks,
  activeFiltersCount,
  onGenreChange,
  onSubGenreChange,
  onPublisherChange,
  onReset,
}: BooksFilterSidebarProps) {
  const { subGenresByGenre, loadingGenres, expandedGenres, toggleExpand } =
    useGenreSubGenres(genres, selectedGenre);

  return (
    <aside className="hidden lg:block lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-5 sticky top-20">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-amber-500" />
          Refine Books
        </h2>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Categories and sub-category */}
      <div className="space-y-1.5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-amber-500" /> Categories and
            sub-category
          </span>
          {selectedSubGenre && selectedSubGenre !== "all" && (
            <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
              <Layers className="w-2.5 h-2.5" /> 1 active
            </span>
          )}
        </h3>

        <div className="max-h-64 sm:max-h-80 overflow-y-auto space-y-1 pr-1">
          <button
            type="button"
            onClick={() => {
              onGenreChange("all");
              onSubGenreChange?.("all");
            }}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
              selectedGenre === "all"
                ? "bg-amber-500 text-white font-semibold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>All Categories</span>
            <span
              className={`text-[10px] ${
                selectedGenre === "all" ? "text-amber-100" : "text-slate-400"
              }`}
            >
              {totalBooks}
            </span>
          </button>

          {isLoadingFilters ? (
            <div className="py-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
              Loading...
            </div>
          ) : (
            genres.map((gen) => {
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
                          ? "bg-amber-100/90 text-amber-900 font-bold border border-amber-300/80 shadow-2xs"
                          : "bg-amber-500 text-white font-semibold shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onGenreChange(genName);
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
                        <span className="ml-auto mr-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-800 font-semibold uppercase">
                          sub-filter
                        </span>
                      )}
                    </button>

                    {/* Expand / Collapse button */}
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
                              ? "text-amber-800 hover:bg-amber-200/70"
                              : "text-amber-100 hover:bg-amber-600 hover:text-white"
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
                    <div className="ml-3 pl-2.5 border-l-2 border-amber-200/90 my-1 space-y-0.5 animate-in fade-in-50 duration-150">
                      {isLoadingSubs ? (
                        <div className="py-1 px-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                          <span>Loading sub-categories...</span>
                        </div>
                      ) : subGenres.length === 0 ? (
                        <div className="py-1 px-2 text-[10px] text-slate-400 italic">
                          No sub-categories available
                        </div>
                      ) : (
                        <>
                          {/* Option to clear subgenre and view all books in this genre */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!isGenreSelected) onGenreChange(genName);
                              onSubGenreChange?.("all");
                            }}
                            className={`w-full text-left text-[11px] px-2 py-1 rounded-md transition-all flex items-center justify-between cursor-pointer ${
                              isGenreSelected &&
                              (!selectedSubGenre || selectedSubGenre === "all")
                                ? "bg-amber-500 text-white font-semibold shadow-2xs"
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
                                    onGenreChange(genName);
                                  }
                                  if (isSubSelected) {
                                    onSubGenreChange?.("all");
                                  } else {
                                    onSubGenreChange?.(subName);
                                  }
                                }}
                                className={`w-full text-left text-[11px] px-2 py-1 rounded-md transition-all flex items-center justify-between cursor-pointer ${
                                  isSubSelected
                                    ? "bg-amber-500 text-white font-semibold shadow-2xs"
                                    : "text-slate-600 hover:bg-amber-50/70 hover:text-amber-800"
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

      {/* Publishers */}
      <div className="space-y-1.5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Building2 className="w-3 h-3 text-indigo-500" /> Publishers
        </h3>
        <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
          <button
            type="button"
            onClick={() => onPublisherChange("all")}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
              selectedPublisher === "all"
                ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>All Publishers</span>
          </button>

          {isLoadingFilters ? (
            <div className="py-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
              Loading...
            </div>
          ) : (
            publishers.map((pub) => {
              const pubName = pub.name || pub.englishName || "";
              const isSelected = selectedPublisher === pubName;
              return (
                <button
                  key={pub.id || pubName}
                  type="button"
                  onClick={() => onPublisherChange(pubName)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white font-semibold shadow-2xs"
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

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

interface BooksMobileFilterDrawerProps extends BooksFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BooksMobileFilterDrawer({
  isOpen,
  onClose,
  genres,
  publishers,
  selectedGenre,
  selectedSubGenre = "all",
  selectedPublisher,
  totalBooks,
  onGenreChange,
  onSubGenreChange,
  onPublisherChange,
  onReset,
}: BooksMobileFilterDrawerProps) {
  const { subGenresByGenre, loadingGenres, expandedGenres, toggleExpand } =
    useGenreSubGenres(genres, selectedGenre);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto z-10 animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-amber-500" />
            Filter Books
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
          {/* Categories and sub-category */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                Categories and sub-category
              </h4>
              {selectedSubGenre && selectedSubGenre !== "all" && (
                <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                  <Layers className="w-2.5 h-2.5" /> 1 active
                </span>
              )}
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => {
                  onGenreChange("all");
                  onSubGenreChange?.("all");
                }}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                  selectedGenre === "all"
                    ? "bg-amber-500 text-white font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>All Categories</span>
                <span>{totalBooks}</span>
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
                            ? "bg-amber-100/90 text-amber-900 font-bold border border-amber-300/80 shadow-2xs"
                            : "bg-amber-500 text-white font-semibold shadow-2xs"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onGenreChange(genName);
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
                          <span className="ml-auto mr-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-800 font-semibold uppercase">
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
                                ? "text-amber-800 hover:bg-amber-200/70"
                                : "text-amber-100 hover:bg-amber-600 hover:text-white"
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

                    {/* Nested Subgenres in Mobile Drawer */}
                    {isExpanded && (
                      <div className="ml-3 pl-2.5 border-l-2 border-amber-200/90 my-1 space-y-0.5 animate-in fade-in-50 duration-150">
                        {isLoadingSubs ? (
                          <div className="py-1 px-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                            <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
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
                                if (!isGenreSelected) onGenreChange(genName);
                                onSubGenreChange?.("all");
                              }}
                              className={`w-full text-left text-[11px] px-2 py-1 rounded-md transition-all flex items-center justify-between cursor-pointer ${
                                isGenreSelected &&
                                (!selectedSubGenre ||
                                  selectedSubGenre === "all")
                                  ? "bg-amber-500 text-white font-semibold"
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
                                      onGenreChange(genName);
                                    }
                                    if (isSubSelected) {
                                      onSubGenreChange?.("all");
                                    } else {
                                      onSubGenreChange?.(subName);
                                    }
                                  }}
                                  className={`w-full text-left text-[11px] px-2 py-1 rounded-md transition-all flex items-center justify-between cursor-pointer ${
                                    isSubSelected
                                      ? "bg-amber-500 text-white font-semibold"
                                      : "text-slate-600 hover:bg-amber-50/70 hover:text-amber-800"
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
                onClick={() => onPublisherChange("all")}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                  selectedPublisher === "all"
                    ? "bg-indigo-600 text-white font-bold"
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
                    onClick={() => onPublisherChange(pubName)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">
                      {pub.name || pub.englishName}
                    </span>
                    {isSelected && <Check className="w-3 h-3 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
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
