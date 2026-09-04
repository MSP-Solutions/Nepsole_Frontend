"use client";

import AddAboutDialog, { AboutData } from "@/components/admin/AddAboutDialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import { parseQuillContent } from "@/utils/quillDecoder";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Share2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

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

export default function AboutAdminPage() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Fetch /v1/about
  const fetchAboutData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosAuthInstance.get("/v1/about");
      const res = response?.data;
      let data: AboutData | null = null;

      if (res?.data) {
        data = Array.isArray(res.data) ? res.data[0] || null : res.data;
      } else if (Array.isArray(res)) {
        data = res[0] || null;
      } else if (
        res &&
        typeof res === "object" &&
        (res.title || res.contact || res.email)
      ) {
        data = res;
      }

      setAboutData(data);
    } catch (error: any) {
      console.error("Failed to fetch about data:", error);
      // If 404 or empty, we treat as no data yet
      if (error?.response?.status !== 404) {
        toast.dismiss();
        toast.error(
          error?.response?.data?.message || "Failed to load about details.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAboutData();
  }, [fetchAboutData]);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleSuccess = (updated?: AboutData) => {
    if (updated) {
      setAboutData(updated);
    }
    fetchAboutData();
  };

  const socialPlatforms = [
    {
      name: "Facebook",
      url: aboutData?.facebookUrl,
      icon: FacebookIcon,
      color: "text-[#1877F2]",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      placeholder: "https://facebook.com/nepsolebooks",
    },
    {
      name: "Instagram",
      url: aboutData?.instagramUrl,
      icon: InstagramIcon,
      color: "text-[#E4405F]",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-100",
      placeholder: "https://instagram.com/nepsolebooks",
    },
    {
      name: "Twitter / X",
      url: aboutData?.twitterUrl,
      icon: TwitterIcon,
      color: "text-slate-800",
      bgColor: "bg-slate-100",
      borderColor: "border-slate-200",
      placeholder: "https://twitter.com/nepsolebooks",
    },
    {
      name: "YouTube",
      url: aboutData?.youtubeUrl,
      icon: YoutubeIcon,
      color: "text-[#FF0000]",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
      placeholder: "https://youtube.com/@nepsolebooks",
    },
    {
      name: "LinkedIn",
      url: aboutData?.linkedinUrl,
      icon: LinkedinIcon,
      color: "text-[#0A66C2]",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      placeholder: "https://linkedin.com/company/nepsolebooks",
    },
  ];

  const decodedDescription = aboutData?.description
    ? parseQuillContent(aboutData.description)
    : "";

  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              About Information
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your company information, store address, contact details,
              and social links.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {aboutData ? (
              <button
                type="button"
                onClick={handleOpenDialog}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1749A0] px-4 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-[#123b83] cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
                <span>Edit Information</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenDialog}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1749A0] px-4 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-[#123b83] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add About Details</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !aboutData ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 shadow-xs">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#1749A0]" />
            <p className="text-sm font-medium text-gray-600">
              Loading about information...
            </p>
          </div>
        ) : !aboutData ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1749A0]/10 text-[#1749A0]">
              <Building2 className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No About Information Found
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              You haven&apos;t added your company profile, contact details, or
              social links yet. Add them to showcase your store information.
            </p>
            <button
              type="button"
              onClick={handleOpenDialog}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1749A0] px-5 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-[#123b83] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add About Information</span>
            </button>
          </div>
        ) : (
          /* Main Content Display */
          <div className="space-y-6">
            {/* Hero Overview Card */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs transition hover:shadow-sm sm:p-8">
              <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-gradient-to-br from-[#1749A0]/5 to-indigo-500/10 blur-2xl pointer-events-none" />

              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1749A0] to-[#123b83] text-white shadow-md shadow-[#1749A0]/20">
                    <Building2 className="h-7 w-7" />
                  </div>

                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                        {aboutData.title}
                      </h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Live on Store
                      </span>
                    </div>

                    <div
                      className="text-sm leading-relaxed text-gray-600 sm:text-base prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: decodedDescription || aboutData.description,
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenDialog}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit Info</span>
                </button>
              </div>
            </div>

            {/* Quick Contact & Location Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Phone */}
              <div className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition hover:border-[#1749A0]/40 hover:shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1749A0] transition group-hover:bg-[#1749A0] group-hover:text-white">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Contact Phone
                    </p>
                    <a
                      href={`tel:${aboutData.contact}`}
                      className="mt-0.5 block truncate text-sm font-semibold text-gray-900 hover:text-[#1749A0]"
                    >
                      {aboutData.contact}
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition hover:border-[#1749A0]/40 hover:shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Email Address
                    </p>
                    <a
                      href={`mailto:${aboutData.email}`}
                      className="mt-0.5 block truncate text-sm font-semibold text-gray-900 hover:text-[#1749A0]"
                    >
                      {aboutData.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition hover:border-[#1749A0]/40 hover:shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Store Location
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                      {aboutData.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Links Section */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Social Media & Web Links
                    </h3>
                    <p className="text-xs text-gray-500">
                      Channels connected to your store profile.
                    </p>
                  </div>
                </div>

                <span className="text-xs text-gray-400">
                  {
                    socialPlatforms.filter(
                      (p) => p.url && p.url.trim().length > 0,
                    ).length
                  }{" "}
                  of {socialPlatforms.length} configured
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {socialPlatforms.map((platform) => {
                  const Icon = platform.icon;
                  const hasUrl = Boolean(platform.url && platform.url.trim());

                  return (
                    <div
                      key={platform.name}
                      className={`flex items-center justify-between rounded-xl border p-3.5 transition ${
                        hasUrl
                          ? "border-gray-200 bg-white hover:border-[#1749A0]/30 hover:shadow-xs"
                          : "border-dashed border-gray-200 bg-gray-50/60 opacity-60"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${platform.borderColor} ${platform.bgColor} ${platform.color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900">
                            {platform.name}
                          </p>
                          <p className="truncate text-[11px] text-gray-500">
                            {hasUrl ? platform.url : "Not configured"}
                          </p>
                        </div>
                      </div>

                      {hasUrl && (
                        <a
                          href={platform.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                          title={`Open ${platform.name}`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <AddAboutDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          aboutToEdit={aboutData}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
