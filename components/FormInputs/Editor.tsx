"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

type Props = {
  name: string;
};

export default function BlogEditor({ name }: Props) {
  const { setValue, watch } = useFormContext();

  const value = watch(name);

  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "<p></p>",
    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      setValue(name, editor.getJSON(), {
        shouldDirty: true,
      });
    },
  });

  // ✅ sync form → editor
  useEffect(() => {
    if (!editor || !value) return;

    const current = editor.getJSON();

    if (JSON.stringify(current) !== JSON.stringify(value)) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      
      {/* Toolbar */}
      <div className="flex gap-2 p-2 border-b border-white/10 bg-white/5">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
          className="px-2 py-1 text-sm rounded hover:bg-white/10"
        >
          Bold
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
          className="px-2 py-1 text-sm rounded hover:bg-white/10"
        >
          Italic
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 2 })
              .run()
          }
          className="px-2 py-1 text-sm rounded hover:bg-white/10"
        >
          H2
        </button>
      </div>

      {/* Editor */}
      <div className="p-4 min-h-[200px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}