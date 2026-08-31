"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddressDialog, {
  DeliveryAddress,
} from "@/components/user/AddressDialog";
import EditProfileDialog, {
  UserProfileData,
} from "@/components/user/EditProfileDialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import { getUserCookie, setUserCookie } from "@/utils/cookies";
import {
  Check,
  Edit2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const INITIAL_PROFILE: UserProfileData = {
  name: "User",
  fullName: "User",
  phoneNumber: "",
  phone: "",
  email: "",
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfileData>(INITIAL_PROFILE);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Dialog States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<DeliveryAddress | null>(
    null,
  );
  const [addressToDelete, setAddressToDelete] =
    useState<DeliveryAddress | null>(null);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);

  // Fetch Profile from /v1/auth/profile
  const fetchProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const res = await axiosAuthInstance.get("/v1/auth/profile");
      const data = res.data?.data || res.data;
      if (data) {
        const formatted: UserProfileData = {
          name: data.name || data.fullName || "",
          fullName: data.name || data.fullName || "",
          phoneNumber: data.phoneNumber || data.phone || "",
          phone: data.phoneNumber || data.phone || "",
          email: data.email || "",
        };
        setProfile(formatted);
        localStorage.setItem("nepsole_user_profile", JSON.stringify(formatted));
        await setUserCookie(formatted);
      }
    } catch (err: any) {
      console.error("Failed to fetch profile:", err);
      const savedProfile = localStorage.getItem("nepsole_user_profile");
      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
        } catch {}
      } else {
        const cookieUser = await getUserCookie();
        if (cookieUser) {
          setProfile({
            name: cookieUser.name || cookieUser.fullName || "User",
            fullName: cookieUser.fullName || cookieUser.name || "User",
            phoneNumber: cookieUser.phoneNumber || cookieUser.phone || "",
            phone: cookieUser.phoneNumber || cookieUser.phone || "",
            email: cookieUser.email || "",
          });
        }
      }
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  // Fetch Delivery Addresses from API
  const fetchAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    try {
      const res = await axiosAuthInstance.get("/v1/delivery-addresses");
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];
      setAddresses(list);
    } catch (err: any) {
      console.error("Failed to fetch delivery addresses:", err);
      const cached = localStorage.getItem("nepsole_user_addresses");
      if (cached) {
        try {
          setAddresses(JSON.parse(cached));
        } catch {}
      }
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);

  // Load profile data and addresses
  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, [fetchProfile, fetchAddresses]);

  // Confirm Delete Address via Dialog
  const handleConfirmDeleteAddress = async () => {
    if (!addressToDelete?.id) return;
    setIsDeletingAddress(true);

    try {
      await axiosAuthInstance.delete(
        `/v1/delivery-addresses/${addressToDelete.id}`,
      );
      toast.success("Address deleted successfully");
      setAddressToDelete(null);
      fetchAddresses();
    } catch (error: any) {
      console.error("Failed to delete address:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete address.",
      );
    } finally {
      setIsDeletingAddress(false);
    }
  };

  // Set default address via API: /v1/delivery-addresses/id/default
  const handleSetDefault = async (id?: string | number) => {
    if (!id) return;
    try {
      await axiosAuthInstance.patch(`/v1/delivery-addresses/${id}/default`);
      toast.success("Default delivery address updated");
      fetchAddresses();
    } catch (error: any) {
      console.error("Failed to set default address:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update default address.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Profile & Address
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your personal information and delivery addresses.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Profile Details */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 flex flex-col justify-between">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                    <User className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Profile Details
                    </h2>
                    <p className="text-sm text-gray-500">
                      Your personal information
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-10 text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm">Loading profile...</span>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Full Name */}
                  <div className="flex items-start gap-3">
                    <User className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Full Name
                      </p>
                      <p className="mt-1 break-words text-sm font-medium text-gray-900">
                        {profile.name || profile.fullName || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Phone Number
                      </p>
                      <p className="mt-1 break-words text-sm font-medium text-gray-900">
                        {profile.phoneNumber || profile.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Email Address
                      </p>
                      <p className="mt-1 break-all text-sm font-medium text-gray-900">
                        {profile.email || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Delivery Addresses Section */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                  <MapPin className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Delivery Addresses
                  </h2>
                  <p className="text-sm text-gray-500">
                    Your saved delivery locations
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setAddressToEdit(null);
                  setIsAddressOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Address</span>
              </button>
            </div>

            {/* Address List */}
            <div className="space-y-4">
              {isLoadingAddresses ? (
                <div className="flex items-center justify-center py-10 text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm">Loading addresses...</span>
                </div>
              ) : addresses.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500 border border-dashed rounded-xl">
                  No saved addresses yet. Click &quot;Add Address&quot; to save
                  one.
                </div>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr.id || addr.streetAddress}
                    className={`rounded-xl border p-4 space-y-3 transition ${
                      addr.isDefault
                        ? "border-blue-200 bg-blue-50/30"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {addr.district || "Address"}
                        </span>
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                            <Check className="h-3 w-3" />
                            Default
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setAddressToEdit(addr);
                            setIsAddressOpen(true);
                          }}
                          className="text-gray-400 hover:text-blue-600 p-1 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {addr.id && (
                          <button
                            onClick={() => setAddressToDelete(addr)}
                            className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-sm text-gray-600">
                      {addr.phoneNumber && (
                        <div className="flex items-center gap-2 text-xs text-gray-700">
                          <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>{addr.phoneNumber}</span>
                        </div>
                      )}

                      <div className="flex items-start gap-2 text-xs">
                        <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-gray-800 font-medium">
                            {addr.streetAddress}
                          </p>
                          {addr.landmark && (
                            <p className="text-gray-500">
                              Landmark: {addr.landmark}
                            </p>
                          )}
                          <p className="text-gray-500">
                            {addr.city}, {addr.district}, {addr.province}
                          </p>
                        </div>
                      </div>
                    </div>

                    {!addr.isDefault && addr.id && (
                      <div className="pt-2 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-xs font-medium text-blue-600 hover:underline cursor-pointer"
                        >
                          Set as default address
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        profile={profile}
        onSuccess={fetchProfile}
      />

      {/* Add/Edit Address Dialog */}
      <AddressDialog
        open={isAddressOpen}
        onOpenChange={setIsAddressOpen}
        addressToEdit={addressToEdit}
        onSuccess={fetchAddresses}
      />

      {/* Delete Address Confirmation Dialog */}
      <Dialog
        open={!!addressToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeletingAddress) {
            setAddressToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white p-6 rounded-2xl shadow-xl">
          <DialogHeader className="mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-gray-900">
                  Delete Address
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="text-sm text-gray-600 my-2">
            Are you sure you want to delete the delivery address for{" "}
            <span className="font-semibold text-gray-900">
              {addressToDelete?.streetAddress || "this location"}
            </span>
            {addressToDelete?.city ? `, ${addressToDelete.city}` : ""}?
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={isDeletingAddress}
              onClick={() => setAddressToDelete(null)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeletingAddress}
              onClick={handleConfirmDeleteAddress}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {isDeletingAddress ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Address</span>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
