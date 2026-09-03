"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  Star,
  Search,
  Trash2,
  RefreshCw,
  MessageSquare,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  X,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export interface AdminReviewItem {
  id: number | string;
  bookId: number | string;
  userId?: number | string;
  rating: number | string;
  review?: string;
  content?: string;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id?: number | string;
    name?: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    imageUrl?: string;
    [key: string]: any;
  };
  book?: {
    id?: number | string;
    title?: string;
    price?: number | string;
    coverImage?: string;
    image?: string;
    images?: any[];
    authors?: any[];
    authorBooks?: any[];
    publisher?: any;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<string>("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // View modal
  const [viewReview, setViewReview] = useState<AdminReviewItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);

  // Delete modal
  const [reviewToDelete, setReviewToDelete] = useState<AdminReviewItem | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchReviews = useCallback(
    async (
      page = currentPage,
      limit = pageSize,
      search = debouncedSearch,
      isManual = false,
    ) => {
      if (isManual) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        let url = `/v1/reviews/all?page=${page}&limit=${limit}`;
        if (search.trim()) {
          url += `&search=${encodeURIComponent(search.trim())}`;
        }

        let res;
        try {
          res = await axiosAuthInstance.get(url);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            let altUrl = `/api/v1/reviews/all?page=${page}&limit=${limit}`;
            if (search.trim())
              altUrl += `&search=${encodeURIComponent(search.trim())}`;
            res = await axiosAuthInstance.get(altUrl);
          } else {
            throw err;
          }
        }

        const data = res.data?.data || res.data;
        const list: AdminReviewItem[] = Array.isArray(data)
          ? data
          : data?.reviews || data?.items || [];
        setReviews(list);

        const rawPagination =
          res.data?.pagination ||
          data?.pagination ||
          res.data?.meta ||
          data?.meta;

        if (rawPagination) {
          const totalCount =
            rawPagination.total ??
            rawPagination.totalCount ??
            rawPagination.count ??
            list.length;
          const limitCount = rawPagination.limit ?? limit;
          const pages =
            rawPagination.totalPages ??
            rawPagination.lastPage ??
            Math.max(1, Math.ceil(totalCount / limitCount));

          setPagination({
            total: totalCount,
            page: rawPagination.page ?? page,
            limit: limitCount,
            totalPages: pages,
          });
        } else {
          setPagination({
            total: list.length,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(list.length / limit)),
          });
        }
      } catch (error: any) {
        console.error("Failed to load reviews:", error);
        toast.error("Failed to load reviews list.");
        setReviews([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, pageSize, debouncedSearch],
  );

  useEffect(() => {
    fetchReviews(currentPage, pageSize, debouncedSearch);
  }, [fetchReviews, currentPage, pageSize, debouncedSearch]);

  // Handle Delete Review
  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    setIsDeleting(true);
    try {
      const reviewId = reviewToDelete.id;
      await axiosAuthInstance.delete(`/v1/reviews/admin/${reviewId}`);

      toast.success("Review deleted successfully.");
      setIsDeleteDialogOpen(false);
      setReviewToDelete(null);
      fetchReviews(currentPage, pageSize, debouncedSearch);
    } catch (error: any) {
      console.error("Failed to delete review:", error);
      const msg = error?.response?.data?.message || "Failed to delete review.";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter reviews by rating on client side if requested
  const filteredReviews = useMemo(() => {
    if (selectedRating === "ALL") return reviews;
    const targetRating = Number(selectedRating);
    return reviews.filter((r) => Math.round(Number(r.rating)) === targetRating);
  }, [reviews, selectedRating]);

  // Overall Statistics from loaded reviews
  const reviewStats = useMemo(() => {
    const total = pagination.total || reviews.length;
    if (reviews.length === 0) {
      return { total: 0, average: 0, fiveStarCount: 0, lowRatingCount: 0 };
    }

    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const avg = Number((sum / reviews.length).toFixed(1));
    const fiveStar = reviews.filter(
      (r) => Math.round(Number(r.rating)) === 5,
    ).length;
    const lowStar = reviews.filter(
      (r) => Math.round(Number(r.rating)) <= 2,
    ).length;

    return {
      total,
      average: avg,
      fiveStarCount: fiveStar,
      lowRatingCount: lowStar,
    };
  }, [reviews, pagination.total]);

  const getCoverImage = (review: AdminReviewItem): string | null => {
    if (review.book?.coverImage) return review.book.coverImage;
    if (review.book?.image) return review.book.image;
    const images = review.book?.images || [];
    if (images.length > 0) {
      const cover = images.find(
        (img: any) =>
          typeof img === "object" &&
          (img.type === "COVER" || img.imageType === "COVER"),
      );
      if (cover) return cover.url || cover.imageUrl;
      const first = images[0];
      if (typeof first === "string") return first;
      if (typeof first === "object") return first.url || first.imageUrl;
    }
    return null;
  };

  const getAuthorName = (review: AdminReviewItem): string => {
    const authors = review.book?.authors || review.book?.authorBooks || [];
    if (authors.length === 0) return "—";
    return (
      authors
        .map((a: any) => a.name || a.englishName || a.author?.name || "")
        .filter(Boolean)
        .join(", ") || "—"
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in-50 duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Customer Reviews
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor, inspect, and moderate book ratings & reviews submitted by
            customers.
          </p>
        </div>
      </div>
      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by book title, reviewer name, or keywords..."
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-gray-100/80 border border-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-indigo-300 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Counter */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium select-none">
          <span>
            Showing{" "}
            <strong className="text-gray-900 font-semibold">
              {reviews.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>
            –
            <strong className="text-gray-900 font-semibold">
              {Math.min(currentPage * pageSize, pagination.total || reviews.length)}
            </strong>{" "}
            of{" "}
            <strong className="text-gray-900 font-semibold">
              {pagination.total || reviews.length}
            </strong>{" "}
            reviews
          </span>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Book</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 min-w-[280px]">Review Feedback</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    <span>Loading reviews...</span>
                  </td>
                </tr>
              ) : filteredReviews.length > 0 ? (
                filteredReviews.map((rev) => {
                  const cover = getCoverImage(rev);
                  const author = getAuthorName(rev);
                  const ratingNum = Number(rev.rating) || 5;
                  const comment =
                    rev.review || rev.content || rev.comment || "—";
                  const customerName =
                    rev.user?.name ||
                    rev.user?.fullName ||
                    (rev.user?.email ? rev.user.email.split("@")[0] : "Reader");
                  const customerEmail = rev.user?.email || "—";
                  const bookTitle = rev.book?.title || `Book #${rev.bookId}`;

                  const formattedDate = rev.createdAt
                    ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={rev.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Book info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                            {cover ? (
                              <img
                                src={cover}
                                alt={bookTitle}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-[220px]">
                            <Link
                              href={`/books/${rev.bookId}`}
                              target="_blank"
                              className="font-bold text-slate-900 hover:text-indigo-600 transition truncate block"
                              title={bookTitle}
                            >
                              {bookTitle}
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* Customer info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 border border-indigo-200">
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 max-w-[160px]">
                            <p className="font-semibold text-slate-900 truncate">
                              {customerName}
                            </p>
                            <p
                              className="text-[10px] text-slate-400 truncate"
                              title={customerEmail}
                            >
                              {customerEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-lg border ${
                              ratingNum >= 4
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : ratingNum === 3
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            <Star className="w-3 h-3 fill-current text-current" />
                            <span>{ratingNum}★</span>
                          </span>
                        </div>
                      </td>

                      {/* Review Comment */}
                      <td className="py-3.5 px-4">
                        <p
                          className="text-xs text-slate-700 leading-relaxed line-clamp-2 italic"
                          title={comment}
                        >
                          &quot;{comment}&quot;
                        </p>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px] font-medium">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detail Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setViewReview(rev);
                              setIsViewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                            title="View Full Review"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setReviewToDelete(rev);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      No reviews found
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchTerm
                        ? `No reviews match "${searchTerm}".`
                        : "No customer reviews submitted yet."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {(pagination.totalPages > 1 || (pagination.total || reviews.length) > 10) && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 border-t border-gray-100 bg-white">
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-gray-500">
              <span>
                Page{" "}
                <strong className="text-gray-900 font-semibold">
                  {currentPage}
                </strong>{" "}
                of{" "}
                <strong className="text-gray-900 font-semibold">
                  {pagination.totalPages || 1}
                </strong>{" "}
                ({pagination.total || reviews.length} total reviews)
              </span>

              {/* Page size selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setPageSize(newSize);
                    setCurrentPage(1);
                    fetchReviews(1, newSize, debouncedSearch);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 outline-none focus:border-indigo-500 font-medium cursor-pointer shadow-2xs"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => {
                  const prev = currentPage - 1;
                  setCurrentPage(prev);
                  fetchReviews(prev, pageSize, debouncedSearch);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              {/* Numbered Page Buttons */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from(
                  { length: pagination.totalPages || 1 },
                  (_, i) => i + 1,
                )
                  .filter((p) => {
                    if ((pagination.totalPages || 1) <= 7) return true;
                    if (p === 1 || p === (pagination.totalPages || 1)) return true;
                    return Math.abs(p - currentPage) <= 1;
                  })
                  .map((p, index, array) => {
                    const prev = array[index - 1];
                    const showEllipsis = prev && p - prev > 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && (
                          <span className="px-2 text-xs text-gray-400 select-none">
                            …
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => {
                            setCurrentPage(p);
                            fetchReviews(p, pageSize, debouncedSearch);
                          }}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition cursor-pointer ${
                            currentPage === p
                              ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                              : "hover:bg-gray-100 text-gray-700 font-medium"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                disabled={currentPage >= (pagination.totalPages || 1) || isLoading}
                onClick={() => {
                  const next = currentPage + 1;
                  setCurrentPage(next);
                  fetchReviews(next, pageSize, debouncedSearch);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Review Modal */}
      {viewReview && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-2xl">
            <div className="p-6 bg-slate-50/80 border-b border-slate-100">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Customer Review Details</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Full review submission and metadata
              </DialogDescription>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Book Info Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <div className="w-12 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                  {getCoverImage(viewReview) ? (
                    <img
                      src={getCoverImage(viewReview)!}
                      alt={viewReview.book?.title || "Book"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {viewReview.book?.title || `Book #${viewReview.bookId}`}
                  </h4>
                </div>
              </div>

              {/* Reviewer Details */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Customer
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {viewReview.user?.name ||
                      viewReview.user?.fullName ||
                      "Verified Reader"}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {viewReview.user?.email || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Submitted On
                  </span>
                  <p className="font-medium text-slate-700 mt-0.5">
                    {viewReview.createdAt
                      ? new Date(viewReview.createdAt).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Rating & Full Comment */}
              <div className="space-y-2 p-4 rounded-2xl bg-amber-50/30 border border-amber-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Star Rating:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Number(viewReview.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-amber-700 ml-1">
                      {viewReview.rating} / 5
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/60">
                  <span className="text-xs font-bold text-slate-800 block mb-1">
                    Feedback Comment:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed italic whitespace-pre-wrap">
                    &quot;
                    {viewReview.review ||
                      viewReview.content ||
                      viewReview.comment ||
                      "No written comment provided."}
                    &quot;
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {reviewToDelete && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md p-6 rounded-3xl bg-white border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/80">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-slate-900">
                  Delete Customer Review?
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to permanently delete this review for
                  &quot;
                  <span className="font-semibold text-slate-800">
                    {reviewToDelete.book?.title ||
                      `Book #${reviewToDelete.bookId}`}
                  </span>
                  &quot; by &quot;
                  <span className="font-semibold text-slate-800">
                    {reviewToDelete.user?.name || "Customer"}
                  </span>
                  &quot;? This action cannot be undone.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setReviewToDelete(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Review</span>
                  </>
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}