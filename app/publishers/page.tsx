"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import Pagination from "@/components/Pagination";
import TopHeader from "@/components/topHeader";
import { PaginationMeta } from "@/types/book";
import { axiosInstance } from "@/utils/axiosInstances";
import { BookOpen, MapPin, Search, X } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface SocialLinkItem {
  id: number;
  publisherId: number;
  platform: string;
  url: string;
}

export interface PublisherItem {
  id: number | string;
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
  socialLinks?: SocialLinkItem[];
  _count?: {
    books: number;
  };
}

const PublishersPage = () => {
  const [publishers, setPublishers] = useState<PublisherItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
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

  const fetchPublishers = useCallback(
    async (page = 1, limit = 10, search = "") => {
      setIsLoading(true);
      try {
        const searchParam = search.trim()
          ? `&search=${encodeURIComponent(search.trim())}`
          : "";
        const url = `/v1/publisher?page=${page}&limit=${limit}${searchParam}`;
        const response = await axiosInstance.get(url);
        const rawData = response.data;
        const list =
          rawData?.data ||
          rawData?.publishers ||
          (Array.isArray(rawData) ? rawData : []);
        setPublishers(list);

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
        console.error("Failed to fetch publishers:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load publishers.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchPublishers(currentPage, pageSize, debouncedSearch);
  }, [currentPage, pageSize, debouncedSearch, fetchPublishers]);

  const totalItems = pagination.total || publishers.length;
  const totalPages =
    pagination.totalPages || Math.max(1, Math.ceil(totalItems / pageSize));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 220, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      <TopHeader />
      <Header />
      <div className="flex-1 pb-16">
        {/* Hero Banner */}
        <div className="bg-[#0b1329] text-white py-12 px-4 sm:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto">
            <nav className="text-xs text-slate-400 mb-3 flex items-center gap-2">
              <Link href="/" className="hover:text-amber-400 cursor-pointer">
                Home
              </Link>
              <span>/</span>
              <span className="text-white font-medium">Publishers</span>
            </nav>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  Partner Book Publishers
                </h1>
                <p className="text-sm text-slate-300 mt-2 max-w-2xl">
                  Explore thousands of authentic books and publications from
                  renowned publishing houses.
                </p>
              </div>

              {/* Search Bar in Hero */}
              <div className="w-full md:w-80 lg:w-96">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search publishers by name, location..."
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
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-slate-200 shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2 py-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                        <div className="h-3 bg-slate-200 rounded w-1/3" />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-3 bg-slate-200 rounded w-4/5" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-lg p-2.5 mt-4 border border-slate-100 h-12">
                      <div className="bg-slate-200 rounded h-full" />
                      <div className="bg-slate-200 rounded h-full" />
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <div className="h-8 bg-slate-200 rounded-md w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : publishers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 text-center p-6">
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                No Publishers Found
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {searchTerm
                  ? `No publishers found matching "${searchTerm}". Try another search term.`
                  : "There are no publishers available at the moment."}
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {publishers.map((publisher) => {
                  const booksCount =
                    publisher._count?.books ?? publisher.booksPublished ?? 0;
                  const logoUrl =
                    publisher.publicationLogoUrl ||
                    `https://placehold.co/100x100/0f172a/ffffff?text=${encodeURIComponent(
                      publisher.name
                        ? publisher.name.charAt(0).toUpperCase()
                        : "P",
                    )}`;

                  return (
                    <div
                      key={publisher.id}
                      className="bg-white rounded-xl border border-slate-200 hover:border-amber-400/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={logoUrl}
                            alt={publisher.name}
                            className="w-14 h-14 rounded-full border border-slate-200 object-cover shadow-sm bg-slate-50 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h2 className="text-base font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                              {publisher.name}
                            </h2>
                            {publisher.address && (
                              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                <span className="truncate">
                                  {publisher.address}
                                </span>
                              </p>
                            )}
                            {publisher.establishedYear && (
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Est. {publisher.establishedYear}
                              </p>
                            )}
                          </div>
                        </div>

                        {publisher.about && (
                          <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                            {publisher.about.replace(/<[^>]*>?/gm, "")}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-lg p-2.5 mt-4 border border-slate-100 text-center">
                          <div>
                            <span className="block text-xs font-bold text-slate-900">
                              {booksCount}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                              Books Published
                            </span>
                          </div>
                          <div className="border-l border-slate-200">
                            <span className="block text-xs font-bold text-slate-900">
                              {publisher.authorsCount ?? 0}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                              Authors
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-3 bg-slate-50/75 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          href={`/publishers/${publisher.id}`}
                          className="w-full"
                        >
                          <button className="text-xs font-semibold px-3 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white w-full transition cursor-pointer">
                            Explore
                          </button>
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
                itemLabel="publishers"
                isLoading={isLoading}
                onPageChange={handlePageChange}
                activeColorClass="bg-amber-500 text-white shadow-2xs font-bold"
              />
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PublishersPage;
