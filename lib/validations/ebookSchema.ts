import { z } from "zod";

export const ebookFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { message: "E-Book title is required." })
      .max(300, { message: "E-Book title cannot exceed 300 characters." }),

    plan: z.enum(["FREE", "PAID"]).default("PAID"),

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

    price: z.union([z.string(), z.number()]).optional().nullable(),

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

    soldCount: z
      .union([z.string(), z.number()])
      .refine(
        (val) =>
          val !== "" &&
          val !== null &&
          val !== undefined &&
          String(val).trim() !== "",
        { message: "Sold count is required (enter 0 if new e-book)." }
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
          if (val === undefined || val === null || String(val).trim() === "")
            return true;
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

    images: z
      .array(z.any())
      .refine((val) => Array.isArray(val) && val.length > 0, {
        message: "Please upload at least one e-book image (cover).",
      }),

    pdfUrl: z.any().optional().nullable(),

    description: z
      .string()
      .refine(
        (val) => {
          if (!val) return false;
          const textOnly = val.replace(/<[^>]*>/g, "").trim();
          return textOnly.length > 0;
        },
        { message: "E-Book description is required." }
      )
      .refine(
        (val) => val.length <= 50000,
        { message: "Description cannot exceed 50,000 characters." }
      ),
  })
  .superRefine((data, ctx) => {
    if (data.plan === "PAID") {
      const priceVal = data.price;
      if (
        priceVal === "" ||
        priceVal === null ||
        priceVal === undefined ||
        String(priceVal).trim() === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Price is required for paid e-books.",
          path: ["price"],
        });
      } else if (isNaN(Number(priceVal)) || Number(priceVal) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid price greater than Rs. 0.",
          path: ["price"],
        });
      } else if (Number(priceVal) > 10000000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Price cannot exceed Rs. 10,000,000.",
          path: ["price"],
        });
      }
    }
  });

export type EbookFormValues = z.infer<typeof ebookFormSchema>;
