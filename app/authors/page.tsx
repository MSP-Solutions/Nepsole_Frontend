"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import Pagination from "@/components/Pagination";
import TopHeader from "@/components/topHeader";
import { PaginationMeta } from "@/types/book";
import { axiosInstance } from "@/utils/axiosInstances";
import { parseQuillContent } from "@/utils/quillDecoder";
import {
  ArrowRight,
  BookOpen,
  MapPin,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
  _count?: {
    books: number;
  };
  [key: string]: any;
}

const AuthorsPage = () => {
  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchAuthors = useCallback(
    async (page = 1, limit = 12, search = "") => {
      setIsLoading(true);
      try {
        const searchParam = search.trim()
          ? `&search=${encodeURIComponent(search.trim())}`
          : "";
        const url = `/v1/author?page=${page}&limit=${limit}${searchParam}`;
        const response = await axiosInstance.get(url);
        const rawData = response.data;
        const list =
          rawData?.data ||
          rawData?.authors ||
          (Array.isArray(rawData) ? rawData : []);
        setAuthors(list);

        if (rawData?.pagination) {
          setPagination({
            total: rawData.pagination.total ?? list.length,
            page: rawData.pagination.page ?? page,
            limit: rawData.pagination.limit ?? limit,
            totalPages:
              rawData.pagination.totalPages ??
              Math.max(
                1,
                Math.ceil((rawData.pagination.total ?? list.length) / limit),
              ),
          });
        } else if (rawData?.total !== undefined) {
          setPagination({
            total: rawData.total,
            page: rawData.page || page,
            limit: rawData.limit || limit,
            totalPages:
              rawData.totalPages ||
              Math.max(1, Math.ceil(rawData.total / limit)),
          });
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
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchAuthors(currentPage, pageSize, debouncedSearch);
  }, [currentPage, pageSize, debouncedSearch, fetchAuthors]);

  const getInitials = (name?: string) => {
    if (!name) return "AU";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Clean bio text for preview with full Quill & JSON decoding
  const getBioPreview = (bio?: string) => {
    if (!bio)
      return "Passionate author sharing insights, stories, and published literary works.";

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
      "Passionate author sharing insights, stories, and published literary works."
    );
  };

  const totalItems = pagination.total || authors.length;
  const totalPages =
    pagination.totalPages || Math.max(1, Math.ceil(totalItems / pageSize));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 220, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 antialiased">
      <TopHeader />
      <Header />

      <main className="flex-1 w-full">
        {/* Dark Hero Banner */}
        <section className="bg-[#0b1329] text-white py-12 md:py-16">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-white">Authors</span>
            </div>

            {/* Title, Subtitle & Search Bar */}
            <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white flex items-center gap-3">
                  Featured Authors
                </h1>
                <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-2xl">
                  Explore insights, thoughts, and written works from our
                  community of renowned writers and authors.
                </p>
              </div>

              {/* Search Bar in Hero */}
              <div className="w-full md:w-80 lg:w-96">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search authors by name, nationality..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 hover:bg-slate-800 focus:bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all shadow-inner"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authors Grid Section */}
        <section className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 py-10 sm:py-14">
          {isLoading ? (
            /* Skeleton Loading Grid */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-3 bg-slate-200 rounded w-4/5" />
                    </div>

                    <div className="mt-4 h-10 bg-slate-50 border border-slate-100 rounded-xl" />
                  </div>

                  <div className="mt-5 pt-1">
                    <div className="h-9 bg-slate-200 rounded-xl w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : authors.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 text-center p-6 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
                <User className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                No Authors Found
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {searchTerm
                  ? `No authors found matching "${searchTerm}". Try another search term.`
                  : "There are no registered authors available at the moment."}
              </p>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition cursor-pointer"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            /* Author Cards Grid */
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {authors.map((author) => {
                  const img =
                    author.imageUrl || author.image || author.profileImage;
                  const booksCount =
                    author._count?.books ?? author.booksPublished ?? 0;
                  const happyReaders = author.happyReaders ?? 0;

                  return (
                    <div
                      key={author.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1749A0]/30 hover:shadow-lg"
                    >
                      {/* Top Accent Gradient on Hover */}
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1749A0] via-indigo-600 to-amber-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div>
                        {/* Header: Avatar + Details */}
                        <div className="flex items-center gap-3.5">
                          <Link
                            href={`/authors/${author.id}`}
                            className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-100 ring-2 ring-slate-100 group-hover:border-[#1749A0]/30 group-hover:ring-[#1749A0]/15 transition-all duration-300 shadow-xs bg-gradient-to-br from-[#1749A0] via-indigo-900 to-slate-900 text-sm font-bold text-white"
                          >
                            {img ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={img}
                                alt={author.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <span className="tracking-tight">
                                {getInitials(author.name)}
                              </span>
                            )}
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/authors/${author.id}`}
                              className="truncate block text-base font-bold text-slate-900 group-hover:text-[#1749A0] transition-colors"
                            >
                              {author.name}
                            </Link>

                            {author.positions ? (
                              <p className="mt-0.5 truncate text-xs font-semibold text-[#1749A0]">
                                {Array.isArray(author.positions)
                                  ? author.positions.join(", ")
                                  : author.positions}
                              </p>
                            ) : (
                              <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                                Author & Writer
                              </p>
                            )}

                            {author.nationality && (
                              <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-500">
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
                        <p className="mt-4 line-clamp-2 text-xs italic leading-relaxed text-slate-600">
                          &ldquo;{getBioPreview(author.bio)}&rdquo;
                        </p>

                        {/* Published Works Stats Bar */}
                        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/90 px-3.5 py-2.5 text-xs">
                          <div className="flex items-center gap-2 font-medium text-slate-600">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-[#1749A0]">
                              <BookOpen className="h-3.5 w-3.5" />
                            </div>
                            <span>Published Works</span>
                          </div>
                          <span className="rounded-md border border-slate-200/80 bg-white px-2 py-0.5 text-xs font-bold text-slate-900 shadow-2xs">
                            {booksCount} {booksCount === 1 ? "Book" : "Books"}
                          </span>
                        </div>
                      </div>

                      {/* Action Link */}
                      <div className="mt-5 pt-1">
                        <Link
                          href={`/authors/${author.id}`}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition-all duration-200 hover:border-[#1749A0] hover:bg-[#1749A0] hover:text-white group/btn"
                        >
                          <span>View Profile & Books</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={totalItems}
                totalPages={totalPages}
                itemLabel="authors"
                isLoading={isLoading}
                onPageChange={handlePageChange}
                activeColorClass="bg-amber-500 text-white shadow-2xs font-bold"
              />
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AuthorsPage;
