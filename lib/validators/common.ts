import { z } from "zod";

// 🔤 Language enum 
export const LanguageEnum = z.enum(["en", "hi", "mr"]);

// 🧾 ID
export const IdSchema = z.string().uuid();

// 🌐 Optional string
export const OptionalString = z.string().min(1).optional().or(z.literal("").transform(() => undefined));

// 📅 Date
export const OptionalDate = z.coerce.date().optional();