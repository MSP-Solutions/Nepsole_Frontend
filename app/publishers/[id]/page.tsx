"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  CalendarDays,
  BookOpen,
  Users,
  Globe,
  Mail,
  Phone,
  ArrowRight,
  ShoppingCart,
  Star,
  Loader2,
  ExternalLink,
  Search,
  Tablet,
  ChevronRight,
  Percent,
} from "lucide-react";
import TopHeader from "@/components/topHeader";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { axiosInstance } from "@/utils/axiosInstances";
import { parseQuillContent } from "@/utils/quillDecoder";
import toast from "react-hot-toast";

export interface SocialLinkItem {
  id?: number | string;
  publisherId?: number | string;
  platform: string;
  url: string;
}

export interface PublisherBookItem {
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
  stock?: number;
  [key: string]: any;
}

export interface PublisherDetailItem {
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
  books?: PublisherBookItem[];
  ebooks?: any[];
  _count?: {
    books: number;
  };
  [key: string]: any;
}

// Strip HTML tags for clean text preview
const stripHtml = (html: string): string => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// Helper for rendering accurate social media brand icons
const getSocialPlatformDetails = (platform: string = "") => {
  const p = platform.trim().toUpperCase();

  switch (p) {
    case "FACEBOOK":
      return {
        label: "Facebook",
        bgColor: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        ),
      };
    case "TWITTER":
    case "X":
      return {
        label: "X (Twitter)",
        bgColor:
          "bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200",
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        ),
      };
    case "INSTAGRAM":
      return {
        label: "Instagram",
        bgColor: "bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100",
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        ),
      };
    case "LINKEDIN":
      return {
        label: "LinkedIn",
        bgColor: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        ),
      };
    case "YOUTUBE":
      return {
        label: "YouTube",
        bgColor: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100",
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        ),
      };
    case "TIKTOK":
      return {
        label: "TikTok",
        bgColor:
          "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200",
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.02 3.32-1.41 3.49-3.22.04-1.06.01-2.12.01-3.18.01-4.89.01-9.78.01-14.67z" />
          </svg>
        ),
      };
    default:
      return {
        label: platform || "Website",
        bgColor: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
        icon: <Globe className="w-4 h-4 shrink-0" />,
      };
  }
};

interface PublisherDetailProps {
  params: Promise<{ id: string }>;
}

