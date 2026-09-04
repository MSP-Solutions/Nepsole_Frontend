"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import TopHeader from "@/components/topHeader";
import { axiosInstance } from "@/utils/axiosInstances";
import { parseQuillContent } from "@/utils/quillDecoder";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Headphones,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Social SVG Icons
const FacebookIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={`${className} fill-current shrink-0`} viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={`${className} fill-current shrink-0`} viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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

interface AboutItem {
  id?: number | string;
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
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAbout = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get("/v1/about");
        const raw = res?.data;
        let data: AboutItem | null = null;

        if (raw?.data) {
          data = Array.isArray(raw.data) ? raw.data[0] || null : raw.data;
        } else if (Array.isArray(raw)) {
          data = raw[0] || null;
        } else if (raw && typeof raw === "object") {
          data = raw;
        }

        setAboutData(data);
      } catch (error) {
        console.error("Failed to fetch about details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAbout();
  }, []);

  const decodedDescription = aboutData?.description
    ? parseQuillContent(aboutData.description)
    : "";

  const title = aboutData?.title || "About Nepsole";
  const contact = aboutData?.contact || "9810330979";
  const email = aboutData?.email || "info@nepsole.com";
  const address = aboutData?.address || "Pokhara, Nepal";

  const socialLinks = [
    {
      name: "Facebook",
      url: aboutData?.facebookUrl,
      icon: FacebookIcon,
      color: "hover:text-[#1877F2]",
    },
    {
      name: "Instagram",
      url: aboutData?.instagramUrl,
      icon: InstagramIcon,
      color: "hover:text-[#E4405F]",
    },
    {
      name: "Twitter",
      url: aboutData?.twitterUrl,
      icon: TwitterIcon,
      color: "hover:text-[#1DA1F2]",
    },
    {
      name: "YouTube",
      url: aboutData?.youtubeUrl,
      icon: YoutubeIcon,
      color: "hover:text-[#FF0000]",
    },
    {
      name: "LinkedIn",
      url: aboutData?.linkedinUrl,
      icon: LinkedinIcon,
      color: "hover:text-[#0A66C2]",
    },
  ].filter(
    (s) => s.url && typeof s.url === "string" && s.url.trim().length > 0,
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-gray-900 selection:bg-[#1749A0]/10 selection:text-[#1749A0]">
      <TopHeader />
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}

        <section className="bg-[#0b1329] text-white py-12 md:py-16">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-white">About Us</span>
            </div>

            {/* Title & Subtitle */}
            <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white flex items-center gap-3">
                  {title}
                </h1>
                <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-2xl">
                  Dedicated to connecting readers across Nepal with quality
                  physical books and e-books.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <section className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 py-10 sm:py-14">
          <div>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-28 rounded-2xl border border-gray-100 bg-white shadow-xs">
                <Loader2 className="h-8 w-8 animate-spin text-[#1749A0] mb-3" />
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                  Loading about information...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
                <div className="space-y-8 lg:col-span-8">
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 md:p-10 shadow-xs">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-[#1749A0]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1749A0]">
                      <span>{title}</span>
                    </div>
                    {decodedDescription ? (
                      <div
                        className="prose prose-slate max-w-none text-gray-700 leading-relaxed text-sm sm:text-base prose-p:my-3 prose-strong:text-gray-900 prose-strong:font-semibold"
                        dangerouslySetInnerHTML={{ __html: decodedDescription }}
                      />
                    ) : (
                      <p className="text-sm sm:text-base leading-relaxed text-gray-700">
                        {aboutData?.description ||
                          "Nepsole is a trusted bookstore dedicated to making quality books accessible to readers across Nepal. From timeless classics and academic resources to the latest bestsellers and digital e-books, we bring together a diverse collection for every kind of reader."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Store Contact, Details & CTA (4 Cols) */}
                <div className="space-y-6 lg:col-span-4">
                  {/* Store & Contact Card */}
                  <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3.5 mb-4 text-sm font-bold text-gray-900">
                      <Building2 className="h-4 w-4 text-[#1749A0]" />
                      <span>Store Information</span>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm">
                      {/* Address */}
                      <div className="flex items-start gap-3 rounded-xl bg-gray-50/70 p-3 border border-gray-100">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            Location
                          </span>
                          <p className="font-semibold text-gray-900 mt-0.5">
                            {address}
                          </p>
                        </div>
                      </div>

                      {/* Phone */}
                      <a
                        href={`tel:${contact}`}
                        className="group flex items-start gap-3 rounded-xl bg-gray-50/70 p-3 border border-gray-100 transition hover:border-[#1749A0]/30 hover:bg-white"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#1749A0] transition group-hover:bg-[#1749A0] group-hover:text-white">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            Call Us
                          </span>
                          <p className="font-semibold text-gray-900 mt-0.5 group-hover:text-[#1749A0] transition-colors">
                            {contact}
                          </p>
                        </div>
                      </a>

                      {/* Email */}
                      <a
                        href={`mailto:${email}`}
                        className="group flex items-start gap-3 rounded-xl bg-gray-50/70 p-3 border border-gray-100 transition hover:border-[#1749A0]/30 hover:bg-white"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            Email
                          </span>
                          <p className="font-semibold text-gray-900 mt-0.5 truncate group-hover:text-[#1749A0] transition-colors">
                            {email}
                          </p>
                        </div>
                      </a>
                    </div>

                    {/* Social Media Links (if configured) */}
                    {socialLinks.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-gray-100">
                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
                          Follow Along
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {socialLinks.map((platform) => {
                            const Icon = platform.icon;
                            return (
                              <a
                                key={platform.name}
                                href={platform.url!}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={platform.name}
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 ${platform.color} transition-colors`}
                                title={platform.name}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Explore Catalog CTA Banner */}
                  <div className="rounded-2xl bg-gradient-to-br from-[#0F2557] to-[#1749A0] p-6 text-white shadow-md shadow-[#1749A0]/15">
                    <h4 className="text-base font-bold">
                      Looking for your next read?
                    </h4>
                    <p className="mt-1.5 text-xs text-blue-100/90 leading-relaxed">
                      Explore thousands of titles across multiple genres or
                      start reading instantly with our digital e-books.
                    </p>

                    <div className="mt-5 flex flex-col gap-2">
                      <Link
                        href="/books"
                        className="inline-flex items-center justify-between rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#1749A0] shadow-xs transition hover:bg-blue-50"
                      >
                        <span>Browse Physical Books</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href="/eBooks"
                        className="inline-flex items-center justify-between rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20 backdrop-blur-xs"
                      >
                        <span>Explore E-Books</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
