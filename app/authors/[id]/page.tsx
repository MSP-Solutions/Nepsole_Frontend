"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import TopHeader from "@/components/topHeader";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  Star,
  BookOpen,
  Clock,
  ShoppingBag,
  Heart,
  Globe,
  Languages,
  Tag,
  ExternalLink,
  ChevronRight,
  ShoppingCart,
  Award,
} from "lucide-react";

// Mock Database of Authors
const authorsData: Record<string, {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  stats: {
    booksPublished: string;
    yearsWriting: string;
    booksSold: string;
    happyReaders: string;
  };
  about: {
    nationality: string;
    language: string;
    genres: string;
    website: string;
  };
}> = {
  "1": {
    name: "Parag Sharma",
    role: "Author, Speaker & Leadership Coach",
    bio: "पराग् शर्मा एक लोकप्रिय लेखक, प्रेरक वक्ता र लिडरशिप कोच हुन्। उनका पुस्तकहरूले व्यक्तिगत विकास, नेतृत्व, सफलता र सकारात्मक सोचमा लाखौँ पाठकहरूलाई प्रेरणा दिएका छन्।",
    avatar: "/images/authors/sangam.jpg",
    rating: 4.8,
    reviewsCount: 256,
    stats: {
      booksPublished: "12+",
      yearsWriting: "8+",
      booksSold: "1M+",
      happyReaders: "50K+",
    },
    about: {
      nationality: "Nepalese",
      language: "Nepali, English",
      genres: "Self Help, Motivation, Leadership",
      website: "www.paragsharma.com",
    },
  },
  "2": {
    name: "Sangam Thapa",
    role: "Frontend Developer & Tech Author",
    bio: "Passionate developer and author sharing insights about technology, web development, software engineering, and modern digital experiences.",
    avatar: "/images/authors/sangam.jpg",
    rating: 4.9,
    reviewsCount: 184,
    stats: {
      booksPublished: "8+",
      yearsWriting: "5+",
      booksSold: "450K+",
      happyReaders: "30K+",
    },
    about: {
      nationality: "Nepalese",
      language: "Nepali, English",
      genres: "Technology, Programming, Web",
      website: "www.sangamthapa.com",
    },
  },
};

// Fallback Default Author (Parag Sharma)
const defaultAuthor = authorsData["1"];

// Author's Published Books
const authorBooks = [
  {
    id: "b1",
    title: "सफलताको नयाँ सोच",
    badge: "Bestseller",
    badgeColor: "bg-amber-500 text-white",
    rating: 4.8,
    reviews: 1256,
    price: "Rs. 340",
    originalPrice: "Rs. 400",
    coverGradient: "from-blue-900 via-indigo-800 to-amber-700",
  },
  {
    id: "b2",
    title: "आफूलाई बदल्ने शक्ति",
    badge: "-15%",
    badgeColor: "bg-red-500 text-white",
    rating: 4.7,
    reviews: 982,
    price: "Rs. 280",
    originalPrice: "Rs. 330",
    coverGradient: "from-sky-900 via-blue-800 to-cyan-700",
  },
  {
    id: "b3",
    title: "Think Like a Leader",
    badge: "-10%",
    badgeColor: "bg-red-500 text-white",
    rating: 4.9,
    reviews: 1105,
    price: "Rs. 450",
    originalPrice: "Rs. 500",
    coverGradient: "from-slate-900 via-blue-950 to-indigo-900",
  },
  {
    id: "b4",
    title: "समयको सदुपयोग",
    badge: null,
    rating: 4.6,
    reviews: 875,
    price: "Rs. 320",
    originalPrice: null,
    coverGradient: "from-purple-950 via-indigo-900 to-violet-800",
  },
  {
    id: "b5",
    title: "सकारात्मक सोचको शक्ति",
    badge: null,
    rating: 4.7,
    reviews: 723,
    price: "Rs. 350",
    originalPrice: null,
    coverGradient: "from-amber-950 via-yellow-900 to-orange-800",
  },
  {
    id: "b6",
    title: "The Power of Habit",
    badge: null,
    rating: 4.8,
    reviews: 1012,
    price: "Rs. 350",
    originalPrice: null,
    coverGradient: "from-amber-400 via-yellow-400 to-amber-500",
  },
];

