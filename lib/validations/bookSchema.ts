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
    .optional()
    .nullable()
    .or(z.literal("")),

  pages: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (val === undefined || val === null || String(val).trim() === "") return true;
        const num = Number(val);
        return !isNaN(num) && num > 0 && Number.isInteger(num);
      },
      { message: "Pages must be a valid whole number greater than 0." }
    ),

  isbn10: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),

  isbn13: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),

  widthCm: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (val === undefined || val === null || String(val).trim() === "") return true;
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "Width must be a valid number (0 or higher)." }
    ),

  heightCm: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (val === undefined || val === null || String(val).trim() === "") return true;
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "Height must be a valid number (0 or higher)." }
    ),

  depthCm: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (val === undefined || val === null || String(val).trim() === "") return true;
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "Depth must be a valid number (0 or higher)." }
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


