"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, X, Plus, Globe, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { axiosMultipartInstance } from "@/utils/axiosInstances";
import TextEditorEdit from "../TextEditor";
import { parseQuillContent } from "@/utils/quillDecoder";

export interface SocialMedia {
  platform: string;
  url: string;
}

export interface AuthorData {
  id?: number | string;
  name: string;
  positions?: string;
  bio?: string;
  nationality?: string;
  image?: string | null;
  imageUrl?: string | null;
  profileImage?: string | null;
  websiteUrl?: string;
  booksPublished?: number | string;
  yearsOfWriting?: number | string;
  booksSold?: number | string;
  happyReaders?: number | string;
  socialLinks?: SocialMedia[] | string;
  [key: string]: any;
}

interface AddAuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAuthor?: (author: any) => void;
  onSuccess?: (author: any) => void;
  authorToEdit?: AuthorData | null;
}

export const AddAuthorDialog: React.FC<AddAuthorDialogProps> = ({
  open,
  onOpenChange,
  onAddAuthor,
  onSuccess,
  authorToEdit,
}) => {
  const initialFormData = {
    name: "",
    positions: "",
    bio: "",
    nationality: "",
    websiteUrl: "",
    booksPublished: "",
    yearsOfWriting: "",
    booksSold: "",
    happyReaders: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatToString = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (Array.isArray(val)) return val.join(", ");
    return String(val);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedFile(null);
    setImagePreview(null);
    setSocialMedia([]);
  };

  useEffect(() => {
    if (open) {
      if (authorToEdit) {
        const decodedBio = parseQuillContent(authorToEdit.bio);
        setFormData({
          name: formatToString(authorToEdit.name),
          positions: formatToString(
            authorToEdit.positions || authorToEdit.position,
          ),
          bio: formatToString(decodedBio),
          nationality: formatToString(authorToEdit.nationality),
          websiteUrl: formatToString(
            authorToEdit.websiteUrl || authorToEdit.website,
          ),
          booksPublished:
            authorToEdit.booksPublished !== undefined &&
            authorToEdit.booksPublished !== null
              ? String(authorToEdit.booksPublished)
              : "",
          yearsOfWriting:
            authorToEdit.yearsOfWriting !== undefined &&
            authorToEdit.yearsOfWriting !== null
              ? String(authorToEdit.yearsOfWriting)
              : "",
          booksSold:
            authorToEdit.booksSold !== undefined &&
            authorToEdit.booksSold !== null
              ? String(authorToEdit.booksSold)
              : "",
          happyReaders:
            authorToEdit.happyReaders !== undefined &&
            authorToEdit.happyReaders !== null
              ? String(authorToEdit.happyReaders)
              : "",
        });

        setImagePreview(
          authorToEdit.imageUrl ||
            authorToEdit.image ||
            authorToEdit.profileImage ||
            null,
        );
        setSelectedFile(null);

        if (Array.isArray(authorToEdit.socialLinks)) {
          setSocialMedia(
            authorToEdit.socialLinks.map((s: any) => ({
              platform: s.platform || "FACEBOOK",
              url: formatToString(s.url),
            })),
          );
        } else if (
          typeof authorToEdit.socialLinks === "string" &&
          authorToEdit.socialLinks.trim() !== ""
        ) {
          try {
            const parsed = JSON.parse(authorToEdit.socialLinks);
            if (Array.isArray(parsed)) {
              setSocialMedia(
                parsed.map((s: any) => ({
                  platform: s.platform || "FACEBOOK",
                  url: formatToString(s.url),
                })),
              );
            }
          } catch {
            setSocialMedia([]);
          }
        } else if (authorToEdit.socialMedia) {
          const links: SocialMedia[] = [];
          if (authorToEdit.socialMedia.facebook) {
            links.push({
              platform: "FACEBOOK",
              url: formatToString(authorToEdit.socialMedia.facebook),
            });
          }
          if (authorToEdit.socialMedia.twitter) {
            links.push({
              platform: "TWITTER",
              url: formatToString(authorToEdit.socialMedia.twitter),
            });
          }
          if (authorToEdit.socialMedia.instagram) {
            links.push({
              platform: "INSTAGRAM",
              url: formatToString(authorToEdit.socialMedia.instagram),
            });
          }
          if (authorToEdit.socialMedia.linkedin) {
            links.push({
              platform: "LINKEDIN",
              url: formatToString(authorToEdit.socialMedia.linkedin),
            });
          }
          setSocialMedia(links);
        } else {
          setSocialMedia([]);
        }
      } else {
        resetForm();
      }
    }
  }, [open, authorToEdit]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      if (file) toast.error("Please select a valid image file.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addSocialMedia = () => {
    setSocialMedia((prev) => [...prev, { platform: "FACEBOOK", url: "" }]);
  };

  const updateSocialMedia = (
    index: number,
    field: keyof SocialMedia,
    value: string,
  ) => {
    setSocialMedia((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeSocialMedia = (index: number) => {
    setSocialMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formatToString(formData.name).trim();
    const positions = formatToString(formData.positions).trim();
    const bio = formatToString(formData.bio).trim();
    const nationality = formatToString(formData.nationality).trim();
    const websiteUrl = formatToString(formData.websiteUrl).trim();

    if (!name) {
      toast.error("Author Name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", name);

      if (positions) {
        data.append("positions", positions);
      }
      if (bio) {
        data.append("bio", bio);
      }
      if (nationality) {
        data.append("nationality", nationality);
      }
      if (websiteUrl) {
        data.append("websiteUrl", websiteUrl);
      }
      if (
        formData.booksPublished !== "" &&
        formData.booksPublished !== undefined &&
        formData.booksPublished !== null
      ) {
        data.append("booksPublished", String(formData.booksPublished));
      }
      if (
        formData.yearsOfWriting !== "" &&
        formData.yearsOfWriting !== undefined &&
        formData.yearsOfWriting !== null
      ) {
        data.append("yearsOfWriting", String(formData.yearsOfWriting));
      }
      if (
        formData.booksSold !== "" &&
        formData.booksSold !== undefined &&
        formData.booksSold !== null
      ) {
        data.append("booksSold", String(formData.booksSold));
      }
      if (
        formData.happyReaders !== "" &&
        formData.happyReaders !== undefined &&
        formData.happyReaders !== null
      ) {
        data.append("happyReaders", String(formData.happyReaders));
      }

      if (selectedFile) {
        data.append("image", selectedFile);
      }

      const validSocialMedia = socialMedia.filter(
        (item) => item.url && formatToString(item.url).trim() !== "",
      );
      data.append("socialLinks", JSON.stringify(validSocialMedia));

      let response;
      if (authorToEdit?.id) {
        response = await axiosMultipartInstance.patch(
          `/v1/author/${authorToEdit.id}`,
          data,
        );
        toast.success("Author updated successfully!");
      } else {
        response = await axiosMultipartInstance.post("/v1/author", data);
        toast.success("Author added successfully!");
      }

      const resAuthor = response.data?.data || response.data;
      onAddAuthor?.(resAuthor);
      onSuccess?.(resAuthor);

      handleClose();
    } catch (error: any) {
      console.error("Failed to save author:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save author.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[100vw] md:max-w-4xl max-h-[90vh] flex flex-col p-0 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div>
            <DialogTitle className="text-base font-bold text-slate-900 sm:text-lg">
              {authorToEdit ? "Edit Author" : "Add New Author"}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-slate-500">
              {authorToEdit
                ? "Update author profile and details."
                : "Enter details to register a new author."}
            </DialogDescription>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="add-author-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6 text-slate-800"
        >
          {/* General Information & Image */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              General Information
            </h3>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* Profile Image Uploader */}
              <div className="relative flex h-32 w-full shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-3 text-center transition hover:border-indigo-400 hover:bg-indigo-50/20 sm:w-36">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  id="profileImageInput"
                />
                {imagePreview ? (
                  <div className="relative h-full w-full overflow-hidden rounded-lg bg-white p-1 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="h-full w-full object-cover rounded-md"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-500">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm text-slate-400">
                      <Upload className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-700">
                      Upload Image
                    </span>
                    <span className="text-[10px] text-slate-400">
                      PNG, JPG up to 5MB
                    </span>
                  </div>
                )}
              </div>

              {/* Form Inputs */}
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Author Name */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="author-name"
                    className="mb-1 block text-xs font-medium text-slate-700"
                  >
                    Author Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="author-name"
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Mahendra Thapa"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>

                {/* Positions */}
                <div>
                  <label
                    htmlFor="author-positions"
                    className="mb-1 block text-xs font-medium text-slate-700"
                  >
                    Positions / Role
                  </label>
                  <input
                    id="author-positions"
                    type="text"
                    name="positions"
                    placeholder="e.g. Full-Stack Developer"
                    value={formData.positions}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label
                    htmlFor="author-nationality"
                    className="mb-1 block text-xs font-medium text-slate-700"
                  >
                    Nationality
                  </label>
                  <input
                    id="author-nationality"
                    type="text"
                    name="nationality"
                    placeholder="e.g. Nepali,Hindi"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>

                {/* Website URL */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="author-website"
                    className="mb-1 block text-xs font-medium text-slate-700"
                  >
                    Website URL
                  </label>
                  <input
                    id="author-website"
                    type="url"
                    name="websiteUrl"
                    placeholder="https://www.facebook.com/"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Social Links */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Social Links
                </h3>
                <p className="text-xs text-slate-400">
                  Add social profiles for this author.
                </p>
              </div>
              <button
                type="button"
                onClick={addSocialMedia}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Profile
              </button>
            </div>

            {socialMedia.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
                <Globe className="mx-auto mb-1 h-5 w-5 text-slate-400" />
                <p className="text-xs text-slate-500">
                  No social media links added.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {socialMedia.map((social, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center"
                  >
                    <div className="w-full sm:w-36 shrink-0">
                      <select
                        value={social.platform}
                        onChange={(e) =>
                          updateSocialMedia(index, "platform", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
                      >
                        <option value="FACEBOOK">Facebook</option>
                        <option value="INSTAGRAM">Instagram</option>
                        <option value="TWITTER">Twitter / X</option>
                        <option value="YOUTUBE">YouTube</option>
                        <option value="LINKEDIN">LinkedIn</option>
                        <option value="TIKTOK">TikTok</option>
                      </select>
                    </div>

                    <div className="flex-1 min-w-0">
                      <input
                        type="url"
                        value={social.url}
                        onChange={(e) =>
                          updateSocialMedia(index, "url", e.target.value)
                        }
                        placeholder="https://facebook.com/dev..."
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSocialMedia(index)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 self-end sm:self-center cursor-pointer"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Statistics */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Writing & Publishing Statistics
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label
                  htmlFor="author-books-published"
                  className="mb-1 block text-xs font-medium text-slate-700"
                >
                  Books Published
                </label>
                <input
                  id="author-books-published"
                  type="number"
                  name="booksPublished"
                  min="0"
                  placeholder="200"
                  value={formData.booksPublished}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="author-years-of-writing"
                  className="mb-1 block text-xs font-medium text-slate-700"
                >
                  Years of Writing
                </label>
                <input
                  id="author-years-of-writing"
                  type="number"
                  name="yearsOfWriting"
                  min="0"
                  placeholder="8"
                  value={formData.yearsOfWriting}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="author-books-sold"
                  className="mb-1 block text-xs font-medium text-slate-700"
                >
                  Books Sold
                </label>
                <input
                  id="author-books-sold"
                  type="text"
                  name="booksSold"
                  placeholder="10"
                  value={formData.booksSold}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="author-happy-readers"
                  className="mb-1 block text-xs font-medium text-slate-700"
                >
                  Happy Readers
                </label>
                <input
                  id="author-happy-readers"
                  type="text"
                  name="happyReaders"
                  placeholder="12"
                  value={formData.happyReaders}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Biography */}
          <div>
            <label
              htmlFor="author-bio"
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Biography / Summary
            </label>
            <TextEditorEdit
              initialHtml={formData.bio}
              value={formData.bio}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, bio: val }))
              }
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-author-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting
              ? authorToEdit
                ? "Updating..."
                : "Saving..."
              : authorToEdit
                ? "Update Author"
                : "Save Author"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAuthorDialog;
