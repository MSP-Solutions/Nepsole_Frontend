"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Star,
  BookOpen,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import { getUserCookie } from "@/utils/cookies";
import AddReviewDialog from "@/components/reviews/AddReviewDialog";

export interface BookReviewItem {
  id?: number | string;
  bookId?: number | string;
  userId?: number | string;
  rating?: number | string;
  review?: string;
  content?: string;
  comment?: string;
  user?: {
    id?: number | string;
    name?: string;
    email?: string;
    avatar?: string;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface OrderDeliveredReviewsProps {
  order: any;
}

export default function OrderDeliveredReviews({ order }: OrderDeliveredReviewsProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reviewsByBookId, setReviewsByBookId] = useState<Record<string | number, BookReviewItem | null>>({});
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true);
  const [selectedBookForReview, setSelectedBookForReview] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Status check: only render when DELIVERED or COMPLETED
  const orderStatus = (order?.status || "").toUpperCase();
  const isDelivered = orderStatus === "DELIVERED" || orderStatus === "COMPLETED";

  const fetchReviewsForBooks = useCallback(async () => {
    if (!order?.items || !order.items.length) {
      setLoadingReviews(false);
      return;
    }

    setLoadingReviews(true);

    try {
      const cookieUser = await getUserCookie();
      setCurrentUser(cookieUser);
      const currentUserId = cookieUser?.id || cookieUser?.userId;
      const currentUserEmail = cookieUser?.email;

      const items = order.items || [];
      const reviewsMap: Record<string | number, BookReviewItem | null> = {};

      await Promise.allSettled(
        items.map(async (item: any) => {
          const bookId = item.bookId || item.book?.id;
          if (!bookId) return;

          try {
            let res;
            try {
              res = await axiosAuthInstance.get(`/v1/reviews/book/${bookId}`);
            } catch (err: any) {
              if (err?.response?.status === 404) {
                res = await axiosAuthInstance.get(`/api/v1/reviews/book/${bookId}`);
              } else {
                throw err;
              }
            }

            const data = res?.data?.data || res?.data?.reviews || res?.data || [];
            const reviewsList: BookReviewItem[] = Array.isArray(data) ? data : [];

            // Find review written by this logged in user
            const userReview = reviewsList.find((r) => {
              if (currentUserId && (String(r.userId) === String(currentUserId) || String(r.user?.id) === String(currentUserId))) {
                return true;
              }
              if (currentUserEmail && r.user?.email && r.user.email.toLowerCase() === currentUserEmail.toLowerCase()) {
                return true;
              }
              // If only 1 review returned and it's user-specific
              return false;
            }) || (reviewsList.length === 1 && reviewsList[0].userId ? reviewsList[0] : null);

            reviewsMap[bookId] = userReview || null;
          } catch {
            reviewsMap[bookId] = null;
          }
        })
      );

      setReviewsByBookId(reviewsMap);
    } catch (error) {
      console.error("Failed to fetch reviews for books:", error);
    } finally {
      setLoadingReviews(false);
    }
  }, [order?.items]);

  useEffect(() => {
    if (isDelivered) {
      fetchReviewsForBooks();
    }
  }, [isDelivered, fetchReviewsForBooks]);

  if (!isDelivered || !order?.items || order.items.length === 0) {
    return null;
  }

  const handleOpenReviewDialog = (item: any) => {
    const bookId = item.bookId || item.book?.id;
    const cover =
      item.book?.images?.find((image: any) => image.type === "COVER")?.url ||
      item.book?.images?.[0]?.url ||
      item.book?.coverImage ||
      item.book?.image;

    const authorName = item.book?.authors?.length
      ? item.book.authors.map((a: any) => a.name).filter(Boolean).join(", ")
      : "";

    setSelectedBookForReview({
      id: bookId,
      title: item.book?.title || "Book",
      coverImage: cover,
      authorName,
    });
    setIsDialogOpen(true);
  };

  const handleReviewSuccess = (newReview: any) => {
    if (!selectedBookForReview) return;
    const bookId = selectedBookForReview.id;

    setReviewsByBookId((prev) => ({
      ...prev,
      [bookId]: {
        ...newReview,
        bookId,
        rating: newReview.rating || 5,
        review: newReview.review || newReview.content || "",
        createdAt: new Date().toISOString(),
        user: {
          name: currentUser?.name || currentUser?.fullName || "You",
        },
      },
    }));
  };

  return (
    <>
      <section className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-white p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in-50 duration-300">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Star className="w-4 h-4 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Rate & Review Your Delivered Books
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Order Delivered
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Share your feedback on the books you received to help fellow readers in the community.
              </p>
            </div>
          </div>
        </div>

        {/* Books List for Review */}
        <div className="divide-y divide-slate-100">
          {order.items.map((item: any) => {
            const bookId = item.bookId || item.book?.id;
            const cover =
              item.book?.images?.find((image: any) => image.type === "COVER")?.url ||
              item.book?.images?.[0]?.url ||
              item.book?.coverImage ||
              item.book?.image;

            const authorName = item.book?.authors?.length
              ? item.book.authors.map((a: any) => a.name).filter(Boolean).join(", ")
              : "";

            const existingReview = reviewsByBookId[bookId];
            const ratingNum = Number(existingReview?.rating) || 0;
            const reviewText =
              existingReview?.review ||
              existingReview?.content ||
              existingReview?.comment ||
              "";

            return (
              <div
                key={item.id || bookId}
                className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Book Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center shadow-2xs">
                    {cover ? (
                      <img
                        src={cover}
                        alt={item.book?.title || "Book"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-4 w-4 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.book?.title || "Book Title"}
                    </h4>
                    {authorName && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        by {authorName}
                      </p>
                    )}

                    {/* Existing Review Display */}
                    {existingReview ? (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= ratingNum
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200 fill-slate-100"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/60 px-1.5 py-0.2 rounded border border-amber-200">
                            {ratingNum}/5
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {existingReview.createdAt
                              ? new Date(existingReview.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Submitted"}
                          </span>
                        </div>

                        {reviewText && (
                          <p className="text-[11px] text-slate-700 italic leading-relaxed">
                            &quot;{reviewText}&quot;
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-slate-400" />
                        <span>No review submitted yet</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action Button or Reviewed Status */}
                <div className="shrink-0 sm:pl-3">
                  {existingReview ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Reviewed</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenReviewDialog(item)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>Write Review</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Review Dialog Modal */}
      {selectedBookForReview && (
        <AddReviewDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedBookForReview(null);
          }}
          book={selectedBookForReview}
          onReviewSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
}
