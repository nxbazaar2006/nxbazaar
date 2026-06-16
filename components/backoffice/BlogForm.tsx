"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Undo2,
} from "lucide-react";
import { BlogInput } from "@/lib/validators/blog.schema";
import { useCreateBlog, useUpdateBlog } from "@/hooks/useBlog";
import { generateSlug } from "@/lib/utils/slug";
import BlogEditor from "@/components/FormInputs/Editor";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Locale = "en" | "hi" | "mr";
type BlogTranslationInput = BlogInput["translations"][number];

type Props = {
  initialData?: BlogInput;
  blogId?: string;
};

const locales: Locale[] = ["en", "hi", "mr"];
const DESCRIPTION_PLACEHOLDER = "Write a clear ecommerce description";

function toolbarClass(active = false) {
  return `inline-flex h-8 w-8 items-center justify-center rounded-2xl text-xs transition ${
    active
      ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 text-white"
      : "border bg-card text-card-foreground shadow-sm text-slate-700 hover:-translate-y-0.5 dark:text-slate-200"
  }`;
}

function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-[140px] outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== (value || "<p></p>")) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div className="border bg-card text-card-foreground shadow-sm overflow-hidden rounded-2xl">
      <div className="flex flex-wrap gap-1 bg-white/45 p-2 backdrop-blur-xl dark:bg-white/5">
        <button
          type="button"
          className={toolbarClass(editor?.isActive("bold"))}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarClass(editor?.isActive("italic"))}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarClass(editor?.isActive("heading", { level: 2 }))}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarClass(editor?.isActive("bulletList"))}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarClass(editor?.isActive("orderedList"))}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarClass()}
          onClick={() => editor?.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarClass()}
          onClick={() => editor?.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[170px] p-4 text-sm text-slate-800 dark:text-slate-100"
        aria-label={placeholder}
      />
    </div>
  );
}

