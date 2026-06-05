"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Italic,
  Languages,
  List,
  ListOrdered,
  Mic,
  MicOff,
  Pilcrow,
  Redo2,
  Sparkles,
  Type,
  Undo2,
} from "lucide-react";
import {
  FieldValues,
  Path,
  RegisterOptions,
  get,
  useController,
  useFormContext,
} from "react-hook-form";

import { cn } from "@/lib/utils";

type Locale = "en" | "hi" | "mr";

type FeatureToggles = {
  ai?: boolean;
  voice?: boolean;
  language?: boolean;
  editor?: boolean;
};

type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionLike = EventTarget & {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
  languageName?: Path<T>;
  defaultLanguage?: Locale;
  aiPrompt?: string;
  aiEndpoint?: string;
  features?: FeatureToggles;
};

const LOCALES: { value: Locale; formValue: string; label: string; speech: string }[] = [
  { value: "en", formValue: "EN", label: "English", speech: "en-IN" },
  { value: "hi", formValue: "HI", label: "Hindi", speech: "hi-IN" },
  { value: "mr", formValue: "MR", label: "Marathi", speech: "mr-IN" },
];

const DEFAULT_FEATURES: Required<FeatureToggles> = {
  ai: false,
  voice: false,
  language: false,
  editor: false,
};
const DEFAULT_DESCRIPTION_PLACEHOLDER = "Write a clear ecommerce description";

function siblingPath(path: string, sibling: string) {
  const parts = path.split(".");
  parts[parts.length - 1] = sibling;
  return parts.join(".");
}

function normalizeLocale(value: unknown, fallback: Locale): Locale {
  const locale = String(value ?? fallback).toLowerCase();
  return locale === "hi" || locale === "mr" ? locale : "en";
}

function extractAiText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  const record = payload as Record<string, unknown>;
  const candidates = [
    record.description,
    record.content,
    record.text,
    record.result,
    record.output,
    (record.data as Record<string, unknown> | undefined)?.description,
    (record.data as Record<string, unknown> | undefined)?.content,
    (record.data as Record<string, unknown> | undefined)?.text,
  ];

  return candidates.find((value): value is string => typeof value === "string") ?? "";
}

function editorButtonClass(active = false) {
  return cn(
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs shadow-sm transition",
    active
      ? "border-cyan-300 bg-cyan-400/20 text-cyan-100"
      : "border-white/15 bg-white/5 text-gray-700 hover:bg-white/10 dark:text-gray-200"
  );
}

