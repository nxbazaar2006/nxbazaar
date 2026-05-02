"use client";

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

  if (!editor) return null;

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
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

      <div className="p-4 min-h-[200px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
