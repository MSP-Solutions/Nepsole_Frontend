"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  X,
  Globe,
  BookOpen,
  Users,
  ShoppingBag,
  Calendar,
  Edit2,
  ExternalLink,
  Info,
  Award,
} from "lucide-react";
import { AuthorItem } from "@/app/admin/(dashboard)/authors/page";
import { parseQuillContent } from "@/utils/quillDecoder";

interface ViewAuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  author: AuthorItem | null;
  onEdit?: (author: AuthorItem) => void;
}

export const ViewAuthorDialog: React.FC<ViewAuthorDialogProps> = ({
  open,
  onOpenChange,
  author,
  onEdit,
}) => {
  if (!author) return null;

  const getInitials = (name?: string) => {
    if (!name) return "AU";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const renderBioContent = (bioStr?: string) => {
    if (!bioStr) {
      return (
        <p className="text-xs text-slate-400 italic">
          No biography provided.
        </p>
      );
    }

    const htmlContent = parseQuillContent(bioStr);

    return (
      <div
        className="prose prose-sm max-w-none text-xs text-slate-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  const getSocialLinks = () => {
    if (Array.isArray(author.socialLinks)) {
      return author.socialLinks;
    }
    if (typeof author.socialLinks === "string" && author.socialLinks.trim() !== "") {
      try {
        const parsed = JSON.parse(author.socialLinks);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  };

  const socialLinks = getSocialLinks();
  const profileImg = author.imageUrl || author.image || author.profileImage;

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
              Author Details
            </DialogTitle>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-slate-800">
          {/* Main Info Card */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center">
            {/* Avatar / Profile Image */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-indigo-600 shadow-sm font-bold text-xl text-white">
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

            {/* Overview */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {author.name}
                </h2>
                {author.nationality && (
                  <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                    {author.nationality}
                  </span>
                )}
              </div>

              {author.positions && (
                <p className="mt-1 text-xs font-medium text-indigo-600">
                  {author.positions}
                </p>
              )}
            </div>

            {/* Quick Edit Button */}
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(author);
                }}
                className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Author</span>
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
                {author.booksPublished ?? 0}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-600">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium text-slate-500">
                  Years of Writing
                </span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {author.yearsOfWriting ?? 0}
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
                {author.booksSold ?? 0}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-purple-600">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium text-slate-500">
                  Happy Readers
                </span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {author.happyReaders ?? 0}
              </p>
            </div>
          </div>

          {/* Web & Social Links Card */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Web & Social Profiles
            </h3>

            {author.websiteUrl && (
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-500">Website:</span>
                <a
                  href={author.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 truncate text-indigo-600 hover:underline"
                >
                  <span className="truncate">{author.websiteUrl}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            )}

            {socialLinks.length > 0 ? (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-2">
                  Social Media:
                </p>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link: any, idx: number) => (
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
            ) : !author.websiteUrl ? (
              <p className="text-xs text-slate-400 italic">No web or social links provided.</p>
            ) : null}
          </div>

          {/* Biography Section */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Biography / Summary
            </h3>
            {renderBioContent(author.bio)}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAuthorDialog;
