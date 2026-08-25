"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Languages, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { axiosAuthInstance } from "@/utils/axiosInstances";

export interface LanguageItem {
  id: number | string;
  name: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AddLanguageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (language: LanguageItem) => void;
  languageToEdit?: LanguageItem | null;
}

export const AddLanguageDialog: React.FC<AddLanguageDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  languageToEdit,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setCode("");
  };

  useEffect(() => {
    if (open) {
      if (languageToEdit) {
        setName(languageToEdit.name || "");
        setCode(languageToEdit.code || "");
      } else {
        resetForm();
      }
    }
  }, [open, languageToEdit]);

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Language Name is required.");
      return;
    }

    if (!code.trim()) {
      toast.error("Language Code is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        code: code.trim().toLowerCase(),
      };

      let response;
      if (languageToEdit?.id) {
        response = await axiosAuthInstance.patch(
          `/v1/language/${languageToEdit.id}`,
          payload,
        );
        toast.success("Language updated successfully!");
      } else {
        response = await axiosAuthInstance.post("/v1/language", payload);
        toast.success("Language added successfully!");
      }

      const resData = response.data?.data || response.data;
      onSuccess?.(resData);
      handleClose();
    } catch (error: any) {
      console.error("Save language error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save language.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-md p-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {languageToEdit ? "Edit Language" : "Add New Language"}
              </DialogTitle>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Language Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. English, Nepali, Spanish"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Language Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. en, ne, es"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                required
              />
              <p className="mt-1 text-[11px] text-slate-400">
                ISO 639-1 code standard (e.g. &quot;en&quot; for English, &quot;ne&quot; for Nepali).
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting
                ? languageToEdit
                  ? "Saving..."
                  : "Adding..."
                : languageToEdit
                ? "Save Changes"
                : "Add Language"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLanguageDialog;
