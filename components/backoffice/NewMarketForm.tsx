"use client";

import { useEffect, useState } from "react";
import { createMarket, updateMarket } from "@/actions/market";
import { useRouter } from "next/navigation";

type Translation = {
  locale: "en" | "hi" | "mr";
  title: string;
  description?: string;
};

type MarketFormProps = {
  initialData?: any;
  categories?: { id: string; title: string }[];
};

export default function MarketForm({
  initialData,
  categories = [],
}: MarketFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    logoUrl: "",
    isActive: true,
    categories: [] as string[],
    translations: [
      { locale: "en", title: "", description: "" },
      { locale: "hi", title: "", description: "" },
      { locale: "mr", title: "", description: "" },
    ] as Translation[],
  });

  // ✅ EDIT MODE PREFILL
  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        logoUrl: initialData.logoUrl || "",
        isActive: initialData.isActive,
        categories: initialData.categories?.map((c: any) => c.id) || [],
        translations:
          initialData.translations?.length > 0
            ? initialData.translations
            : form.translations,
      });
    }
  }, [initialData]);

  // ✅ INPUT HANDLER
  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ TRANSLATION CHANGE
  const handleTranslationChange = (
    index: number,
    field: keyof Translation,
    value: string
  ) => {
    const updated = [...form.translations];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, translations: updated }));
  };

  // ✅ CATEGORY TOGGLE
  const toggleCategory = (id: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  };

  // ✅ SUBMIT
  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (initialData) {
        await updateMarket(initialData.id, form);
      } else {
        await createMarket(form);
      }

      router.push("/dashboard/markets");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* TITLE */}
      <div>
        <label className="text-sm font-medium">Title</label>
        <input
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full mt-1 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 outline-none"
        />
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full mt-1 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 outline-none"
        />
      </div>

      {/* LOGO */}
      <div>
        <label className="text-sm font-medium">Logo URL</label>
        <input
          value={form.logoUrl}
          onChange={(e) => handleChange("logoUrl", e.target.value)}
          className="w-full mt-1 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 outline-none"
        />
      </div>

      {/* ACTIVE */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => handleChange("isActive", e.target.checked)}
        />
        <label>Active</label>
      </div>

      {/* CATEGORIES */}
      <div>
        <label className="text-sm font-medium">Categories</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`px-3 py-1 rounded-xl border ${
                form.categories.includes(cat.id)
                  ? "bg-black text-white"
                  : "bg-white dark:bg-neutral-800"
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* TRANSLATIONS */}
      <div>
        <h3 className="font-semibold mb-2">Translations</h3>

        {form.translations.map((t, index) => (
          <div
            key={t.locale}
            className="p-4 mb-3 rounded-xl border bg-white/50 dark:bg-neutral-900/50"
          >
            <p className="text-sm font-semibold uppercase mb-2">
              {t.locale}
            </p>

            <input
              placeholder="Title"
              value={t.title}
              onChange={(e) =>
                handleTranslationChange(index, "title", e.target.value)
              }
              className="w-full mb-2 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800"
            />

            <textarea
              placeholder="Description"
              value={t.description}
              onChange={(e) =>
                handleTranslationChange(index, "description", e.target.value)
              }
              className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800"
            />
          </div>
        ))}
      </div>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-6 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black"
      >
        {loading ? "Saving..." : "Save Market"}
      </button>
    </div>
  );
}