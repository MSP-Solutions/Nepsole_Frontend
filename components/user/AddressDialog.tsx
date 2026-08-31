"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { provinces } from "@/lib/data/data";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface DeliveryAddress {
  id?: string | number;
  district: string;
  phoneNumber: string;
  province: string;
  city: string;
  streetAddress: string;
  landmark?: string;
  isDefault: boolean;
  [key: string]: any;
}

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addressToEdit?: DeliveryAddress | null;
  onSuccess: () => void;
}

export default function AddressDialog({
  open,
  onOpenChange,
  addressToEdit,
  onSuccess,
}: AddressDialogProps) {
  const [district, setDistrict] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [province, setProvince] = useState(
    provinces[0]?.name || "Bagmati Province",
  );
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProvinceData = provinces.find((p) => p.name === province);
  const availableDistricts = selectedProvinceData?.districts || [];

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    const foundProv = provinces.find((p) => p.name === newProvince);
    const isValidDistrict = foundProv?.districts.some(
      (d) => d.name === district,
    );
    if (!isValidDistrict) {
      setDistrict("");
    }
  };

  useEffect(() => {
    if (open) {
      if (addressToEdit) {
        setDistrict(addressToEdit.district || "");
        setPhoneNumber(addressToEdit.phoneNumber || addressToEdit.phone || "");
        setProvince(
          addressToEdit.province || provinces[0]?.name || "Bagmati Province",
        );
        setCity(addressToEdit.city || "");
        setStreetAddress(
          addressToEdit.streetAddress || addressToEdit.street || "",
        );
        setLandmark(addressToEdit.landmark || "");
        setIsDefault(Boolean(addressToEdit.isDefault));
      } else {
        setDistrict("");
        setPhoneNumber("");
        setProvince(provinces[0]?.name || "Bagmati Province");
        setCity("");
        setStreetAddress("");
        setLandmark("");
        setIsDefault(false);
      }
    }
  }, [open, addressToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      toast.error("Please enter phone number");
      return;
    }
    if (!province.trim()) {
      toast.error("Please select province");
      return;
    }
    if (!district.trim()) {
      toast.error("Please enter district");
      return;
    }
    if (!city.trim()) {
      toast.error("Please enter city");
      return;
    }
    if (!streetAddress.trim()) {
      toast.error("Please enter street address");
      return;
    }

    const payload = {
      district: district.trim(),
      phoneNumber: phoneNumber.trim(),
      province: province.trim(),
      city: city.trim(),
      streetAddress: streetAddress.trim(),
      landmark: landmark.trim() || undefined,
      isDefault,
    };

    setIsSubmitting(true);

    try {
      if (addressToEdit?.id) {
        // Update Address
        await axiosAuthInstance.patch(
          `/v1/delivery-addresses/${addressToEdit.id}`,
          payload,
        );
        toast.success("Address updated successfully");
      } else {
        // Create Address
        await axiosAuthInstance.post("/v1/delivery-addresses", payload);
        toast.success("Address added successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to save address:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to save address. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white p-6 rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {addressToEdit ? "Edit Delivery Address" : "Add Delivery Address"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
              placeholder="9841234567"
            />
          </div>

          {/* Province & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province *
              </label>
              <Select
                value={province}
                onValueChange={(val) => val && handleProvinceChange(val)}
              >
                <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((prov) => (
                    <SelectItem key={prov.id} value={prov.name}>
                      {prov.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District *
              </label>
              <Select
                value={district}
                onValueChange={(val) => val && setDistrict(val)}
                disabled={!province || availableDistricts.length === 0}
              >
                <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 disabled:bg-gray-50 disabled:text-gray-400">
                  <SelectValue
                    placeholder={
                      province ? "Select District" : "Select Province first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableDistricts.map((dist) => (
                    <SelectItem key={dist.id} value={dist.name}>
                      {dist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* City & Street Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
                placeholder="Tinkune, Kathmandu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
                placeholder="Putalisadak, Ward 28, House No. 45"
              />
            </div>
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
              placeholder="Near Star Mall"
            />
          </div>

          {/* Default Address Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Set as default delivery address</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : addressToEdit
                  ? "Update Address"
                  : "Save Address"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
