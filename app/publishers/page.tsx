"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import TopHeader from "@/components/topHeader";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { axiosInstance } from "@/utils/axiosInstances";
import { BookOpen, Loader2, MapPin, Search } from "lucide-react";
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

  const fetchPublishers = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/v1/publisher");
      const list =
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);
      setPublishers(list);
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
    fetchPublishers();
  }, []);

  // Filter publishers based on search term
  const filteredPublishers = publishers.filter((pub) => {
    const matchesSearch =
      pub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pub.address &&
        pub.address.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div>
      <TopHeader />
      <Header />
      <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
        {/* Hero Banner */}
        <div className="bg-slate-900 text-white py-10 px-4 sm:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto">
            <nav className="text-xs text-slate-400 mb-3 flex items-center gap-2">
              <Link href="/" className="hover:text-amber-400 cursor-pointer">
                Home
              </Link>
              <span>/</span>
              <span className="text-white font-medium">Publishers</span>
            </nav>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Partner Book Publishers
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Explore books from renowned publishing houses.
                </p>
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
          ) : filteredPublishers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 text-center p-6">
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                No Publishers Found
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {searchTerm
                  ? `No publishers found matching "${searchTerm}".`
                  : "There are no publishers available at the moment."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPublishers.map((publisher) => {
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
                            Books
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
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PublishersPage;
