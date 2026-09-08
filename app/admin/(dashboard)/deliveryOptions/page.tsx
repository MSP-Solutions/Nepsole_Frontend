"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Truck,
  Plus,
  Clock3,
  Pencil,
  Trash2,
  Check,
  Package,
  Loader2,
} from "lucide-react";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import toast from "react-hot-toast";
import {
  AddDeliveryOptionDialog,
  DeliveryOptionItem,
} from "@/components/admin/AddDeliveryOptionDialog";
import { DeleteDeliveryOptionDialog } from "@/components/admin/DeleteDeliveryOptionDialog";

export default function DeliveryOptionsPage() {
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOptionItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [optionToEdit, setOptionToEdit] = useState<DeliveryOptionItem | null>(
    null,
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] =
    useState<DeliveryOptionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle loading map
  const [togglingIds, setTogglingIds] = useState<
    Record<string | number, boolean>
  >({});

  // Fetch delivery options from /v1/delivery-options
  const fetchDeliveryOptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosAuthInstance.get("/v1/delivery-options");
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];
      setDeliveryOptions(list);
    } catch (error: any) {
      console.error("Failed to fetch delivery options:", error);
      toast.dismiss();
      toast.error(
        error?.response?.data?.message || "Failed to load delivery options.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveryOptions();
  }, [fetchDeliveryOptions]);

  // Toggle active status via PATCH /v1/delivery-options/:id
  const handleToggleActive = async (option: DeliveryOptionItem) => {
    const newStatus = !option.isActive;

    // Optimistic update
    setDeliveryOptions((prev) =>
      prev.map((item) =>
        item.id === option.id ? { ...item, isActive: newStatus } : item,
      ),
    );

    setTogglingIds((prev) => ({ ...prev, [option.id]: true }));

    try {
      await axiosAuthInstance.patch(`/v1/delivery-options/${option.id}`, {
        name: option.name,
        description: option.description,
        cost: option.cost,
        estimatedDays: option.estimatedDays,
        isActive: newStatus,
      });
      toast.success(
        `Delivery option ${newStatus ? "activated" : "deactivated"}!`,
      );
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast.error(error?.response?.data?.message || "Failed to update status.");
      // Revert optimistic update
      setDeliveryOptions((prev) =>
        prev.map((item) =>
          item.id === option.id ? { ...item, isActive: !newStatus } : item,
        ),
      );
    } finally {
      setTogglingIds((prev) => ({ ...prev, [option.id]: false }));
    }
  };

  // Delete option via DELETE /v1/delivery-options/:id
  const handleConfirmDelete = async () => {
    if (!optionToDelete) return;
    setIsDeleting(true);

    try {
      await axiosAuthInstance.delete(
        `/v1/delivery-options/${optionToDelete.id}`,
      );
      toast.success("Delivery option deleted successfully!");
      setIsDeleteDialogOpen(false);
      setOptionToDelete(null);
      fetchDeliveryOptions();
    } catch (error: any) {
      console.error("Failed to delete option:", error);
      toast.dismiss();
      toast.error(
        error?.response?.data?.message || "Failed to delete delivery option.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Delivery Options
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage the shipping methods and delivery rates available for your
              customers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setOptionToEdit(null);
              setIsAddEditDialogOpen(true);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Delivery Option</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium text-gray-600">
              Loading delivery options...
            </p>
          </div>
        ) : deliveryOptions.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              No delivery options found
            </h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              Get started by creating your first shipping option for regular,
              express or local delivery.
            </p>
            <button
              type="button"
              onClick={() => {
                setOptionToEdit(null);
                setIsAddEditDialogOpen(true);
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add Delivery Option</span>
            </button>
          </div>
        ) : (
          /* Delivery Options List */
          <div className="space-y-4">
            {deliveryOptions.map((option) => (
              <div
                key={option.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left info */}
                  <div className="flex min-w-0 gap-4">
                    {/* Icon */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                      <Truck className="h-5 w-5 text-gray-700" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-gray-900">
                          {option.name}
                        </h2>

                        {option.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            <Check className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                            Inactive
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        {option.description}
                      </p>

                      {/* Details */}
                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock3 className="h-4 w-4 text-gray-400" />
                          <span>{option.estimatedDays}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span>
                            Rs. {Number(option.cost || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4 sm:border-0 sm:pt-0">
                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setOptionToEdit(option);
                          setIsAddEditDialogOpen(true);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                        aria-label={`Edit ${option.name}`}
                        title="Edit option"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOptionToDelete(option);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        aria-label={`Delete ${option.name}`}
                        title="Delete option"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <AddDeliveryOptionDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        optionToEdit={optionToEdit}
        onSuccess={fetchDeliveryOptions}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDeliveryOptionDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        option={optionToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
