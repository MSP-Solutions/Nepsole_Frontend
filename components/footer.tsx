"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowUpRight, Mail, Phone } from "lucide-react";
import { axiosInstance } from "@/utils/axiosInstances";
import { parseQuillContent } from "@/utils/quillDecoder";

interface FooterItem {
  label: string;
  href: string;
}

interface AboutData {
  title?: string;
  description?: string;
  contact?: string;
  email?: string;
  address?: string;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  linkedinUrl?: string | null;
  [key: string]: any;
}

// Social SVG Icons
const FacebookIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={`${className} fill-current shrink-0`} viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={`${className} fill-current shrink-0`} viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689-.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TwitterIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={`${className} fill-current shrink-0`} viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YoutubeIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={`${className} fill-current shrink-0`} viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const LinkedinIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={`${className} fill-current shrink-0`} viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const quickLinks: FooterItem[] = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Browse Books", href: "/books" },
  { label: "Explore E-Books", href: "/eBooks" },
  { label: "Authors", href: "/authors" },
  { label: "Publishers", href: "/publishers" },
];

const customerLinks: FooterItem[] = [
  { label: "Help & Support", href: "/contact" },
  { label: "My Account", href: "/user/profile" },
  { label: "Wishlist", href: "/user/wishlist" },
  { label: "Cart", href: "/cart" },
  { label: "Terms & Conditions", href: "/termsandconditions" },
];

const defaultPopularGenres: FooterItem[] = [
  { label: "Fiction", href: "/books?genre=Fiction" },
  { label: "Biography", href: "/books?genre=Biography" },
  { label: "Self Help", href: "/books?genre=Self%20Help" },
  { label: "Business & Economics", href: "/books?genre=Business" },
  { label: "Children's Books", href: "/books?genre=Children" },
  { label: "Nepal Literature", href: "/books?genre=Literature" },
];

