"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import TopHeader from "@/components/topHeader";
import { axiosInstance } from "@/utils/axiosInstances";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Social Icons
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

// Helper function to safely extract plain strings from nested response/error objects
const parseStringMessage = (val: any): string => {
  if (!val) return "";
  if (typeof val === "string") return val.trim();
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (Array.isArray(val)) {
    return val
      .map((item) => parseStringMessage(item))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof val === "object") {
    if (typeof val.message === "string") return val.message.trim();
    if (Array.isArray(val.message)) return parseStringMessage(val.message);
    if (typeof val.error === "string") return val.error.trim();
    if (typeof val.error === "object") return parseStringMessage(val.error);
    if (typeof val.details === "string") return val.details.trim();
    if (Array.isArray(val.details)) return parseStringMessage(val.details);
  }
  return "";
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({
    type: "",
    message: "",
  });

  // Dynamic Contact Info from /v1/about
  const [aboutInfo, setAboutInfo] = useState<{
    contact?: string;
    email?: string;
    address?: string;
    googleMapUrl?: string | null;
    googleMapEmbedUrl?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    twitterUrl?: string | null;
    youtubeUrl?: string | null;
    linkedinUrl?: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        let res;
        try {
          res = await axiosInstance.get("/v1/about");
        } catch (err: any) {
          if (err?.response?.status === 404) {
            res = await axiosInstance.get("/api/v1/about");
          } else {
            throw err;
          }
        }
        const raw = res?.data;
        let data = null;
        if (raw?.data) {
          data = Array.isArray(raw.data) ? raw.data[0] || null : raw.data;
        } else if (Array.isArray(raw)) {
          data = raw[0] || null;
        } else if (raw && typeof raw === "object") {
          data = raw;
        }
        if (data) {
          setAboutInfo({
            contact: typeof data.contact === "string" ? data.contact : "",
            email: typeof data.email === "string" ? data.email : "",
            address: typeof data.address === "string" ? data.address : "",
            googleMapUrl:
              typeof (data.googleMapUrl || data.mapUrl) === "string"
                ? data.googleMapUrl || data.mapUrl
                : null,
            googleMapEmbedUrl:
              typeof (data.googleMapEmbedUrl || data.mapEmbedUrl) === "string"
                ? data.googleMapEmbedUrl || data.mapEmbedUrl
                : null,
            facebookUrl:
              typeof data.facebookUrl === "string" ? data.facebookUrl : null,
            instagramUrl:
              typeof data.instagramUrl === "string" ? data.instagramUrl : null,
            twitterUrl:
              typeof data.twitterUrl === "string" ? data.twitterUrl : null,
            youtubeUrl:
              typeof data.youtubeUrl === "string" ? data.youtubeUrl : null,
            linkedinUrl:
              typeof data.linkedinUrl === "string" ? data.linkedinUrl : null,
          });
        }
      } catch {
        // Fallback gracefully
      }
    };

    fetchContactDetails();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setStatus({
      type: "",
      message: "",
    });

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim() || "Book Inquiry",
      message: formData.message.trim(),
    };

    try {
      let response;
      try {
        response = await axiosInstance.post("/v1/contact", payload);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          response = await axiosInstance.post("/api/v1/contact", payload);
        } else {
          throw err;
        }
      }

      const parsedSuccess = parseStringMessage(
        response?.data?.message || response?.data?.data?.message,
      );
      const resMsg =
        parsedSuccess ||
        "Thank you! Your inquiry has been sent successfully. We will contact you shortly.";

      setStatus({
        type: "success",
        message: resMsg,
      });

      toast.success(resMsg);

      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Contact Form Error:", error);

      const parsedError =
        parseStringMessage(error?.response?.data) ||
        parseStringMessage(error?.message);

      const errMsg =
        parsedError ||
        "Unable to send your inquiry right now. Please try again or reach out directly.";

      setStatus({
        type: "error",
        message: errMsg,
      });

      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const phoneDisplay =
    typeof aboutInfo?.contact === "string" && aboutInfo.contact.trim()
      ? aboutInfo.contact
      : "+977-9810330979";
  const emailDisplay =
    typeof aboutInfo?.email === "string" && aboutInfo.email.trim()
      ? aboutInfo.email
      : "info@nepsole.com";
  const addressDisplay =
    typeof aboutInfo?.address === "string" && aboutInfo.address.trim()
      ? aboutInfo.address
      : "Pokhara, Nepal";

  const mapSearchQuery = encodeURIComponent(addressDisplay);
  const mapEmbedUrl =
    aboutInfo?.googleMapEmbedUrl ||
    `https://maps.google.com/maps?q=${mapSearchQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-800 antialiased">
      <TopHeader />
      <Header />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#051026] text-white py-12 md:py-16">
          <div className="relative mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-indigo-300/80 font-medium">
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-white">Contact Us</span>
            </nav>

            <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                  Get in Touch with Nepsole
                </h1>
                <p className="text-xs sm:text-sm text-indigo-100/80 max-w-xl">
                  Have questions or want to share feedback? We'd love to hear
                  from you! Send us a message and our team will respond
                  promptly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
          {/* Main Card (Info Panel + Form) */}
          <div className="grid overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-200/90 lg:grid-cols-[1fr_1.35fr]">
            {/* Left Column: Direct Info & Channels */}
            <div className="bg-[#051026] p-6 sm:p-10 text-white flex flex-col justify-between space-y-8 relative overflow-hidden">
              <div className="relative space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Let&apos;s talk about books
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
                    Looking for a specific Nepali classic, academic publication,
                    or digital e-book reader support? We are just a message
                    away.
                  </p>
                </div>

                {/* Contact Channels */}
                <div className="space-y-4">
                  {/* Phone */}
                  <a
                    href={`tel:${phoneDisplay.replace(/[^0-9+]/g, "")}`}
                    className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/40 transition-all duration-200"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/20 group-hover:scale-105 transition-transform">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block">
                        Call / WhatsApp
                      </span>
                      <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {phoneDisplay}
                      </span>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:${emailDisplay}`}
                    className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-400/40 transition-all duration-200"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block">
                        Email Address
                      </span>
                      <span className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                        {emailDisplay}
                      </span>
                    </div>
                  </a>

                  {/* Location */}
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block">
                        Main Location
                      </span>
                      <span className="text-sm font-bold text-white">
                        {addressDisplay}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="relative pt-6 border-t border-white/10">
                <span className="text-xs font-semibold text-indigo-200 block mb-3">
                  Connect with us:
                </span>
                <div className="flex items-center gap-2">
                  {aboutInfo?.facebookUrl && (
                    <a
                      href={aboutInfo.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white transition-all cursor-pointer"
                      title="Facebook"
                    >
                      <FacebookIcon className="w-4 h-4" />
                    </a>
                  )}
                  {aboutInfo?.instagramUrl && (
                    <a
                      href={aboutInfo.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500 hover:text-white text-white transition-all cursor-pointer"
                      title="Instagram"
                    >
                      <InstagramIcon className="w-4 h-4" />
                    </a>
                  )}
                  {aboutInfo?.twitterUrl && (
                    <a
                      href={aboutInfo.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-sky-500 hover:text-white text-white transition-all cursor-pointer"
                      title="Twitter"
                    >
                      <TwitterIcon className="w-4 h-4" />
                    </a>
                  )}
                  {aboutInfo?.youtubeUrl && (
                    <a
                      href={aboutInfo.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-red-600 hover:text-white text-white transition-all cursor-pointer"
                      title="YouTube"
                    >
                      <YoutubeIcon className="w-4 h-4" />
                    </a>
                  )}
                  {aboutInfo?.linkedinUrl && (
                    <a
                      href={aboutInfo.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-indigo-600 hover:text-white text-white transition-all cursor-pointer"
                      title="LinkedIn"
                    >
                      <LinkedinIcon className="w-4 h-4" />
                    </a>
                  )}
                  {!aboutInfo?.facebookUrl && !aboutInfo?.instagramUrl && (
                    <span className="text-xs text-indigo-300">
                      Nepsole Official Community
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Inquiry Form */}
            <div className="p-6 sm:p-10 bg-white flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    Send Us an Inquiry
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill out the form below and we will get back to you via
                    email or phone.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name + Phone */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-1.5 block text-xs font-bold text-slate-700"
                      >
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Ram Sharma"
                          required
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-1.5 block text-xs font-bold text-slate-700"
                      >
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="e.g. 9812345678"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-bold text-slate-700"
                    >
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. yourname@example.com"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-1.5 block text-xs font-bold text-slate-700"
                    >
                      Subject / Topic
                    </label>
                    <div className="relative">
                      <BookOpen
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="e.g. Book Inquiry"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="message"
                        className="block text-xs font-bold text-slate-700"
                      >
                        Message <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {formData.message.length} characters
                      </span>
                    </div>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Hi, do you have 'Muna Madan' or 'Palpasa Cafe' in stock right now? Looking forward to your reply."
                      rows={5}
                      required
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs sm:text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10"
                    />
                  </div>

                  {/* In-form Status Notification */}
                  {status.message && (
                    <div
                      className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs font-medium animate-in fade-in duration-200 ${
                        status.type === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-rose-200 bg-rose-50 text-rose-800"
                      }`}
                    >
                      {status.type === "success" ? (
                        <CheckCircle2
                          size={18}
                          className="shrink-0 text-emerald-600 mt-0.5"
                        />
                      ) : (
                        <AlertCircle
                          size={18}
                          className="shrink-0 text-rose-600 mt-0.5"
                        />
                      )}
                      <p className="flex-1">{status.message}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F2557] to-[#1a3b8b] hover:from-[#0b1c43] hover:to-[#122e6b] px-5 py-3 text-xs sm:text-sm font-bold text-white transition shadow-sm hover:shadow cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>Sending Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Google Maps Location Section */}
          <div className="overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Find Us on Google Maps
                </h3>
              </div>
            </div>

            {/* Map Frame */}
            <div className="relative w-full h-[380px] sm:h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
              <iframe
                title="Nepsole Google Map Location"
                src={mapEmbedUrl}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
