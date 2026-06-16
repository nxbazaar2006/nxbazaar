import type { Editor } from "@tiptap/core";

export function VoiceInputControls({
  editor,
  onTranscription,
}: {
  editor: Editor;
  onTranscription: (transcript: string, editor: Editor) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onTranscription("", editor)}
      className="px-2 py-1 text-sm rounded-2xl hover:bg-white/10"
    >
      Voice Input
    </button>
  );
}
