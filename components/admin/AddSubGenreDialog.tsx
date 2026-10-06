"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Layers, X, Save, Loader2, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface GenreOption {
  id: number | string;
  name: string;
  [key: string]: any;
}

export interface SubGenreData {
  id?: number | string;
  name: string;
  genreId: number | string;
  genre?: {
    id: number | string;
    name: string;
    [key: string]: any;
  };
  Genre?: {
    id: number | string;
    name: string;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface AddSubGenreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (subGenre: SubGenreData) => void;
  onAddSubGenre?: (subGenre: SubGenreData) => void;
  subGenreToEdit?: SubGenreData | null;
  genres?: GenreOption[];
}

export const AddSubGenreDialog: React.FC<AddSubGenreDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  onAddSubGenre,
  subGenreToEdit,
  genres: initialGenres,
}) => {
  const [name, setName] = useState("");
  const [genreId, setGenreId] = useState<string | number>("");
  const [genresList, setGenresList] = useState<GenreOption[]>(
    initialGenres || [],
  );
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map genres for Select items with labels
  const genreItems = useMemo(() => {
    return genresList.map((g) => ({
      label: g.name,
      value: String(g.id),
    }));
  }, [genresList]);

  // Sync external genres prop if available
  useEffect(() => {
    if (initialGenres && initialGenres.length > 0) {
      setGenresList(initialGenres);
    }
  }, [initialGenres]);

  // Fetch genres if not provided or empty when dialog opens
  useEffect(() => {
    if (open && (!genresList || genresList.length === 0)) {
      const fetchGenres = async () => {
        setIsLoadingGenres(true);
        try {
          let response;
          try {
            response = await axiosAuthInstance.get("/v1/genre?limit=100");
          } catch (err: any) {
            if (err?.response?.status === 404) {
              response = await axiosAuthInstance.get("/api/v1/genre?limit=100");
            } else {
              throw err;
            }
          }
          const raw = response.data;
          const list = Array.isArray(raw)
            ? raw
            : raw?.data || raw?.genres || [];
          setGenresList(list);
        } catch (error) {
          console.error("Failed to load genres for subgenre modal:", error);
        } finally {
          setIsLoadingGenres(false);
        }
      };

      fetchGenres();
    }
  }, [open, genresList]);

  // Reset or fill form when open / subGenreToEdit changes
  useEffect(() => {
    if (open) {
      if (subGenreToEdit) {
        setName(subGenreToEdit.name || "");
        const rawGenreId =
          subGenreToEdit.genreId ??
          subGenreToEdit.genre?.id ??
          subGenreToEdit.Genre?.id ??
          "";
        setGenreId(rawGenreId);
      } else {
        setName("");
        setGenreId("");
      }
    }
  }, [open, subGenreToEdit]);

  const handleClose = () => {
    setName("");
    setGenreId("");
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Please enter a sub genre name.");
      return;
    }

    if (!genreId && genreId !== 0) {
      toast.error("Please select a parent genre.");
      return;
    }

    const numericGenreId = Number(genreId);
    const resolvedGenreId = !isNaN(numericGenreId)
      ? numericGenreId
      : genreId;

    const payload = {
      name: trimmedName,
      genreId: resolvedGenreId,
    };

    setIsSubmitting(true);

    try {
      let response;
      if (subGenreToEdit?.id) {
        // Update endpoint: /api/v1/subgenre/:id (or /v1/subgenre/:id with fallback)
        const updateUrlPrimary = `/v1/subgenre/${subGenreToEdit.id}`;
        const updateUrlFallback = `/api/v1/subgenre/${subGenreToEdit.id}`;

        try {
          try {
            response = await axiosAuthInstance.patch(updateUrlPrimary, payload);
          } catch (patchErr: any) {
            if (patchErr?.response?.status === 404) {
              response = await axiosAuthInstance.patch(
                updateUrlFallback,
                payload,
              );
            } else if (patchErr?.response?.status === 405) {
              // Try PUT if PATCH is not allowed
              response = await axiosAuthInstance.put(
                updateUrlPrimary,
                payload,
              );
            } else {
              throw patchErr;
            }
          }
        } catch (retryErr: any) {
          if (retryErr?.response?.status === 405) {
            response = await axiosAuthInstance.put(updateUrlFallback, payload);
          } else {
            throw retryErr;
          }
        }

        toast.success("Sub genre updated successfully!");
      } else {
        // Create endpoint: /api/v1/subgenre (or /v1/subgenre with fallback)
        const createUrlPrimary = "/v1/subgenre";
        const createUrlFallback = "/api/v1/subgenre";

        try {
          response = await axiosAuthInstance.post(createUrlPrimary, payload);
        } catch (postErr: any) {
          if (postErr?.response?.status === 404) {
            response = await axiosAuthInstance.post(
              createUrlFallback,
              payload,
            );
          } else {
            throw postErr;
          }
        }

        toast.success("Sub genre added successfully!");
      }

      const resData =
        response.data?.data ||
        response.data?.subgenre ||
        response.data || {
          id: subGenreToEdit?.id || Date.now(),
          ...payload,
        };

      onSuccess?.(resData);
      onAddSubGenre?.(resData);
      handleClose();
    } catch (error: any) {
      console.error("Save sub genre error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save sub genre. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1749A0]/10 text-[#1749A0]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">
                {subGenreToEdit ? "Edit Sub Genre" : "Add Sub Genre"}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-gray-500">
                {subGenreToEdit
                  ? "Update the sub genre details below."
                  : "Create a new sub genre linked to a parent genre."}
              </DialogDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Sub Genre Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Sub Genre Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Psychological Thriller"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10 disabled:bg-gray-50"
              autoFocus
            />
          </div>

          {/* Parent Genre Select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Parent Genre <span className="text-rose-500">*</span>
              </label>
              {isLoadingGenres && (
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading genres...
                </span>
              )}
            </div>

            <Select
              items={genreItems}
              value={
                genreId !== "" && genreId !== undefined && genreId !== null
                  ? String(genreId)
                  : ""
              }
              onValueChange={(val) => {
                if (val) {
                  const num = Number(val);
                  setGenreId(!isNaN(num) ? num : val);
                } else {
                  setGenreId("");
                }
              }}
              disabled={isSubmitting || isLoadingGenres}
            >
              <SelectTrigger className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-none outline-none transition focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10 disabled:bg-gray-50 cursor-pointer">
                <SelectValue placeholder="Select a parent genre...">
                  {(val: string | null) => {
                    if (!val) return null;
                    const matched = genresList.find(
                      (g) => String(g.id) === String(val),
                    );
                    return matched ? matched.name : val;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[100] max-h-60 bg-white border border-gray-200 shadow-xl rounded-xl">
                {genresList.map((g) => (
                  <SelectItem
                    key={g.id}
                    value={String(g.id)}
                    className="cursor-pointer py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 rounded-lg"
                  >
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-[11px] text-gray-500">
              The sub genre will be classified under this parent genre.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1749A0] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#123b83] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  {subGenreToEdit ? "Update Sub Genre" : "Add Sub Genre"}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubGenreDialog;
