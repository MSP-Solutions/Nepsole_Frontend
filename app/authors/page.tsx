"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import TopHeader from "@/components/topHeader";
import { axiosInstance } from "@/utils/axiosInstances";
import { parseQuillContent } from "@/utils/quillDecoder";
import { ArrowRight, BookOpen, MapPin, User, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
      // toast.error(error?.response?.data?.message || "Failed to load authors.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

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

  // Filter authors by search query
  const filteredAuthors = authors.filter((author) => {
    const term = searchTerm.toLowerCase();
    const matchesName = author.name
      ? String(author.name).toLowerCase().includes(term)
      : false;
    const matchesPosition = author.positions
      ? (Array.isArray(author.positions)
          ? author.positions.join(" ").toLowerCase()
          : String(author.positions).toLowerCase()
        ).includes(term)
      : false;
    const matchesNationality = author.nationality
      ? (Array.isArray(author.nationality)
          ? author.nationality.join(" ").toLowerCase()
          : String(author.nationality).toLowerCase()
        ).includes(term)
      : false;

    return matchesName || matchesPosition || matchesNationality;
  });

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

            {/* Title & Subtitle */}
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

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-2.5 mt-5 border border-slate-100 h-14">
                      <div className="bg-slate-200 rounded h-full" />
                      <div className="bg-slate-200 rounded h-full" />
                    </div>
                  </div>

                  <div className="mt-5 pt-3">
                    <div className="h-9 bg-slate-200 rounded-lg w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAuthors.length === 0 ? (
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
            </div>
          ) : (
            /* Author Cards Grid */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAuthors.map((author) => {
                const img =
                  author.imageUrl || author.image || author.profileImage;
                const booksCount =
                  author._count?.books ?? author.booksPublished ?? 0;
                const happyReaders = author.happyReaders ?? 0;

                return (
                  <div
                    key={author.id}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-indigo-300"
                  >
                    <div>
                      {/* Header: Avatar + Details */}
                      <div className="flex items-start gap-4">
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-[#0f172a] text-lg font-bold text-white shadow-inner">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img}
                              alt={author.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>{getInitials(author.name)}</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h2 className="truncate text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {author.name}
                          </h2>

                          {author.positions && (
                            <p className="text-xs text-indigo-600 font-medium truncate mt-0.5">
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
                      <p className="mt-4 text-xs italic leading-relaxed text-slate-600 line-clamp-2">
                        &quot;{getBioPreview(author.bio)}&quot;
                      </p>

                      {/* Stats Grid */}
                      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 text-center border border-slate-100">
                        <div className="border-r border-slate-200/80 pr-2">
                          <div className="text-base font-bold text-slate-900 flex items-center justify-center gap-1">
                            <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                            <span>{booksCount}</span>
                          </div>
                          <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                            Books
                          </div>
                        </div>
                        <div className="pl-2">
                          <div className="text-base font-bold text-slate-900 flex items-center justify-center gap-1">
                            <Users className="h-3.5 w-3.5 text-indigo-500" />
                            <span>{happyReaders}</span>
                          </div>
                          <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                            Readers
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Link */}
                    <div className="mt-5 pt-3">
                      <Link
                        href={`/authors/${author.id}`}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-2xs"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AuthorsPage;
