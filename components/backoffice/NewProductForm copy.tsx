"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductInput } from "@/lib/validators/productSchema";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/useProduct";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  initialData?: ProductInput & { id?: string };
};

export default function ProductForm({ initialData }: Props) {
  const router = useRouter();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  /* ================= FORM ================= */
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      title: "",
      tags: [],
      currency: "INR",
      categoryId: "",
      userId: "",
      images: [],
      variants: [],
      translations: [],
    },
  });

  /* ================= WATCH (SAFE) ================= */
  const images = useWatch({
    control: form.control,
    name: "images",
  }) || [];

  const variants = useWatch({
    control: form.control,
    name: "variants",
  }) || [];

  /* ================= FIELD ARRAYS ================= */
  const { fields: variantFields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  /* ================= SUBMIT ================= */
  const onSubmit = async (data: ProductInput) => {
    if (initialData?.id) {
      await updateMutation.mutateAsync({
        id: initialData.id,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }

    router.push("/dashboard/products");
  };

  /* ================= UI ================= */
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      
      {/* ================= BASIC ================= */}
      <div className="space-y-4">
        <h2 className="font-semibold">Basic Info</h2>

        <Input placeholder="Title" {...form.register("title")} />
        <Input placeholder="Category ID" {...form.register("categoryId")} />
        <Input placeholder="User ID" {...form.register("userId")} />
      </div>

      {/* ================= IMAGES ================= */}
      <div className="space-y-4">
        <h2 className="font-semibold">Images</h2>

        <Button
          type="button"
          onClick={() =>
            form.setValue("images", [
              ...images,
              { url: "", isPrimary: false },
            ])
          }
        >
          Add Image
        </Button>

        {images.map((img, i) => (
          <div key={i} className="flex gap-2">
            <Input {...form.register(`images.${i}.url`)} />

            <input type="checkbox" {...form.register(`images.${i}.isPrimary`)} />

            <Button
              type="button"
              onClick={() => {
                const updated = [...images];
                updated.splice(i, 1);
                form.setValue("images", updated);
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {/* ================= VARIANTS ================= */}
      <div className="space-y-4">
        <h2 className="font-semibold">Variants</h2>

        <Button
          type="button"
          onClick={() =>
            append({
              title: "",
              price: 0,
              attributes: [],
              wholesalePricing: [],
              isDefault: false,
            })
          }
        >
          Add Variant
        </Button>

        {variantFields.map((field, i) => {
          const attributes = variants[i]?.attributes || [];
          const wholesale = variants[i]?.wholesalePricing || [];

          return (
            <div key={field.id} className="border p-4 space-y-4">
              <Input {...form.register(`variants.${i}.title`)} />

              <Input
                type="number"
                {...form.register(`variants.${i}.price`, {
                  valueAsNumber: true,
                })}
              />

              {/* ATTRIBUTES */}
              <Button
                type="button"
                onClick={() => {
                  form.setValue(`variants.${i}.attributes`, [
                    ...attributes,
                    { name: "", value: "" },
                  ]);
                }}
              >
                Add Attribute
              </Button>

              {attributes.map((_, j) => (
                <div key={j} className="flex gap-2">
                  <Input {...form.register(`variants.${i}.attributes.${j}.name`)} />
                  <Input {...form.register(`variants.${i}.attributes.${j}.value`)} />
                </div>
              ))}

              {/* WHOLESALE */}
              <Button
                type="button"
                onClick={() => {
                  form.setValue(`variants.${i}.wholesalePricing`, [
                    ...wholesale,
                    { minQty: 1, price: 0 },
                  ]);
                }}
              >
                Add Wholesale
              </Button>

              {wholesale.map((_, j) => (
                <div key={j} className="flex gap-2">
                  <Input
                    type="number"
                    {...form.register(
                      `variants.${i}.wholesalePricing.${j}.minQty`,
                      { valueAsNumber: true }
                    )}
                  />
                  <Input
                    type="number"
                    {...form.register(
                      `variants.${i}.wholesalePricing.${j}.price`,
                      { valueAsNumber: true }
                    )}
                  />
                </div>
              ))}

              <Button type="button" onClick={() => remove(i)}>
                Remove Variant
              </Button>
            </div>
          );
        })}
      </div>

      {/* ================= TRANSLATIONS ================= */}
      <div className="space-y-4">
        <h2 className="font-semibold">Translations</h2>

        {["EN", "HI", "MR"].map((locale, i) => (
          <div key={locale} className="border p-4 space-y-2">
            <Input {...form.register(`translations.${i}.title`)} />
            <Input {...form.register(`translations.${i}.description`)} />

            <input
              type="hidden"
              value={locale}
              {...form.register(`translations.${i}.locale`)}
            />
          </div>
        ))}
      </div>

      {/* ================= SUBMIT ================= */}
      <Button type="submit" className="w-full">
        {initialData ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}