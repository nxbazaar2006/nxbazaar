import { Language } from "@prisma/client";

export const INDIAN_LANGUAGES: Language[] = [
  Language.EN,
  Language.HI,
  Language.MR,
];

export const SLUG_ROUTE_MODELS = [
  "category",
  "subcategory",
  "product",
  "market",
  "blog",
  "vlog",
] as const;

export type SlugRouteModel = (typeof SLUG_ROUTE_MODELS)[number];