export default function TextareaInput<T extends FieldValues>({
  label,
  name,
  rules,
  placeholder,
  rows = 4,
  required = false,
  className,
  languageName,
  defaultLanguage = "en",
  aiPrompt,
  aiEndpoint = "/api/ai/blog",
  features,
}: Props<T>) {
  const enabled = { ...DEFAULT_FEATURES, ...features };
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<T>();

  const { field } = useController({
    name,
    control,
    rules,
    defaultValue: "" as never,
  });

  const resolvedLanguageName = useMemo(
    () => languageName ?? (siblingPath(name, "locale") as Path<T>),
    [languageName, name]
  );
  const watchedLanguage = watch(resolvedLanguageName);
  const locale = normalizeLocale(watchedLanguage, defaultLanguage);
  const localeConfig = LOCALES.find((item) => item.value === locale) ?? LOCALES[0];
  const value = typeof field.value === "string" ? field.value : "";
  const error = get(errors, name);
  const resolvedPlaceholder =
    placeholder ??
    (label.toLowerCase().includes("description")
      ? DEFAULT_DESCRIPTION_PLACEHOLDER
      : undefined);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState<"textarea" | "editor">(
    enabled.editor ? "editor" : "textarea"
  );
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const updateValue = (nextValue: string) => {
    field.onChange(nextValue);
    setValue(name, nextValue as never, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    immediatelyRender: false,
    editable: mode === "editor",
    onUpdate: ({ editor }) => {
      updateValue(editor.getHTML());
    },
  });

  useEffect(() => {
    editor?.setEditable(mode === "editor");
  }, [editor, mode]);

  useEffect(() => {
    if (!editor || mode !== "editor") return;
    if (editor.getHTML() !== (value || "<p></p>")) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, mode, value]);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const handleLanguageChange = (nextLocale: Locale) => {
    const next = LOCALES.find((item) => item.value === nextLocale) ?? LOCALES[0];
    setValue(resolvedLanguageName, next.formValue as never, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch(aiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt ?? label,
          field: name,
          language: locale,
          currentValue: value,
        }),
      });

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const text = extractAiText(await response.json()).trim();
      if (text) updateValue(text);
    } catch (error) {
      console.error("TEXTAREA_AI_ERROR", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = localeConfig.speech;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (transcript) {
        updateValue([value, transcript].filter(Boolean).join(" "));
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {enabled.language && (
            <label className="inline-flex items-center gap-1 rounded-lg border border-gray-200  px-2 py-1 text-xs text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              <Languages className="h-3.5 w-3.5" aria-hidden="true" />
              <select
                value={locale}
                onChange={(event) => handleLanguageChange(event.target.value as Locale)}
                className="bg-transparent outline-none"
                aria-label={`${label} language`}
              >
                {LOCALES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {enabled.editor && (
            <button
              type="button"
              onClick={() =>
                setMode((current) => (current === "editor" ? "textarea" : "editor"))
              }
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-transparent px-2 py-1 text-xs text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"
              title={mode === "editor" ? "Use plain text" : "Use rich editor"}
            >
              {mode === "editor" ? (
                <Type className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Pilcrow className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {mode === "editor" ? "Plain" : "Editor"}
            </button>
          )}

          {enabled.voice && (
            <button
              type="button"
              onClick={handleVoice}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs shadow-sm transition",
                isListening
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-gray-200  text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              )}
              title={isListening ? "Stop voice input" : "Start voice input"}
            >
              {isListening ? (
                <MicOff className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Mic className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Voice
            </button>
          )}

          {enabled.ai && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-transparent px-2 py-1 text-xs text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200"
              title="Generate with AI"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {isGenerating ? "Generating" : "AI"}
            </button>
          )}
        </div>
      </div>

      {enabled.editor && mode === "editor" ? (
        <div
          className={cn(
            "overflow-hidden rounded-2xl border bg-transparent shadow-sm transition",
            error ? "border-red-500" : "border-slate-200 dark:border-white/10"
          )}
        >
          <div className="flex flex-wrap items-center gap-1 border-b border-white/15 bg-white/5 p-2">
            <button
              type="button"
              className={editorButtonClass(editor?.isActive("bold"))}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              title="Bold"
            >
              <Bold className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={editorButtonClass(editor?.isActive("italic"))}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              title="Italic"
            >
              <Italic className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={editorButtonClass(
                editor?.isActive("heading", { level: 2 })
              )}
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run()
              }
              title="Heading"
            >
              <Heading2 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={editorButtonClass(editor?.isActive("bulletList"))}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              title="Bullet list"
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={editorButtonClass(editor?.isActive("orderedList"))}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              title="Numbered list"
            >
              <ListOrdered className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="mx-1 h-6 w-px bg-white/15" />
            <button
              type="button"
              className={editorButtonClass()}
              onClick={() => editor?.chain().focus().undo().run()}
              title="Undo"
            >
              <Undo2 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={editorButtonClass()}
              onClick={() => editor?.chain().focus().redo().run()}
              title="Redo"
            >
              <Redo2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none px-4 py-3 outline-none dark:prose-invert [&_.ProseMirror]:min-h-[130px] [&_.ProseMirror]:outline-none"
          />
        </div>
      ) : (
        <textarea
          {...field}
          value={value}
          rows={rows}
          lang={locale}
          placeholder={resolvedPlaceholder}
          onChange={(event) => updateValue(event.target.value)}
          className={cn(
            "w-full resize-none rounded-2xl border bg-transparent px-4 py-3 text-gray-900 shadow-sm outline-none transition-all duration-300 ease-in-out placeholder:text-gray-400 hover:shadow-md dark:text-gray-100",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 dark:border-white/10"
          )}
        />
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500">
          {String(error.message ?? "This field is required")}
        </p>
      )}
    </div>
  );
}
