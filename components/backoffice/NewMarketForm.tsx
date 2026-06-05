"use client";

import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import type { Resolver } from "react-hook-form";

import ImageInput from "@/components/FormInputs/ImageInput";
import MultiSelectDropdown from "@/components/FormInputs/MultiSelectDropdown";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import TextareaInput from "@/components/FormInputs/TextAreaInput";
import TextInput from "@/components/FormInputs/TextInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import { createMarket, updateMarket } from "@/actions/market";
import { marketSchema, type MarketInput } from "@/lib/validators/market.schema";

type Option = {
  label: string;
  value: string;
};

type MarketFormData = Omit<MarketInput, "translations"> & {
  id?: string;
  translations?: {
    locale: string;
    title: string;
    description?: string | null;
    slug?: string | null;
  }[];
};

type Props = {
  categories: Option[];
  market?: MarketFormData;
};

const locales = [
  { locale: "en", label: "English" },
  { locale: "hi", label: "Hindi" },
  { locale: "mr", label: "Marathi" },
] as const;

function normalizeMarket(market?: MarketFormData): MarketInput {
  return {
    logoUrl: market?.logoUrl ?? "",
    isActive: market?.isActive ?? true,
    categoryIds: market?.categoryIds ?? [],
    translations: locales.map(({ locale }) => {
      const translation = market?.translations?.find(
        (item) => item.locale.toLowerCase() === locale
      );

      return {
        locale,
        title: translation?.title ?? "",
        description: translation?.description ?? "",
        slug: translation?.slug ?? "",
      };
    }),
  };
}

export default function NewMarketForm({ categories, market }: Props) {
  const isUpdate = Boolean(market?.id);

  const form = useForm<MarketInput>({
    resolver: zodResolver(marketSchema) as Resolver<MarketInput>,
    defaultValues: normalizeMarket(market),
  });
  const translations = useWatch({
    control: form.control,
    name: "translations",
  });

  async function onSubmit(data: MarketInput) {
    const response =
      isUpdate && market?.id
        ? await updateMarket(market.id, data)
        : await createMarket(data);

    if (!response.success) {
      toast.error(response.error ?? "Market save failed");
      return;
    }

    toast.success(isUpdate ? "Market updated" : "Market created");
    window.location.assign("/dashboard/markets");
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-5xl space-y-8 rounded-lg border border-white/10 bg-white/5 p-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <ImageInput<MarketInput>
            name="logoUrl"
            endpoint="marketLogoUploader"
            label="Market Logo"
          />

          <div className="space-y-6">
            <ToggleInput<MarketInput>
              label="Status"
              name="isActive"
              trueTitle="Active"
              falseTitle="Inactive"
            />

            <MultiSelectDropdown<MarketInput>
              label="Categories"
              name="categoryIds"
              options={categories}
            />
          </div>
        </div>

        <div className="space-y-6">
          {locales.map((item, index) => (
            <section
              key={item.locale}
              className="space-y-4 rounded-md border border-white/10 p-4"
            >
              <h2 className="text-base font-semibold">{item.label}</h2>

              <input
                type="hidden"
                {...form.register(`translations.${index}.locale`)}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <TextInput<MarketInput>
                  label="Title"
                  name={`translations.${index}.title`}
                  register={form.register}
                  errors={form.formState.errors}
                />

                <TextInput<MarketInput>
                  label="Slug"
                  name={`translations.${index}.slug`}
                  register={form.register}
                  errors={form.formState.errors}
                />
              </div>

              <TextareaInput<MarketInput>
                label="Description"
                name={`translations.${index}.description`}
                languageName={`translations.${index}.locale`}
                rows={6}
                features={{
                  ai: true,
                  voice: true,
                  language: true,
                  editor: true,
                }}
                aiPrompt={`Create an ecommerce market description for ${
                  translations?.[index]?.title || "this market"
                }`}
              />
            </section>
          ))}
        </div>

        <SubmitButton
          buttonTitle={isUpdate ? "Update Market" : "Create Market"}
          loadingButtonTitle={isUpdate ? "Updating..." : "Creating..."}
          isLoading={form.formState.isSubmitting}
        />
      </form>
    </FormProvider>
  );
}
