"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { TestimonialItem } from "./AddTestimonialDialog";

interface DeleteTestimonialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial: TestimonialItem | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteTestimonialDialog: React.FC<DeleteTestimonialDialogProps> = ({
  open,
  onOpenChange,
  testimonial,
  onConfirm,
  isDeleting,
}) => {
  if (!testimonial) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-md p-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Delete Testimonial
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Confirm testimonial deletion
              </DialogDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 text-slate-700">
          <p className="text-sm leading-relaxed">
            Are you sure you want to delete testimonial by{" "}
            <span className="font-bold text-slate-900">&quot;{testimonial.name}&quot;</span>?
          </p>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            This action cannot be undone. This review will be permanently removed from the system.
          </p>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete Testimonial"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTestimonialDialog;
