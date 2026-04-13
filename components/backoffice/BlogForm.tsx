"use client";

import { useState } from "react";
import { BlogInput } from "@/lib/validators/blog.schema";
import { useCreateBlog, useUpdateBlog } from "@/hooks/useBlog";
import { generateSlug } from "@/lib/utils/slug";
import BlogEditor from "@/components/Forminputs/BlogEditor";

type Locale = "en" | "hi" | "mr";

type Props = {
  initialData?: BlogInput;
  blogId?: string;
};

const locales: Locale[] = ["en", "hi", "mr"];

export default function BlogForm({ initialData, blogId }: Props) {
  const isEdit = Boolean(blogId);

  const [activeTab, setActiveTab] = useState<Locale>("en");
  const [slugLocked, setSlugLocked] = useState(false);

  const [form, setForm] = useState<BlogInput>(
    initialData || {
      slug: "",
      imageUrl: "",
      isActive: true,
      isFeatured: false,
      content: {},
      userId: "", // 🔥 later auth से आएगा
      categoryId: "",
      translations: locales.map((l) => ({
        locale: l,
        title: "",
        description: "",
        metaTitle: "",
        metaDescription: "",
      })),
    }
  );

  const create = useCreateBlog();
  const update = useUpdateBlog();

  /* ================================
     UPDATE TRANSLATION
  ================================= */

  const updateTranslation = (
    locale: Locale,
    field:
      | "title"
      | "description"
      | "metaTitle"
      | "metaDescription",
    value: string
  ) => {
    const updated = form.translations.map((t) =>
      t.locale === locale ? { ...t, [field]: value } : t
    );

    const enTitle =
      updated.find((t) => t.locale === "en")?.title || "";

    setForm({
      ...form,
      translations: updated,
      slug: slugLocked ? form.slug : slugify(enTitle),
    });
  };

  /* ================================
     SUBMIT
  ================================= */

  const handleSubmit = () => {
    if (isEdit && blogId) {
      update.mutate({ id: blogId, data: form });
    } else {
      create.mutate(form);
    }
  };

  /* ================================
     UI
  ================================= */

  return (
    <div className="space-y-6">

      {/* ===== LANGUAGE TABS ===== */}
      <div className="flex gap-2">
        {locales.map((l) => (
          <button
            key={l}
            onClick={() => setActiveTab(l)}
            className={`px-3 py-1 border ${
              activeTab === l ? "bg-black text-white" : ""
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ===== TITLE ===== */}
      <input
        value={
          form.translations.find((t) => t.locale === activeTab)?.title || ""
        }
        onChange={(e) =>
          updateTranslation(activeTab, "title", e.target.value)
        }
        placeholder={`Title (${activeTab})`}
        className="border p-2 w-full"
      />

      {/* ===== DESCRIPTION ===== */}
      <textarea
        value={
          form.translations.find((t) => t.locale === activeTab)?.description ||
          ""
        }
        onChange={(e) =>
          updateTranslation(activeTab, "description", e.target.value)
        }
        placeholder={`Description (${activeTab})`}
        className="border p-2 w-full"
      />

      {/* ===== SLUG CONTROL ===== */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={slugLocked}
          onChange={() => setSlugLocked(!slugLocked)}
        />
        <label>Manual Slug</label>
      </div>

      {/* ===== SLUG ===== */}
      <input
        value={form.slug}
        disabled={!slugLocked}
        onChange={(e) =>
          setForm({
            ...form,
            slug: slugify(e.target.value),
          })
        }
        placeholder="Slug"
        className="border p-2 w-full"
      />

      {/* ===== IMAGE ===== */}
      <input
        value={form.imageUrl || ""}
        onChange={(e) =>
          setForm({ ...form, imageUrl: e.target.value })
        }
        placeholder="Image URL"
        className="border p-2 w-full"
      />

      {/* ===== CATEGORY ===== */}
      <input
        value={form.categoryId || ""}
        onChange={(e) =>
          setForm({ ...form, categoryId: e.target.value })
        }
        placeholder="Category ID"
        className="border p-2 w-full"
      />

      {/* ===== STATUS ===== */}
      <div className="flex gap-4">
        <label>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={() =>
              setForm({ ...form, isActive: !form.isActive })
            }
          />
          Active
        </label>

        <label>
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={() =>
              setForm({ ...form, isFeatured: !form.isFeatured })
            }
          />
          Featured
        </label>
      </div>

      {/* ===== SEO ===== */}
      <input
        value={
          form.translations.find((t) => t.locale === activeTab)
            ?.metaTitle || ""
        }
        onChange={(e) =>
          updateTranslation(activeTab, "metaTitle", e.target.value)
        }
        placeholder="Meta Title"
        className="border p-2 w-full"
      />

      <textarea
        value={
          form.translations.find((t) => t.locale === activeTab)
            ?.metaDescription || ""
        }
        onChange={(e) =>
          updateTranslation(
            activeTab,
            "metaDescription",
            e.target.value
          )
        }
        placeholder="Meta Description"
        className="border p-2 w-full"
      />

      {/* ===== EDITOR ===== */}
      <BlogEditor
        value={form.content}
        onChange={(val) =>
          setForm({ ...form, content: val })
        }
      />

      {/* ===== SUBMIT ===== */}
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        {isEdit ? "Update Blog" : "Create Blog"}
      </button>
    </div>
  );
}