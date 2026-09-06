"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosMultipartInstance } from "@/utils/axiosInstances";
import {
  Upload,
  User,
  X,
  Save,
  Loader2,
  Quote,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

export interface TestimonialItem {
  id: number | string;
  name: string;
  designation?: string;
  message: string;
  image?: string | null;
  imageUrl?: string | null;
  isPublished?: boolean | string | number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface AddTestimonialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  testimonialToEdit?: TestimonialItem | null;
}

export const AddTestimonialDialog: React.FC<AddTestimonialDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  testimonialToEdit,
}) => {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTestimonialImage = (t: any) => {
    const img = t?.imageUrl || t?.image || "";
    if (!img) return "";
    if (
      img.startsWith("http://") ||
      img.startsWith("https://") ||
      img.startsWith("data:") ||
      img.startsWith("blob:")
    ) {
      return img;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    return `${baseUrl}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  const resetForm = () => {
    setName("");
    setDesignation("");
    setMessage("");
    setImagePreview(null);
    setSelectedFile(null);
    setIsDragOver(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (open) {
      if (testimonialToEdit) {
        setName(testimonialToEdit.name || "");
        setDesignation(testimonialToEdit.designation || "");
        setMessage(testimonialToEdit.message || "");
        const img = getTestimonialImage(testimonialToEdit);
        setImagePreview(img || null);
        setSelectedFile(null);
      } else {
        resetForm();
      }
    }
  }, [open, testimonialToEdit]);

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter full name.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter testimonial message.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("designation", designation.trim());
      formData.append("message", message.trim());

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      if (testimonialToEdit?.id) {
        try {
          await axiosMultipartInstance.put(
            `/v1/testimonial/${testimonialToEdit.id}`,
            formData,
          );
        } catch {
          await axiosMultipartInstance.patch(
            `/v1/testimonial/${testimonialToEdit.id}`,
            formData,
          );
        }
        toast.success("Testimonial updated successfully!");
      } else {
        await axiosMultipartInstance.post("/v1/testimonial", formData);
        toast.success("Testimonial added successfully!");
      }

      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error("Save Testimonial Error:", error);
      const errResponse = error?.response?.data;
      const errorMsg =
        errResponse?.message ||
        errResponse?.error ||
        error?.message ||
        "Failed to save testimonial. Please try again.";
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
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1749A0]/10 text-[#1749A0]">
              <Quote size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                {testimonialToEdit ? "Edit Testimonial" : "Add New Testimonial"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {testimonialToEdit
                  ? "Update client or reviewer testimonial details."
                  : "Add customer feedback and review to feature on Nepsole."}
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
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* User Image Upload */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Profile Image / Avatar
            </label>

            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition ${
                  isDragOver
                    ? "border-[#1749A0] bg-[#1749A0]/5"
                    : "border-gray-200 bg-gray-50/60 hover:border-[#1749A0]/50 hover:bg-[#1749A0]/5"
                }`}
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-400 shadow-xs transition group-hover:scale-105 group-hover:text-[#1749A0]">
                  <Upload size={18} />
                </div>

                <p className="text-xs font-semibold text-gray-700">
                  Upload author photo
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  PNG, JPG, WEBP (Square ratio recommended)
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-white shadow-xs">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {selectedFile ? selectedFile.name : "Current Photo"}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Image preview ready
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Name & Designation grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sangam Thapa Magar"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#1749A0] focus:bg-white focus:ring-2 focus:ring-[#1749A0]/10"
                />
                <User
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Designation / Role
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#1749A0] focus:bg-white focus:ring-2 focus:ring-[#1749A0]/10"
                />
                <Briefcase
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Testimonial Message */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Message / Feedback <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the testimonial message here..."
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#1749A0] focus:bg-white focus:ring-2 focus:ring-[#1749A0]/10 resize-none"
              />
              <MessageSquare
                size={16}
                className="absolute left-3 top-3.5 text-gray-400"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 -mx-6 -mb-6 flex flex-col-reverse gap-2 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row sm:justify-end">
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1749A0] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#123b83] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{testimonialToEdit ? "Updating..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>
                    {testimonialToEdit
                      ? "Update Testimonial"
                      : "Save Testimonial"}
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

export default AddTestimonialDialog;
