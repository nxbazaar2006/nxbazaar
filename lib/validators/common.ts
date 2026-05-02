import { z } from "zod";

// 🔤 Language enum 
export const LanguageEnum = z.enum(["en", "hi", "mr"]);

// 🧾 ID
export const IdSchema = z.string().uuid();

// 🌐 Optional string
export const OptionalString = z.string().min(1).optional().or(z.literal("").transform(() => undefined));

export const requiredString = (label = "Field", min = 1) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, `${label} must be at least ${min} characters`);

// 📅 Date
export const OptionalDate = z.coerce.date().optional();
