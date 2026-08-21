"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import React, { useState } from "react";

export interface AuthorData {
  id?: number;
  name: string;
  englishName?: string;
  position?: string;
  nationality: string;
  languages: string;
  genre: string;
  website: string;
  socialMedia: {
    twitter: string;
    facebook: string;
    instagram: string;
    linkedin: string;
  };
  booksPublished: number | string;
  yearsOfWriting: number | string;
  booksSold: string;
  happyReaders: string;
  bio: string;
  profileImage: string | null;
  books?: number;
  followers?: string;
  awards?: string[];
  status?: string;
  initials?: string;
  avatarBg?: string;
}

interface AddAuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAuthor?: (author: AuthorData) => void;
}

export const AddAuthorDialog: React.FC<AddAuthorDialogProps> = ({
  open,
  onOpenChange,
  onAddAuthor,
}) => {
  const initialFormData: AuthorData = {
    name: "",
    position: "",
    nationality: "",
    languages: "",
    genre: "",
    website: "",
    socialMedia: {
      twitter: "",
      facebook: "",
      instagram: "",
      linkedin: "",
    },
    booksPublished: "",
    yearsOfWriting: "",
    booksSold: "",
    happyReaders: "",
    bio: "",
    profileImage: null,
  };

  const [formData, setFormData] = useState<AuthorData>(initialFormData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("social_")) {
      const platform = name.replace(
        "social_",
        "",
      ) as keyof AuthorData["socialMedia"];
      setFormData((prev) => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [platform]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const initials = formData.name
      ? formData.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "AU";

    const newAuthor: AuthorData = {
      ...formData,
      id: Date.now(),
      englishName: formData.name,
      books: Number(formData.booksPublished) || 0,
      followers: formData.happyReaders || "0",
      awards: [],
      status: "Active",
      initials,
      avatarBg: "bg-indigo-600 text-white",
    };

    if (onAddAuthor) {
      onAddAuthor(newAuthor);
    }

    setFormData(initialFormData);
    setImagePreview(null);
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setImagePreview(null);
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
              Add New Author
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-0.5">
              Enter details to add a new author to the system.
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
          id="add-author-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-800"
        >
          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              General Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              {/* Profile Image Uploader */}
              <div className="md:col-span-1 flex flex-col items-center justify-center p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition relative group cursor-pointer text-center min-h-[140px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="profileImageInput"
                />
                {imagePreview ? (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
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
                      Upload Photo
                    </p>
                    <p className="text-[10px] text-slate-400">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                )}
              </div>

              {/* Form Inputs */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Author Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label
                    htmlFor="author-name"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Author Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="author-name"
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Laxmi Prasad Devkota"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Position / Designation */}
                <div className="space-y-1">
                  <label
                    htmlFor="author-position"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Position / Designation
                  </label>
                  <input
                    id="author-position"
                    type="text"
                    name="position"
                    placeholder="e.g. Senior Author, Guest Writer"
                    value={formData.position || ""}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Genre */}
                <div className="space-y-1">
                  <label
                    htmlFor="author-genre"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Genre / Field <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="author-genre"
                    type="text"
                    name="genre"
                    required
                    placeholder="e.g. Poetry, Fiction, Self Help"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Nationality */}
                <div className="space-y-1">
                  <label
                    htmlFor="author-nationality"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="author-nationality"
                    type="text"
                    name="nationality"
                    required
                    placeholder="e.g. Nepali, American"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Languages */}
                <div className="space-y-1">
                  <label
                    htmlFor="author-languages"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Languages
                  </label>
                  <input
                    id="author-languages"
                    type="text"
                    name="languages"
                    placeholder="e.g. Nepali, English, Hindi"
                    value={formData.languages}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Statistics */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Writing & Publishing Statistics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="space-y-1">
                <label
                  htmlFor="author-books-published"
                  className="block text-xs font-medium text-slate-700"
                >
                  Books Published
                </label>
                <input
                  id="author-books-published"
                  type="number"
                  name="booksPublished"
                  min="0"
                  placeholder="e.g. 12"
                  value={formData.booksPublished}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="author-years-of-writing"
                  className="block text-xs font-medium text-slate-700"
                >
                  Years of Writing
                </label>
                <input
                  id="author-years-of-writing"
                  type="number"
                  name="yearsOfWriting"
                  min="0"
                  placeholder="e.g. 15"
                  value={formData.yearsOfWriting}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="author-books-sold"
                  className="block text-xs font-medium text-slate-700"
                >
                  Books Sold
                </label>
                <input
                  id="author-books-sold"
                  type="text"
                  name="booksSold"
                  placeholder="e.g. 50K+"
                  value={formData.booksSold}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="author-happy-readers"
                  className="block text-xs font-medium text-slate-700"
                >
                  Happy Readers
                </label>
                <input
                  id="author-happy-readers"
                  type="text"
                  name="happyReaders"
                  placeholder="e.g. 100K+"
                  value={formData.happyReaders}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Social Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Website & Social Media
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2 space-y-1">
                <label
                  htmlFor="author-website"
                  className="block text-xs font-medium text-slate-700"
                >
                  Official Website
                </label>
                <input
                  id="author-website"
                  type="url"
                  name="website"
                  placeholder="https://authorwebsite.com"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="social-twitter"
                  className="block text-xs font-medium text-slate-700"
                >
                  Twitter / X
                </label>
                <input
                  id="social-twitter"
                  type="text"
                  name="social_twitter"
                  placeholder="https://x.com/username"
                  value={formData.socialMedia.twitter}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="social-facebook"
                  className="block text-xs font-medium text-slate-700"
                >
                  Facebook
                </label>
                <input
                  id="social-facebook"
                  type="text"
                  name="social_facebook"
                  placeholder="https://facebook.com/username"
                  value={formData.socialMedia.facebook}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="social-instagram"
                  className="block text-xs font-medium text-slate-700"
                >
                  Instagram
                </label>
                <input
                  id="social-instagram"
                  type="text"
                  name="social_instagram"
                  placeholder="https://instagram.com/username"
                  value={formData.socialMedia.instagram}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="social-linkedin"
                  className="block text-xs font-medium text-slate-700"
                >
                  LinkedIn
                </label>
                <input
                  id="social-linkedin"
                  type="text"
                  name="social_linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.socialMedia.linkedin}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Biography */}
          <div className="space-y-1">
            <label
              htmlFor="author-bio"
              className="block text-xs font-medium text-slate-700"
            >
              Biography / Summary
            </label>
            <textarea
              id="author-bio"
              name="bio"
              rows={4}
              placeholder="Write a concise overview of the author's background, achievements, and prominent works..."
              value={formData.bio}
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
            form="add-author-form"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            Save Author
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAuthorDialog;
