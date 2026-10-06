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
  Trash2,
  Upload,
  User,
  X,
  Layers,
} from "lucide-react";
import React, { useEffect, useRef, useState, useMemo } from "react";
import toast from "react-hot-toast";
import TextEditorEdit from "../TextEditor";
import { ebookFormSchema } from "@/lib/validations/ebookSchema";

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
  subGenreIds?: (number | string)[];
  subGenres?: any[];
  subgenres?: any[];
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
  const [selectedSubGenres, setSelectedSubGenres] = useState<
    (number | string)[]
  >([]);
  const [selectedLanguages, setSelectedLanguages] = useState<
    (number | string)[]
  >([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Subgenres cache by genreId
  const [subGenresByGenre, setSubGenresByGenre] = useState<
    Record<string | number, OptionItem[]>
  >({});
  const [isLoadingSubGenres, setIsLoadingSubGenres] = useState(false);

  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown open & search states
  const [publisherOpen, setPublisherOpen] = useState(false);
  const [publisherSearch, setPublisherSearch] = useState("");

  const [authorOpen, setAuthorOpen] = useState(false);
  const [authorSearch, setAuthorSearch] = useState("");

  const [genreOpen, setGenreOpen] = useState(false);
  const [genreSearch, setGenreSearch] = useState("");

  const [subGenreOpen, setSubGenreOpen] = useState(false);
  const [subGenreSearch, setSubGenreSearch] = useState("");

  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");

  // Refs for click outside and error scrolling
  const publisherRef = useRef<HTMLDivElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);
  const subGenreRef = useRef<HTMLDivElement>(null);
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
        subGenreRef.current &&
        !subGenreRef.current.contains(e.target as Node)
      ) {
        setSubGenreOpen(false);
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
        const initialSubGenreIds =
          bookToEdit.subGenreIds ||
          (bookToEdit.subgenres || bookToEdit.subGenres || []).map((sg: any) =>
            typeof sg === "object" ? sg.id || sg.subGenreId : sg
          ) ||
          [];
        setSelectedSubGenres(initialSubGenreIds);
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
        setErrors({});
      } else {
        resetForm();
      }
    }
  }, [open, bookToEdit]);

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedAuthors([]);
    setSelectedGenres([]);
    setSelectedSubGenres([]);
    setSelectedLanguages([]);
    setPdfFile(null);
    setExistingPdfUrl("");
    setExistingImages([]);
    uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setUploadedImages([]);
    setErrors({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Image Upload handler for new images with validation
  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit per image
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
    ];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type) && !file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not a supported image format.`);
        continue;
      }
      if (file.size > maxSizeBytes) {
        toast.error(`"${file.name}" exceeds the maximum allowed size of 10MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    // Check if there is already any image marked as COVER
    const hasAnyCover =
      existingImages.some((img) => img.type === "COVER") ||
      uploadedImages.some((img) => img.type === "COVER");

    const newItems: BookImageItem[] = validFiles.map((file, idx) => ({
      file,
      preview: URL.createObjectURL(file),
      type: !hasAnyCover && idx === 0 ? "COVER" : "INSIDE",
    }));

    setUploadedImages((prev) => [...prev, ...newItems]);
    if (errors.images) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.images;
        return next;
      });
    }
    e.target.value = "";
  };

  const handleRemoveUploadedImage = (index: number) => {
    setUploadedImages((prev) => {
      const target = prev[index];
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      const next = prev.filter((_, i) => i !== index);
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

  // PDF File Upload Handler with validation
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        toast.error("Please upload a valid PDF document.");
        return;
      }
      const maxPdfSize = 100 * 1024 * 1024; // 100MB limit
      if (file.size > maxPdfSize) {
        toast.error("PDF file exceeds the maximum allowed size of 100MB.");
        return;
      }
      setPdfFile(file);
      if (errors.pdfUrl || errors.pdfFile) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.pdfUrl;
          delete next.pdfFile;
          return next;
        });
      }
    }
    e.target.value = "";
  };

  // Toggles for Multi-Selects with automatic error clearing
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

  const toggleAuthor = (id: number | string) => {
    toggleSelection(id, selectedAuthors, setSelectedAuthors);
    if (errors.authorIds || errors.authors) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.authorIds;
        delete next.authors;
        return next;
      });
    }
  };

  const toggleGenre = (id: number | string) => {
    toggleSelection(id, selectedGenres, setSelectedGenres);
    if (errors.genreIds || errors.genres) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.genreIds;
        delete next.genres;
        return next;
      });
    }
  };

  const toggleSubGenre = (id: number | string) => {
    toggleSelection(id, selectedSubGenres, setSelectedSubGenres);
    if (errors.subGenreIds || errors.subgenres || errors.subgenre) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.subGenreIds;
        delete next.subgenres;
        delete next.subgenre;
        return next;
      });
    }
  };

  const toggleLanguage = (id: number | string) => {
    toggleSelection(id, selectedLanguages, setSelectedLanguages);
    if (errors.languageIds || errors.languages) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.languageIds;
        delete next.languages;
        return next;
      });
    }
  };

  // Fetch subgenres dynamically whenever selectedGenres changes
  useEffect(() => {
    if (!open) return;

    if (selectedGenres.length === 0) {
      setSelectedSubGenres([]);
      return;
    }

    const fetchSubGenresForGenres = async () => {
      setIsLoadingSubGenres(true);
      try {
        const genresToFetch = selectedGenres.filter(
          (gid) => !subGenresByGenre[gid],
        );

        if (genresToFetch.length > 0) {
          const fetchPromises = genresToFetch.map(async (gid) => {
            let res;
            try {
              res = await axiosAuthInstance.get(`/v1/subgenre/by-genre/${gid}`);
            } catch (err: any) {
              if (err?.response?.status === 404) {
                res = await axiosAuthInstance.get(
                  `/api/v1/subgenre/by-genre/${gid}`,
                );
              } else {
                throw err;
              }
            }
            const data = res.data;
            const list: OptionItem[] = Array.isArray(data)
              ? data
              : data?.data || data?.subgenres || data?.subGenres || [];
            return { gid, list };
          });

          const results = await Promise.allSettled(fetchPromises);
          setSubGenresByGenre((prev) => {
            const next = { ...prev };
            results.forEach((r) => {
              if (r.status === "fulfilled") {
                next[r.value.gid] = r.value.list;
              }
            });
            return next;
          });
        }
      } catch (error) {
        console.error("Error fetching subgenres by genre:", error);
      } finally {
        setIsLoadingSubGenres(false);
      }
    };

    fetchSubGenresForGenres();
  }, [selectedGenres, open, subGenresByGenre]);

  // Aggregate available subgenres from all currently selected genres
  const availableSubGenres = useMemo(() => {
    const list: (OptionItem & { genreName?: string })[] = [];
    const seenIds = new Set<string | number>();

    selectedGenres.forEach((gid) => {
      const genreObj = genres.find((g) => String(g.id) === String(gid));
      const gName = genreObj?.name || genreObj?.englishName || "";
      const subs = subGenresByGenre[gid] || [];
      subs.forEach((sub) => {
        if (!seenIds.has(sub.id)) {
          seenIds.add(sub.id);
          list.push({
            ...sub,
            genreName: gName,
          });
        }
      });
    });

    return list;
  }, [selectedGenres, subGenresByGenre, genres]);

  const filteredSubGenres = useMemo(() => {
    const q = subGenreSearch.toLowerCase().trim();
    if (!q) return availableSubGenres;
    return availableSubGenres.filter((sg) =>
      (sg.name || sg.englishName || "").toLowerCase().includes(q),
    );
  }, [availableSubGenres, subGenreSearch]);

  // If genres change, clean up any selected subgenres that no longer belong to selected genres
  useEffect(() => {
    if (selectedGenres.length === 0) {
      if (selectedSubGenres.length > 0) setSelectedSubGenres([]);
      return;
    }
    if (availableSubGenres.length > 0) {
      const validSubIds = new Set(
        availableSubGenres.map((sg) => String(sg.id)),
      );
      setSelectedSubGenres((prev) =>
        prev.filter((id) => validSubIds.has(String(id))),
      );
    }
  }, [selectedGenres, availableSubGenres]);

  const scrollToFirstError = (fieldErrors: Record<string, string>) => {
    const errorKeys = Object.keys(fieldErrors);
    if (errorKeys.length === 0) return;

    // Field order matching form layout top-to-bottom
    const fieldOrder = [
      "plan",
      "pdfUrl",
      "pdfFile",
      "title",
      "publisherId",
      "authorIds",
      "authors",
      "genreIds",
      "genres",
      "subGenreIds",
      "subgenres",
      "languageIds",
      "languages",
      "price",
      "discountPercent",
      "soldCount",
      "publicationDate",
      "pages",
      "isbn10",
      "isbn13",
      "images",
      "description",
    ];

    const targetField = fieldOrder.find((f) => fieldErrors[f]) || errorKeys[0];

    setTimeout(() => {
      let targetEl: HTMLElement | null = null;

      if (targetField === "publisherId") {
        targetEl = publisherRef.current;
      } else if (targetField === "authorIds" || targetField === "authors") {
        targetEl = authorRef.current;
      } else if (targetField === "genreIds" || targetField === "genres") {
        targetEl = genreRef.current;
      } else if (targetField === "subGenreIds" || targetField === "subgenres") {
        targetEl = subGenreRef.current;
      } else if (targetField === "languageIds" || targetField === "languages") {
        targetEl = languageRef.current;
      } else if (targetField === "images") {
        targetEl =
          document.getElementById("images-section") ||
          document.getElementById("ebook-images-section") ||
          document.querySelector("input[name='images']");
      } else if (targetField === "description") {
        targetEl =
          document.getElementById("description-section") ||
          document.getElementById("ebook-description-section") ||
          document.querySelector(".ql-editor");
      } else if (targetField === "pdfUrl" || targetField === "pdfFile") {
        targetEl = document.getElementById("pdf-section");
      } else {
        targetEl = document.querySelector(`[name='${targetField}']`);
      }

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
        if (
          targetEl instanceof HTMLInputElement ||
          targetEl instanceof HTMLTextAreaElement
        ) {
          targetEl.focus({ preventScroll: true });
        }
      }
    }, 80);
  };

  const validateForm = (): boolean => {
    const allImages = [...existingImages, ...uploadedImages];
    const dataToValidate = {
      ...formData,
      authorIds: selectedAuthors,
      genreIds: selectedGenres,
      subGenreIds: selectedSubGenres,
      languageIds: selectedLanguages,
      images: allImages,
      description: formData.description,
      pdfUrl: pdfFile || existingPdfUrl || null,
    };

    const result = ebookFormSchema.safeParse(dataToValidate);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = String(issue.path[0]);
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);

      const firstErrorMessage =
        result.error.issues[0]?.message || "Please fill in all required fields.";
      toast.error(firstErrorMessage);
      scrollToFirstError(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
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

      if (formData.publicationDate && formData.publicationDate.trim()) {
        data.append("publicationDate", formData.publicationDate.trim());
      }
      if (formData.isbn10 && formData.isbn10.trim()) {
        data.append("isbn10", formData.isbn10.trim());
      }
      if (formData.isbn13 && formData.isbn13.trim()) {
        data.append("isbn13", formData.isbn13.trim());
      }

      const pagesStr = String(formData.pages ?? "").trim();
      if (pagesStr !== "") {
        const pagesNum = Number(pagesStr);
        if (!isNaN(pagesNum) && pagesNum > 0) {
          data.append("pages", String(pagesNum));
        }
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
        "subGenreIds",
        JSON.stringify(selectedSubGenres.map((id) => Number(id))),
      );
      if (selectedSubGenres.length > 0 && selectedSubGenres[0] !== undefined) {
        data.append("subGenreId", String(Number(selectedSubGenres[0])));
      }
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
      const resData = error?.response?.data;
      const fieldErrors: Record<string, string> = {};

      const normalizeFieldName = (rawField: string): string => {
        const f = rawField.toLowerCase().replace(/[-_]/g, "");
        if (f === "isbn10") return "isbn10";
        if (f === "isbn13") return "isbn13";
        if (f === "publicationdate" || f === "pubdate") return "publicationDate";
        if (f === "publisherid" || f === "publisher") return "publisherId";
        if (f === "authorids" || f === "authors" || f === "author") return "authorIds";
        if (f === "genreids" || f === "genres" || f === "genre") return "genreIds";
        if (f === "subgenreids" || f === "subgenres" || f === "subgenre") return "subGenreIds";
        if (f === "languageids" || f === "languages" || f === "language") return "languageIds";
        if (f === "discountpercent" || f === "discount") return "discountPercent";
        if (f === "soldcount" || f === "sold") return "soldCount";
        if (f === "description" || f === "desc") return "description";
        if (f === "images" || f === "imagestypes" || f === "image") return "images";
        if (f === "pdfurl" || f === "pdf" || f === "pdffile") return "pdfUrl";
        if (f === "plan") return "plan";
        if (f === "price") return "price";
        if (f === "pages" || f === "page") return "pages";
        return rawField;
      };

      const extractCleanMessage = (errData: any): string => {
        if (!errData) return "Failed to save e-book.";
        if (typeof errData === "string") {
          const trimmed = errData.trim();
          if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            try {
              const parsed = JSON.parse(trimmed);
              return extractCleanMessage(parsed);
            } catch {
              return trimmed;
            }
          }
          return trimmed;
        }
        if (Array.isArray(errData)) {
          return errData
            .map((item) => extractCleanMessage(item))
            .filter(Boolean)
            .join(", ");
        }
        if (typeof errData === "object") {
          if (errData.message && typeof errData.message === "string") {
            return extractCleanMessage(errData.message);
          }
          if (errData.error && typeof errData.error === "string") {
            return extractCleanMessage(errData.error);
          }
          if (errData.errors) {
            return extractCleanMessage(errData.errors);
          }
          const values = Object.values(errData);
          if (values.length > 0) {
            return extractCleanMessage(values[0]);
          }
        }
        return "Failed to save e-book.";
      };

      // 1. Process structured backend validation errors
      const detailsList =
        resData?.error?.details ||
        resData?.details ||
        resData?.errors ||
        (Array.isArray(resData?.error) ? resData.error : null);

      if (Array.isArray(detailsList)) {
        detailsList.forEach((item: any) => {
          const field =
            item.field ||
            item.path ||
            item.param ||
            (Array.isArray(item.path) ? item.path[0] : null);
          const msg =
            item.message ||
            item.msg ||
            item.error ||
            extractCleanMessage(item);
          if (field && msg) {
            fieldErrors[normalizeFieldName(String(field))] = String(msg);
          }
        });
      } else if (typeof detailsList === "object" && detailsList !== null) {
        Object.entries(detailsList).forEach(([k, v]: [string, any]) => {
          fieldErrors[normalizeFieldName(k)] = extractCleanMessage(v);
        });
      }

      // Determine the main error toast message
      let mainErrorMsg = "";
      if (resData?.error?.message && typeof resData.error.message === "string") {
        mainErrorMsg = resData.error.message;
      } else if (resData?.message && typeof resData.message === "string") {
        mainErrorMsg = resData.message;
      } else {
        mainErrorMsg = extractCleanMessage(resData);
      }

      const firstFieldErrorMsg = Object.values(fieldErrors)[0];
      const toastMessage =
        firstFieldErrorMsg || mainErrorMsg || "Failed to save e-book.";

      // Smart pattern fallback if fieldErrors is still empty
      if (Object.keys(fieldErrors).length === 0) {
        const lowerMsg = toastMessage.toLowerCase();
        if (
          lowerMsg.includes("isbn10") ||
          lowerMsg.includes("isbn-10") ||
          lowerMsg.includes("isbn 10")
        ) {
          fieldErrors.isbn10 = toastMessage;
        }
        if (
          lowerMsg.includes("isbn13") ||
          lowerMsg.includes("isbn-13") ||
          lowerMsg.includes("isbn 13")
        ) {
          fieldErrors.isbn13 = toastMessage;
        }
        if (lowerMsg.includes("title")) {
          fieldErrors.title = toastMessage;
        }
        if (lowerMsg.includes("publisher")) {
          fieldErrors.publisherId = toastMessage;
        }
        if (lowerMsg.includes("price")) {
          fieldErrors.price = toastMessage;
        }
        if (lowerMsg.includes("page")) {
          fieldErrors.pages = toastMessage;
        }
        if (lowerMsg.includes("pdf")) {
          fieldErrors.pdfUrl = toastMessage;
        }
      }

      if (Object.keys(fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        scrollToFirstError(fieldErrors);
      }

      toast.error(toastMessage);
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
        className="w-[98vw] md:max-w-4xl max-h-[92vh] flex flex-col p-0 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">
                {bookToEdit ? "Edit E-Book" : "Add New E-Book"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Enter comprehensive e-book details to catalog in the system.
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
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        plan: "FREE",
                        price: "0",
                      }));
                      if (errors.price) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.price;
                          return next;
                        });
                      }
                    }}
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
              <div className="space-y-1.5" id="pdf-section">
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
                    <div
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs ${
                        errors.pdfUrl || errors.pdfFile
                          ? "border-rose-400 bg-rose-50/30 text-rose-900"
                          : "border-indigo-300 bg-indigo-50/60 text-indigo-900"
                      }`}
                    >
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
                      className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border-2 border-dashed text-xs font-semibold transition cursor-pointer ${
                        errors.pdfUrl || errors.pdfFile
                          ? "border-rose-400 bg-rose-50/20 text-rose-600 hover:bg-rose-50/40"
                          : "border-slate-300 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-400 text-slate-600"
                      }`}
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
                {(errors.pdfUrl || errors.pdfFile) && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                    {errors.pdfUrl || errors.pdfFile}
                  </p>
                )}
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
                  placeholder="e.g. Good Boyes"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 shadow-sm transition ${
                    errors.title
                      ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500"
                      : "border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                />
                {errors.title && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                    {errors.title}
                  </p>
                )}
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
                    errors.publisherId
                      ? "border-rose-400 ring-1 ring-rose-400 bg-rose-50/20"
                      : publisherOpen
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

                {errors.publisherId && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                    {errors.publisherId}
                  </p>
                )}

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
                                setErrors((prev) => {
                                  const next = { ...prev };
                                  delete next.publisherId;
                                  return next;
                                });
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
                  Author(s) <span className="text-red-500">*</span>
                </label>

                <div
                  onClick={() => setAuthorOpen(!authorOpen)}
                  className={`w-full min-h-[38px] flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm cursor-pointer bg-white transition shadow-sm ${
                    errors.authorIds || errors.authors
                      ? "border-rose-400 ring-1 ring-rose-400 bg-rose-50/20"
                      : authorOpen
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
                                toggleAuthor(authId);
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

                {(errors.authorIds || errors.authors) && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                    {errors.authorIds || errors.authors}
                  </p>
                )}

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
                              onClick={() => toggleAuthor(auth.id)}
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
                  Genres / Categories <span className="text-red-500">*</span>
                </label>

                <div
                  onClick={() => setGenreOpen(!genreOpen)}
                  className={`w-full min-h-[38px] flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm cursor-pointer bg-white transition shadow-sm ${
                    errors.genreIds || errors.genres
                      ? "border-rose-400 ring-1 ring-rose-400 bg-rose-50/20"
                      : genreOpen
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
                                toggleGenre(genId);
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

                {(errors.genreIds || errors.genres) && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                    {errors.genreIds || errors.genres}
                  </p>
                )}

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
                              onClick={() => toggleGenre(gen.id)}
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

              {/* Sub Genres Dropdown (/api/v1/subgenre/by-genre/:genreId) */}
              <div className="space-y-1.5 relative" ref={subGenreRef}>
                <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    Sub Genres
                  </span>
                  {selectedGenres.length === 0 ? (
                    <span className="text-[11px] text-amber-600 font-normal">
                      Select genre first
                    </span>
                  ) : isLoadingSubGenres ? (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-normal">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading subgenres...
                    </span>
                  ) : null}
                </label>

                <div
                  onClick={() => {
                    if (selectedGenres.length > 0) {
                      setSubGenreOpen(!subGenreOpen);
                    } else {
                      toast.error(
                        "Please select a genre first to view sub genres.",
                      );
                    }
                  }}
                  className={`w-full min-h-[38px] flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm transition shadow-sm ${
                    selectedGenres.length === 0
                      ? "bg-slate-50 border-slate-200 cursor-not-allowed text-slate-400"
                      : subGenreOpen
                        ? "border-indigo-500 ring-1 ring-indigo-500 bg-white cursor-pointer"
                        : "border-slate-300 hover:border-slate-400 bg-white cursor-pointer"
                  }`}
                >
                  <div className="flex flex-wrap gap-1 flex-1">
                    {selectedGenres.length === 0 ? (
                      <span className="text-slate-400 text-sm">
                        Select a genre first to choose sub genres...
                      </span>
                    ) : selectedSubGenres.length === 0 ? (
                      <span className="text-slate-400 text-sm">
                        {availableSubGenres.length === 0 && !isLoadingSubGenres
                          ? "No sub genres available for selected genre(s)"
                          : "Select sub genres..."}
                      </span>
                    ) : (
                      selectedSubGenres.map((subId) => {
                        const subObj = availableSubGenres.find(
                          (s) => String(s.id) === String(subId),
                        );
                        return (
                          <span
                            key={subId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                          >
                            {subObj
                              ? subObj.name || subObj.englishName
                              : `Sub Genre #${subId}`}
                            <span
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSubGenre(subId);
                              }}
                              className="hover:text-blue-900 cursor-pointer"
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

                {errors.subGenreIds && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                    {errors.subGenreIds}
                  </p>
                )}

                {subGenreOpen && selectedGenres.length > 0 && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-2 pb-2">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search sub genre..."
                        value={subGenreSearch}
                        onChange={(e) => setSubGenreSearch(e.target.value)}
                        className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto mt-1 space-y-0.5">
                      {isLoadingSubGenres ? (
                        <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading
                          sub genres...
                        </div>
                      ) : filteredSubGenres.length === 0 ? (
                        <div className="py-3 text-center text-xs text-slate-400">
                          {availableSubGenres.length === 0
                            ? "No sub genres found for the selected genre(s)"
                            : "No matching sub genres"}
                        </div>
                      ) : (
                        filteredSubGenres.map((sub) => {
                          const isSelected = selectedSubGenres.some(
                            (id) => String(id) === String(sub.id),
                          );
                          return (
                            <div
                              key={sub.id}
                              onClick={() => toggleSubGenre(sub.id)}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition ${
                                isSelected
                                  ? "bg-blue-50 text-blue-700 font-semibold"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="truncate">
                                  {sub.name || sub.englishName}
                                </span>
                                {sub.genreName && selectedGenres.length > 1 && (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ({sub.genreName})
                                  </span>
                                )}
                              </div>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-blue-600" />
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
                  Language(s) <span className="text-red-500">*</span>
                </label>

                <div
                  onClick={() => setLanguageOpen(!languageOpen)}
                  className={`w-full min-h-[38px] flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm cursor-pointer bg-white transition shadow-sm ${
                    errors.languageIds || errors.languages
                      ? "border-rose-400 ring-1 ring-rose-400 bg-rose-50/20"
                      : languageOpen
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
                                toggleLanguage(langId);
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

                {(errors.languageIds || errors.languages) && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                    {errors.languageIds || errors.languages}
                  </p>
                )}

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
                              onClick={() => toggleLanguage(lang.id)}
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
              Pricing, Stock & Sales
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
                    formData.plan === "FREE" ? "0 (Free)" : "e.g. 750"
                  }
                  value={formData.plan === "FREE" ? "0" : formData.price}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 disabled:bg-slate-100 disabled:text-slate-400 shadow-sm transition ${
                    errors.price
                      ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500"
                      : "border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                />
                {errors.price && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                    {errors.price}
                  </p>
                )}
              </div>

              {/* Discount Percent */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Discount (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="discountPercent"
                  step="0.01"
                  min="0"
                  max="100"
                  disabled={formData.plan === "FREE"}
                  placeholder="e.g. 0"
                  value={
                    formData.plan === "FREE" ? "0" : formData.discountPercent
                  }
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 disabled:bg-slate-100 disabled:text-slate-400 shadow-sm transition ${
                    errors.discountPercent
                      ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500"
                      : "border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                />
                {errors.discountPercent && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                    {errors.discountPercent}
                  </p>
                )}
              </div>

              {/* Sold Count */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Sold Count <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="soldCount"
                  min="0"
                  placeholder="e.g. 0"
                  value={formData.soldCount}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 shadow-sm transition ${
                    errors.soldCount
                      ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500"
                      : "border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                />
                {errors.soldCount && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                    {errors.soldCount}
                  </p>
                )}
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
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 shadow-sm transition ${
                    errors.publicationDate
                      ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500"
                      : "border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                />
                {errors.publicationDate && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                    {errors.publicationDate}
                  </p>
                )}
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
                  placeholder="e.g. 350"
                  value={formData.pages}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 shadow-sm transition ${
                    errors.pages
                      ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500"
                      : "border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                />
                {errors.pages && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                    {errors.pages}
                  </p>
                )}
              </div>

              {/* ISBN 10 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  ISBN-10
                </label>
                <input
                  type="text"
                  name="isbn10"
                  placeholder="e.g. 0735211299"
                  value={formData.isbn10}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 shadow-sm transition ${
                    errors.isbn10
                      ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500"
                      : "border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                />
                {errors.isbn10 && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                    {errors.isbn10}
                  </p>
                )}
              </div>

              {/* ISBN 13 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  ISBN-13
                </label>
                <input
                  type="text"
                  name="isbn13"
                  placeholder="e.g. 978-0735211292"
                  value={formData.isbn13}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 shadow-sm transition ${
                    errors.isbn13
                      ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500"
                      : "border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                />
                {errors.isbn13 && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                    {errors.isbn13}
                  </p>
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* 5. Images Gallery & Uploads */}
          <div id="images-section" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" />
                Book Images & Covers <span className="text-red-500">*</span>
              </h3>
              <label
                htmlFor="ebook-multi-images"
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition border border-indigo-200 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload Images
              </label>
              <input
                id="ebook-multi-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFilesChange}
                className="hidden"
              />
            </div>

            {!hasAnyImages ? (
              <label
                htmlFor="ebook-multi-images"
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition cursor-pointer text-center ${
                  errors.images
                    ? "border-rose-400 bg-rose-50/20"
                    : "border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/30"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 shadow-sm">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Click to browse and upload book images
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Upload cover, back cover, and preview pages (PNG, JPG, WEBP)
                </p>
              </label>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
                {/* 1. Existing Saved Images */}
                {existingImages.map((img, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="relative group rounded-xl border border-slate-200 bg-white p-2 shadow-sm flex flex-col justify-between overflow-hidden ring-1 ring-slate-100"
                  >
                    <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-slate-100 mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={`Existing #${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider shadow-xs">
                        Saved
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition opacity-90 hover:opacity-100 cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Image Type
                      </label>
                      <select
                        value={img.type}
                        onChange={(e) =>
                          handleExistingImageTypeChange(idx, e.target.value)
                        }
                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 font-medium outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {IMAGE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {/* 2. Newly Uploaded Images */}
                {uploadedImages.map((img, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="relative group rounded-xl border border-indigo-200 bg-indigo-50/20 p-2 shadow-sm flex flex-col justify-between overflow-hidden"
                  >
                    <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-slate-100 mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.preview}
                        alt={`New Upload #${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider shadow-xs">
                        New
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUploadedImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition opacity-90 hover:opacity-100 cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider block">
                        Image Type
                      </label>
                      <select
                        value={img.type}
                        onChange={(e) =>
                          handleUploadedImageTypeChange(idx, e.target.value)
                        }
                        className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 font-medium outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {IMAGE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {/* Add More button */}
                <label
                  htmlFor="ebook-multi-images"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/30 cursor-pointer transition aspect-[3/4] text-slate-400 hover:text-indigo-600 p-2"
                >
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-xs font-semibold">Add More</span>
                </label>
              </div>
            )}

            {errors.images && (
              <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                {errors.images}
              </p>
            )}
          </div>

          <hr className="border-slate-200" />

          {/* 6. Description (Rich Text Editor) */}
          <div id="description-section" className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600">
              E-Book Description & Summary <span className="text-red-500">*</span>
            </label>
            <div
              className={`rounded-lg transition ${
                errors.description ? "ring-2 ring-rose-400 p-0.5" : ""
              }`}
            >
              <TextEditorEdit
                key={bookToEdit?.id ? `edit-ebook-${bookToEdit.id}` : "new-ebook"}
                initialHtml={formData.description}
                value={formData.description}
                onChange={(val) => {
                  setFormData((prev) => ({ ...prev, description: val }));
                  if (errors.description) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.description;
                      return next;
                    });
                  }
                }}
              />
            </div>
            {errors.description && (
              <p className="text-[11px] font-medium text-rose-500 mt-1 animate-in fade-in-50">
                {errors.description}
              </p>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/80">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-ebook-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving E-Book...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {bookToEdit ? "Update E-Book" : "Save E-Book"}
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEBooksDailog;
