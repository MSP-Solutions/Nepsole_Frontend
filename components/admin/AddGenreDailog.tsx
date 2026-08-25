"use client";

import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImagePlus, X, Save, BookOpen, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { axiosMultipartInstance } from "@/utils/axiosInstances";

export interface GenreData {
  id?: number | string;
  name: string;
  icon?: string | null;
  image?: string | null;
  [key: string]: any;
}

interface AddGenreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGenre?: (genre: GenreData) => void;
  onSuccess?: (genre: GenreData) => void;
  genreToEdit?: GenreData | null;
}

const AddGenreDialog: React.FC<AddGenreDialogProps> = ({
  open,
  onOpenChange,
  onAddGenre,
  onSuccess,
  genreToEdit,
}) => {
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName("");
    setImagePreview(null);
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  React.useEffect(() => {
    if (open) {
      if (genreToEdit) {
        setName(genreToEdit.name || "");
        const img =
          genreToEdit.icon || genreToEdit.image || genreToEdit.imageUrl || "";
        if (img) {
          if (
            img.startsWith("http://") ||
            img.startsWith("https://") ||
            img.startsWith("data:") ||
            img.startsWith("blob:")
          ) {
            setImagePreview(img);
          } else {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
            setImagePreview(
              `${baseUrl}${img.startsWith("/") ? "" : "/"}${img}`,
            );
          }
        } else {
          setImagePreview(null);
        }
        setSelectedFile(null);
      } else {
        resetForm();
      }
    }
  }, [open, genreToEdit]);

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      handleFileChange(file);
    }
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

    if (file) {
      handleFileChange(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a genre name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (selectedFile) {
        formData.append("icon", selectedFile);
      }

      let response;
      if (genreToEdit?.id) {
        response = await axiosMultipartInstance.patch(
          `/v1/genre/${genreToEdit.id}`,
          formData,
        );
        toast.success("Genre updated successfully!");
      } else {
        response = await axiosMultipartInstance.post("/v1/genre", formData);
        toast.success("Genre added successfully!");
      }

      const resGenre = response.data?.data ||
        response.data || {
          id: genreToEdit?.id || Date.now(),
          name: name.trim(),
          icon: imagePreview,
        };

      onAddGenre?.(resGenre);
      onSuccess?.(resGenre);
      handleClose();
    } catch (error: any) {
      console.error("Failed to save genre:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to save genre. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {genreToEdit ? "Edit Genre" : "Add Genre"}
            </DialogTitle>

            <DialogDescription className="mt-1 text-xs text-gray-500">
              {genreToEdit
                ? "Update genre name and image."
                : "Add a genre name and upload its image."}
            </DialogDescription>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-5">
            {/* Genre Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Genre Name <span className="text-rose-500">*</span>
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Science Fiction"
                required
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
              />
            </div>

            {/* Genre Image */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Genre Image
              </label>

              {!imagePreview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition ${
                    isDragOver
                      ? "border-[#1749A0] bg-[#1749A0]/5"
                      : "border-gray-200 bg-gray-50/60 hover:border-[#1749A0]/50 hover:bg-[#1749A0]/5"
                  }`}
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 shadow-sm transition group-hover:scale-105 group-hover:text-[#1749A0]">
                    <ImagePlus size={22} />
                  </div>

                  <p className="text-sm font-semibold text-gray-700">
                    Click to upload image
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    or drag and drop your image here
                  </p>

                  <p className="mt-2 text-[11px] text-gray-400">
                    PNG, JPG, JPEG, WEBP
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
                <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  <img
                    src={imagePreview}
                    alt="Genre preview"
                    className="h-48 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10">
                    <p className="text-xs font-medium text-white">
                      Genre Image
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1749A0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123b83] disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSubmitting
                ? genreToEdit
                  ? "Updating..."
                  : "Creating..."
                : genreToEdit
                  ? "Update Genre"
                  : "Create Genre"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGenreDialog;
