"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  axiosAuthInstance,
  axiosMultipartInstance,
} from "@/utils/axiosInstances";
import {
  Bookmark,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  FileUp,
  Gift,
  Image as ImageIcon,
  Languages,
  Loader2,
  Lock,
  Plus,
  Save,
  Search,
  Upload,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import TextEditorEdit from "../TextEditor";

export interface OptionItem {
  id: number | string;
  name: string;
  code?: string;
  [key: string]: any;
}

export interface BookImageItem {
  file: File;
  preview: string;
  type: string;
}

export interface ExistingBookImage {
  id?: number | string;
  url: string;
  type: string;
}

export interface EBookFormData {
  id?: number | string;
  title: string;
  plan?: "FREE" | "PAID" | string;
  price: number | string;
  discountPercent?: number | string;
  publicationDate?: string;
  isbn10?: string;
  isbn13?: string;
  pages?: number | string;
  description: string;
  widthCm?: number | string;
  depthCm?: number | string;
  heightCm?: number | string;
  publisherId?: number | string;
  authorIds?: (number | string)[];
  genreIds?: (number | string)[];
  languageIds?: (number | string)[];
  images?: any[];
  bookImages?: any[];
  existingImages?: ExistingBookImage[];
  imagesTypes?: string[];
  soldCount?: number | string;
  pdfUrl?: any;
  coverImageUrl?: string | null;
  [key: string]: any;
}

interface AddEBooksDailogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBook?: (ebook: any) => void;
  onSuccess?: (ebook: any) => void;
  bookToEdit?: EBookFormData | null;
}

const IMAGE_TYPE_OPTIONS = ["COVER", "BACK_COVER", "INSIDE", "PROMO", "OTHER"];