const cleanHtmlText = (rawDescription?: string | null): string => {
  if (!rawDescription) return "";
  const parsed = parseQuillContent(rawDescription);
  return parsed
    .replace(/<[^>]*>?/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export default function Footer() {
  const [popularGenres, setPopularGenres] =
    useState<FooterItem[]>(defaultPopularGenres);
  const [isLoadingGenres, setIsLoadingGenres] = useState<boolean>(true);
  const [aboutData, setAboutData] = useState<AboutData | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Fetch popular genres and about details in parallel
    const fetchFooterData = async () => {
      try {
        const [genreRes, aboutRes] = await Promise.allSettled([
          axiosInstance.get("/v1/genre/popular"),
          axiosInstance.get("/v1/about"),
        ]);

        if (!isMounted) return;

        // Process Genres
        if (genreRes.status === "fulfilled") {
          const data = genreRes.value.data;
          const list = Array.isArray(data)
            ? data
            : data?.data || data?.genres || data?.popularGenres || [];

          if (Array.isArray(list) && list.length > 0) {
            const mapped: FooterItem[] = list.slice(0, 8).map((genre: any) => {
              const name =
                genre.name || genre.englishName || genre.nepaliName || "Genre";
              const queryValue = genre.id || name;
              return {
                label: name,
                href: `/books?genre=${encodeURIComponent(queryValue)}`,
              };
            });
            setPopularGenres(mapped);
          }
        }

        // Process About Information
        if (aboutRes.status === "fulfilled") {
          const raw = aboutRes.value?.data;
          let parsedAbout: AboutData | null = null;
          if (raw?.data) {
            parsedAbout = Array.isArray(raw.data)
              ? raw.data[0] || null
              : raw.data;
          } else if (Array.isArray(raw)) {
            parsedAbout = raw[0] || null;
          } else if (raw && typeof raw === "object") {
            parsedAbout = raw;
          }
          if (parsedAbout) {
            setAboutData(parsedAbout);
          }
        }
      } catch (error) {
        console.error("Failed to fetch footer details:", error);
      } finally {
        if (isMounted) {
          setIsLoadingGenres(false);
        }
      }
    };

    fetchFooterData();

    return () => {
      isMounted = false;
    };
  }, []);

  const cleanDescription = cleanHtmlText(aboutData?.description);
  const email = aboutData?.email || "hello@nepsole.com";
  const contactPhone = aboutData?.contact || "+977 9800000000";

  // Build social media list dynamically from /v1/about
  const socialLinks = [
    {
      name: "Facebook",
      url: aboutData?.facebookUrl,
      icon: FacebookIcon,
      hoverClass:
        "hover:text-[#1877F2] hover:border-[#1877F2]/30 hover:bg-blue-50/50",
    },
    {
      name: "Instagram",
      url: aboutData?.instagramUrl,
      icon: InstagramIcon,
      hoverClass:
        "hover:text-[#E4405F] hover:border-[#E4405F]/30 hover:bg-pink-50/50",
    },
    {
      name: "Twitter",
      url: aboutData?.twitterUrl,
      icon: TwitterIcon,
      hoverClass: "hover:text-black hover:border-black/30 hover:bg-slate-100",
    },
    {
      name: "YouTube",
      url: aboutData?.youtubeUrl,
      icon: YoutubeIcon,
      hoverClass:
        "hover:text-[#CD201F] hover:border-[#CD201F]/30 hover:bg-red-50/50",
    },
    {
      name: "LinkedIn",
      url: aboutData?.linkedinUrl,
      icon: LinkedinIcon,
      hoverClass:
        "hover:text-[#0A66C2] hover:border-[#0A66C2]/30 hover:bg-blue-50/50",
    },
  ].filter((item) => Boolean(item.url && item.url.trim() !== ""));

  return (
    <footer className="border-t border-slate-200 bg-white font-sans text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:py-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:py-16">
          {/* Brand & About Information */}
          <div className="lg:col-span-1 flex flex-col justify-between">
            <div>
              <Link href="/" className="group inline-flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
                  <BookOpen size={22} strokeWidth={1.8} />
                </div>

                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Nepsole
                  </h2>
                  <p className="text-xs font-medium text-slate-400">
                    Books, Knowledge & Beyond
                  </p>
                </div>
              </Link>

              {/* Description (Clamped to 2-3 lines) */}
              <p
                className="mt-4 max-w-sm text-sm leading-6 text-slate-500 line-clamp-3"
                title={cleanDescription || undefined}
              >
                {cleanDescription ||
                  "Your trusted online bookstore for books, e-books, and audiobooks. Discover stories, ideas, and knowledge all in one place."}
              </p>

              {/* Contact Details */}
              <div className="mt-5 space-y-2.5">
                <a
                  href={`mailto:${email}`}
                  className="flex w-fit items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
                >
                  <Mail size={15} />
                  <span>{email}</span>
                </a>

                <a
                  href={`tel:${contactPhone}`}
                  className="flex w-fit items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
                >
                  <Phone size={15} />
                  <span>{contactPhone}</span>
                </a>
              </div>

              {/* Social Media Links from API */}
              {socialLinks.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        title={social.name}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${social.hoverClass}`}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <FooterColumn title="Quick Links" items={quickLinks} />

          {/* Customer Service */}
          <FooterColumn title="Customer Service" items={customerLinks} />

          {/* Popular Genre from API */}
          <FooterColumn
            title="Popular Genre"
            items={popularGenres}
            isLoading={isLoadingGenres && popularGenres.length === 0}
          />
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-3 py-6 text-center text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-slate-600">Nepsole</span>. All
            Rights Reserved.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/privacyPolicy"
              className="transition-colors hover:text-slate-700"
            >
              Privacy Policy
            </Link>

            <span className="h-3 w-px bg-slate-200" />

            <Link
              href="/termsandconditions"
              className="transition-colors hover:text-slate-700"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
  isLoading = false,
}: {
  title: string;
  items: (string | FooterItem)[];
  isLoading?: boolean;
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-slate-900">{title}</h3>

      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-4 w-28 animate-pulse rounded bg-slate-100"
            />
          ))}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, idx) => {
            const label = typeof item === "string" ? item : item.label;
            const href = typeof item === "string" ? "#" : item.href;

            return (
              <li key={`${label}-${idx}`}>
                <Link
                  href={href}
                  className="group inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-900"
                >
                  <span>{label}</span>

                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
