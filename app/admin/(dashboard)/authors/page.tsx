"use client";

import AddAuthorDialog from "@/components/admin/AddAuthorDialog";
import DeleteAuthorDialog from "@/components/admin/DeleteAuthorDialog";
import ViewAuthorDialog from "@/components/admin/ViewAuthorDialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit2Icon,
  EyeIcon,
  Globe,
  Loader2,
  Plus,
  Search,
  Trash2Icon,
  User,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface SocialLinkItem {
  id?: number | string;
  authorId?: number | string;
  platform: string;
  url: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthorItem {
  id: number | string;
  name: string;
  positions?: string;
  bio?: string;
  nationality?: string;
  imageUrl?: string | null;
  image?: string | null;
  profileImage?: string | null;
  websiteUrl?: string;
  booksPublished?: number | string;
  yearsOfWriting?: number | string;
  booksSold?: number | string;
  happyReaders?: number | string;
  socialLinks?: SocialLinkItem[] | string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    books: number;
  };
  [key: string]: any;
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [editingAuthor, setEditingAuthor] = useState<AuthorItem | null>(null);

  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [viewingAuthor, setViewingAuthor] = useState<AuthorItem | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [deletingAuthor, setDeletingAuthor] = useState<AuthorItem | null>(null);
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

  const fetchAuthors = async (page = currentPage, limit = pageSize) => {
    setIsLoading(true);
    try {
      const response = await axiosAuthInstance.get(
        `/v1/author?page=${page}&limit=${limit}`,
      );
      const rawData = response.data;
      const list =
        rawData?.data ||
        rawData?.authors ||
        (Array.isArray(rawData) ? rawData : []);
      setAuthors(list);

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
      console.error("Failed to fetch authors:", error);
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Failed to load authors.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleOpenAddModal = () => {
    setEditingAuthor(null);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (author: AuthorItem) => {
    setEditingAuthor(author);
    setIsAddDialogOpen(true);
  };

  const handleView = (author: AuthorItem) => {
    setViewingAuthor(author);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (author: AuthorItem) => {
    setDeletingAuthor(author);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAuthor) return;

    setIsDeleting(true);
    try {
      await axiosAuthInstance.delete(`/v1/author/${deletingAuthor.id}`);
      toast.success("Author deleted successfully.");
      setIsDeleteDialogOpen(false);
      setDeletingAuthor(null);
      fetchAuthors(currentPage, pageSize);
    } catch (error: any) {
      console.error("Delete author error:", error);
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Failed to delete author.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper function to extract initials
  const getInitials = (name?: string) => {
    if (!name) return "AU";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Filter authors locally by search query
  const filteredAuthors = authors.filter(
    (author) =>
      (author.name &&
        String(author.name)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (author.positions &&
        (Array.isArray(author.positions)
          ? author.positions.join(" ").toLowerCase()
          : String(author.positions).toLowerCase()
        ).includes(searchQuery.toLowerCase())) ||
      (author.nationality &&
        (Array.isArray(author.nationality)
          ? author.nationality.join(" ").toLowerCase()
          : String(author.nationality).toLowerCase()
        ).includes(searchQuery.toLowerCase())),
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        {/* Header Section */}
        <div className="mb-5 sm:mb-6 lg:mb-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                Authors
              </h1>
              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
                Manage and view all registered authors and their publications.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Author</span>
              </button>

              {/* Add / Edit Dialog */}
              <AddAuthorDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                authorToEdit={editingAuthor}
                onSuccess={() => fetchAuthors(currentPage, pageSize)}
              />

              {/* View Dialog */}
              <ViewAuthorDialog
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
                author={viewingAuthor}
                onEdit={handleEdit}
              />

              {/* Delete Confirmation Dialog */}
              <DeleteAuthorDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                author={deletingAuthor}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
              />
            </div>
          </div>
        </div>

        {/* Filter Card & Search Bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search authors by name, role or nationality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-sm font-medium text-slate-600">
              Loading authors...
            </p>
          </div>
        ) : filteredAuthors.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <User className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              No Authors Found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {searchQuery
                ? "No authors match your search query."
                : 'There are no registered authors yet. Click "Add Author" to create your first entry.'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Author</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm md:block">
              {/* Table Header */}
              <div className="grid grid-cols-[minmax(0,1.5fr)_140px_160px_140px_110px] items-center border-b border-slate-100 bg-slate-50/70 px-5 py-3 lg:px-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Author
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Nationality
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Statistics
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Website
                </span>
                <span className="text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Actions
                </span>
              </div>

              {/* Rows */}
              {filteredAuthors.map((author) => {
                const img =
                  author.imageUrl || author.image || author.profileImage;
                return (
                  <div
                    key={author.id}
                    className="group grid grid-cols-[minmax(0,1.5fr)_140px_160px_140px_110px] items-center border-b border-slate-100 px-5 py-4 transition-colors duration-200 last:border-0 hover:bg-slate-50/70 lg:px-6"
                  >
                    {/* Author Name & Image */}
                    <div
                      onClick={() => handleView(author)}
                      className="flex min-w-0 items-center gap-3 sm:gap-4 cursor-pointer"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-indigo-600 font-bold text-white text-xs shadow-xs">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={author.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{getInitials(author.name)}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-xs font-semibold text-slate-800 hover:text-indigo-600 sm:text-sm">
                          {author.name}
                        </h2>

                        {author.positions && (
                          <p className="mt-0.5 truncate text-[11px] text-indigo-600 font-medium">
                            {author.positions}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Nationality */}
                    <div>
                      {author.nationality ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                          {author.nationality}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>

                    {/* Statistics */}
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
                        <BookOpen className="h-3 w-3 text-indigo-500" />
                        {author.booksPublished ?? 0} Published
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Users className="h-3 w-3 text-slate-400" />
                        {author.happyReaders ?? 0} Readers
                      </span>
                    </div>

                    {/* Website */}
                    <div className="flex items-center">
                      {author.websiteUrl ? (
                        <a
                          href={author.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 truncate text-[11px] text-indigo-600 hover:underline max-w-[120px]"
                        >
                          <Globe className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                          <span className="truncate">Visit Web</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleView(author)}
                        aria-label={`View ${author.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-95 cursor-pointer"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(author)}
                        aria-label={`Edit ${author.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 cursor-pointer"
                        title="Edit"
                      >
                        <Edit2Icon className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(author)}
                        aria-label={`Delete ${author.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Card Grid */}
            <div className="grid gap-3 sm:grid-cols-2 md:hidden">
              {filteredAuthors.map((author) => {
                const img =
                  author.imageUrl || author.image || author.profileImage;
                return (
                  <article
                    key={author.id}
                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        onClick={() => handleView(author)}
                        className="flex min-w-0 items-center gap-3 cursor-pointer"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-indigo-600 font-bold text-white text-xs">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img}
                              alt={author.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>{getInitials(author.name)}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h2 className="break-words text-sm font-semibold leading-5 text-slate-800 hover:text-indigo-600">
                            {author.name}
                          </h2>

                          {author.positions && (
                            <p className="text-[11px] text-indigo-600 font-medium truncate">
                              {author.positions}
                            </p>
                          )}
                        </div>
                      </div>

                      {author.nationality && (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {author.nationality}
                        </span>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {author.booksPublished ?? 0}
                            </p>
                            <p className="text-[9px] text-slate-400">Books</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-indigo-500" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {author.happyReaders ?? 0}
                            </p>
                            <p className="text-[9px] text-slate-400">Readers</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-[10px] text-slate-400">
                        ID: #{author.id}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleView(author)}
                          aria-label={`View ${author.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(author)}
                          aria-label={`Edit ${author.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2Icon className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteClick(author)}
                          aria-label={`Delete ${author.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
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
                    authors
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
