"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { FEATURES, isFeatureEnabled } from "@/lib/features";
import { generateAIContent, type AIRequestType } from "@/lib/ai";
import { LANGUAGES, type SupportedLanguage } from "@/lib/languages";
import { useSpeechToText } from "@/hooks/useSpeechToText";

type Props<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  label: string;
  enableAI?: boolean;
  enableVoice?: boolean;
  enableLanguage?: boolean;
  editor?: "textarea" | "rich";
  placeholder?: string;
};

function RichField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== (value || "")) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  return <EditorContent editor={editor} className="min-h-36 rounded-2xl border p-3" />;
}

export default function TextareaInput<T extends FieldValues>({
  form,
  name,
  label,
  enableAI = false,
  enableVoice = false,
  enableLanguage = false,
  editor = "textarea",
  placeholder,
}: Props<T>) {
  const { control, setValue, watch, formState: { errors } } = form;
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [aiLoading, setAiLoading] = useState(false);
  const { isSupported, isListening, startListening, stopListening } = useSpeechToText();

  const canAI = enableAI && isFeatureEnabled("AI");
  const canVoice = enableVoice && isFeatureEnabled("VOICE");
  const canLanguage = enableLanguage && isFeatureEnabled("MULTI_LANG");
  const canRich = editor === "rich" && isFeatureEnabled("RICH_EDITOR");

  const currentValue = (watch(name) as string) ?? "";
  const error = (errors as Record<string, { message?: string }>)[name as string]?.message;

  const voiceLang = useMemo(() => {
    if (language === "hi") return "hi-IN";
    if (language === "mr") return "mr-IN";
    return "en-US";
  }, [language]);

  const applyValue = (next: string) => {
    setValue(name, next as T[FieldPath<T>], { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const runAI = async (type: AIRequestType) => {
    try {
      setAiLoading(true);
      const content = await generateAIContent({ prompt: currentValue, type, language });
      if (content) applyValue(content);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {canLanguage && (
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="rounded-2xl border px-2 py-1 text-xs"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        )}
      </div>

      {(canAI || canVoice) && (
        <div className="flex flex-wrap gap-2">
          {canAI && (["product", "rewrite", "seo", "continue"] as AIRequestType[]).map((type) => (
            <button key={type} type="button" disabled={aiLoading} onClick={() => runAI(type)} className="rounded-2xl border px-2 py-1 text-xs">
              {aiLoading ? "Generating..." : `AI ${type}`}
            </button>
          ))}
          {canVoice && isSupported && (
            <button
              type="button"
              onClick={() => isListening ? stopListening() : startListening({
                lang: voiceLang,
                onText: (text) => {
                  const base = (watch(name) as string) ?? "";
                  const appendText = base.trim().endsWith(" ") || base.length === 0 ? `${base}${text}` : `${base} ${text}`;
                  applyValue(appendText);
                },
              })}
              className="rounded-2xl border px-2 py-1 text-xs"
            >
              {isListening ? "Stop Voice" : "Start Voice"}
            </button>
          )}
        </div>
      )}

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          canRich ? (
            <RichField value={(field.value as string) ?? ""} onChange={field.onChange} />
          ) : (
            <textarea
              {...field}
              value={(field.value as string) ?? ""}
              placeholder={placeholder}
              rows={5}
              className="w-full rounded-2xl border p-3"
            />
          )
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
