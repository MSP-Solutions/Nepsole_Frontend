"use client";

import { axiosInstance } from "@/utils/axiosInstances";
import { parseQuillContent } from "@/utils/quillDecoder";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface AuthorItem {
  id: number | string;
  name: string;
  positions?: string | string[];
  bio?: string;
  nationality?: string | string[];
  imageUrl?: string | null;
  image?: string | null;
  profileImage?: string | null;
  websiteUrl?: string;
  booksPublished?: number | string;
  yearsOfWriting?: number | string;
  booksSold?: number | string;
  happyReaders?: number | string;
  _count?: {
    books: number;
  };
  [key: string]: any;
}

const Authors = () => {
  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const fetchAuthors = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/v1/author");
      const list =
        response.data?.data ||
        response.data?.authors ||
        (Array.isArray(response.data) ? response.data : []);
      setAuthors(list);
    } catch (error: any) {
      console.error("Failed to fetch authors:", error);
      toast.error(error?.response?.data?.message || "Failed to load authors.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  // Update scroll buttons state when authors load or viewport resizes
  useEffect(() => {
    if (authors.length > 0) {
      const timer = setTimeout(() => {
        checkScrollButtons();
      }, 100);
      const handleResize = () => checkScrollButtons();
      window.addEventListener("resize", handleResize);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [authors]);

  const getInitials = (name?: string) => {
    if (!name) return "AU";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Clean bio text for preview with full Quill & JSON decoding
  const getBioPreview = (bio?: string) => {
    if (!bio)
      return "Passionate author sharing insights, stories, and literary masterpieces with readers worldwide.";

    const decoded = parseQuillContent(bio);
    const cleanText = decoded
      .replace(/<br\s*[\/]?>/gi, " ")
      .replace(/<[^>]*>?/gm, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return (
      cleanText ||
      "Passionate author sharing insights, stories, and literary masterpieces with readers worldwide."
    );
  };

  // Display top 4 authors on the homepage
  const displayedAuthors = authors.slice(0, 4);
  const hasMoreAuthors = authors.length > 4;

  return (
    <section className="w-full bg-slate-50/50 py-10 sm:py-14 border-t border-slate-100">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              Featured Authors
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Discover celebrated writers, passionate storytellers, and thought
              leaders publishing on Nepsole.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            {/* Carousel navigation buttons */}
            {(canScrollLeft || canScrollRight) && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleScroll("left")}
                  disabled={!canScrollLeft}
                  aria-label="Previous authors"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll("right")}
                  disabled={!canScrollRight}
                  aria-label="Next authors"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            <Link
              href="/authors"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition group"
            >
              <span>View All Authors</span>
              {authors.length > 0 && (
                <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[11px] font-bold">
                  {authors.length}
                </span>
              )}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Authors Content */}
        {isLoading ? (
          /* Skeleton Loading Row */
          <div className="flex gap-4 sm:gap-6 overflow-hidden py-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="w-[270px] sm:w-[290px] md:w-[310px] lg:w-[calc(25%-18px)] shrink-0 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-full bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-3 bg-slate-200 rounded w-4/5" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-2.5 mt-4 border border-slate-100 h-12">
                    <div className="bg-slate-200 rounded h-full" />
                    <div className="bg-slate-200 rounded h-full" />
                  </div>
                </div>

                <div className="mt-5 pt-2">
                  <div className="h-9 bg-slate-200 rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedAuthors.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-14 bg-white rounded-2xl border border-dashed border-slate-200 text-center p-6 shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 shadow-inner">
              <User className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              No Authors Available
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Featured authors will be displayed here soon.
            </p>
          </div>
        ) : (
          /* Scrollable Carousel Row */
          <div className="relative">
            <div
              ref={scrollContainerRef}
              onScroll={checkScrollButtons}
              className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth py-1 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
            >
              {displayedAuthors.map((author) => {
                const img =
                  author.imageUrl || author.image || author.profileImage;
                const booksCount =
                  author._count?.books ?? author.booksPublished ?? 0;
                const happyReaders = author.happyReaders ?? 0;

                return (
                  <div
                    key={author.id}
                    className="w-[270px] sm:w-[290px] md:w-[310px] lg:w-[calc(25%-18px)] shrink-0 snap-start group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-indigo-300"
                  >
                    <div>
                      {/* Header: Avatar + Details */}
                      <div className="flex items-center gap-3.5">
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-100 bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 text-sm font-bold text-white shadow-sm ring-2 ring-indigo-50">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img}
                              alt={author.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <span>{getInitials(author.name)}</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/authors/${author.id}`}
                            className="truncate block text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors"
                          >
                            {author.name}
                          </Link>

                          {author.positions && (
                            <p className="text-xs font-medium text-indigo-600 truncate mt-0.5">
                              {Array.isArray(author.positions)
                                ? author.positions.join(", ")
                                : author.positions}
                            </p>
                          )}

                          {author.nationality && (
                            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                              <MapPin className="h-3 w-3 shrink-0 text-rose-500" />
                              <span className="truncate">
                                {Array.isArray(author.nationality)
                                  ? author.nationality.join(", ")
                                  : author.nationality}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bio Preview */}
                      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 h-[58px] flex items-center overflow-hidden">
                        <p className="text-xs italic leading-relaxed text-slate-600 line-clamp-2 overflow-hidden w-full">
                          &quot;{getBioPreview(author.bio)}&quot;
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2 text-center border border-slate-100">
                        <div className="border-r border-slate-200/80 pr-2">
                          <div className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1">
                            <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                            <span>{booksCount}</span>
                          </div>
                          <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                            Books
                          </div>
                        </div>
                        <div className="pl-2">
                          <div className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1">
                            <Users className="h-3.5 w-3.5 text-indigo-500" />
                            <span>{happyReaders}</span>
                          </div>
                          <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                            Readers
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Link */}
                    <div className="mt-5 pt-1">
                      <Link
                        href={`/authors/${author.id}`}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 transition duration-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-2xs group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-200"
                      >
                        <span>View Profile</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Explore More Banner if more than 4 authors */}
        {hasMoreAuthors && !isLoading && (
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-indigo-900/40">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-indigo-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Looking for more authors?
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Browse our complete directory of {authors.length} writers and
                  storytellers.
                </p>
              </div>
            </div>
            <Link
              href="/authors"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs sm:text-sm hover:bg-indigo-50 hover:shadow-md transition shrink-0 w-full sm:w-auto"
            >
              <span>Explore All {authors.length} Authors</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Authors;
