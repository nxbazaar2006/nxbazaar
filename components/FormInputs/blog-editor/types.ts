import type { JSONContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";

export type BlogEditorFeatureFlags = {
  toolbar?: boolean;
  aiAssistant?: boolean;
  voiceInput?: boolean;
};

export type BlogEditorProps = {
  value: JSONContent | null;
  onChange: (val: JSONContent) => void;
  features?: BlogEditorFeatureFlags;
  onAiAssist?: (editor: Editor) => void;
  onVoiceTranscription?: (transcript: string, editor: Editor) => void;
};
