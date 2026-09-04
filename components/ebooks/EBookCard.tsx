"use client";

import { BookAuthor, BookGenre, BookImage, BookPublisher } from "@/types/book";
import { BookOpen, Heart, Tablet } from "lucide-react";
import Link from "next/link";
import React from "react";

export interface EBookItem {
  id: number | string;
  title: string;
  price: number | string;
  discountPercent?: number | string;
  stock?: number;
  soldCount?: number;
  publicationDate?: string;
  isbn10?: string;
  isbn13?: string;
  pages?: number | string;
  description?: string;
  publisherId?: number | string;
  publisher?: BookPublisher;
  publisherName?: string;
  authors?: BookAuthor[];
  authorBooks?: BookAuthor[];
  genres?: BookGenre[];
  genreBooks?: BookGenre[];
  images?: (BookImage | string)[];
  bookImages?: BookImage[];
  coverImage?: string;
  coverImageUrl?: string;
  image?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  formats?: string[];
  plan?: string;
  fileSizeMb?: number | string;
  rating?: number;
  avgRating?: number;
  averageRating?: number;
  totalReviews?: number;
  [key: string]: any;
}

interface EBookCardProps {
  book: EBookItem;
  isWishlisted: boolean;
  onToggleWishlist: (id: number | string) => void;
}

export default function EBookCard({
  book,
  isWishlisted,
  onToggleWishlist,
}: EBookCardProps) {
  const getCoverImage = (): string | null => {
    if (book.coverImageUrl) return book.coverImageUrl;
    if (book.coverImage) return book.coverImage;
    if (book.image) return book.image;
    if (book.imageUrl) return book.imageUrl;

    const imagesList = book.images || book.bookImages || [];
    if (imagesList.length === 0) return null;

    const coverObj = imagesList.find((img: any) =>
      typeof img === "object"
        ? img.imageType === "COVER" || img.type === "COVER"
        : false,
    );
    if (coverObj && typeof coverObj === "object") {
      return coverObj.url || coverObj.imageUrl || null;
    }

    const first = imagesList[0];
    if (typeof first === "string") return first;
    if (typeof first === "object") return first.url || first.imageUrl || null;
    return null;
  };

  const getAuthorsString = (): string => {
    const list = book.authors || book.authorBooks || [];
    if (list.length === 0) return "";
    return list
      .map((a) => a.name || a.englishName || a.author?.name || "")
      .filter(Boolean)
      .join(", ");
  };

  const getPrimaryGenreName = (): string => {
    const list = book.genres || book.genreBooks || [];
    if (list.length === 0) return "";
    return (
      list[0].name || list[0].englishName || list[0].genre?.name || "E-Book"
    );
  };

  const coverUrl = getCoverImage();
  const priceNum = Number(book.price) || 0;
  const discountNum = Number(book.discountPercent) || 0;
  const discountedPrice =
    discountNum > 0
      ? priceNum - (priceNum * discountNum) / 100
      : priceNum;
  const genreName = getPrimaryGenreName();
  const authorName = getAuthorsString();
  const isFree =
    (book.plan && book.plan.toUpperCase() === "FREE") || priceNum === 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 flex flex-col justify-between relative group hover:shadow-md hover:border-indigo-400/70 transition-all duration-200">
      {/* Top Badges (Plan / Discount & Wishlist) */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-1 pointer-events-auto">
          <span
            className={`text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs ${
              isFree ? "bg-emerald-600" : "bg-indigo-600"
            }`}
          >
            {isFree ? "FREE" : "E-BOOK"}
          </span>
          {discountNum > 0 && !isFree && (
            <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
              -{discountNum}%
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist(book.id);
          }}
          className={`p-1.5 rounded-full shadow-2xs transition-colors cursor-pointer pointer-events-auto ${
            isWishlisted
              ? "bg-rose-50 text-rose-600 border border-rose-200"
              : "bg-white/90 text-slate-400 hover:text-rose-500 border border-slate-200/60 hover:bg-white"
          }`}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-3 h-3 ${
              isWishlisted ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>
      </div>

      <div>
        {/* Compact Cover Image Container */}
        <Link href={`/eBooks/${book.id}`} className="block">
          <div className="relative aspect-[4/5] max-h-44 sm:max-h-48 w-full bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center mb-2 group-hover:scale-[1.01] transition-transform duration-200 border border-slate-100">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                <Tablet className="w-6 h-6 mb-1 text-indigo-400" />
                <span className="text-[9px] font-bold tracking-wider uppercase line-clamp-1">
                  {book.title}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Category Pill */}
        {genreName && (
          <span className="inline-block text-[9px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded mb-1 border border-indigo-100/80 truncate max-w-full">
            {genreName}
          </span>
        )}

        {/* Title */}
        <Link href={`/eBooks/${book.id}`}>
          <h2
            className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-snug"
            title={book.title}
          >
            {book.title}
          </h2>
        </Link>

        {/* Author Name */}
        {authorName && (
          <p
            className="text-[11px] text-slate-500 truncate mt-0.5"
            title={authorName}
          >
            {authorName}
          </p>
        )}

        {/* Price & Discount */}
        <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
          {isFree ? (
            <span className="text-xs sm:text-sm font-bold text-emerald-600">
              Free Reading
            </span>
          ) : (
            <>
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Rs. {discountedPrice.toLocaleString()}
              </span>
              {discountNum > 0 && (
                <span className="text-[10px] text-slate-400 line-through">
                  Rs. {priceNum.toLocaleString()}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-2.5 pt-2 border-t border-slate-100">
        <Link
          href={`/eBooks/${book.id}`}
          className="w-full bg-slate-900 hover:bg-indigo-600 text-white text-[11px] font-medium py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
        >
          <BookOpen className="w-3 h-3" />
          <span>{isFree ? "Read Now" : "View E-Book"}</span>
        </Link>
      </div>
    </div>
  );
}