// Top Readers Also Bought Recommendations
const topRecommendedBooks = [
  {
    id: "rec1",
    title: "Atomic Habits",
    author: "James Clear",
    rating: 4.9,
    reviews: 2145,
    price: "Rs. 855",
    coverBg: "bg-amber-100 border-amber-200 text-amber-900",
  },
  {
    id: "rec2",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    rating: 4.8,
    reviews: 1876,
    price: "Rs. 765",
    coverBg: "bg-slate-100 border-slate-200 text-slate-900",
  },
  {
    id: "rec3",
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    rating: 4.7,
    reviews: 1542,
    price: "Rs. 650",
    coverBg: "bg-purple-100 border-purple-200 text-purple-900",
  },
];

interface AuthorDetailsProps {
  params: Promise<{ id: string }>;
}

export default function AuthorDetailsPage({ params }: AuthorDetailsProps) {
  const resolvedParams = use(params);
  const authorId = resolvedParams?.id || "1";

  // Find author or fallback
  const author = authorsData[authorId] || defaultAuthor;

  const [activeTab, setActiveTab] = useState("Books");
  const [emailSubscription, setEmailSubscription] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const tabs = [
    "Books",
    "About",
    "Awards & Achievements",
    "Videos",
    "Events",
    "Articles",
    "Reviews",
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailSubscription) {
      setSubscribed(true);
      setEmailSubscription("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

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
          <Link href="/authors" className="hover:text-indigo-600 transition-colors">
            Authors
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="text-gray-900 font-semibold">{author.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Author Bio & Header (Left & Middle - 8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
            {/* Left Bio Box (7 cols) */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Author Avatar with Award Badge */}
                <div className="relative shrink-0">
                  <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100">
                    <Image
                      src={author.avatar}
                      alt={author.name}
                      fill
                      className="object-cover"
                      priority
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  {/* Gold Award Badge Overlay */}
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#0c193c] text-amber-400 border-2 border-white shadow-md">
                    <Award className="h-4 w-4" />
                  </div>
                </div>

                {/* Author Name & Rating */}
                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {author.name}
                  </h1>
                  <p className="text-xs font-semibold text-gray-500">
                    {author.role}
                  </p>

                  {/* Stars Rating */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      {author.rating}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({author.reviewsCount} Reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio Paragraph */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {author.bio}
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-2.5 pt-2 text-gray-500">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Dark Navy Blue Stat Box (5 cols) */}
            <div className="md:col-span-5 bg-[#0c193c] text-white p-6 sm:p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800">
              <div className="grid grid-cols-2 gap-6 divide-x divide-y divide-slate-800/80">
                {/* Stat 1: Books Published */}
                <div className="pr-4 pb-4 flex flex-col justify-center space-y-1">
                  <BookOpen className="h-5 w-5 text-amber-400 mb-1" />
                  <span className="text-xl font-bold tracking-tight text-white">
                    {author.stats.booksPublished}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Books Published
                  </span>
                </div>

                {/* Stat 2: Years of Writing */}
                <div className="pl-4 pb-4 flex flex-col justify-center space-y-1">
                  <Clock className="h-5 w-5 text-amber-400 mb-1" />
                  <span className="text-xl font-bold tracking-tight text-white">
                    {author.stats.yearsWriting}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Years of Writing
                  </span>
                </div>

                {/* Stat 3: Books Sold */}
                <div className="pr-4 pt-4 flex flex-col justify-center space-y-1">
                  <ShoppingBag className="h-5 w-5 text-amber-400 mb-1" />
                  <span className="text-xl font-bold tracking-tight text-white">
                    {author.stats.booksSold}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Books Sold
                  </span>
                </div>

                {/* Stat 4: Happy Readers */}
                <div className="pl-4 pt-4 flex flex-col justify-center space-y-1">
                  <Heart className="h-5 w-5 text-amber-400 mb-1" />
                  <span className="text-xl font-bold tracking-tight text-white">
                    {author.stats.happyReaders}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Happy Readers
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: About the Author Box (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
                About the Author
              </h3>

              <div className="space-y-3 text-xs">
                {/* Nationality */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500 font-medium">
                    <Globe className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Nationality:</span>
                  </span>
                  <span className="font-semibold text-gray-800">
                    {author.about.nationality}
                  </span>
                </div>

                {/* Language */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500 font-medium">
                    <Languages className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Language:</span>
                  </span>
                  <span className="font-semibold text-gray-800">
                    {author.about.language}
                  </span>
                </div>

                {/* Genres */}
                <div className="flex items-start justify-between">
                  <span className="flex items-center gap-2 text-gray-500 font-medium shrink-0">
                    <Tag className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Genres:</span>
                  </span>
                  <span className="font-semibold text-gray-800 text-right max-w-[160px]">
                    {author.about.genres}
                  </span>
                </div>

                {/* Website */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500 font-medium">
                    <Globe className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Website:</span>
                  </span>
                  <a
                    href={`https://${author.about.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    {author.about.website}
                  </a>
                </div>
              </div>
            </div>

            <a
              href={`https://${author.about.website}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>Visit Official Website</span>
              <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
            </a>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="border-b border-gray-200 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-8 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-xs font-semibold transition-all border-b-2 select-none cursor-pointer ${activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Area: Books Grid (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
            {/* Header & Sort Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Books by {author.name}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  ({authorBooks.length} Books Found)
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-gray-400 font-medium">Sort by:</span>
                <select className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer">
                  <option>Newest First</option>
                  <option>Popularity</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* 6 Books Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {authorBooks.map((book) => (
                <div
                  key={book.id}
                  className="group flex flex-col justify-between bg-white rounded-2xl border border-gray-100 p-3.5 shadow-2xs hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-3">
                    {/* Book Cover Container */}
                    <div className="relative aspect-3/4 rounded-xl overflow-hidden shadow-sm bg-gradient-to-br flex flex-col justify-between p-4 text-white">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${book.coverGradient}`}
                      />

                      {/* Badge (Bestseller, -15%, -10%) */}
                      {book.badge && (
                        <span
                          className={`relative z-10 self-start px-2 py-0.5 rounded-md text-sm font-bold ${book.badgeColor}`}
                        >
                          {book.badge}
                        </span>
                      )}

                      {/* Mock Cover Typography */}
                      <div className="relative z-10 mt-auto text-center space-y-1">
                        <span className="block text-sm font-bold leading-tight drop-shadow-md">
                          {book.title}
                        </span>
                        <span className="block text-sm text-white/80 font-medium">
                          {author.name}
                        </span>
                      </div>
                    </div>

                    {/* Book Info */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {book.title}
                      </h4>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-3 w-3 fill-amber-400"
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium">
                          ({book.reviews.toLocaleString()})
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xs font-bold text-rose-600">
                          {book.price}
                        </span>
                        {book.originalPrice && (
                          <span className="text-[11px] text-gray-400 line-through">
                            {book.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Add to Cart + Wishlist Heart */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all cursor-pointer"
                    >
                      <span>Add to Cart</span>
                    </button>

                    <button
                      type="button"
                      aria-label="Wishlist"
                      className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                    >
                      <Heart className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Books Button */}
            <div className="pt-4 text-center">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0c193c] hover:bg-[#122350] text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <span>View All Books</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Sidebar Widgets (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Widget 1: Top Readers Also Bought */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
                Top Readers Also Bought
              </h3>

              <div className="space-y-4">
                {topRecommendedBooks.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Mini Book Cover */}
                      <div
                        className={`w-9 h-12 rounded-md ${item.coverBg} border flex items-center justify-center text-[9px] font-bold text-center p-1 leading-tight shadow-2xs shrink-0`}
                      >
                        {item.title}
                      </div>

                      <div className="space-y-0.5">
                        <h5 className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {item.title}
                        </h5>
                        <p className="text-[11px] text-gray-400">{item.author}</p>

                        <div className="flex items-center gap-1 pt-0.5">
                          <div className="flex items-center text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-2.5 w-2.5 fill-amber-400"
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">
                            ({item.reviews.toLocaleString()})
                          </span>
                        </div>

                        <p className="text-xs font-bold text-rose-600 pt-0.5">
                          {item.price}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="Add to Cart"
                      className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors cursor-pointer shrink-0"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: Stay Updated Newsletter */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Stay Updated</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Get the latest books, offers and author news.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-2 pt-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={emailSubscription}
                  onChange={(e) => setEmailSubscription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0c193c] hover:bg-[#122350] text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  Subscribe
                </button>
              </form>

              {subscribed && (
                <p className="text-xs font-medium text-emerald-600 text-center pt-1 animate-fade-in">
                  ✓ Thank you for subscribing!
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
