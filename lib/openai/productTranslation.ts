import "server-only";

import { LOCALES } from "@/lib/validators/productSchema";

type ProductLocale = (typeof LOCALES)[number];
type TargetLocale = Exclude<ProductLocale, "EN">;

export type ProductTranslationContent = {
  title: string;
  description?: string;
};

export type ProductTranslationResult = Record<
  ProductLocale,
  ProductTranslationContent
>;

const TARGET_LOCALE_NAMES = {
  HI: "Hindi",
  MR: "Marathi",
} satisfies Record<TargetLocale, string>;

export class ProductTranslationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductTranslationError";
  }
}

function assertRecord(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ProductTranslationError("OpenAI returned an invalid response.");
  }
}

function extractOutputText(payload: unknown) {
  assertRecord(payload);

  if (typeof payload.output_text === "string") {
    return payload.output_text.trim();
  }

  const output = payload.output;

  if (!Array.isArray(output)) {
    return "";
  }

  for (const item of output) {
    if (!item || typeof item !== "object" || !("content" in item)) {
      continue;
    }

    const content = (item as { content?: unknown }).content;

    if (!Array.isArray(content)) {
      continue;
    }

    for (const part of content) {
      if (
        part &&
        typeof part === "object" &&
        "text" in part &&
        typeof (part as { text?: unknown }).text === "string"
      ) {
        return ((part as { text: string }).text).trim();
      }
    }
  }

  return "";
}

function parseTranslationJson(text: string): ProductTranslationContent {
  try {
    const parsed: unknown = JSON.parse(text);
    assertRecord(parsed);

    const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
    const description =
      typeof parsed.description === "string" ? parsed.description.trim() : "";

    if (!title) {
      throw new ProductTranslationError("OpenAI translation is missing title.");
    }

    return {
      title,
      description: description || undefined,
    };
  } catch (error) {
    if (error instanceof ProductTranslationError) {
      throw error;
    }

    throw new ProductTranslationError("OpenAI returned malformed JSON.");
  }
}

async function translateProductContentForLocale({
  content,
  targetLocale,
}: {
  content: ProductTranslationContent;
  targetLocale: TargetLocale;
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new ProductTranslationError(
      "OPENAI_API_KEY is required to translate product content."
    );
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You translate ecommerce product content. Preserve brands, SKUs, numbers, units, measurements, HTML, markdown, and technical terms. Return strict JSON with keys title and description only.",
        },
        {
          role: "user",
          content: JSON.stringify({
            targetLanguage: TARGET_LOCALE_NAMES[targetLocale],
            sourceLanguage: "English",
            title: content.title,
            description: content.description ?? "",
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new ProductTranslationError(
      `OpenAI translation failed (${response.status}): ${message}`
    );
  }

  return parseTranslationJson(extractOutputText(await response.json()));
}

export async function translateProductContent(
  english: ProductTranslationContent
): Promise<ProductTranslationResult> {
  const title = english.title.trim();
  const description = english.description?.trim();

  if (!title) {
    throw new ProductTranslationError("English product title is required.");
  }

  const [hi, mr] = await Promise.all([
    translateProductContentForLocale({
      content: { title, description },
      targetLocale: "HI",
    }),
    translateProductContentForLocale({
      content: { title, description },
      targetLocale: "MR",
    }),
  ]);

  return {
    EN: { title, description: description || undefined },
    HI: hi,
    MR: mr,
  };
}
