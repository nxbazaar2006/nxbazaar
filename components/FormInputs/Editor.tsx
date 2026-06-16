"use client";

import { EditorContent } from "@tiptap/react";

import { AIAssistControls } from "./blog-editor/features/ai/AIAssistControls";
import { EditorToolbar } from "./blog-editor/features/toolbar/EditorToolbar";
import { VoiceInputControls } from "./blog-editor/features/voice/VoiceInputControls";
import { useBlogEditorCore } from "./blog-editor/core/useBlogEditorCore";
import type { BlogEditorProps } from "./blog-editor/types";

const DEFAULT_FEATURES = {
  toolbar: true,
  aiAssistant: false,
  voiceInput: false,
};

export default function Editor({
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
    <div className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
      <div className="flex gap-2 border-b border-border bg-muted p-2">
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

      <div className="min-h-[200px] p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
