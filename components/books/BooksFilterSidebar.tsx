"use client";

import {
  Bookmark,
  Building2,
  Check,
  Filter,
  Loader2,
  X,
} from "lucide-react";

export interface OptionItem {
  id: number | string;
  name: string;
  englishName?: string;
  [key: string]: any;
}

interface BooksFilterSidebarProps {
  genres: OptionItem[];
  publishers: OptionItem[];
  isLoadingFilters: boolean;
  selectedGenre: string;
  selectedPublisher: string;
  totalBooks: number;
  activeFiltersCount: number;
  onGenreChange: (genre: string) => void;
  onPublisherChange: (publisher: string) => void;
  onReset: () => void;
}

export function BooksFilterSidebar({
  genres,
  publishers,
  isLoadingFilters,
  selectedGenre,
  selectedPublisher,
  totalBooks,
  activeFiltersCount,
  onGenreChange,
  onPublisherChange,
  onReset,
}: BooksFilterSidebarProps) {
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

      {/* Genres */}
      <div className="space-y-1.5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Bookmark className="w-3 h-3 text-amber-500" /> Genres
        </h3>
        <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
          <button
            type="button"
            onClick={() => onGenreChange("all")}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
              selectedGenre === "all"
                ? "bg-amber-500 text-white font-semibold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>All Genres</span>
            <span
              className={`text-[10px] ${selectedGenre === "all" ? "text-amber-100" : "text-slate-400"}`}
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
              const isSelected = selectedGenre === genName;
              return (
                <button
                  key={gen.id || genName}
                  type="button"
                  onClick={() => onGenreChange(genName)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-amber-500 text-white font-semibold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{gen.name || gen.englishName}</span>
                  {isSelected && <Check className="w-3 h-3 shrink-0" />}
                </button>
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
                  <span className="truncate">{pub.name || pub.englishName}</span>
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
  selectedPublisher,
  totalBooks,
  onGenreChange,
  onPublisherChange,
  onReset,
}: BooksMobileFilterDrawerProps) {
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
          {/* Genres */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-2">
              Genres &amp; Categories
            </h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => onGenreChange("all")}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                  selectedGenre === "all"
                    ? "bg-amber-500 text-white font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>All Genres</span>
                <span>{totalBooks}</span>
              </button>
              {genres.map((gen) => {
                const genName = gen.name || gen.englishName || "";
                const isSelected = selectedGenre === genName;
                return (
                  <button
                    key={gen.id || genName}
                    type="button"
                    onClick={() => onGenreChange(genName)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-amber-500 text-white font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{gen.name || gen.englishName}</span>
                    {isSelected && <Check className="w-3 h-3 shrink-0" />}
                  </button>
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
                    <span className="truncate">{pub.name || pub.englishName}</span>
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
