"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddressDialog, {
  DeliveryAddress,
} from "@/components/user/AddressDialog";
import ChangePasswordDialog from "@/components/user/ChangePasswordDialog";
import EditProfileDialog, {
  UserProfileData,
} from "@/components/user/EditProfileDialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import { getUserCookie, setUserCookie, getTokenFromCookies, clearCookies } from "@/utils/cookies";
import { useRouter } from "next/navigation";
import {
  Check,
  Edit2,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  AlertTriangle,
  Mail,
  MapPin,
  Phone,
  Plus,
  Shield,
  ShieldCheck,
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
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<DeliveryAddress | null>(
    null,
  );
  const [addressToDelete, setAddressToDelete] =
    useState<DeliveryAddress | null>(null);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);

  const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const router = useRouter();

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
      toast.dismiss();
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
      toast.dismiss();
      toast.error(
        error?.response?.data?.message || "Failed to update default address.",
      );
    }
  };

  const handleConfirmLogoutAll = async () => {
    try {
      setIsLoggingOutAll(true);
      const tokens = await getTokenFromCookies();
      if (tokens?.refreshToken) {
        try {
          await axiosAuthInstance.post("/v1/auth/logout-all", {
            refreshToken: tokens.refreshToken,
          });
        } catch (err) {
          console.error("API logout-all error:", err);
        }
      }
      await clearCookies();
      setShowLogoutAllDialog(false);
      toast.dismiss();
      toast.success("Successfully logged out from all devices");
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out from all devices:", error);
      toast.dismiss();
      toast.error("Failed to log out from all devices");
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name || name === "User") return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const displayName = profile.name || profile.fullName || "User";

  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-8 sm:px-6 lg:px-8 text-slate-900">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
                <Shield className="h-3.5 w-3.5" />
                Account Settings
              </span>
            </div>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Profile & Preferences
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Manage your personal information, security credentials, and
              delivery addresses.
            </p>
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Profile & Security (5 cols) */}
          <div className="space-y-6 lg:col-span-5">
            {/* Profile Overview Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base shadow-sm">
                    {getInitials(displayName)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {displayName}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active Account
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>Edit</span>
                </button>
              </div>

              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                  <span className="text-xs">Loading profile...</span>
                </div>
              ) : (
                <div className="mt-4 space-y-3.5 text-xs">
                  {/* Full Name */}
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50/70 p-3">
                    <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Full Name
                      </p>
                      <p className="mt-0.5 font-semibold text-slate-800 break-words">
                        {displayName}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50/70 p-3">
                    <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Phone Number
                      </p>
                      <p className="mt-0.5 font-semibold text-slate-800">
                        {profile.phoneNumber || profile.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50/70 p-3">
                    <Mail className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Email Address
                      </p>
                      <p className="mt-0.5 font-semibold text-slate-800 break-all">
                        {profile.email || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Security & Password Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Security & Password
                    </h3>
                    <p className="text-xs text-slate-500">
                      Keep your account safe with a strong password.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsPasswordOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition active:scale-[0.98] cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Change Password</span>
                </button>
              </div>
            </div>

            {/* Logout from all devices Card */}
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/30 p-5 shadow-xs sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Device Management
                    </h3>
                    <p className="text-xs text-slate-500">
                      Log out from all active devices and sessions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-rose-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowLogoutAllDialog(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 transition active:scale-[0.98] cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout All Devices</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Delivery Addresses (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">
                        Delivery Addresses
                      </h2>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {addresses.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Manage locations for book shipping and fast checkout.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAddressToEdit(null);
                    setIsAddressOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Address</span>
                </button>
              </div>

              {/* Address List */}
              <div className="mt-5 space-y-3">
                {isLoadingAddresses ? (
                  <div className="flex items-center justify-center py-12 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-xs">Loading addresses...</span>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      No saved addresses yet
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
                      Add your home or office address to ensure quick delivery
                      when ordering books.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setAddressToEdit(null);
                        setIsAddressOpen(true);
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add New Address</span>
                    </button>
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr.id || addr.streetAddress}
                      className={`rounded-2xl border p-4 transition-all ${
                        addr.isDefault
                          ? "border-blue-200 bg-blue-50/20 shadow-xs"
                          : "border-slate-200/80 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                            {addr.district || "Address"}
                          </span>
                          {addr.isDefault && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                              <Check className="h-3 w-3" />
                              Default Address
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setAddressToEdit(addr);
                              setIsAddressOpen(true);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                            title="Edit Address"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          {addr.id && (
                            <button
                              type="button"
                              onClick={() => setAddressToDelete(addr)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                              title="Delete Address"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-slate-900">
                              {addr.streetAddress}
                            </p>
                            {addr.landmark && (
                              <p className="text-slate-500">
                                Landmark: {addr.landmark}
                              </p>
                            )}
                            <p className="text-slate-500">
                              {[addr.city, addr.district, addr.province]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>
                        </div>

                        {addr.phoneNumber && (
                          <div className="flex items-center gap-2 pt-1">
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium text-slate-700">
                              {addr.phoneNumber}
                            </span>
                          </div>
                        )}
                      </div>

                      {!addr.isDefault && addr.id && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleSetDefault(addr.id)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                          >
                            Set as default address
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        profile={profile}
        onSuccess={fetchProfile}
      />

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={isPasswordOpen}
        onOpenChange={setIsPasswordOpen}
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-slate-900">
                  Delete Address
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="text-xs sm:text-sm text-slate-600 my-2 leading-relaxed">
            Are you sure you want to delete the delivery address for{" "}
            <span className="font-semibold text-slate-900">
              {addressToDelete?.streetAddress || "this location"}
            </span>
            {addressToDelete?.city ? `, ${addressToDelete.city}` : ""}?
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <button
              type="button"
              disabled={isDeletingAddress}
              onClick={() => setAddressToDelete(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeletingAddress}
              onClick={handleConfirmDeleteAddress}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer transition shadow-2xs"
            >
              {isDeletingAddress ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Address</span>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout All Devices Confirmation Dialog */}
      <Dialog open={showLogoutAllDialog} onOpenChange={setShowLogoutAllDialog}>
        <DialogContent className="sm:max-w-md bg-[#0c193c] text-white border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <AlertTriangle className="h-6 w-6 stroke-[2]" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-white">
              Confirm Logout All Devices
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-400 leading-relaxed">
              Are you sure you want to log out from all devices? This will invalidate all your active sessions everywhere.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-slate-800/60 mt-4">
            <button
              type="button"
              disabled={isLoggingOutAll}
              onClick={() => setShowLogoutAllDialog(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isLoggingOutAll}
              onClick={handleConfirmLogoutAll}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoggingOutAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>Yes, Log out everywhere</span>
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
