"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import TopHeader from "@/components/topHeader";
import { axiosInstance } from "@/utils/axiosInstances";
import { parseQuillContent } from "@/utils/quillDecoder";
import {
  Award,
  BookOpen,
  ChevronRight,
  Clock,
  ExternalLink,
  Globe,
  Heart,
  Loader2,
  MapPin,
  ShoppingBag,
  Star,
  Tablet,
} from "lucide-react";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface SocialLinkItem {
  id?: number | string;
  authorId?: number | string;
  platform: string;
  url: string;
}

export interface AuthorBookItem {
  id: number | string;
  title: string;
  price?: string | number;
  discountPercent?: string | number;
  description?: string;
  coverImage?: string;
  image?: string;
  images?: any[];
  bookImages?: any[];
  rating?: number;
  totalReviews?: number;
  [key: string]: any;
}

export interface AuthorDetailData {
  id: number | string;
  name: string;
  positions?: string[] | string;
  bio?: string;
  nationality?: string[] | string;
  imageUrl?: string | null;
  image?: string | null;
  profileImage?: string | null;
  websiteUrl?: string;
  booksPublished?: number | string;
  yearsOfWriting?: number | string;
  booksSold?: number | string;
  happyReaders?: number | string;
  socialLinks?: SocialLinkItem[] | string;
  books?: AuthorBookItem[];
  ebooks?: any[];
  _count?: {
    books: number;
  };
  [key: string]: any;
}

const getSocialPlatformDetails = (platform: string = "") => {
  const p = String(platform).trim().toUpperCase();

  switch (p) {
    case "FACEBOOK":
      return {
        label: "Facebook",
        icon: (
          <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        ),
      };
    case "TWITTER":
    case "X":
      return {
        label: "Twitter / X",
        icon: (
          <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        ),
      };
    case "INSTAGRAM":
      return {
        label: "Instagram",
        icon: (
          <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        ),
      };
    case "LINKEDIN":
      return {
        label: "LinkedIn",
        icon: (
          <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        ),
      };
    case "YOUTUBE":
      return {
        label: "YouTube",
        icon: (
          <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        ),
      };
    case "TIKTOK":
      return {
        label: "TikTok",
        icon: (
          <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.02 3.32-1.41 3.49-3.22.04-1.06.01-2.12.01-3.18.01-4.89.01-9.78.01-14.67z" />
          </svg>
        ),
      };
    default:
      return {
        label: platform || "Social Profile",
        icon: <Globe className="h-4 w-4 shrink-0" />,
      };
  }
};

interface AuthorDetailsProps {
  params: Promise<{ id: string }>;
}

