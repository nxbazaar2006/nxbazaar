import type { SupportedLanguage } from "@/lib/languages";

export type AIRequestType = "product" | "rewrite" | "seo" | "continue";

export const generateAIContent = async ({
  prompt,
  type,
  language,
}: {
  prompt: string;
  type: AIRequestType;
  language: SupportedLanguage;
}) => {
  const response = await fetch("/api/ai/blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, type, language }),
  });

  if (!response.ok) {
    throw new Error("AI content generation failed");
  }

  const data = await response.json();
  return (data?.content ?? data?.text ?? "") as string;
};
