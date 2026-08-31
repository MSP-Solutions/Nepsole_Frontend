"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  Truck,
  Loader2,
  Save,
  X,
  Clock3,
  Banknote,
  FileText,
  CheckCircle2,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";

export interface DeliveryOptionItem {
  id: number | string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface AddDeliveryOptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  optionToEdit?: DeliveryOptionItem | null;
}

export const AddDeliveryOptionDialog: React.FC<
  AddDeliveryOptionDialogProps
> = ({ open, onOpenChange, onSuccess, optionToEdit }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState<string | number>("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCost("");
    setEstimatedDays("");
    setIsActive(true);
  };

  useEffect(() => {
    if (open) {
      if (optionToEdit) {
        setName(optionToEdit.name || "");
        setDescription(optionToEdit.description || "");
        setCost(optionToEdit.cost !== undefined ? optionToEdit.cost : "");
        setEstimatedDays(optionToEdit.estimatedDays || "");
        setIsActive(
          optionToEdit.isActive !== undefined
            ? Boolean(optionToEdit.isActive)
            : true,
        );
      } else {
        resetForm();
      }
    }
  }, [open, optionToEdit]);

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Option name is required.");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required.");
      return;
    }

    if (cost === "" || isNaN(Number(cost)) || Number(cost) < 0) {
      toast.error("Please enter a valid cost.");
      return;
    }

    if (!estimatedDays.trim()) {
      toast.error("Estimated delivery days is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        cost: Number(cost),
        estimatedDays: estimatedDays.trim(),
        isActive: Boolean(isActive),
      };

      if (optionToEdit?.id) {
        await axiosAuthInstance.patch(
          `/v1/delivery-options/${optionToEdit.id}`,
          payload,
        );
        toast.success("Delivery option updated successfully!");
      } else {
        await axiosAuthInstance.post("/v1/delivery-options", payload);
        toast.success("Delivery option added successfully!");
      }

      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error("Save delivery option error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save delivery option.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[92vw] sm:w-[95vw] max-w-lg p-0 bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/40 px-5 sm:px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {optionToEdit ? "Edit Delivery Option" : "Add Delivery Option"}
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5 hidden xs:block sm:block">
                {optionToEdit
                  ? "Update shipping details and customer pricing"
                  : "Configure shipping rates and delivery timeline"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-5 sm:p-6 space-y-4.5">
            {/* Option Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Option Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl border border-slate-200 bg-white transition focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/15">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Package className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Standard Ground Delivery"
                  className="w-full rounded-xl bg-transparent py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Description <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl border border-slate-200 bg-white transition focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/15">
                <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                  <FileText className="h-4 w-4" />
                </div>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Standard ground shipping covering all 7 provinces in Nepal"
                  className="w-full rounded-xl bg-transparent py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Cost & Estimated Days */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Delivery Cost (Rs.) <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl border border-slate-200 bg-white transition focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/15">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 font-medium text-xs">
                    Rs.
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="50"
                    className="w-full rounded-xl bg-transparent py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Estimated Time <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl border border-slate-200 bg-white transition focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/15">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    placeholder="e.g. 3–5 Business Days"
                    className="w-full rounded-xl bg-transparent py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Active Status Card Toggle */}
            <div className="pt-1">
              <div
                onClick={() => setIsActive(!isActive)}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer select-none ${
                  isActive
                    ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/60"
                    : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/60"
                }`}
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      Visibility Status
                    </span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isActive
                      ? "Visible and selectable by customers at checkout"
                      : "Hidden from customers during checkout"}
                  </p>
                </div>

                {/* Custom toggle switch */}
                <button
                  type="button"
                  aria-checked={isActive}
                  role="switch"
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isActive ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 bg-slate-50/80 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{optionToEdit ? "Update Option" : "Save Option"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
