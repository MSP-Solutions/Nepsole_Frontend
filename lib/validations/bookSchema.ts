import { z } from "zod";

export const bookFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Book title is required." }),

  publisherId: z
    .union([z.string(), z.number()])
    .refine(
      (val) => val !== "" && val !== null && val !== undefined && String(val).trim() !== "",
      { message: "Please select a publisher." }
    ),

  price: z
    .union([z.string(), z.number()])
    .refine(
      (val) => val !== "" && val !== null && val !== undefined && String(val).trim() !== "",
      { message: "Price is required." }
    )
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0,
      { message: "Please enter a valid price (0 or higher)." }
    ),

  discountPercent: z
    .union([z.string(), z.number()])
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val === "" ||
        (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100),
      { message: "Discount percentage must be between 0 and 100." }
    ),

  stock: z
    .union([z.string(), z.number()])
    .refine(
      (val) => val !== "" && val !== null && val !== undefined && String(val).trim() !== "",
      { message: "Stock quantity is required." }
    )
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0,
      { message: "Please enter a valid stock quantity (0 or higher)." }
    ),

  soldCount: z
    .union([z.string(), z.number()])
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val === "" ||
        (!isNaN(Number(val)) && Number(val) >= 0),
      { message: "Sold count must be 0 or higher." }
    ),

  publicationDate: z.string().optional(),

  pages: z
    .union([z.string(), z.number()])
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val === "" ||
        (!isNaN(Number(val)) && Number(val) > 0),
      { message: "Pages must be a positive number." }
    ),

  isbn10: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || !val.trim()) return true;
        const clean = val.replace(/[-\s]/g, "");
        return clean.length === 10 && /^\d{9}[\dX]$/i.test(clean);
      },
      { message: "ISBN-10 must contain exactly 10 digits." }
    ),

  isbn13: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || !val.trim()) return true;
        const clean = val.replace(/[-\s]/g, "");
        return clean.length === 13 && /^\d{13}$/.test(clean);
      },
      { message: "ISBN-13 must contain exactly 13 digits." }
    ),

  widthCm: z
    .union([z.string(), z.number()])
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val === "" ||
        (!isNaN(Number(val)) && Number(val) >= 0),
      { message: "Width must be 0 or higher." }
    ),

  heightCm: z
    .union([z.string(), z.number()])
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val === "" ||
        (!isNaN(Number(val)) && Number(val) >= 0),
      { message: "Height must be 0 or higher." }
    ),

  depthCm: z
    .union([z.string(), z.number()])
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val === "" ||
        (!isNaN(Number(val)) && Number(val) >= 0),
      { message: "Depth must be 0 or higher." }
    ),

  description: z.string().optional(),
});

export type BookFormValues = z.infer<typeof bookFormSchema>;