export const AddEBooksDailog: React.FC<AddEBooksDailogProps> = ({
  open,
  onOpenChange,
  onAddBook,
  onSuccess,
  bookToEdit,
}) => {
  const initialFormState = {
    title: "",
    plan: "PAID" as "PAID" | "FREE",
    price: "",
    discountPercent: "0",
    publicationDate: "",
    isbn10: "",
    isbn13: "",
    pages: "",
    description: "",
    publisherId: "" as number | string,
    soldCount: "0",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [selectedAuthors, setSelectedAuthors] = useState<(number | string)[]>(
    [],
  );
  const [selectedGenres, setSelectedGenres] = useState<(number | string)[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<
    (number | string)[]
  >([]);

  // PDF Document File State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState<string>("");

  // Images state
  const [existingImages, setExistingImages] = useState<ExistingBookImage[]>([]);
  const [uploadedImages, setUploadedImages] = useState<BookImageItem[]>([]);

  // Remote dropdown options
  const [publishers, setPublishers] = useState<OptionItem[]>([]);
  const [authors, setAuthors] = useState<OptionItem[]>([]);
  const [genres, setGenres] = useState<OptionItem[]>([]);
  const [languages, setLanguages] = useState<OptionItem[]>([]);

  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown open & search states
  const [publisherOpen, setPublisherOpen] = useState(false);
  const [publisherSearch, setPublisherSearch] = useState("");

  const [authorOpen, setAuthorOpen] = useState(false);
  const [authorSearch, setAuthorSearch] = useState("");

  const [genreOpen, setGenreOpen] = useState(false);
  const [genreSearch, setGenreSearch] = useState("");

  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");

  // Refs for click outside
  const publisherRef = useRef<HTMLDivElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        publisherRef.current &&
        !publisherRef.current.contains(e.target as Node)
      ) {
        setPublisherOpen(false);
      }
      if (authorRef.current && !authorRef.current.contains(e.target as Node)) {
        setAuthorOpen(false);
      }
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setGenreOpen(false);
      }
      if (
        languageRef.current &&
        !languageRef.current.contains(e.target as Node)
      ) {
        setLanguageOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all dropdown options from APIs
  const fetchDropdownData = async () => {
    setIsLoadingOptions(true);
    try {
      const [pubRes, authRes, genRes, langRes] = await Promise.allSettled([
        axiosAuthInstance.get("/v1/publisher"),
        axiosAuthInstance.get("/v1/author"),
        axiosAuthInstance.get("/v1/genre"),
        axiosAuthInstance.get("/v1/language?limit=100"),
      ]);

      if (pubRes.status === "fulfilled") {
        const d = pubRes.value.data;
        const list = Array.isArray(d) ? d : d?.data || d?.publishers || [];
        setPublishers(list);
      }
      if (authRes.status === "fulfilled") {
        const d = authRes.value.data;
        const list = Array.isArray(d) ? d : d?.data || d?.authors || [];
        setAuthors(list);
      }
      if (genRes.status === "fulfilled") {
        const d = genRes.value.data;
        const list = Array.isArray(d) ? d : d?.data || d?.genres || [];
        setGenres(list);
      }
      if (langRes.status === "fulfilled") {
        const d = langRes.value.data;
        const list = Array.isArray(d) ? d : d?.data || d?.languages || [];
        setLanguages(list);
      }
    } catch (err) {
      console.error("Failed to load dropdown options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDropdownData();
      if (bookToEdit) {
        setFormData({
          title: bookToEdit.title || "",
          plan: (bookToEdit.plan?.toUpperCase() === "FREE"
            ? "FREE"
            : "PAID") as "PAID" | "FREE",
          price: bookToEdit.price !== undefined ? String(bookToEdit.price) : "",
          discountPercent:
            bookToEdit.discountPercent !== undefined
              ? String(bookToEdit.discountPercent)
              : "0",

          publicationDate: bookToEdit.publicationDate
            ? bookToEdit.publicationDate.split("T")[0]
            : "",
          isbn10: bookToEdit.isbn10 || "",
          isbn13: bookToEdit.isbn13 || "",
          pages: bookToEdit.pages !== undefined ? String(bookToEdit.pages) : "",
          description: bookToEdit.description || "",
          publisherId: bookToEdit.publisherId || "",
          soldCount:
            bookToEdit.soldCount !== undefined
              ? String(bookToEdit.soldCount)
              : "0",
        });
        setSelectedAuthors(bookToEdit.authorIds || []);
        setSelectedGenres(bookToEdit.genreIds || []);
        setSelectedLanguages(bookToEdit.languageIds || []);

        // Load existing PDF link if available
        setExistingPdfUrl(
          typeof bookToEdit.pdfUrl === "string" ? bookToEdit.pdfUrl : "",
        );
        setPdfFile(null);

        // Load existing images
        const rawImgs =
          bookToEdit.images ||
          bookToEdit.bookImages ||
          bookToEdit.existingImages ||
          [];
        const loadedExisting: ExistingBookImage[] = rawImgs
          .map((img: any, idx: number) => {
            if (typeof img === "string") {
              return { url: img, type: idx === 0 ? "COVER" : "INSIDE" };
            }
            const url = img.url || img.imageUrl || "";
            const type =
              img.imageType || img.type || (idx === 0 ? "COVER" : "INSIDE");
            return url ? { id: img.id, url, type } : null;
          })
          .filter(Boolean) as ExistingBookImage[];

        if (loadedExisting.length === 0 && bookToEdit.coverImageUrl) {
          loadedExisting.push({ url: bookToEdit.coverImageUrl, type: "COVER" });
        }

        setExistingImages(loadedExisting);
        setUploadedImages([]);
      } else {
        resetForm();
      }
    }
  }, [open, bookToEdit]);

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedAuthors([]);
    setSelectedGenres([]);
    setSelectedLanguages([]);
    setPdfFile(null);
    setExistingPdfUrl("");
    setExistingImages([]);
    uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setUploadedImages([]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Image Upload handler for new images
  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if there is already any image marked as COVER
    const hasAnyCover =
      existingImages.some((img) => img.type === "COVER") ||
      uploadedImages.some((img) => img.type === "COVER");

    const newItems: BookImageItem[] = Array.from(files).map((file, idx) => ({
      file,
      preview: URL.createObjectURL(file),
      // Only the first new image can become COVER if no COVER currently exists; all other images default to INSIDE
      type: !hasAnyCover && idx === 0 ? "COVER" : "INSIDE",
    }));

    setUploadedImages((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const handleRemoveUploadedImage = (index: number) => {
    setUploadedImages((prev) => {
      const target = prev[index];
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      const next = prev.filter((_, i) => i !== index);
      // If the removed image was COVER and no other COVER exists in existing images, promote first remaining image
      if (
        target?.type === "COVER" &&
        !existingImages.some((img) => img.type === "COVER") &&
        next.length > 0
      ) {
        next[0].type = "COVER";
      }
      return next;
    });
  };

  const handleUploadedImageTypeChange = (index: number, newType: string) => {
    if (newType === "COVER") {
      // Demote all existing and other uploaded images to INSIDE so only ONE is COVER
      setExistingImages((prev) =>
        prev.map((item) =>
          item.type === "COVER" ? { ...item, type: "INSIDE" } : item,
        ),
      );
      setUploadedImages((prev) =>
        prev.map((item, i) => ({
          ...item,
          type:
            i === index
              ? "COVER"
              : item.type === "COVER"
                ? "INSIDE"
                : item.type,
        })),
      );
    } else {
      setUploadedImages((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, type: newType } : item,
        ),
      );
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => {
      const target = prev[index];
      const next = prev.filter((_, i) => i !== index);
      // If the removed image was COVER, promote first existing or uploaded image to COVER
      if (target?.type === "COVER") {
        if (next.length > 0) {
          next[0].type = "COVER";
        } else if (uploadedImages.length > 0) {
          setUploadedImages((uPrev) =>
            uPrev.map((item, i) =>
              i === 0 ? { ...item, type: "COVER" } : item,
            ),
          );
        }
      }
      return next;
    });
  };

  const handleExistingImageTypeChange = (index: number, newType: string) => {
    if (newType === "COVER") {
      // Demote all uploaded and other existing images to INSIDE so only ONE is COVER
      setUploadedImages((prev) =>
        prev.map((item) =>
          item.type === "COVER" ? { ...item, type: "INSIDE" } : item,
        ),
      );
      setExistingImages((prev) =>
        prev.map((item, i) => ({
          ...item,
          type:
            i === index
              ? "COVER"
              : item.type === "COVER"
                ? "INSIDE"
                : item.type,
        })),
      );
    } else {
      setExistingImages((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, type: newType } : item,
        ),
      );
    }
  };

  // PDF File Upload Handler
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        toast.error("Please upload a valid PDF document.");
        return;
      }
      setPdfFile(file);
    }
    e.target.value = "";
  };

  // Toggles for Multi-Selects
  const toggleSelection = (
    id: number | string,
    current: (number | string)[],
    setter: React.Dispatch<React.SetStateAction<(number | string)[]>>,
  ) => {
    if (current.includes(id)) {
      setter(current.filter((item) => item !== id));
    } else {
      setter([...current, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("E-Book Title is required.");
      return;
    }
    if (
      formData.plan === "PAID" &&
      (!formData.price || Number(formData.price) <= 0)
    ) {
      toast.error("Please provide a valid Price for a Paid E-Book.");
      return;
    }
    if (!formData.publisherId) {
      toast.error("Please select a Publisher.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("plan", formData.plan);
      data.append(
        "price",
        formData.plan === "FREE" ? "0" : String(Number(formData.price) || 0),
      );
      data.append(
        "discountPercent",
        String(Number(formData.discountPercent) || 0),
      );
      data.append("soldCount", String(Number(formData.soldCount) || 0));

      if (formData.publicationDate) {
        data.append("publicationDate", formData.publicationDate);
      }
      if (formData.isbn10.trim()) {
        data.append("isbn10", formData.isbn10.trim());
      }
      if (formData.isbn13.trim()) {
        data.append("isbn13", formData.isbn13.trim());
      }
      if (formData.pages) {
        data.append("pages", String(Number(formData.pages)));
      }
      if (formData.description) {
        data.append("description", formData.description);
      }
      data.append("publisherId", String(Number(formData.publisherId)));
      data.append(
        "authorIds",
        JSON.stringify(selectedAuthors.map((id) => Number(id))),
      );
      data.append(
        "genreIds",
        JSON.stringify(selectedGenres.map((id) => Number(id))),
      );
      data.append(
        "languageIds",
        JSON.stringify(selectedLanguages.map((id) => Number(id))),
      );
      uploadedImages.forEach((imgObj) => {
        data.append("images", imgObj.file);
      });
      if (uploadedImages.length > 0) {
        data.append(
          "imagesTypes",
          JSON.stringify(uploadedImages.map((imgObj) => imgObj.type)),
        );
      }

      // If editing, append existing preserved images
      if (bookToEdit?.id) {
        data.append("existingImages", JSON.stringify(existingImages));
      }

      // Append PDF Document File under the "pdfUrl" key
      if (pdfFile) {
        data.append("pdfUrl", pdfFile);
      }

      let response;
      if (bookToEdit?.id) {
        response = await axiosMultipartInstance.patch(
          `/v1/ebook/${bookToEdit.id}`,
          data,
        );
        toast.success("E-Book updated successfully!");
      } else {
        response = await axiosMultipartInstance.post("/v1/ebook", data);
        toast.success("E-Book created successfully!");
      }

      const resData = response.data?.data || response.data;
      onAddBook?.(resData);
      onSuccess?.(resData);

      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Save eBook error:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save e-book.";
      toast.error(
        typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Filtered dropdown lists
  const filteredPublishers = publishers.filter((p) =>
    (p.name || p.englishName || "")
      .toLowerCase()
      .includes(publisherSearch.toLowerCase()),
  );
  const filteredAuthors = authors.filter((a) =>
    (a.name || a.englishName || "")
      .toLowerCase()
      .includes(authorSearch.toLowerCase()),
  );
  const filteredGenres = genres.filter((g) =>
    (g.name || g.englishName || "")
      .toLowerCase()
      .includes(genreSearch.toLowerCase()),
  );
  const filteredLanguages = languages.filter((l) =>
    (l.name || l.code || "")
      .toLowerCase()
      .includes(languageSearch.toLowerCase()),
  );

  const selectedPublisherObj = publishers.find(
    (p) => String(p.id) === String(formData.publisherId),
  );

  const hasAnyImages = existingImages.length > 0 || uploadedImages.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[98vw] md:max-w-4xl max-h-[92vh] flex flex-col p-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">
                {bookToEdit ? "Edit E-Book" : "Add New E-Book"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Upload PDF document, configure access plan, and enter e-book
                details.
              </DialogDescription>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="add-ebook-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-7 text-slate-800"
        >
          {/* 1. Access Plan & PDF Document Upload */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
              <FileUp className="w-3.5 h-3.5" />
              E-Book Plan & PDF Document
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Access Plan Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Access Plan <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        plan: "FREE",
                        price: "0",
                      }))
                    }
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      formData.plan === "FREE"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Gift className="w-4 h-4 text-emerald-600" />
                    <span>Free Access</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, plan: "PAID" }))
                    }
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      formData.plan === "PAID"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-800 ring-2 ring-indigo-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Lock className="w-4 h-4 text-indigo-600" />
                    <span>Paid Edition</span>
                  </button>
                </div>
              </div>

              {/* PDF Document Upload Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>PDF Document (pdfUrl)</span>
                  {existingPdfUrl && (
                    <a
                      href={existingPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-600 hover:underline font-normal inline-flex items-center gap-1"
                    >
                      <span>View Current PDF</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </label>

                <div className="relative">
                  <input
                    type="file"
                    id="ebook-pdf-input"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfFileChange}
                    className="hidden"
                  />

                  {pdfFile ? (
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-indigo-300 bg-indigo-50/60 text-xs text-indigo-900">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="truncate font-semibold">
                          {pdfFile.name}
                        </span>
                        <span className="text-[10px] text-indigo-500 shrink-0">
                          ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPdfFile(null)}
                        className="p-1 rounded-lg text-indigo-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Remove PDF"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="ebook-pdf-input"
                      className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-400 text-xs font-semibold text-slate-600 transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-indigo-600" />
                      <span>
                        {existingPdfUrl
                          ? "Replace PDF Document"
                          : "Upload PDF Document (.pdf)"}
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* 2. General Information & Dropdowns */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              General Information & Dropdowns
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  E-Book Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Good Boyes"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                />
              </div>

              {/* Publisher Dropdown (/v1/publisher) */}
              <div className="space-y-1.5 relative" ref={publisherRef}>
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Publisher <span className="text-red-500">*</span>
                </label>

                <div
                  onClick={() => setPublisherOpen(!publisherOpen)}
                  className={`w-full flex items-center justify-between rounded-lg border px-3.5 py-2 text-sm cursor-pointer bg-white transition shadow-sm ${
                    publisherOpen
                      ? "border-indigo-500 ring-1 ring-indigo-500"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <span
                    className={`truncate ${
                      selectedPublisherObj
                        ? "text-slate-900 font-medium"
                        : "text-slate-400"
                    }`}
                  >
                    {selectedPublisherObj
                      ? selectedPublisherObj.name ||
                        selectedPublisherObj.englishName
                      : "Select a publisher..."}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </div>

                {publisherOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-2 pb-2">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search publisher..."
                        value={publisherSearch}
                        onChange={(e) => setPublisherSearch(e.target.value)}
                        className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto mt-1 space-y-0.5">
                      {isLoadingOptions ? (
                        <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                          Loading publishers...
                        </div>
                      ) : filteredPublishers.length === 0 ? (
                        <div className="py-3 text-center text-xs text-slate-400">
                          No publisher found
                        </div>
                      ) : (
                        filteredPublishers.map((pub) => {
                          const isSelected =
                            String(formData.publisherId) === String(pub.id);
                          return (
                            <div
                              key={pub.id}
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  publisherId: pub.id,
                                }));
                                setPublisherOpen(false);
                                setPublisherSearch("");
                              }}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition ${
                                isSelected
                                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span className="truncate">
                                {pub.name || pub.englishName}
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-indigo-600" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Authors Dropdown (/v1/author) */}
              <div className="space-y-1.5 relative" ref={authorRef}>
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Author(s)
                </label>

                <div
                  onClick={() => setAuthorOpen(!authorOpen)}
                  className={`w-full min-h-[38px] flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm cursor-pointer bg-white transition shadow-sm ${
                    authorOpen
                      ? "border-indigo-500 ring-1 ring-indigo-500"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <div className="flex flex-wrap gap-1 flex-1">
                    {selectedAuthors.length === 0 ? (
                      <span className="text-slate-400 text-sm">
                        Select authors...
                      </span>
                    ) : (
                      selectedAuthors.map((authId) => {
                        const authorObj = authors.find(
                          (a) => String(a.id) === String(authId),
                        );
                        return (
                          <span
                            key={authId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100"
                          >
                            {authorObj
                              ? authorObj.name || authorObj.englishName
                              : `Author #${authId}`}
                            <span
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelection(
                                  authId,
                                  selectedAuthors,
                                  setSelectedAuthors,
                                );
                              }}
                              className="hover:text-indigo-900 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </span>
                          </span>
                        );
                      })
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </div>

                {authorOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-2 pb-2">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search author..."
                        value={authorSearch}
                        onChange={(e) => setAuthorSearch(e.target.value)}
                        className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto mt-1 space-y-0.5">
                      {isLoadingOptions ? (
                        <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                          Loading authors...
                        </div>
                      ) : filteredAuthors.length === 0 ? (
                        <div className="py-3 text-center text-xs text-slate-400">
                          No authors found
                        </div>
                      ) : (
                        filteredAuthors.map((auth) => {
                          const isSelected = selectedAuthors.includes(auth.id);
                          return (
                            <div
                              key={auth.id}
                              onClick={() =>
                                toggleSelection(
                                  auth.id,
                                  selectedAuthors,
                                  setSelectedAuthors,
                                )
                              }
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition ${
                                isSelected
                                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span className="truncate">
                                {auth.name || auth.englishName}
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-indigo-600" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Genres Dropdown (/v1/genre) */}
              <div className="space-y-1.5 relative" ref={genreRef}>
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                  Genres / Categories
                </label>

                <div
                  onClick={() => setGenreOpen(!genreOpen)}
                  className={`w-full min-h-[38px] flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm cursor-pointer bg-white transition shadow-sm ${
                    genreOpen
                      ? "border-indigo-500 ring-1 ring-indigo-500"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <div className="flex flex-wrap gap-1 flex-1">
                    {selectedGenres.length === 0 ? (
                      <span className="text-slate-400 text-sm">
                        Select genres...
                      </span>
                    ) : (
                      selectedGenres.map((genId) => {
                        const genreObj = genres.find(
                          (g) => String(g.id) === String(genId),
                        );
                        return (
                          <span
                            key={genId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100"
                          >
                            {genreObj
                              ? genreObj.name || genreObj.englishName
                              : `Genre #${genId}`}
                            <span
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelection(
                                  genId,
                                  selectedGenres,
                                  setSelectedGenres,
                                );
                              }}
                              className="hover:text-emerald-900 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </span>
                          </span>
                        );
                      })
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </div>

                {genreOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-2 pb-2">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search genre..."
                        value={genreSearch}
                        onChange={(e) => setGenreSearch(e.target.value)}
                        className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto mt-1 space-y-0.5">
                      {isLoadingOptions ? (
                        <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                          Loading genres...
                        </div>
                      ) : filteredGenres.length === 0 ? (
                        <div className="py-3 text-center text-xs text-slate-400">
                          No genres found
                        </div>
                      ) : (
                        filteredGenres.map((gen) => {
                          const isSelected = selectedGenres.includes(gen.id);
                          return (
                            <div
                              key={gen.id}
                              onClick={() =>
                                toggleSelection(
                                  gen.id,
                                  selectedGenres,
                                  setSelectedGenres,
                                )
                              }
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition ${
                                isSelected
                                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span className="truncate">
                                {gen.name || gen.englishName}
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Languages Dropdown (/v1/language) */}
              <div className="space-y-1.5 relative" ref={languageRef}>
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-slate-400" />
                  Language(s)
                </label>

                <div
                  onClick={() => setLanguageOpen(!languageOpen)}
                  className={`w-full min-h-[38px] flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm cursor-pointer bg-white transition shadow-sm ${
                    languageOpen
                      ? "border-indigo-500 ring-1 ring-indigo-500"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <div className="flex flex-wrap gap-1 flex-1">
                    {selectedLanguages.length === 0 ? (
                      <span className="text-slate-400 text-sm">
                        Select languages...
                      </span>
                    ) : (
                      selectedLanguages.map((langId) => {
                        const langObj = languages.find(
                          (l) => String(l.id) === String(langId),
                        );
                        return (
                          <span
                            key={langId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 text-sky-700 text-xs font-medium border border-sky-100"
                          >
                            {langObj ? langObj.name : `Lang #${langId}`}
                            <span
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelection(
                                  langId,
                                  selectedLanguages,
                                  setSelectedLanguages,
                                );
                              }}
                              className="hover:text-sky-900 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </span>
                          </span>
                        );
                      })
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </div>

                {languageOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-2 pb-2">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search language..."
                        value={languageSearch}
                        onChange={(e) => setLanguageSearch(e.target.value)}
                        className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto mt-1 space-y-0.5">
                      {isLoadingOptions ? (
                        <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                          Loading languages...
                        </div>
                      ) : filteredLanguages.length === 0 ? (
                        <div className="py-3 text-center text-xs text-slate-400">
                          No languages found
                        </div>
                      ) : (
                        filteredLanguages.map((lang) => {
                          const isSelected = selectedLanguages.includes(
                            lang.id,
                          );
                          return (
                            <div
                              key={lang.id}
                              onClick={() =>
                                toggleSelection(
                                  lang.id,
                                  selectedLanguages,
                                  setSelectedLanguages,
                                )
                              }
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition ${
                                isSelected
                                  ? "bg-sky-50 text-sky-700 font-semibold"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span className="truncate">
                                {lang.name} {lang.code ? `(${lang.code})` : ""}
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-sky-600" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* 3. Pricing & Sales */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Pricing & Sales
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Price */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Price (Rs.){" "}
                  {formData.plan === "PAID" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  disabled={formData.plan === "FREE"}
                  placeholder={
                    formData.plan === "FREE" ? "0 (Free)" : "e.g. 1200"
                  }
                  value={formData.plan === "FREE" ? "0" : formData.price}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 shadow-sm"
                />
              </div>

              {/* Discount Percent */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discountPercent"
                  step="0.01"
                  min="0"
                  max="100"
                  disabled={formData.plan === "FREE"}
                  placeholder="e.g. 10"
                  value={
                    formData.plan === "FREE" ? "0" : formData.discountPercent
                  }
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 shadow-sm"
                />
              </div>

              {/* Sold Count */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Sold Count
                </label>
                <input
                  type="number"
                  name="soldCount"
                  min="0"
                  placeholder="e.g. 10"
                  value={formData.soldCount}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* 4. Publishing Specs & Identifiers */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Publishing Specs & Identifiers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Publication Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Publication Date
                </label>
                <input
                  type="date"
                  name="publicationDate"
                  value={formData.publicationDate}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                />
              </div>

              {/* Pages */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Total Pages
                </label>
                <input
                  type="number"
                  name="pages"
                  min="1"
                  placeholder="e.g. 1200"
                  value={formData.pages}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                />
              </div>

              {/* ISBN 10 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  ISBN-10
                </label>
                <input
                  type="text"
                  name="isbn10"
                  placeholder="e.g. 1234567892"
                  value={formData.isbn10}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                />
              </div>

              {/* ISBN 13 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  ISBN-13
                </label>
                <input
                  type="text"
                  name="isbn13"
                  placeholder="e.g. 1234567890121"
                  value={formData.isbn13}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                />
              </div>
            </div>
          </div>
          <hr className="border-slate-200" />

          {/* 6. Description (Rich Text Editor) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              E-Book Description
            </h3>
            <div className="min-h-[160px] rounded-xl border border-slate-200 overflow-hidden bg-white">
              <TextEditorEdit
                value={formData.description}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, description: content }))
                }
              />
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* 7. Image Uploads & Image Types */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  E-Book Covers & Promo Images
                </h3>
                <p className="text-[11px] text-slate-400">
                  Upload cover and promo artwork. Assign accurate image types.
                </p>
              </div>

              <label
                htmlFor="ebook-images-upload"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition cursor-pointer border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Image(s)</span>
              </label>
              <input
                id="ebook-images-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFilesChange}
                className="hidden"
              />
            </div>

            {!hasAnyImages ? (
              <label
                htmlFor="ebook-images-upload"
                className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 transition cursor-pointer text-center"
              >
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  Click or drag images here
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Supports PNG, JPG, WEBP formats
                </p>
              </label>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {/* Existing Images */}
                {existingImages.map((img, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className={`relative group rounded-xl border p-2 space-y-2 transition shadow-2xs ${
                      img.type === "COVER"
                        ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/30"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt="E-Book existing preview"
                        className="w-full h-full object-cover"
                      />
                      {img.type === "COVER" && (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-bold shadow-md">
                          COVER ⭐
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition shadow-sm cursor-pointer"
                        title="Remove Image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <select
                      value={img.type}
                      onChange={(e) =>
                        handleExistingImageTypeChange(idx, e.target.value)
                      }
                      className={`w-full rounded-md border px-2 py-1 text-[11px] font-semibold outline-none transition cursor-pointer ${
                        img.type === "COVER"
                          ? "border-emerald-400 bg-white text-emerald-800"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {IMAGE_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t === "COVER" ? "⭐ COVER (Main)" : t}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                {/* Newly Uploaded Images */}
                {uploadedImages.map((img, idx) => (
                  <div
                    key={`uploaded-${idx}`}
                    className={`relative group rounded-xl border p-2 space-y-2 transition shadow-2xs ${
                      img.type === "COVER"
                        ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/30"
                        : "border-indigo-200 bg-indigo-50/40"
                    }`}
                  >
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.preview}
                        alt="E-Book new upload"
                        className="w-full h-full object-cover"
                      />
                      {img.type === "COVER" && (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-bold shadow-md">
                          COVER ⭐
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveUploadedImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition shadow-sm cursor-pointer"
                        title="Remove Image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <select
                      value={img.type}
                      onChange={(e) =>
                        handleUploadedImageTypeChange(idx, e.target.value)
                      }
                      className={`w-full rounded-md border px-2 py-1 text-[11px] font-semibold outline-none transition cursor-pointer ${
                        img.type === "COVER"
                          ? "border-emerald-400 bg-white text-emerald-800"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {IMAGE_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t === "COVER" ? "⭐ COVER (Main)" : t}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-slate-200 bg-slate-50/80">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-ebook-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving E-Book...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{bookToEdit ? "Update E-Book" : "Save E-Book"}</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEBooksDailog;
