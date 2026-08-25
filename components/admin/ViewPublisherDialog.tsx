"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  X,
  MapPin,
  Mail,
  Phone,
  Globe,
  BookOpen,
  Users,
  ShoppingBag,
  Calendar,
  Edit2,
  ExternalLink,
  Info,
} from "lucide-react";
import { PublisherItem } from "@/app/admin/(dashboard)/publishers/page";
import { parseQuillContent } from "@/utils/quillDecoder";

interface ViewPublisherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publisher: PublisherItem | null;
  onEdit?: (publisher: PublisherItem) => void;
}

export const ViewPublisherDialog: React.FC<ViewPublisherDialogProps> = ({
  open,
  onOpenChange,
  publisher,
  onEdit,
}) => {
  if (!publisher) return null;

  const renderAboutContent = (aboutStr?: string) => {
    if (!aboutStr) {
      return (
        <p className="text-xs text-slate-400 italic">
          No description provided.
        </p>
      );
    }

    const htmlContent = parseQuillContent(aboutStr);

    return (
      <div
        className="prose prose-sm max-w-none text-xs text-slate-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[100vw] md:max-w-3xl max-h-[90vh] flex flex-col p-0 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div>
            <DialogTitle className="text-base font-bold text-slate-900 sm:text-lg">
              Publisher Details
            </DialogTitle>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-slate-800">
          {/* Main Info Card */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center">
            {/* Logo */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm font-bold text-xl text-indigo-600">
              {publisher.publicationLogoUrl ? (
                <img
                  src={publisher.publicationLogoUrl}
                  alt={publisher.name}
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <span>
                  {publisher.name
                    ? publisher.name.charAt(0).toUpperCase()
                    : "P"}
                </span>
              )}
            </div>

            {/* Overview */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {publisher.name}
                </h2>
              </div>

              {publisher.address && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{publisher.address}</span>
                </div>
              )}

              {publisher.establishedYear && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Established in {publisher.establishedYear}</span>
                </div>
              )}
            </div>

            {/* Quick Edit Button */}
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(publisher);
                }}
                className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Publisher</span>
              </button>
            )}
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-600">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs font-medium text-slate-500">
                  Books Published
                </span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {publisher.booksPublished}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-purple-600">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium text-slate-500">
                  Authors
                </span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {publisher.authorsCount ?? 0}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600">
                <ShoppingBag className="h-4 w-4" />
                <span className="text-xs font-medium text-slate-500">
                  Books Sold
                </span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {publisher.booksSold ?? 0}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-600">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium text-slate-500">
                  Year of Publishing
                </span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {publisher.yearsOfPublishing ??
                  (publisher.establishedYear
                    ? new Date().getFullYear() -
                      Number(publisher.establishedYear)
                    : "N/A")}
              </p>
            </div>
          </div>

          {/* Contact & Links Card */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Contact & Web Details
            </h3>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
              {publisher.email && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-500">Email:</span>
                  <a
                    href={`mailto:${publisher.email}`}
                    className="truncate text-indigo-600 hover:underline"
                  >
                    {publisher.email}
                  </a>
                </div>
              )}

              {publisher.websiteUrl && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-500">Website:</span>
                  <a
                    href={publisher.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 truncate text-indigo-600 hover:underline"
                  >
                    <span className="truncate">{publisher.websiteUrl}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              )}

              {Array.isArray(publisher.phoneNumbers) &&
                publisher.phoneNumbers.length > 0 && (
                  <div className="flex items-center gap-2 text-slate-700 sm:col-span-2">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-500">Phone:</span>
                    <span>{publisher.phoneNumbers.join(", ")}</span>
                  </div>
                )}
            </div>

            {/* Social Links */}
            {Array.isArray(publisher.socialLinks) &&
              publisher.socialLinks.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    Social Profiles:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {publisher.socialLinks.map((link: any, idx: number) => (
                      <a
                        key={link.id || idx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition"
                      >
                        <Globe className="h-3 w-3 text-slate-400" />
                        <span>{link.platform}</span>
                        <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* About Section */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              About Publisher
            </h3>
            {renderAboutContent(publisher.about)}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewPublisherDialog;
