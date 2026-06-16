import type { Editor } from "@tiptap/core";

export function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="px-2 py-1 text-sm rounded-2xl hover:bg-white/10"
      >
        Bold
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="px-2 py-1 text-sm rounded-2xl hover:bg-white/10"
      >
        Italic
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className="px-2 py-1 text-sm rounded-2xl hover:bg-white/10"
      >
        H2
      </button>
    </>
  );
}
