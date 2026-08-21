"use client";

import AddPublishersDialog from "@/components/admin/AddPublishersDialog";
import { BookOpenIcon, Edit2Icon, MapPinIcon, Plus, Trash2Icon } from "lucide-react";
import { useState } from "react";

const publishers = [
  {
    initials: "SP",
    name: "Sajha Prakashan",
    nepali: "साझा प्रकाशन",
    location: "Kathmandu, Nepal",
    year: "1964",
    books: "1,240",
    categories: ["Literature", "Poetry", "Drama"],
    featured: true,
    type: "orange",
  },
  {
    initials: "FP",
    name: "Fine Print",
    nepali: "फाइन प्रिन्ट",
    location: "Lalitpur, Nepal",
    year: "1998",
    books: "430",
    categories: ["Fiction", "Non-Fiction", "Education"],
    featured: true,
    type: "purple",
  },
  {
    initials: "RPB",
    name: "Ratna Pustak Bhandar",
    nepali: "रत्न पुस्तक भण्डार",
    location: "Kathmandu, Nepal",
    year: "1952",
    books: "860",
    categories: ["Textbooks", "Reference", "Religion"],
    type: "blue",
  },
  {
    initials: "PB",
    name: "Penguin Books",
    location: "London, UK",
    year: "1935",
    books: "15,000",
    categories: ["Fiction", "Self Help", "Biography"],
    featured: true,
    type: "rose",
  },
  {
    initials: "EB",
    name: "Ekta Books",
    nepali: "एकता बुक्स",
    location: "Kathmandu, Nepal",
    year: "2001",
    books: "380",
    categories: ["Children", "Fiction", "Education"],
    type: "green",
  },
  {
    initials: "HC",
    name: "HarperCollins",
    location: "New York, USA",
    year: "1817",
    books: "25,000",
    categories: ["Fiction", "Non-Fiction", "Science"],
    type: "indigo",
  },
  {
    initials: "NP",
    name: "Nepal Pragya Pratishthan",
    nepali: "नेपाल प्रज्ञा प्रतिष्ठान",
    location: "Kathmandu, Nepal",
    year: "1957",
    books: "560",
    categories: ["Research", "Language", "Culture"],
    type: "amber",
  },
  {
    initials: "MP",
    name: "Mandala Publications",
    nepali: "मण्डला पब्लिकेसन्स",
    location: "Kathmandu, Nepal",
    year: "2003",
    books: "290",
    categories: ["Travel", "Art", "Culture"],
    type: "cyan",
  },
];

const avatarStyles = {
  orange: "bg-orange-50 text-orange-600 ring-orange-100",
  purple: "bg-violet-50 text-violet-600 ring-violet-100",
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100",
  green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  cyan: "bg-cyan-50 text-cyan-600 ring-cyan-100",
};

