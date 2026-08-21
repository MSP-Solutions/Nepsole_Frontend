"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import React, { useState } from "react";

export interface PublisherData {
  id?: number;
  name: string;
  about?: string;
  establishedYear?: number | null;
  address?: string;
  phoneNumbers?: string[];
  email?: string;
  websiteUrl?: string;
  publicationLogoUrl?: string | null;
  booksPublished?: number;
  authorsCount?: number;
  booksSold?: number;
  yearsOfPublishing?: number | null;
}

interface AddPublishersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPublisher?: (publisher: PublisherData) => void;
}

export const AddPublishersDialog: React.FC<AddPublishersDialogProps> = ({
  open,
  onOpenChange,
  onAddPublisher,
}) => {
  const initialFormData = {
    name: "",
    about: "",
    establishedYear: "",
    address: "",
    phoneNumbers: "",
    email: "",
    websiteUrl: "",
    publicationLogoUrl: null as string | null,
    booksPublished: "",
    authorsCount: "",
    booksSold: "",
    yearsOfPublishing: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData((prev) => ({ ...prev, publicationLogoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const phoneNumbersArray = formData.phoneNumbers
      ? formData.phoneNumbers
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      : [];

    const newPublisher: PublisherData = {
      id: Date.now(),
      name: formData.name,
      about: formData.about || undefined,
      establishedYear: formData.establishedYear
        ? Number(formData.establishedYear)
        : null,
      address: formData.address || undefined,
      phoneNumbers: phoneNumbersArray,
      email: formData.email || undefined,
      websiteUrl: formData.websiteUrl || undefined,
      publicationLogoUrl: formData.publicationLogoUrl,
      booksPublished: Number(formData.booksPublished) || 0,
      authorsCount: Number(formData.authorsCount) || 0,
      booksSold: Number(formData.booksSold) || 0,
      yearsOfPublishing: formData.yearsOfPublishing
        ? Number(formData.yearsOfPublishing)
        : null,
    };

    if (onAddPublisher) {
      onAddPublisher(newPublisher);
    }

    setFormData(initialFormData);
    setLogoPreview(null);
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setLogoPreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[100vw] md:max-w-4xl  max-h-[90vh] flex flex-col p-0 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
          <div>
            <DialogTitle className="text-base sm:text-lg font-semibold text-slate-900">
              Add New Publisher
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-0.5">
              Enter details to register a new publishing house.
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="add-publisher-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-800"
        >
          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              General Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              {/* Publication Logo Uploader */}
              <div className="md:col-span-1 flex flex-col items-center justify-center p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition relative group cursor-pointer text-center min-h-[140px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="publicationLogoInput"
                />
                {logoPreview ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-white p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoPreview}
                      alt="Publication Logo Preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[10px] font-medium">
                      Change
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-1.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-medium text-slate-700">
                      Upload Logo
                    </p>
                    <p className="text-[10px] text-slate-400">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                )}
              </div>

              {/* Form Inputs */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Publisher Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label
                    htmlFor="publisher-name"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Publisher Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="publisher-name"
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Sajha Prakashan"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Established Year */}
                <div className="space-y-1">
                  <label
                    htmlFor="publisher-established-year"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Established Year
                  </label>
                  <input
                    id="publisher-established-year"
                    type="number"
                    name="establishedYear"
                    placeholder="e.g. 1964"
                    value={formData.establishedYear}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label
                    htmlFor="publisher-address"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Address / Location
                  </label>
                  <input
                    id="publisher-address"
                    type="text"
                    name="address"
                    placeholder="e.g. Kathmandu, Nepal"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Email */}
              <div className="space-y-1">
                <label
                  htmlFor="publisher-email"
                  className="block text-xs font-medium text-slate-700"
                >
                  Email Address
                </label>
                <input
                  id="publisher-email"
                  type="email"
                  name="email"
                  placeholder="e.g. contact@publisher.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Website URL */}
              <div className="space-y-1">
                <label
                  htmlFor="publisher-website-url"
                  className="block text-xs font-medium text-slate-700"
                >
                  Website URL
                </label>
                <input
                  id="publisher-website-url"
                  type="url"
                  name="websiteUrl"
                  placeholder="https://publisher.com"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Phone Numbers */}
              <div className="sm:col-span-2 space-y-1">
                <label
                  htmlFor="publisher-phone-numbers"
                  className="block text-xs font-medium text-slate-700"
                >
                  Phone Numbers{" "}
                  <span className="text-slate-400 font-normal">
                    (comma-separated)
                  </span>
                </label>
                <input
                  id="publisher-phone-numbers"
                  type="text"
                  name="phoneNumbers"
                  placeholder="e.g. +977 1-4222080, +977 9801234567"
                  value={formData.phoneNumbers}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Publishing Statistics */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Publishing Statistics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="space-y-1">
                <label
                  htmlFor="publisher-books-published"
                  className="block text-xs font-medium text-slate-700"
                >
                  Books Published
                </label>
                <input
                  id="publisher-books-published"
                  type="number"
                  name="booksPublished"
                  min="0"
                  placeholder="e.g. 1240"
                  value={formData.booksPublished}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="publisher-authors-count"
                  className="block text-xs font-medium text-slate-700"
                >
                  Authors Count
                </label>
                <input
                  id="publisher-authors-count"
                  type="number"
                  name="authorsCount"
                  min="0"
                  placeholder="e.g. 45"
                  value={formData.authorsCount}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="publisher-books-sold"
                  className="block text-xs font-medium text-slate-700"
                >
                  Books Sold
                </label>
                <input
                  id="publisher-books-sold"
                  type="number"
                  name="booksSold"
                  min="0"
                  placeholder="e.g. 50000"
                  value={formData.booksSold}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="publisher-years-of-publishing"
                  className="block text-xs font-medium text-slate-700"
                >
                  Years of Publishing
                </label>
                <input
                  id="publisher-years-of-publishing"
                  type="number"
                  name="yearsOfPublishing"
                  min="0"
                  placeholder="e.g. 60"
                  value={formData.yearsOfPublishing}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* About / Summary */}
          <div className="space-y-1">
            <label
              htmlFor="publisher-about"
              className="block text-xs font-medium text-slate-700"
            >
              About Publisher
            </label>
            <textarea
              id="publisher-about"
              name="about"
              rows={4}
              placeholder="Write a summary of the publisher's history, catalog focus, and achievements..."
              value={formData.about}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-publisher-form"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            Save Publisher
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPublishersDialog;
