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
  Share2,
} from "lucide-react";
import TopHeader from "@/components/topHeader";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { axiosInstance } from "@/utils/axiosInstances";
import { parseQuillContent } from "@/utils/quillDecoder";
import toast from "react-hot-toast";
import { PublisherItem, SocialLinkItem } from "../page";

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
    case "WHATSAPP":
      return {
        label: "WhatsApp",
        bgColor:
          "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100",
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        ),
      };
    case "TELEGRAM":
      return {
        label: "Telegram",
        bgColor: "bg-sky-50 text-sky-500 border-sky-200 hover:bg-sky-100",
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        ),
      };
    case "GITHUB":
      return {
        label: "GitHub",
        bgColor:
          "bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200",
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        ),
      };
    default:
      return {
        label: platform || "Social Profile",
        bgColor:
          "bg-slate-50 text-[#0b234f] border-slate-200 hover:bg-slate-100",
        icon: <Share2 className="w-4 h-4 text-[#0b234f] shrink-0" />,
      };
  }
};

const categories = [
  {
    name: "Self Help",
    books: 68,
    icon: "📖",
  },
  {
    name: "Biography",
    books: 42,
    icon: "👤",
  },
  {
    name: "Novels",
    books: 54,
    icon: "📚",
  },
  {
    name: "Children's Books",
    books: 36,
    icon: "🧸",
  },
  {
    name: "Business",
    books: 24,
    icon: "📊",
  },
];

const books = [
  {
    title: "The Power of Habit",
    author: "Charles Duhigg",
    image: "/books/habit.jpg",
    price: "Rs. 680",
    oldPrice: "Rs. 800",
    discount: "-15%",
    rating: 4.8,
    reviews: 1256,
  },
  {
    title: "सोच्ने बानी बदलौँ",
    author: "सञ्जय केसी",
    image: "/books/nepali-book.jpg",
    price: "Rs. 315",
    oldPrice: "Rs. 350",
    discount: "-10%",
    rating: 4.7,
    reviews: 982,
  },
  {
    title: "The 5 AM Club",
    author: "Robin Sharma",
    image: "/books/5am.jpg",
    price: "Rs. 650",
    oldPrice: "Rs. 740",
    discount: "-12%",
    rating: 4.8,
    reviews: 1105,
  },
  {
    title: "जीवनलाई सरल बनाउने कला",
    author: "अमित के. मल्ल",
    image: "/books/simple-life.jpg",
    price: "Rs. 280",
    oldPrice: "Rs. 340",
    discount: "-15%",
    rating: 4.6,
    reviews: 875,
  },
  {
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    image: "/books/rich-dad.jpg",
    price: "Rs. 750",
    oldPrice: "Rs. 840",
    discount: "-10%",
    rating: 4.9,
    reviews: 2145,
  },
];

const authors = [
  {
    name: "Robin Sharma",
    books: 12,
    image: "/authors/robin-sharma.jpg",
  },
  {
    name: "Saurabh Subedi",
    books: 8,
    image: "/authors/saurabh.jpg",
  },
  {
    name: "Anil K. Mandal",
    books: 6,
    image: "/authors/anil.jpg",
  },
  {
    name: "Bijay Kumar Sigdel",
    books: 5,
    image: "/authors/bijay.jpg",
  },
  {
    name: "Ramesh Nepal",
    books: 7,
    image: "/authors/ramesh.jpg",
  },
  {
    name: "Sachin Regmi",
    books: 9,
    image: "/authors/sachin.jpg",
  },
];

interface PublisherDetailProps {
  params: Promise<{ id: string }>;
}