export default function Page() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <div className="mb-5 sm:mb-6 lg:mb-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                Publishers
              </h1>

              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
                Manage and view all registered publishers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAddDialogOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Publisher</span>
              </button>
              <AddPublishersDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
              />
            </div>
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm md:block">
          {/* Table Header */}
          <div
            className="
              grid
              grid-cols-[minmax(0,1fr)_140px_90px]
              items-center
              border-b border-slate-100
              bg-slate-50/70
              px-5 py-3
              lg:grid-cols-[minmax(0,1fr)_170px_100px]
              lg:px-6
            "
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Publisher
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Collection
            </span>

            <span className="text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Actions
            </span>
          </div>

          {/* Rows */}
          {publishers.map((publisher) => (
            <div
              key={publisher.name}
              className="
                group grid grid-cols-[minmax(0,1fr)_140px_90px]
                items-center
                border-b border-slate-100
                px-5 py-4
                transition-colors duration-200
                last:border-0
                hover:bg-slate-50/70
                lg:grid-cols-[minmax(0,1fr)_170px_100px]
                lg:px-6
                lg:py-4
              "
            >
              {/* Publisher */}
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h2 className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
                      {publisher.name}
                    </h2>

                    {publisher.featured && (
                      <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[8px] font-semibold text-indigo-600 sm:text-[9px]">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex min-w-0 items-center gap-1 text-[9px] text-slate-400 sm:gap-1.5 sm:text-[11px]">
                    <MapPinIcon className="h-3 w-3 shrink-0" />

                    <span className="truncate">{publisher.location}</span>

                    <span className="hidden text-slate-300 sm:inline">•</span>

                    <span className="hidden shrink-0 sm:inline">
                      Est. {publisher.year}
                    </span>
                  </div>

                  {/* Categories */}
                  <div className="mt-2 hidden flex-wrap gap-1 sm:flex">
                    {publisher.categories.map((category) => (
                      <span
                        key={category}
                        className="
                          rounded-md
                          border border-slate-100
                          bg-slate-50
                          px-1.5 py-0.5
                          text-[8px]
                          font-medium
                          text-slate-500
                          lg:px-2 lg:py-1 lg:text-[9px]
                        "
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Collection */}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                  <BookOpenIcon className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800 sm:text-sm">
                    {publisher.books}
                  </p>

                  <p className="text-[9px] text-slate-400 sm:text-[10px]">
                    Books
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  aria-label={`Edit ${publisher.name}`}
                  className="
                    flex h-8 w-8 items-center justify-center
                    rounded-lg
                    text-slate-400
                    transition-all
                    hover:bg-indigo-50
                    hover:text-indigo-600
                    active:scale-95
                  "
                >
                  <Edit2Icon className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  aria-label={`Delete ${publisher.name}`}
                  className="
                    flex h-8 w-8 items-center justify-center
                    rounded-lg
                    text-slate-400
                    transition-all
                    hover:bg-red-50
                    hover:text-red-500
                    active:scale-95
                  "
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:hidden">
          {publishers.map((publisher) => (
            <article
              key={publisher.name}
              className="
                overflow-hidden
                rounded-2xl
                border border-slate-200/80
                bg-white
                p-4
                shadow-sm
                transition-all
                duration-200
                hover:border-slate-300
                hover:shadow-md
              "
            >
              {/* Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h2 className="break-words text-sm font-semibold leading-5 text-slate-800">
                        {publisher.name}
                      </h2>

                      {publisher.featured && (
                        <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[8px] font-semibold text-indigo-600">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                      <MapPinIcon className="h-3 w-3 shrink-0" />

                      <span className="truncate">{publisher.location}</span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-semibold text-emerald-600 xs:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>

              {/* Details */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {/* Books */}
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-500">
                      <BookOpenIcon className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">
                        {publisher.books}
                      </p>

                      <p className="text-[9px] text-slate-400">Books</p>
                    </div>
                  </div>
                </div>

                {/* Established */}
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-bold text-slate-800">
                    {publisher.year}
                  </p>

                  <p className="text-[9px] text-slate-400">Established</p>
                </div>
              </div>

              {/* Categories */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {publisher.categories.map((category) => (
                  <span
                    key={category}
                    className="
                      rounded-md
                      border border-slate-100
                      bg-slate-50
                      px-2 py-1
                      text-[9px]
                      font-medium
                      text-slate-500
                    "
                  >
                    {category}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[10px] text-slate-400">Publisher</span>

                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label={`Edit ${publisher.name}`}
                    className="
                      flex h-9 w-9 items-center justify-center
                      rounded-lg
                      text-slate-400
                      transition
                      hover:bg-indigo-50
                      hover:text-indigo-600
                      active:scale-95
                    "
                  >
                    <Edit2Icon className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    aria-label={`Delete ${publisher.name}`}
                    className="
                      flex h-9 w-9 items-center justify-center
                      rounded-lg
                      text-slate-400
                      transition
                      hover:bg-red-50
                      hover:text-red-500
                      active:scale-95
                    "
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
