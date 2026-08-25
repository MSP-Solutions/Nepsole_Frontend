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
import TextEditorEdit from "../TextEditor";
import { axiosMultipartInstance } from "@/utils/axiosInstances";
import { parseQuillContent } from "@/utils/quillDecoder";

export interface SocialMedia {
  platform: string;
  url: string;
}

export interface PublisherData {
  id?: number | string;
  name: string;
  about?: string;
  establishedYear?: number | string | null;
  address?: string;
  phoneNumber?: string;
  email?: string;
  websiteUrl?: string;
  logo?: string | null;
  publicationLogoUrl?: string | null;
  booksPublished?: number | string;
  authorsCount?: number | string;
  booksSold?: number | string;
  yearsOfPublishing?: number | string | null;
  socialLinks?: any[];
  [key: string]: any;
}

interface AddPublishersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPublisher?: (publisher: any) => void;
  onSuccess?: (publisher: any) => void;
  publisherToEdit?: PublisherData | null;
}

export const AddPublishersDialog: React.FC<AddPublishersDialogProps> = ({
  open,
  onOpenChange,
  onAddPublisher,
  onSuccess,
  publisherToEdit,
}) => {
  const initialFormData = {
    name: "",
    about: "",
    establishedYear: "",
    address: "",
    phoneNumbers: "",
    email: "",
    websiteUrl: "",
    booksPublished: "",
    authorsCount: "",
    booksSold: "",
    yearsOfPublishing: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedFile(null);
    setLogoPreview(null);
    setSocialMedia([]);
  };

  useEffect(() => {
    if (open) {
      if (publisherToEdit) {
        const decodedAbout = parseQuillContent(publisherToEdit.about);
        setFormData({
          name: publisherToEdit.name || "",
          about: decodedAbout,
          establishedYear: publisherToEdit.establishedYear
            ? String(publisherToEdit.establishedYear)
            : "",
          address: publisherToEdit.address || "",
          phoneNumbers:
            publisherToEdit.phoneNumber ||
            (Array.isArray(publisherToEdit.phoneNumbers) &&
            publisherToEdit.phoneNumbers.length > 0
              ? publisherToEdit.phoneNumbers[0]
              : ""),
          email: publisherToEdit.email || "",
          websiteUrl: publisherToEdit.websiteUrl || "",
          booksPublished:
            publisherToEdit.booksPublished !== undefined &&
            publisherToEdit.booksPublished !== null
              ? String(publisherToEdit.booksPublished)
              : publisherToEdit.booksPublished !== undefined &&
                  publisherToEdit.booksPublished !== null
                ? String(publisherToEdit.booksPublished)
                : "",
          authorsCount:
            publisherToEdit.authorsCount !== undefined &&
            publisherToEdit.authorsCount !== null
              ? String(publisherToEdit.authorsCount)
              : "",
          booksSold:
            publisherToEdit.booksSold !== undefined &&
            publisherToEdit.booksSold !== null
              ? String(publisherToEdit.booksSold)
              : "",
          yearsOfPublishing:
            publisherToEdit.yearsOfPublishing !== undefined &&
            publisherToEdit.yearsOfPublishing !== null
              ? String(publisherToEdit.yearsOfPublishing)
              : publisherToEdit.yearsOfPublishing !== undefined &&
                  publisherToEdit.yearsOfPublishing !== null
                ? String(publisherToEdit.yearsOfPublishing)
                : "",
        });
        setLogoPreview(
          publisherToEdit.publicationLogoUrl || publisherToEdit.logo || null,
        );
        setSelectedFile(null);

        if (Array.isArray(publisherToEdit.socialLinks)) {
          setSocialMedia(
            publisherToEdit.socialLinks.map((s: any) => ({
              platform: s.platform || "FACEBOOK",
              url: s.url || "",
            })),
          );
        } else {
          setSocialMedia([]);
        }
      } else {
        resetForm();
      }
    }
  }, [open, publisherToEdit]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      if (file) toast.error("Please select a valid image file.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
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
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
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
    if (!formData.name.trim()) {
      toast.error("Publisher Name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      if (formData.about) data.append("about", formData.about);
      if (formData.establishedYear)
        data.append("establishedYear", formData.establishedYear);
      if (formData.address) data.append("address", formData.address.trim());
      if (formData.phoneNumbers)
        data.append("phoneNumber", formData.phoneNumbers.trim());
      if (formData.email) data.append("email", formData.email.trim());
      if (formData.websiteUrl)
        data.append("websiteUrl", formData.websiteUrl.trim());

      if (selectedFile) {
        data.append("logo", selectedFile);
      }

      if (formData.booksPublished)
        data.append("booksPublished", formData.booksPublished);
      if (formData.authorsCount)
        data.append("authorsCount", formData.authorsCount);
      if (formData.booksSold) data.append("booksSold", formData.booksSold);
      if (formData.yearsOfPublishing)
        data.append("yearsOfPublishing", formData.yearsOfPublishing);

      const validSocialMedia = socialMedia.filter(
        (item) => item.url.trim() !== "",
      );
      data.append("socialLinks", JSON.stringify(validSocialMedia));

      let response;
      if (publisherToEdit?.id) {
        response = await axiosMultipartInstance.patch(
          `/v1/publisher/${publisherToEdit.id}`,
          data,
        );
        toast.success("Publisher updated successfully!");
      } else {
        response = await axiosMultipartInstance.post("/v1/publisher", data);
        toast.success("Publisher added successfully!");
      }

      const resPublisher = response.data?.data || response.data;
      onAddPublisher?.(resPublisher);
      onSuccess?.(resPublisher);

      handleClose();
    } catch (error: any) {
      console.error("Failed to save publisher:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save publisher.";
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
              {publisherToEdit ? "Edit Publisher" : "Add New Publisher"}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-slate-500">
              {publisherToEdit
                ? "Update details of this publishing house."
                : "Enter details to register a new publishing house."}
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

        {/* Scrollable Form */}
        <form
          id="add-publisher-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6 text-slate-800"
        >
          {/* General Info & Logo */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              General Information
            </h3>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* Logo Upload Box */}
              <div className="relative flex h-32 w-full shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-3 text-center transition hover:border-indigo-400 hover:bg-indigo-50/20 sm:w-36">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
                {logoPreview ? (
                  <div className="relative h-full w-full overflow-hidden rounded-lg bg-white p-1">
                    <img
                      src={logoPreview}
                      alt="Publication Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-500">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm text-slate-400">
                      <Upload className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-700">
                      Upload Logo
                    </span>
                    <span className="text-[10px] text-slate-400">
                      PNG, JPG up to 5MB
                    </span>
                  </div>
                )}
              </div>

              {/* Text Fields */}
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Publisher Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Publisher Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Established Year
                  </label>
                  <input
                    type="number"
                    name="establishedYear"
                    placeholder="e.g. 2025"
                    value={formData.establishedYear}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Address / Location
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Tinkune,Kathmandu, Nepal"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="user@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Website URL
                </label>
                <input
                  type="url"
                  name="websiteUrl"
                  placeholder="https://www.facebook.com/"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNumbers"
                  placeholder="9800000001"
                  value={formData.phoneNumbers}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Social Media */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Social Media
                </h3>
                <p className="text-xs text-slate-400">
                  Add social profiles for this publisher.
                </p>
              </div>
              <button
                type="button"
                onClick={addSocialMedia}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
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
                        <option value="TWITTER">Twitter / X</option>
                        <option value="INSTAGRAM">Instagram</option>
                        <option value="LINKEDIN">LinkedIn</option>
                        <option value="YOUTUBE">YouTube</option>
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
                        placeholder="https://facebook.com/dev"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSocialMedia(index)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 self-end sm:self-center"
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
              Publishing Statistics
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Books Published
                </label>
                <input
                  type="number"
                  name="booksPublished"
                  min="0"
                  placeholder="20"
                  value={formData.booksPublished}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Authors Count
                </label>
                <input
                  type="number"
                  name="authorsCount"
                  min="0"
                  placeholder="4"
                  value={formData.authorsCount}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Books Sold
                </label>
                <input
                  type="number"
                  name="booksSold"
                  min="0"
                  placeholder="20"
                  value={formData.booksSold}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Year of Publishing
                </label>
                <input
                  type="number"
                  name="yearsOfPublishing"
                  min="0"
                  placeholder="2020"
                  value={formData.yearsOfPublishing}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* About */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              About Publisher
            </label>
            <TextEditorEdit
              initialHtml={formData.about}
              value={formData.about}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, about: val }))
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
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-publisher-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting
              ? publisherToEdit
                ? "Updating..."
                : "Saving..."
              : publisherToEdit
                ? "Update Publisher"
                : "Save Publisher"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPublishersDialog;
