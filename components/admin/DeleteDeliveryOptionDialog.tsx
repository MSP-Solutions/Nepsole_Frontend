"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { DeliveryOptionItem } from "./AddDeliveryOptionDialog";

interface DeleteDeliveryOptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  option: DeliveryOptionItem | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteDeliveryOptionDialog: React.FC<
  DeleteDeliveryOptionDialogProps
> = ({ open, onOpenChange, option, onConfirm, isDeleting }) => {
  if (!option) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-md p-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Delete Delivery Option
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Confirm option deletion
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
        <div className="p-5">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">
              &quot;{option.name}&quot;
            </span>
            ? This action cannot be undone and customers will no longer be able to select this shipping method.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Option</span>
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
