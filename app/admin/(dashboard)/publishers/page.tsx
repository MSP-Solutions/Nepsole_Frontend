"use client";

import React, { useEffect, useState } from "react";
import AddPublishersDialog from "@/components/admin/AddPublishersDialog";
import ViewPublisherDialog from "@/components/admin/ViewPublisherDialog";
import DeletePublisherDialog from "@/components/admin/DeletePublisherDialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  BookOpenIcon,
  ChevronLeft,
  ChevronRight,
  Edit2Icon,
  EyeIcon,
  Globe,
  Loader2,
  Mail,
  MapPinIcon,
  Plus,
  RefreshCw,
  Trash2Icon,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

export interface SocialLinkItem {
  id: number;
  publisherId: number;
  platform: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PublisherItem {
  id: number;
  name: string;
  about?: string;
  establishedYear?: number | null;
  address?: string;
  phoneNumbers?: string[];
  email?: string;
  websiteUrl?: string;
  publicationLogoUrl?: string | null;
  booksPublished?: number;
  authorsCount?: number;
  booksSold?: number;
  yearsOfPublishing?: number | null;
  createdAt?: string;
  updatedAt?: string;
  socialLinks?: SocialLinkItem[];
  _count?: {
    books: number;
  };
}

export default function Page() {
  const [publishers, setPublishers] = useState<PublisherItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [editingPublisher, setEditingPublisher] =
    useState<PublisherItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [viewingPublisher, setViewingPublisher] =
    useState<PublisherItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [deletingPublisher, setDeletingPublisher] =
    useState<PublisherItem | null>(null);
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

  const fetchPublishers = async (page = currentPage, limit = pageSize) => {
    setIsLoading(true);
    try {
      const response = await axiosAuthInstance.get(
        `/v1/publisher?page=${page}&limit=${limit}`,
      );
      const list =
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);
      setPublishers(list);

      if (response.data?.pagination) {
        setPagination(response.data.pagination);
      } else {
        setPagination({
          total: list.length,
          page: page,
          limit: limit,
          totalPages: Math.max(1, Math.ceil(list.length / limit)),
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch publishers:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load publishers.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishers(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleOpenAddModal = () => {
    setEditingPublisher(null);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (publisher: PublisherItem) => {
    setEditingPublisher(publisher);
    setIsAddDialogOpen(true);
  };

  const handleView = (publisher: PublisherItem) => {
    setViewingPublisher(publisher);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (publisher: PublisherItem) => {
    setDeletingPublisher(publisher);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPublisher) return;

    setIsDeleting(true);
    try {
      await axiosAuthInstance.delete(`/v1/publisher/${deletingPublisher.id}`);
      toast.success("Publisher deleted successfully.");
      setIsDeleteDialogOpen(false);
      setDeletingPublisher(null);
      fetchPublishers();
    } catch (error: any) {
      console.error("Delete publisher error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete publisher.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        {/* Header Section */}
        <div className="mb-5 sm:mb-6 lg:mb-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                Publishers
              </h1>
              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
                Manage and view all registered publishing houses.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Publisher</span>
              </button>

              {/* Add / Edit Dialog */}
              <AddPublishersDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                publisherToEdit={editingPublisher}
                onSuccess={() => fetchPublishers()}
              />

              {/* View Dialog */}
              <ViewPublisherDialog
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
                publisher={viewingPublisher}
                onEdit={handleEdit}
              />

              {/* Delete Confirmation Dialog */}
              <DeletePublisherDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                publisher={deletingPublisher}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-sm font-medium text-slate-600">
              Loading publishers...
            </p>
          </div>
        ) : publishers.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpenIcon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              No Publishers Found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              There are no registered publishers yet. Click &quot;Add
              Publisher&quot; to create your first entry.
            </p>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Publisher</span>
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm md:block">
              {/* Table Header */}
              <div className="grid grid-cols-[minmax(0,1.5fr)_140px_140px_100px_110px] items-center border-b border-slate-100 bg-slate-50/70 px-5 py-3 lg:px-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Publisher
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Contact & Web
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Statistics
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Est. Year
                </span>
                <span className="text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Actions
                </span>
              </div>

              {/* Rows */}
              {publishers.map((publisher) => (
                <div
                  key={publisher.id}
                  className="group grid grid-cols-[minmax(0,1.5fr)_140px_140px_100px_110px] items-center border-b border-slate-100 px-5 py-4 transition-colors duration-200 last:border-0 hover:bg-slate-50/70 lg:px-6"
                >
                  {/* Publisher Name & Logo */}
                  <div
                    onClick={() => handleView(publisher)}
                    className="flex min-w-0 items-center gap-3 sm:gap-4 cursor-pointer"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 font-bold text-slate-600">
                      {publisher.publicationLogoUrl ? (
                        <img
                          src={publisher.publicationLogoUrl}
                          alt={publisher.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>
                          {publisher.name
                            ? publisher.name.charAt(0).toUpperCase()
                            : "P"}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-xs font-semibold text-slate-800 hover:text-indigo-600 sm:text-sm">
                        {publisher.name}
                      </h2>

                      {publisher.address && (
                        <div className="mt-1 flex min-w-0 items-center gap-1 text-[11px] text-slate-400">
                          <MapPinIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate">{publisher.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact & Web */}
                  <div className="flex flex-col gap-1 text-xs text-slate-600">
                    {publisher.email && (
                      <div className="flex items-center gap-1.5 truncate text-[11px]">
                        <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate">{publisher.email}</span>
                      </div>
                    )}
                    {publisher.websiteUrl && (
                      <a
                        href={publisher.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 truncate text-[11px] text-indigo-600 hover:underline"
                      >
                        <Globe className="h-3 w-3 shrink-0 text-indigo-500" />
                        <span className="truncate">Website</span>
                      </a>
                    )}
                  </div>

                  {/* Statistics */}
                  <div className="flex flex-col gap-0.5 text-xs">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
                      <BookOpenIcon className="h-3 w-3 text-indigo-500" />
                      {publisher.booksPublished} Books
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Users className="h-3 w-3 text-slate-400" />
                      {publisher.authorsCount ?? 0} Authors
                    </span>
                  </div>

                  {/* Established Year */}
                  <div>
                    <span className="text-xs font-medium text-slate-700">
                      {publisher.establishedYear
                        ? `Est. ${publisher.establishedYear}`
                        : "—"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleView(publisher)}
                      aria-label={`View ${publisher.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-95 cursor-pointer"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEdit(publisher)}
                      aria-label={`Edit ${publisher.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 cursor-pointer"
                      title="Edit"
                    >
                      <Edit2Icon className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(publisher)}
                      aria-label={`Delete ${publisher.name}`}
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
            <div className="grid gap-3 sm:grid-cols-2 md:hidden">
              {publishers.map((publisher) => (
                <article
                  key={publisher.id}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => handleView(publisher)}
                      className="flex min-w-0 items-center gap-3 cursor-pointer"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 font-bold text-slate-600">
                        {publisher.publicationLogoUrl ? (
                          <img
                            src={publisher.publicationLogoUrl}
                            alt={publisher.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>
                            {publisher.name
                              ? publisher.name.charAt(0).toUpperCase()
                              : "P"}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="break-words text-sm font-semibold leading-5 text-slate-800 hover:text-indigo-600">
                          {publisher.name}
                        </h2>

                        {publisher.address && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                            <MapPinIcon className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {publisher.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-slate-50 p-2.5">
                      <div className="flex items-center gap-2">
                        <BookOpenIcon className="h-3.5 w-3.5 text-indigo-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {publisher._count?.books ??
                              publisher.booksPublished ??
                              0}
                          </p>
                          <p className="text-[9px] text-slate-400">Books</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-2.5">
                      <p className="text-xs font-bold text-slate-800">
                        {publisher.establishedYear ?? "N/A"}
                      </p>
                      <p className="text-[9px] text-slate-400">Established</p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] text-slate-400">
                      ID: #{publisher.id}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleView(publisher)}
                        aria-label={`View ${publisher.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(publisher)}
                        aria-label={`Edit ${publisher.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
                        title="Edit"
                      >
                        <Edit2Icon className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(publisher)}
                        aria-label={`Delete ${publisher.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </div>
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
                    publishers
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
                      <option value={15}>15</option>
                      <option value={20}>20</option>
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
