"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Star, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import { axiosInstance } from "@/utils/axiosInstances";

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
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    imageUrl?: string;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface BookReviewsProps {
  bookId: number | string;
  bookTitle?: string;
  onReviewsLoaded?: (count: number, avgRating: number) => void;
}

export default function BookReviews({
  bookId,
  bookTitle = "this book",
  onReviewsLoaded,
}: BookReviewsProps) {
  const [reviews, setReviews] = useState<BookReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBookReviews = useCallback(async () => {
    if (!bookId) return;
    setIsLoading(true);

    try {
      let res;
      try {
        res = await axiosInstance.get(`/v1/reviews/book/${bookId}`);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          res = await axiosInstance.get(`/api/v1/reviews/book/${bookId}`);
        } else {
          throw err;
        }
      }

      const data = res?.data?.data || res?.data?.reviews || res?.data || [];
      const list: BookReviewItem[] = Array.isArray(data) ? data : [];
      setReviews(list);

      if (onReviewsLoaded) {
        const total = list.length;
        const sum = list.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        const avg = total > 0 ? Number((sum / total).toFixed(1)) : 0;
        onReviewsLoaded(total, avg);
      }
    } catch (error) {
      console.error("Failed to load book reviews:", error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [bookId, onReviewsLoaded]);

  useEffect(() => {
    fetchBookReviews();
  }, [fetchBookReviews]);

  // Review statistics calculation
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        total: 0,
        average: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      breakdown[star] = (breakdown[star] || 0) + 1;
      sum += Number(r.rating) || 0;
    });

    const average = Number((sum / total).toFixed(1));

    const percentages: Record<number, number> = {
      5: Math.round(((breakdown[5] || 0) / total) * 100),
      4: Math.round(((breakdown[4] || 0) / total) * 100),
      3: Math.round(((breakdown[3] || 0) / total) * 100),
      2: Math.round(((breakdown[2] || 0) / total) * 100),
      1: Math.round(((breakdown[1] || 0) / total) * 100),
    };

    return { total, average, breakdown, percentages };
  }, [reviews]);

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
        <p className="text-xs">Loading verified customer reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Top Rating Summary Overview */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50/50 via-slate-50 to-indigo-50/30 border border-slate-200/80">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Average Score Box */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-200/80">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {stats.average > 0 ? stats.average : "0.0"}
            </span>
            <div className="flex items-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(stats.average)
                      ? "fill-amber-400 text-amber-400 drop-shadow-2xs"
                      : "fill-slate-200 text-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-600">
              Based on {stats.total} {stats.total === 1 ? "verified review" : "verified reviews"}
            </p>
          </div>

          {/* Star Distribution Progress Bars */}
          <div className="md:col-span-8 space-y-2 pr-2 sm:pr-4">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.breakdown[star] || 0;
              const pct = stats.percentages[star] || 0;

              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-slate-600 font-medium shrink-0 flex items-center gap-1">
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                  </span>

                  <div className="flex-1 h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="w-10 text-right text-slate-400 text-[11px] shrink-0 font-mono">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>Customer Feedback ({reviews.length})</span>
          </h3>
        </div>

        {reviews.length > 0 ? (
          <div className="divide-y divide-slate-100 space-y-4">
            {reviews.map((rev, idx) => {
              const ratingVal = Number(rev.rating) || 5;
              const reviewerName =
                rev.user?.name ||
                rev.user?.fullName ||
                (rev.user?.email ? rev.user.email.split("@")[0] : "Verified Reader");

              const reviewerInitial = reviewerName.charAt(0).toUpperCase();

              const comment =
                rev.review || rev.content || rev.comment || "";

              const dateFormatted = rev.createdAt
                ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent purchase";

              return (
                <div key={rev.id || idx} className="pt-4 first:pt-0 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-200">
                        {reviewerInitial}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{reviewerName}</h4>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified Purchase
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{dateFormatted}</p>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= ratingVal
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-100 text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {comment && (
                    <p className="text-xs text-slate-700 leading-relaxed pl-12">
                      {comment}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 px-4 text-center rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="w-12 h-12 rounded-full bg-white text-slate-400 flex items-center justify-center mx-auto mb-3 shadow-2xs border border-slate-100">
              <Star className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">No Reviews Yet</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Be among the first readers to review &quot;{bookTitle}&quot; after receiving your delivered copy!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
