"use client";

import { useState, useEffect, useCallback } from "react";
import React from "react";
import {
  Plus,
  Search,
  BookOpen,
  Loader2,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import AddGenreDialog, { GenreData } from "@/components/admin/AddGenreDailog";
import { axiosAuthInstance } from "@/utils/axiosInstances";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function Page() {
  const [genres, setGenres] = useState<GenreData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [genreToEdit, setGenreToEdit] = useState<GenreData | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchGenres = useCallback(
    async (
      page = currentPage,
      limit = pageSize,
      searchParam = debouncedSearch,
    ) => {
      setIsLoading(true);
      try {
        const trimmedSearch = searchParam.trim();
        const query = trimmedSearch
          ? `/v1/genre?page=${page}&limit=${limit}&search=${encodeURIComponent(trimmedSearch)}`
          : `/v1/genre?page=${page}&limit=${limit}`;

        const response = await axiosAuthInstance.get(query);
        const data = response.data;
        const list = Array.isArray(data)
          ? data
          : data?.data || data?.genres || [];
        setGenres(list);

        // Parse pagination metadata
        if (data?.pagination) {
          setPagination({
            total: data.pagination.total ?? list.length,
            page: data.pagination.page ?? page,
            limit: data.pagination.limit ?? limit,
            totalPages:
              data.pagination.totalPages ??
              Math.max(
                1,
                Math.ceil((data.pagination.total ?? list.length) / limit),
              ),
          });
        } else if (data?.total !== undefined) {
          setPagination({
            total: data.total,
            page: data.page || page,
            limit: data.limit || limit,
            totalPages:
              data.totalPages || Math.max(1, Math.ceil(data.total / limit)),
          });
        } else if (data?.meta) {
          setPagination({
            total: data.meta.total ?? list.length,
            page: data.meta.page ?? page,
            limit: data.meta.limit ?? limit,
            totalPages:
              data.meta.totalPages ??
              Math.max(
                1,
                Math.ceil((data.meta.total ?? list.length) / limit),
              ),
          });
        } else {
          setPagination({
            total: list.length,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(list.length / limit)),
          });
        }
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, debouncedSearch],
  );

  useEffect(() => {
    fetchGenres(currentPage, pageSize, debouncedSearch);
  }, [currentPage, pageSize, debouncedSearch, fetchGenres]);

  const handleOpenAddModal = () => {
    setGenreToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (genre: GenreData) => {
    setGenreToEdit(genre);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this genre?")) return;

    setDeletingId(id);
    try {
      await axiosAuthInstance.delete(`/v1/genre/${id}`);
      toast.success("Genre deleted successfully.");
      fetchGenres(currentPage, pageSize, debouncedSearch);
    } catch (error: any) {
      console.error("Delete genre error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete genre.";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const getGenreIcon = (g: GenreData) => {
    const img = g?.icon || g?.image || g?.imageUrl || "";
    if (!img) return "";
    if (
      img.startsWith("http://") ||
      img.startsWith("https://") ||
      img.startsWith("data:") ||
      img.startsWith("blob:")
    ) {
      return img;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    return `${baseUrl}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Genres
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your book genres and categories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1749A0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123b83] cursor-pointer"
            >
              <Plus size={18} />
              Add Genre
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search genres..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Genres Grid / Loading / Empty State */}
        {isLoading ? (
          <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-gray-200 bg-white p-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#1749A0]" />
          </div>
        ) : genres.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {genres.map((genre, index) => {
                const iconUrl = getGenreIcon(genre);

                return (
                  <div
                    key={genre.id || index}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#1749A0]/40 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#1749A0]/10 text-[#1749A0]">
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={genre.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen size={20} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-gray-900 group-hover:text-[#1749A0]">
                          {genre.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleEdit(genre)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-[#1749A0] cursor-pointer"
                        title="Edit genre"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => genre.id && handleDelete(genre.id)}
                        disabled={deletingId === genre.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 cursor-pointer"
                        title="Delete genre"
                      >
                        {deletingId === genre.id ? (
                          <Loader2
                            size={16}
                            className="animate-spin text-rose-600"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    Showing{" "}
                    <strong className="font-semibold text-gray-900">
                      {pagination.total > 0
                        ? (currentPage - 1) * pageSize + 1
                        : 0}
                    </strong>{" "}
                    to{" "}
                    <strong className="font-semibold text-gray-900">
                      {Math.min(currentPage * pageSize, pagination.total)}
                    </strong>{" "}
                    of{" "}
                    <strong className="font-semibold text-gray-900">
                      {pagination.total}
                    </strong>{" "}
                    genres
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 outline-none focus:border-[#1749A0] focus:ring-1 focus:ring-[#1749A0] cursor-pointer"
                    >
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
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs"
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
                              <span className="px-1.5 text-gray-400 font-bold">
                                ...
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setCurrentPage(pageNum)}
                              className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold transition cursor-pointer text-xs ${
                                currentPage === pageNum
                                  ? "bg-[#1749A0] text-white shadow-xs"
                                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
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
                    disabled={
                      currentPage >= pagination.totalPages || isLoading
                    }
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, pagination.totalPages),
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs"
                    title="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <BookOpen size={32} className="mx-auto mb-3 text-gray-300" />

            <h3 className="font-semibold text-gray-800">No genres found</h3>

            <p className="mt-1 text-sm text-gray-500">
              {debouncedSearch
                ? `No genres matched "${debouncedSearch}". Try clearing the search.`
                : "Try adding a new genre using the Add Genre button above."}
            </p>

            {debouncedSearch && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Genre Dialog Component */}
      <AddGenreDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setGenreToEdit(null);
        }}
        genreToEdit={genreToEdit}
        onAddGenre={() => fetchGenres(currentPage, pageSize, debouncedSearch)}
      />
    </div>
  );
}
