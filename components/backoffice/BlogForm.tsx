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
  return `inline-flex h-8 w-8 items-center justify-center rounded border text-xs ${
    active ? "bg-black text-white" : "bg-white text-black"
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
    <div className="overflow-hidden rounded border">
      <div className="flex flex-wrap gap-1 border-b bg-gray-50 p-2">
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
        className="p-3"
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
          form.translations.find((t: BlogTranslationInput) => t.locale === activeTab)?.title || ""
        }
        onChange={(e) =>
          updateTranslation(activeTab, "title", e.target.value)
        }
        placeholder={`Title (${activeTab})`}
        className="border p-2 w-full"
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
            slug: generateSlug(e.target.value),
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
          form.translations.find((t: BlogTranslationInput) => t.locale === activeTab)
            ?.metaTitle || ""
        }
        onChange={(e) =>
          updateTranslation(activeTab, "metaTitle", e.target.value)
        }
        placeholder="Meta Title"
        className="border p-2 w-full"
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

      {/* ===== EDITOR ===== */}
      <BlogEditor
        value={form.content}
        onChange={(val) =>
          setForm({ ...form, content: val })
        }
      />

      {/* ===== SUBMIT ===== */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={create.isPending || update.isPending}
        className="bg-blue-600 text-white px-6 py-2 rounded"
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
