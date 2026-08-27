"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseQuillContent } from "@/utils/quillDecoder";
import {
  Barcode,
  BookOpen,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Edit2,
  ExternalLink,
  FileText,
  Gift,
  HardDrive,
  Languages,
  Layers,
  Lock,
  MapPin,
  Phone,
  Star,
  Tag,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import React, { useState } from "react";

export interface BookAuthor {
  id?: number | string;
  name?: string;
  englishName?: string;
  imageUrl?: string;
  author?: {
    id?: number | string;
    name?: string;
    englishName?: string;
    imageUrl?: string;
  };
  [key: string]: any;
}

export interface BookGenre {
  id?: number | string;
  name?: string;
  englishName?: string;
  icon?: string;
  genre?: {
    id?: number | string;
    name?: string;
    icon?: string;
  };
  [key: string]: any;
}

export interface BookPublisher {
  id?: number | string;
  name?: string;
  englishName?: string;
  publicationLogoUrl?: string;
  address?: string;
  phoneNumbers?: string[];
  [key: string]: any;
}

export interface BookLanguage {
  id?: number | string;
  name?: string;
  code?: string;
  language?: {
    id?: number | string;
    name?: string;
    code?: string;
  };
  [key: string]: any;
}

export interface EBookItem {
  id: number | string;
  title: string;
  plan?: "FREE" | "PAID" | string;
  price: number | string;
  discountPercent?: number | string;
  stock?: number | string;
  soldCount?: number | string;
  downloadCount?: number | string;
  publicationDate?: string;
  isbn10?: string;
  isbn13?: string;
  pages?: number | string;
  description?: string;
  pdfUrl?: string | null;
  pdfPublicId?: string | null;
  previewUrl?: string | null;
  coverImageUrl?: string | null;
  coverPublicId?: string | null;
  fileSizeBytes?: number | null;
  publisherId?: number | string;
  publisher?: BookPublisher;
  authors?: BookAuthor[];
  authorBooks?: BookAuthor[];
  genres?: BookGenre[];
  genreBooks?: BookGenre[];
  languages?: BookLanguage[];
  languageBooks?: BookLanguage[];
  images?: any[];
  bookImages?: any[];
  rating?: string | number | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface ViewEBooksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: EBookItem | any | null;
  onEdit?: (book: any) => void;
}

export const ViewEBooksDialog: React.FC<ViewEBooksDialogProps> = ({
  open,
  onOpenChange,
  book,
  onEdit,
}) => {
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<
    string | null
  >(null);

  if (!book) return null;

  const isFreePlan =
    (book.plan && book.plan.toUpperCase() === "FREE") ||
    Number(book.price || 0) === 0;

  const priceNum = Number(book.price) || 0;
  const discountNum = Number(book.discountPercent) || 0;
  const discountedPrice =
    discountNum > 0 ? priceNum - (priceNum * discountNum) / 100 : priceNum;

  // Extract Authors with image
  const authorsList: BookAuthor[] = (
    book.authors ||
    book.authorBooks ||
    []
  ).map((a: any) => ({
    id: a.id || a.author?.id,
    name:
      a.name ||
      a.englishName ||
      a.author?.name ||
      a.author?.englishName ||
      "Unknown Author",
    imageUrl: a.imageUrl || a.image || a.author?.imageUrl || null,
  }));

  // Extract Genres with icon
  const genresList: BookGenre[] = (book.genres || book.genreBooks || []).map(
    (g: any) => ({
      id: g.id || g.genre?.id,
      name: g.name || g.englishName || g.genre?.name || "Genre",
      icon: g.icon || g.genre?.icon || null,
    }),
  );

  // Extract Languages with code
  const languagesList: BookLanguage[] = (
    book.languages ||
    book.languageBooks ||
    []
  ).map((l: any) => ({
    id: l.id || l.language?.id,
    name: l.name || l.englishName || l.language?.name || "Language",
    code: l.code || l.language?.code || "",
  }));

  // Extract Cover & Additional Images
  const allImages = (book.images || book.bookImages || [])
    .map((img: any, idx: number) => {
      if (typeof img === "string") {
        return { url: img, type: idx === 0 ? "COVER" : "INSIDE" };
      }
      return {
        url: img.url || img.imageUrl || "",
        type: img.imageType || img.type || (idx === 0 ? "COVER" : "INSIDE"),
      };
    })
    .filter((img: any) => Boolean(img.url));

  const coverImage =
    book.coverImageUrl ||
    allImages.find((img: any) => img.type === "COVER")?.url ||
    allImages[0]?.url ||
    null;

  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes || bytes <= 0) return "N/A";
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const renderDescription = (desc?: string) => {
    if (!desc || desc.trim() === "" || desc === `[{"insert":"\\n"}]`) {
      return (
        <p className="text-xs text-slate-400 italic">
          No description provided for this e-book.
        </p>
      );
    }
    const htmlContent = parseQuillContent(desc);
    return (
      <div
        className="prose prose-sm max-w-none text-xs text-slate-700 leading-relaxed font-sans"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[98vw] md:max-w-4xl max-h-[92vh] flex flex-col p-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 sm:text-lg flex items-center gap-2">
                <span>E-Book Details</span>
                <span className="text-xs font-mono text-slate-400 font-normal">
                  #{book.id}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Digital publication metadata, media assets, and specs
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(book);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition cursor-pointer border border-indigo-100"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit E-Book</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6 text-slate-800">
          {/* 1. Main Showcase Card */}
          <div className="flex flex-col sm:flex-row gap-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
            {/* E-Book Cover Frame */}
            <div
              onClick={() => coverImage && setSelectedPreviewImage(coverImage)}
              className="w-32 h-44 shrink-0 rounded-xl bg-slate-900 border border-slate-800 shadow-md overflow-hidden flex items-center justify-center relative mx-auto sm:mx-0 cursor-pointer group"
            >
              {coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                  <BookOpen className="w-8 h-8 mb-1 text-indigo-400" />
                  <span className="text-[9px] font-semibold text-slate-300">
                    No Cover
                  </span>
                </div>
              )}

              {/* Plan Overlay Badge */}
              <div className="absolute top-1.5 left-1.5">
                {isFreePlan ? (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold shadow-xs">
                    FREE
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-bold shadow-xs">
                    PAID
                  </span>
                )}
              </div>

              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[8px] font-semibold uppercase backdrop-blur-xs">
                Zoom
              </span>
            </div>

            {/* E-Book Metadata Header */}
            <div className="flex-1 flex flex-col justify-between space-y-3">
              <div>
                {/* Plan + Discount Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {isFreePlan ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Gift className="w-3 h-3 text-emerald-600" />
                      Free E-Book Access
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Lock className="w-3 h-3 text-indigo-600" />
                      Premium Paid Edition
                    </span>
                  )}

                  {discountNum > 0 && !isFreePlan && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                      <Tag className="w-3 h-3" />
                      {discountNum}% OFF
                    </span>
                  )}

                  {book.pdfUrl && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      <FileText className="w-3 h-3 text-indigo-600" />
                      PDF Available
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {book.title}
                </h2>

                {/* Quick Meta Row */}
                <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                  {/* Publication Date */}
                  {book.publicationDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(book.publicationDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Pages */}
                  {book.pages && (
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{Number(book.pages).toLocaleString()} Pages</span>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{book.rating || "0"}</span>
                  </div>
                </div>
              </div>

              {/* Author(s) & Publisher Row */}
              <div className="space-y-2 pt-2 border-t border-slate-200/60">
                {/* Author(s) */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase w-20 shrink-0">
                    Author(s):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {authorsList.length > 0 ? (
                      authorsList.map((a, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
                        >
                          <div className="w-4 h-4 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center shrink-0">
                            {a.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={a.imageUrl}
                                alt={a.name || ""}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-2.5 h-2.5 text-indigo-600" />
                            )}
                          </div>
                          <span>{a.name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        No author assigned
                      </span>
                    )}
                  </div>
                </div>

                {/* Publisher */}
                {book.publisher && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase w-20 shrink-0">
                      Publisher:
                    </span>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs">
                      {book.publisher.publicationLogoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.publisher.publicationLogoUrl}
                          alt={book.publisher.name || ""}
                          className="w-3.5 h-3.5 object-contain"
                        />
                      )}
                      <span>
                        {book.publisher.name || book.publisher.englishName}
                      </span>
                    </div>
                  </div>
                )}

                {/* Genres */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase w-20 shrink-0">
                    Genres:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {genresList.length > 0 ? (
                      genresList.map((g, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100 shadow-2xs"
                        >
                          {g.icon && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={g.icon}
                              alt={g.name || ""}
                              className="w-3 h-3 object-contain"
                            />
                          )}
                          <span>{g.name}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        No genres assigned
                      </span>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase w-20 shrink-0">
                    Languages:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {languagesList.length > 0 ? (
                      languagesList.map((l, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-medium border border-sky-100 shadow-2xs"
                        >
                          <Languages className="w-3 h-3 text-sky-500" />
                          <span>
                            {l.name} {l.code ? `(${l.code})` : ""}
                          </span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        No language specified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Key Metrics & PDF File Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Price Card */}
            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Access Price
                </span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-base font-bold text-slate-900">
                {isFreePlan
                  ? "Free"
                  : `Rs. ${discountedPrice.toLocaleString()}`}
              </div>
              <div className="text-[10px] text-slate-400">
                {isFreePlan
                  ? "Open to all readers"
                  : discountNum > 0
                    ? `Regular: Rs. ${priceNum.toLocaleString()}`
                    : "Standard Price"}
              </div>
            </div>

            {/* Downloads Card */}
            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Downloads
                </span>
                <Download className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-base font-bold text-slate-900">
                {book.downloadCount || 0}
              </div>
              <div className="text-[10px] text-slate-400">
                Reader downloads recorded
              </div>
            </div>

            {/* Sales Card */}
            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Copies Sold
                </span>
                <TrendingUp className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-base font-bold text-slate-900">
                {book.soldCount || 0}
              </div>
              <div className="text-[10px] text-slate-400">
                Total purchased copies
              </div>
            </div>

            {/* File Size Card */}
            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  PDF Size
                </span>
                <HardDrive className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-base font-bold text-slate-900">
                {formatFileSize(book.fileSizeBytes)}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                Digital PDF Document
              </div>
            </div>
          </div>

          {/* 3. PDF Document Action Card */}
          {book.pdfUrl ? (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    PDF Document File
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono truncate max-w-xs sm:max-w-md">
                    {book.pdfPublicId || "Cloudinary Digital PDF Asset"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={book.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open PDF in Viewer</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 text-center">
              No PDF file uploaded for this e-book.
            </div>
          )}

          {/* 4. Publisher Contact & Address Card */}
          {book.publisher && (
            <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Publisher Details
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900">
                    {book.publisher.name || book.publisher.englishName}
                  </span>
                  {book.publisher.address && (
                    <p className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{book.publisher.address}</span>
                    </p>
                  )}
                </div>

                {book.publisher.phoneNumbers &&
                  book.publisher.phoneNumbers.length > 0 && (
                    <div className="text-slate-600 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{book.publisher.phoneNumbers.join(", ")}</span>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* 5. Identifiers & Timestamps */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Barcode className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-semibold text-slate-700">ISBN-13:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                {book.isbn13 || "Not Specified"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Barcode className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-semibold text-slate-700">ISBN-10:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                {book.isbn10 || "Not Specified"}
              </span>
            </div>

            {book.createdAt && (
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Clock className="w-3 h-3" />
                <span>
                  Created: {new Date(book.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* 6. Description Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Description & Overview
            </h3>
            <div className="rounded-xl border border-slate-100 bg-white p-4.5 shadow-2xs">
              {renderDescription(book.description)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </DialogContent>

      {/* Enlarged Image Preview Modal */}
      {selectedPreviewImage && (
        <Dialog
          open={Boolean(selectedPreviewImage)}
          onOpenChange={() => setSelectedPreviewImage(null)}
        >
          <DialogContent
            showCloseButton={false}
            className="w-auto max-w-[90vw] max-h-[90vh] p-2 bg-black/90 rounded-2xl border-0 overflow-hidden flex items-center justify-center"
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPreviewImage}
                alt="Enlarged Preview"
                className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => setSelectedPreviewImage(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default ViewEBooksDialog;
