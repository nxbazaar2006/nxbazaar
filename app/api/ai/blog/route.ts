import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().optional(),
  field: z.string().optional(),
  language: z.enum(["en", "hi", "mr"]).default("en"),
  currentValue: z.string().optional(),
});

const languageNames = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
} as const;

function fallbackDescription(language: keyof typeof languageNames) {
  if (language === "hi") {
    return "यह उत्पाद रोजमर्रा के उपयोग के लिए भरोसेमंद गुणवत्ता, साफ विवरण और बेहतर मूल्य प्रदान करता है। इसकी विशेषताओं, उपयोग और लाभों को ग्राहकों के लिए स्पष्ट रूप से प्रस्तुत करें।";
  }

  if (language === "mr") {
    return "हा उत्पाद दैनंदिन वापरासाठी चांगली गुणवत्ता, स्पष्ट माहिती आणि योग्य मूल्य देतो. ग्राहकांना वैशिष्ट्ये, उपयोग आणि फायदे समजतील अशा पद्धतीने वर्णन करा.";
  }

  return "This product offers dependable quality, clear value, and practical benefits for everyday use. Highlight its key features, use cases, and customer benefits in a concise ecommerce description.";
}

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        description: fallbackDescription(body.language),
      });
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
              "Write concise ecommerce product descriptions. Return only the description text.",
          },
          {
            role: "user",
            content: `Language: ${languageNames[body.language]}. Field: ${
              body.field ?? "description"
            }. Product context: ${body.prompt ?? ""}. Existing value: ${
              body.currentValue ?? ""
            }`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { description: fallbackDescription(body.language) },
        { status: 200 }
      );
    }

    const payload = await response.json();
    const outputText =
      typeof payload.output_text === "string"
        ? payload.output_text
        : payload.output?.[0]?.content?.[0]?.text;

    return NextResponse.json({
      description:
        typeof outputText === "string" && outputText.trim()
          ? outputText.trim()
          : fallbackDescription(body.language),
    });
  } catch (error) {
    console.error("AI_BLOG_ROUTE_ERROR", error);

    return NextResponse.json(
      { error: "Invalid AI request" },
      { status: 400 }
    );
  }
}
