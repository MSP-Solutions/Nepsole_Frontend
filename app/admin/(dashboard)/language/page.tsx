"use client";

import AddLanguageDialog, {
  LanguageItem,
} from "@/components/admin/AddLanguageDialog";
import DeleteLanguageDialog from "@/components/admin/DeleteLanguageDialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  ChevronLeft,
  ChevronRight,
  Edit2Icon,
  Globe,
  Languages,
  Loader2,
  Plus,
  Trash2Icon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function LanguagePage() {
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [editingLanguage, setEditingLanguage] = useState<LanguageItem | null>(
    null,
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [deletingLanguage, setDeletingLanguage] = useState<LanguageItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const fetchLanguages = async (page = currentPage, limit = pageSize) => {
    setIsLoading(true);
    try {
      const response = await axiosAuthInstance.get(
        `/v1/language?page=${page}&limit=${limit}`,
      );
      const rawData = response.data;
      const list = rawData?.data || (Array.isArray(rawData) ? rawData : []);
      setLanguages(list);

      if (rawData?.pagination) {
        setPagination(rawData.pagination);
      } else {
        setPagination({
          total: list.length,
          page: page,
          limit: limit,
          totalPages: Math.max(1, Math.ceil(list.length / limit)),
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch languages:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load languages.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleOpenAddModal = () => {
    setEditingLanguage(null);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (language: LanguageItem) => {
    setEditingLanguage(language);
    setIsAddDialogOpen(true);
  };

  const handleDeleteClick = (language: LanguageItem) => {
    setDeletingLanguage(language);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLanguage) return;

    setIsDeleting(true);
    try {
      await axiosAuthInstance.delete(`/v1/language/${deletingLanguage.id}`);
      toast.success("Language deleted successfully.");
      setIsDeleteDialogOpen(false);
      setDeletingLanguage(null);
      fetchLanguages(currentPage, pageSize);
    } catch (error: any) {
      console.error("Delete language error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete language.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter languages locally by search query if client side
  const filteredLanguages = languages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        {/* Header Section */}
        <div className="mb-5 sm:mb-6 lg:mb-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                Languages
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Language</span>
              </button>
            </div>
          </div>
        </div>
        {/* Modals */}
        <AddLanguageDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          languageToEdit={editingLanguage}
          onSuccess={() => fetchLanguages(currentPage, pageSize)}
        />

        <DeleteLanguageDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          language={deletingLanguage}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-sm font-medium text-slate-600">
              Loading languages...
            </p>
          </div>
        ) : filteredLanguages.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Languages className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              No Languages Found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {searchQuery
                ? "No languages match your search query."
                : 'There are no registered languages yet. Click "Add Language" to create one.'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Language</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:block">
              {/* Header */}
              <div className="grid grid-cols-[80px_minmax(0,2fr)_150px_120px] items-center border-b border-slate-100 bg-slate-50/70 px-5 py-3 lg:px-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  ID
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Language Name
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Code
                </span>
                <span className="text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Actions
                </span>
              </div>

              {/* Rows */}
              {filteredLanguages.map((lang) => (
                <div
                  key={lang.id}
                  className="group grid grid-cols-[80px_minmax(0,2fr)_150px_120px] items-center border-b border-slate-100 px-5 py-4 transition-colors duration-200 last:border-0 hover:bg-slate-50/70 lg:px-6"
                >
                  {/* ID */}
                  <span className="text-xs font-semibold text-slate-400">
                    #{lang.id}
                  </span>

                  {/* Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs border border-indigo-100">
                      <Globe className="h-4 w-4" />
                    </div>
                    <span className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
                      {lang.name}
                    </span>
                  </div>

                  {/* Code */}
                  <div>
                    <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                      {lang.code}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(lang)}
                      aria-label={`Edit ${lang.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 cursor-pointer"
                      title="Edit"
                    >
                      <Edit2Icon className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(lang)}
                      aria-label={`Delete ${lang.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Card Grid */}
            <div className="grid gap-3 sm:hidden">
              {filteredLanguages.map((lang) => (
                <article
                  key={lang.id}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-slate-800">
                          {lang.name}
                        </h2>
                        <span className="text-[10px] text-slate-400">
                          ID: #{lang.id}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                      {lang.code}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-end border-t border-slate-100 pt-3 gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(lang)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
                      title="Edit"
                    >
                      <Edit2Icon className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(lang)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls Footer */}
            {pagination.total > 0 && (
              <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                  <p>
                    Showing{" "}
                    <span className="font-bold text-slate-900">
                      {pagination.total === 0
                        ? 0
                        : (pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-slate-900">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-slate-900">
                      {pagination.total}
                    </span>{" "}
                    languages
                  </p>

                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                    <span className="text-slate-400 text-xs">Per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || isLoading}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-1 text-xs">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1,
                    )
                      .filter((p) => {
                        if (pagination.totalPages <= 5) return true;
                        return (
                          Math.abs(p - currentPage) <= 1 ||
                          p === 1 ||
                          p === pagination.totalPages
                        );
                      })
                      .map((pageNum, idx, arr) => {
                        const showEllipsisBefore =
                          idx > 0 && pageNum - arr[idx - 1] > 1;
                        return (
                          <React.Fragment key={pageNum}>
                            {showEllipsisBefore && (
                              <span className="px-1 text-slate-400">...</span>
                            )}
                            <button
                              type="button"
                              onClick={() => setCurrentPage(pageNum)}
                              className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold transition cursor-pointer ${
                                currentPage === pageNum
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : "text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage >= pagination.totalPages || isLoading}
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, pagination.totalPages),
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