const PublisherDetailPage = ({ params }: PublisherDetailProps) => {
  const resolvedParams = use(params);
  const publisherId = resolvedParams?.id;

  const [publisher, setPublisher] = useState<PublisherItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPublisher = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/v1/publisher/${publisherId}`);
      const data = response.data?.data || response.data;
      setPublisher(data);
    } catch (error: any) {
      console.error("Failed to fetch publisher:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load publisher details.",
      );
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
  const booksCount = publisher?._count?.books ?? publisher?.booksPublished ?? 0;
  const authorsCount = publisher?.authorsCount ?? 0;
  const booksSold = publisher?.booksSold ?? 0;
  const yearsPublishing = publisher?.yearsOfPublishing ?? 0;
  const logoUrl =
    publisher?.publicationLogoUrl ||
    `https://placehold.co/128x128/0f172a/ffffff?text=${encodeURIComponent(
      publisherName.charAt(0).toUpperCase(),
    )}`;

  // Decode Rich Text / Quill Delta / JSON Stringified about content into clean HTML
  const aboutHtml = parseQuillContent(publisher?.about);
  const phoneNumbers = publisher?.phoneNumbers ?? [];
  const socialLinks: SocialLinkItem[] = Array.isArray(publisher?.socialLinks)
    ? publisher.socialLinks
    : [];

  if (isLoading) {
    return (
      <div>
        <TopHeader />
        <Header />
        <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#0b234f]" />
            <p className="text-sm text-gray-500">
              Loading publisher details...
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
        <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <BookOpen className="h-12 w-12 text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-700">
              Publisher Not Found
            </h2>
            <p className="text-sm text-gray-500">
              The publisher you are looking for could not be found.
            </p>
            <Link
              href="/publishers"
              className="mt-3 rounded-lg bg-[#0b234f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#132f65] transition"
            >
              Back to Publishers
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <TopHeader />
      <Header />
      <div className="min-h-screen bg-[#f7f9fc]">
        {/* Breadcrumb */}
        <section className="border-b bg-white">
          <div className="flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-[#0b234f]">
                Home
              </Link>

              <span className="text-gray-300">›</span>

              <Link
                href="/publishers"
                className="text-gray-500 hover:text-[#0b234f]"
              >
                Publishers
              </Link>

              <span className="text-gray-300">›</span>

              <span className="font-medium text-[#0b234f]">
                {publisherName}
              </span>
            </div>
          </div>
        </section>

        <main className="flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-6 space-y-6">
          {/* Publisher Hero + About */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_0.9fr]">
            {/* Hero */}
            <div className="relative min-h-[360px] overflow-hidden rounded-xl bg-[#071d46] shadow-sm">
              {/* Background overlay */}
              <div className="absolute inset-0 bg-[#071d46]" />

              <div className="relative flex h-full flex-col justify-between p-7 sm:p-9">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  {/* Logo */}
                  <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
                    <img
                      src={logoUrl}
                      alt={publisherName}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white sm:text-4xl">
                      {publisherName}
                    </h1>

                    <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-blue-100">
                      {publisher.establishedYear && (
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={16} className="text-[#e8ac19]" />
                          Established: {publisher.establishedYear}
                        </span>
                      )}

                      {publisher.address && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={16} className="text-[#e8ac19]" />
                          {publisher.address}
                        </span>
                      )}
                    </div>

                    {/* Hero Social Links */}
                    {socialLinks.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {socialLinks.map((link, idx) => {
                          const platformInfo = getSocialPlatformDetails(
                            link.platform,
                          );
                          return (
                            <a
                              key={link.id || idx}
                              href={
                                link.url.startsWith("http")
                                  ? link.url
                                  : `https://${link.url}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              title={platformInfo.label}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-sm transition border border-white/10"
                            >
                              {platformInfo.icon}
                              <span>{platformInfo.label}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-blue-900/40 pt-6">
                  <div>
                    <BookOpen className="mb-2 text-[#e8ac19]" size={22} />

                    <p className="text-2xl font-bold text-white">
                      {booksCount}
                    </p>

                    <p className="text-xs text-blue-100">Books Published</p>
                  </div>

                  <div>
                    <Users className="mb-2 text-[#e8ac19]" size={22} />

                    <p className="text-2xl font-bold text-white">
                      {authorsCount}
                    </p>

                    <p className="text-xs text-blue-100">Active Authors</p>
                  </div>

                  <div>
                    <ShoppingCart className="mb-2 text-[#e8ac19]" size={22} />

                    <p className="text-2xl font-bold text-white">{booksSold}</p>

                    <p className="text-xs text-blue-100">Books Sold</p>
                  </div>

                  <div>
                    <CalendarDays className="mb-2 text-[#e8ac19]" size={22} />

                    <p className="text-2xl font-bold text-white">
                      {yearsPublishing ? `${yearsPublishing}` : "—"}
                    </p>

                    <p className="text-xs text-blue-100">Years of Publishing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* About Sidebar */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0b234f]">
                  About {publisherName}
                </h2>

                {/* Decoded Quill Delta / HTML Description */}
                {aboutHtml ? (
                  <div
                    className="mt-4 text-sm leading-6 text-gray-600 prose prose-sm max-w-none break-words"
                    dangerouslySetInnerHTML={{ __html: aboutHtml }}
                  />
                ) : (
                  <p className="mt-4 text-sm text-gray-400 italic">
                    No description provided.
                  </p>
                )}

                <div className="mt-6 space-y-3.5 border-t pt-5">
                  {/* Website Link (Separate & Clickable) */}
                  {publisher.websiteUrl && (
                    <div className="flex items-start gap-3 text-sm">
                      <Globe
                        size={17}
                        className="mt-0.5 shrink-0 text-[#0b234f]"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Website
                        </p>
                        <a
                          href={
                            publisher.websiteUrl.startsWith("http")
                              ? publisher.websiteUrl
                              : `https://${publisher.websiteUrl}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0b234f] hover:underline font-medium flex items-center gap-1.5 mt-0.5 break-all group"
                        >
                          <span className="truncate">
                            {publisher.websiteUrl}
                          </span>
                          <ExternalLink
                            size={13}
                            className="shrink-0 text-gray-400 group-hover:text-[#0b234f]"
                          />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {publisher.email && (
                    <div className="flex items-start gap-3 text-sm">
                      <Mail
                        size={17}
                        className="mt-0.5 shrink-0 text-[#0b234f]"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Email
                        </p>
                        <a
                          href={`mailto:${publisher.email}`}
                          className="text-gray-700 hover:text-[#0b234f] hover:underline font-medium block mt-0.5 truncate"
                        >
                          {publisher.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Phone Numbers */}
                  {phoneNumbers.length > 0 && (
                    <div className="flex items-start gap-3 text-sm">
                      <Phone
                        size={17}
                        className="mt-0.5 shrink-0 text-[#0b234f]"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Phone
                        </p>
                        <p className="text-gray-700 font-medium mt-0.5">
                          {phoneNumbers.join(", ")}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {publisher.address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin
                        size={17}
                        className="mt-0.5 shrink-0 text-[#0b234f]"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Address
                        </p>
                        <p className="text-gray-700 font-medium mt-0.5">
                          {publisher.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0b234f]">
                Top Categories by {publisherName.replace(" Publications", "")}
              </h2>

              <Link
                href="#"
                className="flex items-center gap-1 text-sm font-semibold text-[#0b234f] hover:underline"
              >
                View All Categories
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4 transition hover:border-[#0b234f]/20 hover:bg-blue-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                    {category.icon}
                  </div>

                  <h3 className="mt-3 text-sm font-semibold text-gray-800">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {category.books} Books
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Books */}
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0b234f]">
                  Books by {publisherName}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {booksCount} Books Found
                </p>
              </div>

              <select className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 outline-none">
                <option>Newest First</option>
                <option>Best Selling</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {books.map((book) => (
                <div key={book.title} className="group">
                  {/* Book */}
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                    <span className="absolute left-2 top-2 z-10 rounded bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
                      {book.discount}
                    </span>

                    <Image
                      src={book.image}
                      alt={book.title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-gray-800">
                    {book.title}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">{book.author}</p>

                  <div className="mt-2 flex items-center gap-1">
                    <Star
                      size={13}
                      fill="currentColor"
                      className="text-yellow-500"
                    />

                    <span className="text-xs font-medium text-gray-600">
                      {book.rating}
                    </span>

                    <span className="text-[11px] text-gray-400">
                      ({book.reviews})
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-bold text-red-600">
                      {book.price}
                    </span>

                    <span className="text-xs text-gray-400 line-through">
                      {book.oldPrice}
                    </span>
                  </div>

                  <button className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[#0b234f] text-xs font-semibold text-[#0b234f] transition hover:bg-[#0b234f] hover:text-white">
                    <ShoppingCart size={14} />
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="#"
                className="flex items-center gap-2 rounded-lg bg-[#0b234f] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#132f65]"
              >
                View All Books
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* Authors */}
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0b234f]">
                Featured Authors from {publisherName}
              </h2>

              <Link
                href="#"
                className="flex items-center gap-1 text-sm font-semibold text-[#0b234f]"
              >
                View All Authors
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
              {authors.map((author) => (
                <Link href="#" key={author.name} className="text-center group">
                  <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border-4 border-gray-100 bg-gray-100 transition group-hover:border-[#0b234f]/20">
                    <Image
                      src={author.image}
                      alt={author.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <h3 className="mt-3 text-sm font-semibold text-gray-800 group-hover:text-[#0b234f] transition">
                    {author.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {author.books} Books
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-2 divide-x divide-y md:grid-cols-5 md:divide-y-0">
              {[
                ["✓", "100% Original Books", "Genuine & Authentic"],
                ["🚚", "Fast Delivery", "Across Nepal"],
                ["↩", "Easy Returns", "7 Days Return Policy"],
                ["▣", "Secure Payment", "100% Safe & Secure"],
                ["$", "Best Price Guarantee", "Unbeatable Prices"],
              ].map(([icon, title, subtitle]) => (
                <div key={title} className="flex items-center gap-3 p-5">
                  <div className="text-xl text-[#0b234f]">{icon}</div>

                  <div>
                    <p className="text-xs font-bold text-[#0b234f]">{title}</p>

                    <p className="mt-1 text-[11px] text-gray-500">{subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PublisherDetailPage;
