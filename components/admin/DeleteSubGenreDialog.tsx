"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { SubGenreData } from "./AddSubGenreDialog";

interface DeleteSubGenreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subGenre: SubGenreData | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteSubGenreDialog: React.FC<DeleteSubGenreDialogProps> = ({
  open,
  onOpenChange,
  subGenre,
  onConfirm,
  isDeleting,
}) => {
  if (!subGenre) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Delete Sub Genre
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Confirm sub genre deletion
              </DialogDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-slate-700">
          <p className="text-sm leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-bold text-slate-900">
              &quot;{subGenre.name}&quot;
            </span>
            {subGenre.genre?.name ? ` (Parent Genre: ${subGenre.genre.name})` : ""}?
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            This action cannot be undone. Books categorized under this sub genre may lose their sub genre association.
          </p>
        </div>

        {/* Footer Actions */}
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
            {isDeleting ? "Deleting..." : "Delete Sub Genre"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSubGenreDialog;
