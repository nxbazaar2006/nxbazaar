"use client";

<<<<<<< HEAD:components/FormInputs/Editor.tsx
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
=======
import { EditorContent } from "@tiptap/react";
import { useBlogEditorCore } from "./blog-editor/core/useBlogEditorCore";
import { EditorToolbar } from "./blog-editor/features/toolbar/EditorToolbar";
import { AIAssistControls } from "./blog-editor/features/ai/AIAssistControls";
import { VoiceInputControls } from "./blog-editor/features/voice/VoiceInputControls";
import type { BlogEditorProps } from "./blog-editor/types";

const DEFAULT_FEATURES = {
  toolbar: true,
  aiAssistant: false,
  voiceInput: false,
};

export default function BlogEditor({
  value,
  onChange,
  features,
  onAiAssist,
  onVoiceTranscription,
}: BlogEditorProps) {
  const editor = useBlogEditorCore({ value, onChange });
  const resolvedFeatures = { ...DEFAULT_FEATURES, ...features };
>>>>>>> 6cf6bafd1bc31939473fdfa5a272376b494100f7:components/FormInputs/BlogEditor.tsx

  if (!editor) return null;

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
<<<<<<< HEAD:components/FormInputs/Editor.tsx
      
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
=======
      <div className="flex gap-2 p-2 border-b border-white/10 bg-white/5">
        {resolvedFeatures.toolbar && <EditorToolbar editor={editor} />}

        {resolvedFeatures.aiAssistant && onAiAssist && (
          <AIAssistControls editor={editor} onAssist={onAiAssist} />
        )}

        {resolvedFeatures.voiceInput && onVoiceTranscription && (
          <VoiceInputControls
            editor={editor}
            onTranscription={onVoiceTranscription}
          />
        )}
      </div>

>>>>>>> 6cf6bafd1bc31939473fdfa5a272376b494100f7:components/FormInputs/BlogEditor.tsx
      <div className="p-4 min-h-[200px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
