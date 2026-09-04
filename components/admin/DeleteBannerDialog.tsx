"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { BannerItem } from "./AddBannerDialog";

interface DeleteBannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: BannerItem | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteBannerDialog: React.FC<DeleteBannerDialogProps> = ({
  open,
  onOpenChange,
  banner,
  onConfirm,
  isDeleting,
}) => {
  if (!banner) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-md p-0 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">
                Delete Banner
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Confirm banner removal
              </DialogDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 text-gray-700 space-y-3">
          <p className="text-sm leading-relaxed">
            Are you sure you want to delete the banner{" "}
            <span className="font-bold text-gray-900">&quot;{banner.title}&quot;</span>?
          </p>
          <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
            This banner will be removed from your website homepage and promotions.
          </p>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/50 px-5 py-3.5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete Banner"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBannerDialog;