export default function AuthorDetailsPage({ params }: AuthorDetailsProps) {
  const resolvedParams = use(params);
  const authorId = resolvedParams?.id;

  const [author, setAuthor] = useState<AuthorDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState("About");

  const fetchAuthorDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/v1/author/${authorId}`);
      const data = response.data?.data || response.data;
      setAuthor(data);
    } catch (error: any) {
      console.error("Failed to fetch author details:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load author details.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authorId) {
      fetchAuthorDetails();
    }
  }, [authorId]);

  const getInitials = (name?: string) => {
    if (!name) return "AU";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getSocialLinks = (): SocialLinkItem[] => {
    if (!author) return [];
    if (Array.isArray(author.socialLinks)) {
      return author.socialLinks;
    }
    if (
      typeof author.socialLinks === "string" &&
      author.socialLinks.trim() !== ""
    ) {
      try {
        const parsed = JSON.parse(author.socialLinks);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <TopHeader />
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-medium text-gray-500">
            Loading author profile...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <TopHeader />
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Author Not Found</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            The author profile you are looking for could not be found or has
            been removed.
          </p>
          <Link
            href="/authors"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            Back to Authors
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const profileImg =
    author.imageUrl || author.image || author.profileImage || null;
  const decodedBio = parseQuillContent(author.bio);
  const socialLinks = getSocialLinks();
  const booksPublished =
    author.booksPublished ?? author._count?.books ?? author.books?.length ?? 0;
  const yearsWriting = author.yearsOfWriting ?? "—";
  const booksSold = author.booksSold ?? "—";
  const happyReaders = author.happyReaders ?? "—";
  const authorBooks = author.books || [];
  const authorEbooks = author.ebooks || [];

  const tabs = [
    { name: "About" },
    ...(authorEbooks.length > 0
      ? [{ name: "E-Books", count: authorEbooks.length }]
      : []),
    { name: "Books", count: authorBooks.length },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-clip w-full">
      <TopHeader />
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium select-none">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <Link
            href="/authors"
            className="hover:text-indigo-600 transition-colors"
          >
            Authors
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="text-gray-900 font-semibold">{author.name}</span>
        </nav>

        {/* Hero Bio Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Author Header Card (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
            {/* Left Bio Box */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Author Avatar */}
                <div className="relative shrink-0">
                  <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                    {profileImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profileImg}
                        alt={author.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(author.name)}</span>
                    )}
                  </div>
                  {/* Award Badge Overlay */}
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#0c193c] text-amber-400 border-2 border-white shadow-md">
                    <Award className="h-4 w-4" />
                  </div>
                </div>

                {/* Author Name & Role */}
                <div className="space-y-1.5 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {author.name}
                  </h1>

                  {author.positions && (
                    <p className="text-xs font-semibold text-indigo-600">
                      {Array.isArray(author.positions)
                        ? author.positions.join(", ")
                        : author.positions}
                    </p>
                  )}

                  {author.nationality && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium pt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span>
                        {Array.isArray(author.nationality)
                          ? author.nationality.join(", ")
                          : author.nationality}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio Preview */}
              {decodedBio ? (
                <div
                  className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: decodedBio }}
                />
              ) : (
                <p className="text-xs sm:text-sm text-gray-500 italic">
                  Passionate author contributing insightful literature and
                  books.
                </p>
              )}

              {/* Social Icons */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-gray-500">
                  {socialLinks.map((link, idx) => {
                    const platformDetails = getSocialPlatformDetails(
                      link.platform,
                    );
                    const url = link.url.startsWith("http")
                      ? link.url
                      : `https://${link.url}`;

                    return (
                      <a
                        key={link.id || idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={platformDetails.label}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        {platformDetails.icon}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dark Navy Blue Stat Box (5 cols) */}
            <div className="md:col-span-5 bg-[#0c193c] text-white p-6 sm:p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800">
              <div className="grid grid-cols-2 gap-6 divide-x divide-y divide-slate-800/80">
                {/* Stat 1: Books Published */}
                <div className="pr-4 pb-4 flex flex-col justify-center space-y-1">
                  <BookOpen className="h-5 w-5 text-amber-400 mb-1" />
                  <span className="text-xl font-bold tracking-tight text-white">
                    {booksPublished}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Books Published
                  </span>
                </div>

                {/* Stat 2: Years of Writing */}
                <div className="pl-4 pb-4 flex flex-col justify-center space-y-1">
                  <Clock className="h-5 w-5 text-amber-400 mb-1" />
                  <span className="text-xl font-bold tracking-tight text-white">
                    {yearsWriting}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Years of Writing
                  </span>
                </div>

                {/* Stat 3: Books Sold */}
                <div className="pr-4 pt-4 flex flex-col justify-center space-y-1">
                  <ShoppingBag className="h-5 w-5 text-amber-400 mb-1" />
                  <span className="text-xl font-bold tracking-tight text-white">
                    {booksSold}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Books Sold
                  </span>
                </div>

                {/* Stat 4: Happy Readers */}
                <div className="pl-4 pt-4 flex flex-col justify-center space-y-1">
                  <Heart className="h-5 w-5 text-amber-400 mb-1" />
                  <span className="text-xl font-bold tracking-tight text-white">
                    {happyReaders}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Happy Readers
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: About Author Overview (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
                About the Author
              </h3>

              <div className="space-y-3 text-xs">
                {/* Nationality */}
                {author.nationality && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-500 font-medium">
                      <Globe className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Nationality:</span>
                    </span>
                    <span className="font-semibold text-gray-800">
                      {Array.isArray(author.nationality)
                        ? author.nationality.join(", ")
                        : author.nationality}
                    </span>
                  </div>
                )}

                {/* Positions */}
                {author.positions && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-500 font-medium">
                      <Award className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Role:</span>
                    </span>
                    <span className="font-semibold text-gray-800 text-right">
                      {Array.isArray(author.positions)
                        ? author.positions.join(", ")
                        : author.positions}
                    </span>
                  </div>
                )}

                {/* Website */}
                {author.websiteUrl && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-500 font-medium">
                      <Globe className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Website:</span>
                    </span>
                    <a
                      href={
                        author.websiteUrl.startsWith("http")
                          ? author.websiteUrl
                          : `https://${author.websiteUrl}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-indigo-600 hover:underline max-w-[160px] truncate"
                    >
                      {author.websiteUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {author.websiteUrl && (
              <a
                href={
                  author.websiteUrl.startsWith("http")
                    ? author.websiteUrl
                    : `https://${author.websiteUrl}`
                }
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>Visit Official Website</span>
                <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
              </a>
            )}
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="border-b border-gray-200 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-8 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                type="button"
                onClick={() => setActiveTab(tab.name)}
                className={`py-3 text-xs font-semibold transition-all border-b-2 select-none cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.name
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <span>{tab.name}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      activeTab === tab.name
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid gap-6 items-start">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
            {/* About Tab */}
            {activeTab === "About" && (
              <div className="space-y-4">
                {decodedBio ? (
                  <div
                    className="text-sm leading-relaxed text-gray-700 prose prose-sm max-w-none break-words"
                    dangerouslySetInnerHTML={{ __html: decodedBio }}
                  />
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    No detailed biography provided for this author.
                  </p>
                )}
              </div>
            )}
            {/* Books Tab */}
            {activeTab === "Books" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Books Authored by {author.name}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Showing all {authorBooks.length} published titles.
                    </p>
                  </div>
                </div>

                {authorBooks.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-xs">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No books listed for this author yet.
                  </div>
                ) : (
                  /* Compact, smaller book cards grid */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
                    {authorBooks.map((book: AuthorBookItem, idx: number) => {
                      const bookTitle = book.title || `Book #${idx + 1}`;
                      const priceNum = Number(book.price) || 0;
                      const discountNum = Number(book.discountPercent) || 0;
                      const finalPrice =
                        discountNum > 0
                          ? priceNum - (priceNum * discountNum) / 100
                          : priceNum;

                      const bookImg =
                        book.coverImage ||
                        book.image ||
                        book.images?.[0]?.url ||
                        book.bookImages?.[0]?.url ||
                        null;

                      const rating = Number(book.rating) || 0;
                      const totalReviews = Number(book.totalReviews) || 0;

                      return (
                        <Link
                          key={book.id || idx}
                          href={`/books/${book.id}`}
                          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md"
                        >
                          {/* Discount Badge */}
                          {discountNum > 0 && (
                            <div className="absolute left-2 top-2 z-10 rounded-md bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                              -{discountNum}%
                            </div>
                          )}

                          {/* Book Image Container */}
                          <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden bg-slate-50 p-2.5">
                            {bookImg ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={bookImg}
                                alt={bookTitle}
                                className="h-full w-auto max-w-full object-contain transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-slate-300">
                                <BookOpen size={28} />
                              </div>
                            )}
                          </div>

                          {/* Book Details */}
                          <div className="flex flex-1 flex-col justify-between border-t border-slate-100 p-2.5">
                            <div>
                              <h3
                                className="line-clamp-1 text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors"
                                title={bookTitle}
                              >
                                {bookTitle}
                              </h3>

                              <p className="truncate text-[10px] text-slate-400 mt-0.5">
                                {author.name}
                              </p>

                              {/* Rating & Reviews if available */}
                              {totalReviews > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  <span className="text-[10px] font-bold text-slate-700">
                                    {rating.toFixed(1)}
                                  </span>
                                  <span className="text-[9px] text-slate-400">
                                    ({totalReviews})
                                  </span>
                                </div>
                              )}

                              {/* Price */}
                              <div className="mt-1.5 flex items-baseline gap-1.5">
                                <span className="text-xs font-bold text-[#1749A0]">
                                  Rs. {Math.round(finalPrice).toLocaleString()}
                                </span>

                                {discountNum > 0 && (
                                  <span className="text-[10px] text-slate-400 line-through">
                                    Rs. {Math.round(priceNum).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* View Button */}
                            <div className="mt-2.5 pt-2 border-t border-slate-100">
                              <span className="inline-flex w-full items-center justify-center gap-1 py-1 rounded-lg bg-slate-50 text-[10px] font-semibold text-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <span>View Book</span>
                                <ChevronRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* E-Books Tab */}
            {activeTab === "E-Books" && (
              <div className="space-y-6">
                <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                  Digital E-Books by {author.name}
                </h2>
                {authorEbooks.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs">
                    <Tablet className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No digital e-books listed for this author.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
                    {authorEbooks.map((ebook: any, idx: number) => (
                      <Link
                        key={ebook.id || idx}
                        href={`/eBooks/${ebook.id}`}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-2.5 transition hover:shadow-md"
                      >
                        <div className="aspect-[3/4] bg-slate-100 rounded-xl flex items-center justify-center mb-2">
                          <Tablet className="h-6 w-6 text-indigo-500" />
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {ebook.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
