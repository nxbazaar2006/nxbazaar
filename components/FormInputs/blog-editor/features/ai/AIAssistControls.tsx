import type { Editor } from "@tiptap/core";

export function AIAssistControls({
  editor,
  onAssist,
}: {
  editor: Editor;
  onAssist: (editor: Editor) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onAssist(editor)}
      className="px-2 py-1 text-sm rounded-2xl hover:bg-white/10"
    >
      AI Assist
    </button>
  );
}
