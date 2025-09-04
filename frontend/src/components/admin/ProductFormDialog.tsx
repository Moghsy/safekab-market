import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Dialog } from "@/components/ui/dialog";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import type Product from "@/models/Product";
import {
  productFormSchema,
  productApiSchema,
  type ProductFormData,
} from "./types";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProduct: Product | null;
  onSuccess: () => void;
}

// MediaFields component
interface MediaFieldsProps {
  control: any;
  register: any;
  errors: any;
}

const MediaFields: React.FC<MediaFieldsProps> = ({
  control,
  register,
  errors,
}) => {
  const { fields, append, remove } = useFieldArray({
    name: "media",
    control,
  });

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        Media (Images & Videos)
      </label>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {fields.map((field: any, idx: number) => (
          <div
            key={field.id}
            className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 items-end border p-3 rounded-md bg-gray-50"
          >
            <div>
              <label className="block text-xs text-gray-600 mb-1">URL</label>
              <input
                type="url"
                placeholder="Media URL"
                className="w-full p-2 border rounded text-sm"
                {...register(`media.${idx}.imageUrl` as const)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                placeholder="Alt text (optional)"
                className="w-full p-2 border rounded text-sm"
                {...register(`media.${idx}.altText` as const)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Order</label>
              <input
                type="text"
                placeholder="Order"
                className="w-full p-2 border rounded text-sm"
                {...register(`media.${idx}.displayOrder` as const)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Type</label>
              <div className="flex gap-2">
                <select
                  className="flex-1 p-2 border rounded text-sm"
                  {...register(`media.${idx}.mediaType` as const)}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <button
                  type="button"
                  className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-sm"
                  onClick={() => remove(idx)}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          onClick={() =>
            append({
              imageUrl: "",
              altText: "",
              displayOrder: fields.length.toString(),
              mediaType: "image",
            })
          }
        >
          Add Media
        </button>
        {errors.media && (
          <p className="text-red-500 text-sm mt-1">{errors.media.message}</p>
        )}
      </div>
    </div>
  );
};

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onOpenChange,
  editProduct,
  onSuccess,
}) => {
  const { api } = useApi();
  const { showError, showSuccess } = useToast();
  const [submitting, setSubmitting] = React.useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    control,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      net_price: "",
      stock: "",
      currency: "GBP",
      vat_rate: "20",
      media: [],
    },
  });

  // Populate form when editing
  React.useEffect(() => {
    if (editProduct) {
      setValue("name", editProduct.name);
      setValue("net_price", editProduct.net_price?.toString() || "");
      setValue("description", editProduct.description || "");
      setValue("stock", editProduct.stock?.toString() || "");
      setValue("currency", editProduct.currency || "GBP");
      setValue("vat_rate", editProduct.vat_rate?.toString() || "20");
      setValue(
        "media",
        editProduct.images?.map((img, i) => ({
          imageUrl: img.image_url,
          altText: img.alt_text || "",
          displayOrder: (img.display_order ?? i).toString(),
          mediaType: img.media_type || "image",
        })) || []
      );
    } else {
      reset();
    }
  }, [editProduct, setValue, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      // Validate and transform the data
      const validatedData = productApiSchema.parse(data);

      if (editProduct) {
        await api.updateProduct({
          id: editProduct.id,
          currency: validatedData.currency,
          description: validatedData.description,
          name: validatedData.name,
          net_price: validatedData.net_price,
          stock: validatedData.stock,
          vat_rate: validatedData.vat_rate,
          media: validatedData.media?.map((item) => {
            return {
              image_url: item.imageUrl,
              alt_text: item.altText,
              display_order: item.displayOrder,
              media_type: item.mediaType,
            };
          }),
        });
        showSuccess("Product updated");
      } else {
        await api.newProduct({
          name: validatedData.name,
          description: validatedData.description,
          net_price: validatedData.net_price,
          stock: validatedData.stock,
          currency: validatedData.currency,
          vat_rate: validatedData.vat_rate,
          media:
            validatedData.media?.map((item) => ({
              image_url: item.imageUrl,
              alt_text: item.altText,
              display_order: item.displayOrder,
              media_type: item.mediaType,
            })) || [],
        });
        showSuccess("Product created");
      }

      onOpenChange(false);
      reset();
      onSuccess();
    } catch (e) {
      if (e instanceof z.ZodError) {
        // Handle validation errors
        e.issues.forEach((issue) => {
          showError(`${issue.path.join(".")}: ${issue.message}`);
        });
      } else {
        showError("Failed to save product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={editProduct ? "Edit Product" : "Add Product"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            {...register("name")}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Net Price (in pence)
          </label>
          <input
            {...register("net_price")}
            type="number"
            className="w-full p-2 border border-gray-300 rounded-md"
            min={0}
          />
          {errors.net_price && (
            <p className="text-red-500 text-sm mt-1">
              {errors.net_price.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            {...register("description")}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Stock (optional)
          </label>
          <input
            {...register("stock")}
            type="number"
            className="w-full p-2 border border-gray-300 rounded-md"
            min={0}
          />
          {errors.stock && (
            <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <select
            {...register("currency")}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="GBP">GBP (British Pound)</option>
            <option value="USD">USD (US Dollar)</option>
            <option value="EUR">EUR (Euro)</option>
          </select>
          {errors.currency && (
            <p className="text-red-500 text-sm mt-1">
              {errors.currency.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">VAT Rate (%)</label>
          <input
            {...register("vat_rate")}
            type="number"
            className="w-full p-2 border border-gray-300 rounded-md"
            min={0}
            max={100}
          />
          {errors.vat_rate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.vat_rate.message}
            </p>
          )}
        </div>

        {/* Media (Images & Videos) */}
        <MediaFields control={control} register={register} errors={errors} />

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && (
              <Spinner variant="circle-filled" size={16} className="mr-2" />
            )}
            {editProduct ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
