import { z } from "zod";

export const bookFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Book title is required." })
    .max(300, { message: "Book title cannot exceed 300 characters." }),

  publisherId: z
    .union([z.string(), z.number()])
    .refine(
      (val) =>
        val !== "" &&
        val !== null &&
        val !== undefined &&
        String(val).trim() !== "",
      { message: "Please select a publisher." }
    ),

  authorIds: z
    .array(z.union([z.string(), z.number()]))
    .refine((val) => Array.isArray(val) && val.length > 0, {
      message: "Please select at least one author.",
    }),

  genreIds: z
    .array(z.union([z.string(), z.number()]))
    .refine((val) => Array.isArray(val) && val.length > 0, {
      message: "Please select at least one genre/category.",
    }),

  languageIds: z
    .array(z.union([z.string(), z.number()]))
    .refine((val) => Array.isArray(val) && val.length > 0, {
      message: "Please select at least one language.",
    }),

  price: z
    .union([z.string(), z.number()])
    .refine(
      (val) =>
        val !== "" &&
        val !== null &&
        val !== undefined &&
        String(val).trim() !== "",
      { message: "Price is required." }
    )
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0,
      { message: "Please enter a valid price (Rs. 0 or higher)." }
    )
    .refine(
      (val) => Number(val) <= 10000000,
      { message: "Price cannot exceed Rs. 10,000,000." }
    ),

  discountPercent: z
    .union([z.string(), z.number()])
    .refine(
      (val) =>
        val !== "" &&
        val !== null &&
        val !== undefined &&
        String(val).trim() !== "",
      { message: "Discount percentage is required (enter 0 if no discount)." }
    )
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100,
      { message: "Discount percentage must be between 0 and 100." }
    ),

  stock: z
    .union([z.string(), z.number()])
    .refine(
      (val) =>
        val !== "" &&
        val !== null &&
        val !== undefined &&
        String(val).trim() !== "",
      { message: "Stock quantity is required." }
    )
    .refine(
      (val) =>
        !isNaN(Number(val)) &&
        Number(val) >= 0 &&
        Number.isInteger(Number(val)),
      { message: "Stock must be a whole number (0 or higher)." }
    )
    .refine(
      (val) => Number(val) <= 1000000,
      { message: "Stock units cannot exceed 1,000,000." }
    ),

  soldCount: z
    .union([z.string(), z.number()])
    .refine(
      (val) =>
        val !== "" &&
        val !== null &&
        val !== undefined &&
        String(val).trim() !== "",
      { message: "Sold count is required (enter 0 if new book)." }
    )
    .refine(
      (val) =>
        !isNaN(Number(val)) &&
        Number(val) >= 0 &&
        Number.isInteger(Number(val)),
      { message: "Sold count must be a whole number (0 or higher)." }
    ),

  publicationDate: z
    .string()
    .trim()
    .min(1, { message: "Publication date is required." })
    .refine(
      (val) => {
        const date = new Date(val);
        return (
          !isNaN(date.getTime()) &&
          date.getFullYear() >= 1000 &&
          date.getFullYear() <= 2100
        );
      },
      { message: "Please enter a valid publication date." }
    ),

  pages: z
    .union([z.string(), z.number()])
    .refine(
      (val) =>
        val !== "" &&
        val !== null &&
        val !== undefined &&
        String(val).trim() !== "",
      { message: "Total pages is required." }
    )
    .refine(
      (val) =>
        !isNaN(Number(val)) && Number(val) > 0 && Number.isInteger(Number(val)),
      { message: "Total pages must be a positive whole number (e.g. 150)." }
    )
    .refine(
      (val) => Number(val) <= 50000,
      { message: "Pages cannot exceed 50,000." }
    ),

  isbn10: z
    .string()
    .trim()
    .min(1, { message: "ISBN-10 is required." })
    .refine(
      (val) => {
        const clean = val.replace(/[-\s]/g, "");
        return clean.length === 10 && /^\d{9}[\dX]$/i.test(clean);
      },
      { message: "ISBN-10 must contain exactly 10 valid characters (e.g. 0735211299)." }
    ),

  isbn13: z
    .string()
    .trim()
    .min(1, { message: "ISBN-13 is required." })
    .refine(
      (val) => {
        const clean = val.replace(/[-\s]/g, "");
        return clean.length === 13 && /^\d{13}$/.test(clean);
      },
      { message: "ISBN-13 must contain exactly 13 digits (e.g. 9780735211292)." }
    ),

  widthCm: z
    .union([z.string(), z.number()])
    .refine(
      (val) =>
        val !== "" &&
        val !== null &&
        val !== undefined &&
        String(val).trim() !== "",
      { message: "Width is required." }
    )
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0,
      { message: "Width must be a valid non-negative number." }
    )
    .refine(
      (val) => Number(val) <= 1000,
      { message: "Width must be less than 1,000 cm." }
    ),

  heightCm: z
    .union([z.string(), z.number()])
    .refine(
      (val) =>
        val !== "" &&
        val !== null &&
        val !== undefined &&
        String(val).trim() !== "",
      { message: "Height is required." }
    )
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0,
      { message: "Height must be a valid non-negative number." }
    )
    .refine(
      (val) => Number(val) <= 1000,
      { message: "Height must be less than 1,000 cm." }
    ),

  depthCm: z
    .union([z.string(), z.number()])
    .refine(
      (val) =>
        val !== "" &&
        val !== null &&
        val !== undefined &&
        String(val).trim() !== "",
      { message: "Depth (spine) is required." }
    )
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0,
      { message: "Depth must be a valid non-negative number." }
    )
    .refine(
      (val) => Number(val) <= 1000,
      { message: "Depth must be less than 1,000 cm." }
    ),

  images: z
    .array(z.any())
    .refine((val) => Array.isArray(val) && val.length > 0, {
      message: "Please upload at least one book image (cover).",
    }),

  description: z
    .string()
    .refine(
      (val) => {
        if (!val) return false;
        const textOnly = val.replace(/<[^>]*>/g, "").trim();
        return textOnly.length > 0;
      },
      { message: "Book description is required." }
    )
    .refine(
      (val) => val.length <= 50000,
      { message: "Description cannot exceed 50,000 characters." }
    ),
});

export type BookFormValues = z.infer<typeof bookFormSchema>;


