"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import { setUserCookie } from "@/utils/cookies";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export interface UserProfileData {
  name?: string;
  fullName?: string;
  phoneNumber?: string;
  phone?: string;
  email?: string;
  [key: string]: any;
}

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfileData;
  onSuccess: () => void;
}

export default function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSuccess,
}: EditProfileDialogProps) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(profile.name || profile.fullName || "");
      setPhoneNumber(profile.phoneNumber || profile.phone || "");
      setEmail(profile.email || "");
    }
  }, [open, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    const payload = {
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
    };

    setIsSubmitting(true);
    try {
      let res;
      try {
        res = await axiosAuthInstance.patch("/v1/auth/profile", payload);
      } catch (patchErr: any) {
        if (patchErr?.response?.status === 405) {
          // Fallback to PUT if PATCH method is not allowed
          res = await axiosAuthInstance.put("/v1/auth/profile", payload);
        } else {
          throw patchErr;
        }
      }

      const updatedData = res?.data?.data || res?.data || payload;
      const mergedProfile = {
        ...profile,
        ...updatedData,
        name: payload.name,
        fullName: payload.name,
        phoneNumber: payload.phoneNumber,
        phone: payload.phoneNumber,
      };

      localStorage.setItem("nepsole_user_profile", JSON.stringify(mergedProfile));
      await setUserCookie(mergedProfile);

      toast.success("Profile updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to update profile. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white p-6 rounded-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-600 focus:outline-none"
              placeholder="Ram Sharma"
            />
          </div>

          {/* Phone Number Field */}
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

          {/* Email Field (Read Only) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <span className="text-xs text-gray-400">Cannot be changed</span>
            </div>
            <input
              type="email"
              disabled
              value={email}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
              placeholder="johndoe@example.com"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
