"use client";

import React, { useState } from "react";
import { Star, X, Loader2, BookOpen, CheckCircle2, MessageSquare } from "lucide-react";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import toast from "react-hot-toast";

export interface AddReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    id: number | string;
    title: string;
    coverImage?: string;
    authorName?: string;
  };
  onReviewSuccess: (reviewData: any) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent! Loved it",
};

export default function AddReviewDialog({
  isOpen,
  onClose,
  book,
  onReviewSuccess,
}: AddReviewDialogProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a star rating between 1 and 5.");
      return;
    }

    if (!reviewText.trim()) {
      toast.error("Please write a few words for your review.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        bookId: Number(book.id),
        rating: Number(rating),
        review: reviewText.trim(),
      };

      let res;
      try {
        res = await axiosAuthInstance.post("/v1/reviews", payload);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          res = await axiosAuthInstance.post("/api/v1/reviews", payload);
        } else {
          throw err;
        }
      }

      toast.success("Review submitted successfully! Thank you.");
      const data = res?.data?.data || res?.data || payload;
      onReviewSuccess(data);
      onClose();
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit review. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRatingDisplay = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Write a Review</h3>
              <p className="text-[11px] text-slate-500">Share your verified reading feedback</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Book Preview */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="w-12 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Verified Purchase
              </span>
              <h4 className="text-xs font-bold text-slate-900 truncate mt-1">
                {book.title}
              </h4>
              {book.authorName && (
                <p className="text-[11px] text-slate-500 truncate">by {book.authorName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 hover:scale-115 transition-transform cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= currentRatingDisplay
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "text-slate-200 fill-slate-100"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {currentRatingDisplay > 0 && (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 ml-2 animate-in fade-in">
                  {RATING_LABELS[currentRatingDisplay] || `${currentRatingDisplay} Stars`}
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Your Review *
            </label>
            <div className="relative">
              <textarea
                rows={4}
                required
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you like or dislike about this book? How was the story, writing style, or print quality?"
                className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition resize-none"
                maxLength={1000}
              />
              <span className="absolute right-3 bottom-3 text-[10px] font-medium text-slate-400">
                {reviewText.length}/1000
              </span>
            </div>
          </div>

          {/* Info Notice */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-800/90 leading-relaxed">
              Reviews can only be submitted once per delivered item and cannot be modified once published.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reviewText.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