const PublisherDetailPage = ({ params }: PublisherDetailProps) => {
  const resolvedParams = use(params);
  const publisherId = resolvedParams?.id;

  const [publisher, setPublisher] = useState<PublisherDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchPublisher = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/v1/publisher/${publisherId}`);
      const data = response.data?.data || response.data;
      setPublisher(data);
    } catch (error: any) {
      console.error("Failed to fetch publisher:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (publisherId) {
      fetchPublisher();
    }
  }, [publisherId]);

  // Derived values from API data
  const publisherName = publisher?.name || "Publisher";
  const booksList: PublisherBookItem[] = Array.isArray(publisher?.books)
    ? publisher.books
    : [];
  const ebooksList: any[] = Array.isArray(publisher?.ebooks)
    ? publisher.ebooks
    : [];

  const booksCount =
    publisher?._count?.books ?? publisher?.booksPublished ?? booksList.length;
  const authorsCount = publisher?.authorsCount ?? 0;
  const booksSold = publisher?.booksSold ?? 0;
  const yearsPublishing = publisher?.yearsOfPublishing ?? 0;
  const establishedYear = publisher?.establishedYear ?? null;

  const logoUrl =
    publisher?.publicationLogoUrl ||
    `https://placehold.co/128x128/0f172a/ffffff?text=${encodeURIComponent(
      publisherName.charAt(0).toUpperCase(),
    )}`;

  // Decode Rich Text / Quill Delta for publisher about
  const aboutHtml = parseQuillContent(publisher?.about);
  const phoneNumbers = Array.isArray(publisher?.phoneNumbers)
    ? publisher.phoneNumbers
    : [];
  const socialLinks: SocialLinkItem[] = Array.isArray(publisher?.socialLinks)
    ? publisher.socialLinks
    : [];

  // Filter books by search query
  const filteredBooks = booksList.filter((book) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = book.title?.toLowerCase().includes(q);
    const desc = stripHtml(parseQuillContent(book.description)).toLowerCase();
    const descMatch = desc.includes(q);
    return titleMatch || descMatch;
  });

  // Sort Books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    const priceA = Number(a.price) || 0;
    const priceB = Number(b.price) || 0;
    const discountA = Number(a.discountPercent) || 0;
    const discountB = Number(b.discountPercent) || 0;
    const finalPriceA =
      discountA > 0 ? priceA - (priceA * discountA) / 100 : priceA;
    const finalPriceB =
      discountB > 0 ? priceB - (priceB * discountB) / 100 : priceB;

    if (sortBy === "price_asc") return finalPriceA - finalPriceB;
    if (sortBy === "price_desc") return finalPriceB - finalPriceA;
    if (sortBy === "discount") return discountB - discountA;
    if (sortBy === "rating")
      return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    return 0;
  });

  if (isLoading) {
    return (
      <div>
        <TopHeader />
        <Header />
        <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#0b234f]" />
            <p className="text-sm text-gray-500 font-medium">
              Loading publisher profile...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!publisher) {
    return (
      <div>
        <TopHeader />
        <Header />
        <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-center p-6 text-center">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">
            Publisher Not Found
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-md">
            The requested publisher profile could not be loaded or may have been
            removed.
          </p>
          <Link
            href="/publishers"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0b234f] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#132f65] transition"
          >
            Browse All Publishers
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <TopHeader />
      <Header />

      {/* Main Container */}
      <div className="mx-auto max-w-[1400px] px-3 sm:px-4 md:px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Link href="/" className="hover:text-[#0b234f] transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <Link
            href="/publishers"
            className="hover:text-[#0b234f] transition-colors"
          >
            Publishers
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-800 font-semibold">{publisherName}</span>
        </div>

        {/* Hero Section */}
        <div className="mt-4 overflow-hidden rounded-2xl bg-[#0b1329] text-white shadow-sm">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              {/* Left Profile Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-white p-1 shadow-md">
                  <Image
                    src={logoUrl}
                    alt={publisherName}
                    fill
                    className="object-contain p-1 rounded-xl"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      {publisherName}
                    </h1>
                    {establishedYear && (
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 border border-white/10">
                        Est. {establishedYear}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    {publisher.address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-rose-400 shrink-0" />
                        <span>{publisher.address}</span>
                      </span>
                    )}

                    {yearsPublishing > 0 && (
                      <span className="flex items-center gap-1.5">
                        <CalendarDays
                          size={13}
                          className="text-amber-400 shrink-0"
                        />
                        <span>{yearsPublishing} Years of Publishing</span>
                      </span>
                    )}

                    {authorsCount > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Users
                          size={13}
                          className="text-emerald-400 shrink-0"
                        />
                        <span>{authorsCount} Authors</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Links & Website */}
              <div className="flex flex-wrap items-center gap-2.5 border-t border-white/10 pt-4 md:border-t-0 md:pt-0">
                {publisher.websiteUrl && (
                  <a
                    href={
                      publisher.websiteUrl.startsWith("http")
                        ? publisher.websiteUrl
                        : `https://${publisher.websiteUrl}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition backdrop-blur-xs"
                  >
                    <Globe size={14} />
                    <span>Website</span>
                    <ExternalLink size={12} className="opacity-70" />
                  </a>
                )}

                {publisher.email && (
                  <a
                    href={`mailto:${publisher.email}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-[#0b1329] hover:bg-slate-100 transition shadow-xs"
                  >
                    <Mail size={14} />
                    <span>Contact</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <main className="mt-6 space-y-6">
          {/* Stats Overview Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0b234f]">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{booksCount}</p>
                <p className="text-xs text-slate-500 font-medium">
                  Published Books
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {authorsCount}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Authors Onboard
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShoppingCart size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{booksSold}</p>
                <p className="text-xs text-slate-500 font-medium">
                  Books Distributed
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <CalendarDays size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {yearsPublishing > 0
                    ? `${yearsPublishing}`
                    : establishedYear
                      ? `${new Date().getFullYear() - establishedYear}`
                      : "—"}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Years Publishing
                </p>
              </div>
            </div>
          </div>

          {/* About & Contact Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* About Narrative (8 cols) */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                About {publisherName}
              </h2>

              {aboutHtml ? (
                <div
                  className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: aboutHtml }}
                />
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No description provided for this publication.
                </p>
              )}
            </div>

            {/* Quick Contact & Info (4 cols) */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Publication Details
              </h3>

              <div className="space-y-3.5 text-xs">
                {publisher.address && (
                  <div className="flex items-start gap-2.5 text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        Address
                      </span>
                      <span>{publisher.address}</span>
                    </div>
                  </div>
                )}

                {phoneNumbers.length > 0 && (
                  <div className="flex items-start gap-2.5 text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        Phone
                      </span>
                      <a
                        href={`tel:${phoneNumbers[0]}`}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {phoneNumbers.join(", ")}
                      </a>
                    </div>
                  </div>
                )}

                {publisher.email && (
                  <div className="flex items-start gap-2.5 text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        Email
                      </span>
                      <a
                        href={`mailto:${publisher.email}`}
                        className="hover:text-indigo-600 truncate block max-w-[220px] transition-colors"
                      >
                        {publisher.email}
                      </a>
                    </div>
                  </div>
                )}

                {socialLinks.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-900 block mb-2">
                      Social Channels
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {socialLinks.map((link, idx) => {
                        const platform = getSocialPlatformDetails(
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
                            rel="noreferrer"
                            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition ${platform.bgColor}`}
                          >
                            {platform.icon}
                            <span className="font-medium text-[11px]">
                              {platform.label}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Books Section with Comprehensive Details */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            {/* Header & Filter Toolbar */}
            <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Books by {publisherName}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Explore all {booksList.length} publications with discounts,
                    ratings, and details.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
              {sortedBooks.map((book) => {
                const bookTitle = book.title || "Untitled Book";
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

                const rawDesc = parseQuillContent(book.description);
                const cleanDesc = stripHtml(rawDesc);
                const rating = Number(book.rating) || 0;
                const totalReviews = Number(book.totalReviews) || 0;

                return (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md"
                  >
                    {/* Discount Tag */}
                    {discountNum > 0 && (
                      <div className="absolute left-2 top-2 z-10 flex items-center gap-0.5 rounded-md bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                        <Percent size={9} />
                        <span>{discountNum}% OFF</span>
                      </div>
                    )}

                    {/* Cover Image Container */}
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

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between border-t border-slate-100 p-2.5 space-y-2">
                      <div>
                        {/* Title */}
                        <h3
                          className="line-clamp-1 text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors"
                          title={bookTitle}
                        >
                          {bookTitle}
                        </h3>

                        {/* Publisher Tag */}
                        <p className="truncate text-[10px] text-slate-400 mt-0.5">
                          {publisherName}
                        </p>

                        {/* Rating & Reviews */}
                        <div className="flex items-center gap-1 mt-1.5">
                          <div className="flex items-center">
                            <Star
                              className={`h-3 w-3 ${
                                rating > 0
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-300"
                              }`}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-700">
                            {rating > 0 ? rating.toFixed(1) : "0.0"}
                          </span>
                        </div>

                        {/* Price & Discount */}
                        <div className="mt-2 flex items-baseline gap-1.5">
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
                      <div className="pt-2 border-t border-slate-100">
                        <span className="inline-flex w-full items-center justify-center gap-1 py-1 rounded-lg bg-slate-50 text-[10px] font-semibold text-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <span>View Details</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* E-Books section if available */}
          {ebooksList.length > 0 && (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Digital E-Books
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ebooksList.length} E-Books published by {publisherName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
                {ebooksList.map((ebook: any, idx: number) => (
                  <Link
                    key={ebook.id || idx}
                    href={`/eBooks/${ebook.id}`}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-2.5 transition hover:shadow-md hover:border-indigo-300"
                  >
                    <div className="aspect-[3/4] bg-slate-50 rounded-xl flex items-center justify-center mb-2">
                      <Tablet className="h-7 w-7 text-indigo-500" />
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                      {ebook.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PublisherDetailPage;