export default function BlogForm({ initialData, blogId }: Props) {
  const isEdit = Boolean(blogId);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Locale>("en");
  const [slugLocked, setSlugLocked] = useState(false);

  const [form, setForm] = useState<BlogInput>(
    initialData
      ? {
          ...initialData,
          imageUrl: initialData.imageUrl ?? "",
          categoryId: initialData.categoryId ?? "",
          translations: locales.map((locale) => {
            const existing = initialData.translations.find(
              (translation: BlogTranslationInput) =>
                translation.locale.toLowerCase() === locale
            );

            return {
              locale,
              title: existing?.title ?? "",
              description: existing?.description ?? "",
              metaTitle: existing?.metaTitle ?? "",
              metaDescription:
                existing?.metaDescription ?? "",
            };
          }),
        }
      : {
          slug: "",
          imageUrl: "",
          isActive: true,
          isFeatured: false,
          content: {},
          userId: "",
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
    const updated = form.translations.map((t: BlogTranslationInput) =>
      t.locale === locale ? { ...t, [field]: value } : t
    );

    const enTitle =
      updated.find((t: BlogTranslationInput) => t.locale === "en")?.title || "";

    setForm({
      ...form,
      translations: updated,
      slug: slugLocked ? form.slug : generateSlug(enTitle),
    });
  };

  /* ================================
     SUBMIT
  ================================= */

  const handleSubmit = async () => {
    const englishTitle =
      form.translations.find((t: BlogTranslationInput) => t.locale === "en")?.title.trim() ?? "";

    if (!englishTitle) {
      setActiveTab("en");
      toast.error("English blog title is required");
      return;
    }

    const payload: BlogInput = {
      ...form,
      slug: form.slug || generateSlug(englishTitle),
      translations: form.translations
        .map((translation: BlogTranslationInput) => ({
          ...translation,
          title: translation.title.trim(),
          description: translation.description?.trim() || undefined,
          metaTitle: translation.metaTitle?.trim() || undefined,
          metaDescription:
            translation.metaDescription?.trim() || undefined,
        }))
        .filter((translation: BlogTranslationInput) => translation.title.length > 0),
    };

    const response =
      isEdit && blogId
        ? await update.mutateAsync({ id: blogId, data: payload })
        : await create.mutateAsync(payload);

    toast.success(
      response?.message ??
        (isEdit
          ? "Blog updated successfully"
          : "Blog created successfully")
    );

    router.push("/dashboard/blog");
    router.refresh();
  };

  /* ================================
     UI
  ================================= */

  return (
    <div className="border bg-card text-card-foreground shadow-sm mx-auto max-w-7xl space-y-6 rounded-3xl p-4 sm:p-6">

      {/* ===== LANGUAGE TABS ===== */}
      <div className="flex flex-wrap gap-2">
        {locales.map((l) => (
          <button
            type="button"
            key={l}
            onClick={() => setActiveTab(l)}
            className={`min-h-10 rounded-2xl px-4 text-sm font-semibold transition ${
              activeTab === l
                ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 text-white"
                : "border bg-card text-card-foreground shadow-sm text-slate-700 hover:-translate-y-0.5 dark:text-slate-200"
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="border bg-card text-card-foreground shadow-sm space-y-4 rounded-3xl p-4">
          <div>
            <p className="text-foreground text-sm font-semibold uppercase tracking-wide">
              Content
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
              Blog translation
            </h2>
          </div>

          {/* ===== TITLE ===== */}
          <input
            value={
              form.translations.find((t: BlogTranslationInput) => t.locale === activeTab)?.title || ""
            }
            onChange={(e) =>
              updateTranslation(activeTab, "title", e.target.value)
            }
            placeholder={`Title (${activeTab})`}
            className="border bg-background text-foreground shadow-xs w-full px-4 py-2"
          />

          {/* ===== DESCRIPTION ===== */}
          <RichTextEditor
            value={
              form.translations.find((t: BlogTranslationInput) => t.locale === activeTab)?.description ||
              ""
            }
            onChange={(value) =>
              updateTranslation(activeTab, "description", value)
            }
            placeholder={DESCRIPTION_PLACEHOLDER}
          />
        </section>

        <section className="border bg-card text-card-foreground shadow-sm space-y-4 rounded-3xl p-4">
          <div>
            <p className="text-foreground text-sm font-semibold uppercase tracking-wide">
              Publishing
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
              Routing & status
            </h2>
          </div>

          {/* ===== SLUG CONTROL ===== */}
          <label className="border bg-card text-card-foreground shadow-sm flex min-h-11 items-center gap-3 rounded-2xl px-4 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={slugLocked}
              onChange={() => setSlugLocked(!slugLocked)}
              className="h-4 w-4 accent-slate-950 dark:accent-white"
            />
            Manual Slug
          </label>

          {/* ===== SLUG ===== */}
          <input
            value={form.slug}
            disabled={!slugLocked}
            onChange={(e) =>
              setForm({
                ...form,
                slug: generateSlug(e.target.value),
              })
            }
            placeholder="Slug"
            className="border bg-background text-foreground shadow-xs w-full px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />

          {/* ===== IMAGE ===== */}
          <input
            value={form.imageUrl || ""}
            onChange={(e) =>
              setForm({ ...form, imageUrl: e.target.value })
            }
            placeholder="Image URL"
            className="border bg-background text-foreground shadow-xs w-full px-4 py-2"
          />

          {/* ===== CATEGORY ===== */}
          <input
            value={form.categoryId || ""}
            onChange={(e) =>
              setForm({ ...form, categoryId: e.target.value })
            }
            placeholder="Category ID"
            className="border bg-background text-foreground shadow-xs w-full px-4 py-2"
          />

          {/* ===== STATUS ===== */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="border bg-card text-card-foreground shadow-sm flex min-h-11 items-center gap-3 rounded-2xl px-4 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={() =>
                  setForm({ ...form, isActive: !form.isActive })
                }
                className="h-4 w-4 accent-slate-950 dark:accent-white"
              />
              Active
            </label>

            <label className="border bg-card text-card-foreground shadow-sm flex min-h-11 items-center gap-3 rounded-2xl px-4 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={() =>
                  setForm({ ...form, isFeatured: !form.isFeatured })
                }
                className="h-4 w-4 accent-slate-950 dark:accent-white"
              />
              Featured
            </label>
          </div>
        </section>
      </div>

      <section className="border bg-card text-card-foreground shadow-sm space-y-4 rounded-3xl p-4">
        <div>
          <p className="text-foreground text-sm font-semibold uppercase tracking-wide">
            SEO
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
            Search preview metadata
          </h2>
        </div>

        {/* ===== SEO ===== */}
        <input
          value={
            form.translations.find((t: BlogTranslationInput) => t.locale === activeTab)
              ?.metaTitle || ""
          }
          onChange={(e) =>
            updateTranslation(activeTab, "metaTitle", e.target.value)
          }
          placeholder="Meta Title"
          className="border bg-background text-foreground shadow-xs w-full px-4 py-2"
        />

        <RichTextEditor
          value={
            form.translations.find((t: BlogTranslationInput) => t.locale === activeTab)
              ?.metaDescription || ""
          }
          onChange={(value) =>
            updateTranslation(
              activeTab,
              "metaDescription",
              value
            )
          }
          placeholder={DESCRIPTION_PLACEHOLDER}
        />
      </section>

      {/* ===== EDITOR ===== */}
      <section className="border bg-card text-card-foreground shadow-sm space-y-4 rounded-3xl p-4">
        <div>
          <p className="text-foreground text-sm font-semibold uppercase tracking-wide">
            Story builder
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
            Rich content blocks
          </h2>
        </div>
        <BlogEditor
          value={form.content}
          onChange={(val) =>
            setForm({ ...form, content: val })
          }
        />
      </section>

      {/* ===== SUBMIT ===== */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={create.isPending || update.isPending}
        className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 min-h-11 rounded-2xl px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {create.isPending || update.isPending
          ? "Saving..."
          : isEdit
            ? "Update Blog"
            : "Create Blog"}
      </button>
    </div>
  );
}
