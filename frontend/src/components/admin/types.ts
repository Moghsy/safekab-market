import { z } from "zod";

// Zod schema for product form validation
export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  net_price: z
    .string()
    .min(1, "Net price is required")
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num > 0;
    }, "Net price must be a positive number"),
  stock: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const num = parseInt(val);
      return !isNaN(num) && num >= 0;
    }, "Stock must be a non-negative number"),
  currency: z.string().min(1, "Currency is required"),
  vat_rate: z
    .string()
    .min(1, "VAT rate is required")
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, "VAT rate must be between 0 and 100"),
  media: z
    .array(
      z.object({
        imageUrl: z.url("Must be a valid URL"),
        altText: z.string().optional(),
        displayOrder: z.string().min(1, "Order is required"),
        mediaType: z.enum(["image", "video"]),
      })
    )
    .optional(),
});

// Transform schema for API submission
export const productApiSchema = productFormSchema.transform((data) => ({
  name: data.name,
  description: data.description,
  net_price: parseInt(data.net_price),
  stock:
    data.stock && data.stock.trim() !== "" ? parseInt(data.stock) : undefined,
  currency: data.currency,
  vat_rate: parseInt(data.vat_rate),
  media: data.media?.map((m) => ({
    imageUrl: m.imageUrl,
    altText: m.altText,
    displayOrder: parseInt(m.displayOrder),
    mediaType: m.mediaType,
  })),
}));

export type ProductFormData = z.infer<typeof productFormSchema>;
