"use client";

import { Filter, X } from "lucide-react";
import React from "react";
import { OptionItem } from "./EBookSidebarFilter";

interface EBookMobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: string;
  onSelectPlan: (plan: string) => void;
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
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
  onSelectGenre,
  genres,
  selectedPublisher,
  onSelectPublisher,
  publishers,
  totalEBooks,
  onResetFilters,
}: EBookMobileFilterDrawerProps) {
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
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
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

          {/* Genres */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-2">
              Genres & Categories
            </h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => onSelectGenre("all")}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                  selectedGenre === "all"
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>All Genres</span>
                <span>{totalEBooks}</span>
              </button>
              {genres.map((gen) => {
                const genName = gen.name || gen.englishName || "";
                const isSelected = selectedGenre === genName;
                return (
                  <button
                    key={gen.id || genName}
                    type="button"
                    onClick={() => onSelectGenre(genName)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">
                      {gen.name || gen.englishName}
                    </span>
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
