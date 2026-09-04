"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Loader2,
  Save,
  X,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import TextEditorEdit from "../TextEditor";
import { parseQuillContent } from "@/utils/quillDecoder";

// Social SVG Icons
const FacebookIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={`${className} fill-current shrink-0`} viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={`${className} fill-current shrink-0`} viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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

export interface AboutData {
  id?: number | string;
  _id?: number | string;
  title: string;
  description: string;
  contact: string;
  email: string;
  address: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface AddAboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (data?: AboutData) => void;
  aboutToEdit?: AboutData | null;
}

export const AddAboutDialog: React.FC<AddAboutDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  aboutToEdit,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contact: "",
    email: "",
    address: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    linkedinUrl: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      contact: "",
      email: "",
      address: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      youtubeUrl: "",
      linkedinUrl: "",
    });
  };

  useEffect(() => {
    if (open) {
      if (aboutToEdit) {
        const decodedDescription = parseQuillContent(aboutToEdit.description);
        setFormData({
          title: aboutToEdit.title || "",
          description: decodedDescription,
          contact: aboutToEdit.contact || "",
          email: aboutToEdit.email || "",
          address: aboutToEdit.address || "",
          facebookUrl: aboutToEdit.facebookUrl || "",
          instagramUrl: aboutToEdit.instagramUrl || "",
          twitterUrl: aboutToEdit.twitterUrl || "",
          youtubeUrl: aboutToEdit.youtubeUrl || "",
          linkedinUrl: aboutToEdit.linkedinUrl || "",
        });
      } else {
        resetForm();
      }
    }
  }, [open, aboutToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Store / Company title is required.");
      return;
    }

    if (
      !formData.description ||
      formData.description.trim() === "" ||
      formData.description === JSON.stringify([{ insert: "\n" }])
    ) {
      toast.error("Description is required.");
      return;
    }

    if (!formData.contact.trim()) {
      toast.error("Contact number is required.");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email address is required.");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Physical address is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description,
        contact: formData.contact.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        facebookUrl: formData.facebookUrl.trim() || undefined,
        instagramUrl: formData.instagramUrl.trim() || undefined,
        twitterUrl: formData.twitterUrl.trim() || undefined,
        youtubeUrl: formData.youtubeUrl.trim() || undefined,
        linkedinUrl: formData.linkedinUrl.trim() || undefined,
      };

      let response;
      const itemId = aboutToEdit?.id || aboutToEdit?._id;

      if (itemId) {
        try {
          response = await axiosAuthInstance.patch(`/v1/about/`, payload);
        } catch {
          // If PATCH with ID fails or endpoint expects POST / PUT
          response = await axiosAuthInstance.post("/v1/about", payload);
        }
        toast.success("About information updated successfully!");
      } else {
        response = await axiosAuthInstance.post("/v1/about", payload);
        toast.success("About information created successfully!");
      }

      const returnedData = response?.data?.data || response?.data || payload;
      onSuccess?.(returnedData);
      handleClose();
    } catch (error: any) {
      console.error("Failed to save about details:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save about details. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[100vw] md:max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-0 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1749A0]/10 text-[#1749A0]">
              <Building2 size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                {aboutToEdit
                  ? "Edit About Information"
                  : "Add About Information"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {aboutToEdit
                  ? "Update store profile, description, contact details, and social media handles."
                  : "Fill in the store profile, description, contact details, and optional social links."}
              </DialogDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* General Information Section */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Store / Company Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Nepsole - Leading Bookstore in Nepal"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#1749A0] focus:bg-white focus:ring-2 focus:ring-[#1749A0]/10"
                />
              </div>
            </div>

            {/* Description using TextEditor */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Description <span className="text-rose-500">*</span>
              </label>
              <div className="overflow-hidden rounded-xl">
                <TextEditorEdit
                  initialHtml={formData.description}
                  value={formData.description}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, description: val }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2 text-xs font-bold uppercase tracking-wider text-gray-600">
              <Phone size={14} className="text-[#1749A0]" />
              <span>Contact & Location</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Contact Number */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Contact Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="+977-9812345678"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#1749A0] focus:bg-white focus:ring-2 focus:ring-[#1749A0]/10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@nepsole.com"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#1749A0] focus:bg-white focus:ring-2 focus:ring-[#1749A0]/10"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Physical Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Putalisadak, Kathmandu, Nepal"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#1749A0] focus:bg-white focus:ring-2 focus:ring-[#1749A0]/10"
                />
              </div>
            </div>
          </div>

          {/* Social Links Section (Optional) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600">
                <Globe size={14} className="text-[#1749A0]" />
                <span>Social Media URLs</span>
              </div>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">
                Optional
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Facebook */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Facebook URL
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1877F2]">
                    <FacebookIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    name="facebookUrl"
                    value={formData.facebookUrl}
                    onChange={handleChange}
                    placeholder="https://facebook.com/nepsolebooks"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#1749A0] focus:bg-white focus:ring-2 focus:ring-[#1749A0]/10"
                  />
                </div>
              </div>

              {/* Instagram */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Instagram URL
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E4405F]">
                    <InstagramIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    name="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={handleChange}
                    placeholder="https://instagram.com/nepsolebooks"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#1749A0] focus:bg-white focus:ring-2 focus:ring-[#1749A0]/10"
                  />
                </div>
              </div>

              {/* Twitter / X */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Twitter / X URL
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-800">
                    <TwitterIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    name="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={handleChange}
                    placeholder="https://twitter.com/nepsolebooks"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#1749A0] focus:bg-white focus:ring-2 focus:ring-[#1749A0]/10"
                  />
                </div>
              </div>

              {/* YouTube */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  YouTube URL
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF0000]">
                    <YoutubeIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={handleChange}
                    placeholder="https://youtube.com/@nepsolebooks"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#1749A0] focus:bg-white focus:ring-2 focus:ring-[#1749A0]/10"
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  LinkedIn URL
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0A66C2]">
                    <LinkedinIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/company/nepsolebooks"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#1749A0] focus:bg-white focus:ring-2 focus:ring-[#1749A0]/10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 -mx-6 -mb-6 flex flex-col-reverse gap-2 border-t border-gray-100 bg-white/95 px-6 py-4 backdrop-blur-sm sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1749A0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123b83] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>
                    {aboutToEdit ? "Update Information" : "Save Information"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAboutDialog;
