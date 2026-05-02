export const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Marathi", value: "mr" },
] as const;

export type SupportedLanguage = (typeof LANGUAGES)[number]["value"];

export const toSchemaLocale = (language: SupportedLanguage) =>
  language.toUpperCase() as "EN" | "HI" | "MR";
